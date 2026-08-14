from __future__ import annotations

import argparse
import asyncio
import base64
import json
import os
import re
import secrets
import socket
import sys
import time
import unicodedata
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import aiohttp
import numpy as np
from aiohttp import web
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
STATIC_DIR = ROOT / "static"
CARDS_PATH = ROOT / "cards.json"
SAMPLE_RATE_OUT = 24_000
DEFAULT_PORT = 8765


def normalize(text: str) -> str:
    text = text.lower().strip().replace("ß", "ss")
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-z0-9äöü ]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def token_set(text: str) -> set[str]:
    return {t for t in normalize(text).split() if len(t) > 2}


def score_pattern(text: str, pattern: str) -> float:
    nt = normalize(text)
    npat = normalize(pattern)
    if not nt or not npat:
        return 0.0
    if npat in nt or nt in npat:
        shorter = min(len(nt), len(npat))
        longer = max(len(nt), len(npat))
        return 0.82 + 0.18 * (shorter / longer)
    a = token_set(nt)
    b = token_set(npat)
    if not a or not b:
        return 0.0
    overlap = len(a & b)
    recall = overlap / len(b)
    precision = overlap / len(a)
    if recall == 0 or precision == 0:
        return 0.0
    f1 = 2 * recall * precision / (recall + precision)
    return min(1.0, (0.62 * recall) + (0.38 * f1))


@dataclass
class Match:
    id: str
    translation_tr: str
    answer_de: str
    score: float


class PreparedMatcher:
    def __init__(self, cards_path: Path = CARDS_PATH):
        self.cards: list[dict[str, Any]] = json.loads(cards_path.read_text(encoding="utf-8"))

    def match(self, text: str, threshold: float = 0.56) -> Match | None:
        best: tuple[float, dict[str, Any]] | None = None
        for card in self.cards:
            score = max((score_pattern(text, p) for p in card.get("patterns", [])), default=0.0)
            if best is None or score > best[0]:
                best = (score, card)
        if not best or best[0] < threshold:
            return None
        score, card = best
        return Match(
            id=str(card["id"]),
            translation_tr=str(card["tr"]),
            answer_de=str(card["answer"]),
            score=round(score, 3),
        )


@dataclass
class LiveState:
    status: str = "Hazır"
    connected: bool = False
    transcript_de: str = ""
    translation_tr: str = ""
    answer_de: str = ""
    answer_source: str = ""
    match_id: str = ""
    match_score: float = 0.0
    revision: int = 0
    updated_at: float = 0.0
    last_error: str = ""


class Hub:
    def __init__(self):
        self.state = LiveState(updated_at=time.time())
        self.clients: set[web.WebSocketResponse] = set()
        self._lock = asyncio.Lock()

    async def patch(self, **changes: Any) -> None:
        async with self._lock:
            for key, value in changes.items():
                if hasattr(self.state, key):
                    setattr(self.state, key, value)
            self.state.updated_at = time.time()
            payload = {"type": "state", "state": asdict(self.state)}
            dead: list[web.WebSocketResponse] = []
            for ws in self.clients:
                try:
                    await ws.send_json(payload)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.clients.discard(ws)

    async def register(self, ws: web.WebSocketResponse) -> None:
        self.clients.add(ws)
        await ws.send_json({"type": "state", "state": asdict(self.state)})


class OpenAIFallback:
    def __init__(self, api_key: str, hub: Hub, model: str = "gpt-5.6-luna"):
        self.api_key = api_key
        self.hub = hub
        self.model = model
        self._task: asyncio.Task[None] | None = None
        self._serial = 0
        self._session: aiohttp.ClientSession | None = None

    async def start(self) -> None:
        if self._session is None:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=8, connect=4, sock_read=6)
            )

    async def close(self) -> None:
        if self._task and not self._task.done():
            self._task.cancel()
        if self._session:
            await self._session.close()
            self._session = None

    def schedule(self, transcript: str, revision: int, delay_s: float = 0.38) -> None:
        self._serial += 1
        serial = self._serial
        if self._task and not self._task.done():
            self._task.cancel()
        self._task = asyncio.create_task(self._debounced(transcript, revision, serial, delay_s))

    async def _debounced(self, transcript: str, revision: int, serial: int, delay_s: float) -> None:
        try:
            await asyncio.sleep(delay_s)
            if serial != self._serial:
                return
            await self.start()
            result = await self._ask(transcript)
            if serial != self._serial or revision != self.hub.state.revision:
                return
            if not result:
                return
            await self.hub.patch(
                translation_tr=result.get("translation_tr", ""),
                answer_de=result.get("answer_de", ""),
                answer_source="AI",
                match_id="",
                match_score=0.0,
                status="Cevap hazır",
            )
        except asyncio.CancelledError:
            return
        except Exception as exc:
            if serial == self._serial:
                await self.hub.patch(last_error=f"AI: {exc}", status="Dinliyor")

    async def _ask(self, transcript: str) -> dict[str, str] | None:
        assert self._session is not None
        prompt = f"""You are a live German job-interview assistant for Yalçın Mutlu.
The interview is for Transdev Vertrieb, Prüfpersonal im Zug, Tübingen.
The candidate's German level is B1.

CURRENT INTERVIEWER SPEECH (may still be an incomplete sentence):
{transcript}

Truthful candidate background only:
- Mutlu Akustik, Ankara: Technical Project Manager, 2018 to Dec 2024. Planned projects, coordinated a seven-person technical team, customer/site communication, purchasing/logistics and on-site implementation.
- Webrano, Ankara: Technical Project Manager / Electronics Technician, 2010 to 2018. Technical support for many business clients, customer contact, IT/technical service, coordinated an average five-person team.
- Do NOT invent Hermes, Deutsche Post, Lieferando, railway-control experience, or any other employment.

Return ONLY valid JSON with exactly these keys:
{{"translation_tr":"...","answer_de":"..."}}
Rules:
- translation_tr: short natural Turkish meaning of what the interviewer is currently asking/saying.
- answer_de: at most 2 or 3 very short, natural B1 German sentences the candidate can say aloud.
- If the interviewer has not asked enough to infer a question yet, keep answer_de empty.
- Never invent personal facts.
- No explanations, no markdown.
"""
        payload = {
            "model": self.model,
            "store": False,
            "reasoning": {"effort": "none"},
            "max_output_tokens": 140,
            "input": prompt,
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        async with self._session.post(
            "https://api.openai.com/v1/responses", headers=headers, json=payload
        ) as resp:
            data = await resp.json(content_type=None)
            if resp.status >= 400:
                message = data.get("error", {}).get("message") if isinstance(data, dict) else str(data)
                raise RuntimeError(f"OpenAI {resp.status}: {message}")
        output_text = extract_output_text(data)
        if not output_text:
            return None
        output_text = output_text.strip()
        if output_text.startswith("```"):
            output_text = re.sub(r"^```(?:json)?\s*|\s*```$", "", output_text, flags=re.S)
        parsed = json.loads(output_text)
        if not isinstance(parsed, dict):
            return None
        return {
            "translation_tr": str(parsed.get("translation_tr", "")).strip(),
            "answer_de": str(parsed.get("answer_de", "")).strip(),
        }


def extract_output_text(data: Any) -> str:
    if isinstance(data, dict):
        if isinstance(data.get("output_text"), str):
            return data["output_text"]
        for item in data.get("output", []) or []:
            if not isinstance(item, dict):
                continue
            for content in item.get("content", []) or []:
                if isinstance(content, dict) and content.get("type") in {"output_text", "text"}:
                    text = content.get("text")
                    if isinstance(text, str):
                        return text
    return ""


class LiveEngine:
    def __init__(self, matcher: PreparedMatcher, hub: Hub, fallback: OpenAIFallback | None):
        self.matcher = matcher
        self.hub = hub
        self.fallback = fallback
        self.current_text = ""
        self.last_final = ""

    async def on_transcript(self, text: str, final: bool = False) -> None:
        text = re.sub(r"\s+", " ", text).strip()
        if not text:
            return
        self.current_text = text
        revision = self.hub.state.revision + 1
        match = self.matcher.match(text)
        changes: dict[str, Any] = {
            "transcript_de": text,
            "revision": revision,
            "status": "Dinliyor" if not final else "Soru tamamlandı",
            "last_error": "",
        }
        if match:
            changes.update(
                translation_tr=match.translation_tr,
                answer_de=match.answer_de,
                answer_source="Hazır",
                match_id=match.id,
                match_score=match.score,
                status="Cevap hazır",
            )
            if self.fallback:
                self.fallback._serial += 1
                if self.fallback._task and not self.fallback._task.done():
                    self.fallback._task.cancel()
        else:
            changes.update(
                answer_source="AI hazırlanıyor" if len(text) >= 12 else "",
                match_id="",
                match_score=0.0,
            )
            if len(text) < 12:
                changes.update(translation_tr="", answer_de="")
        await self.hub.patch(**changes)
        if not match and self.fallback and len(text) >= 12:
            self.fallback.schedule(text, revision, delay_s=0.20 if final else 0.38)
        if final:
            self.last_final = text


class RealtimeTranscriber:
    def __init__(self, api_key: str, engine: LiveEngine, hub: Hub):
        self.api_key = api_key
        self.engine = engine
        self.hub = hub
        self.ws: aiohttp.ClientWebSocketResponse | None = None
        self.session: aiohttp.ClientSession | None = None
        self.reader_task: asyncio.Task[None] | None = None
        self.item_buffers: dict[str, str] = {}

    async def connect(self) -> None:
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=None, sock_connect=10)
        )
        self.ws = await self.session.ws_connect(
            "wss://api.openai.com/v1/realtime?model=gpt-realtime-2.1",
            headers={"Authorization": f"Bearer {self.api_key}"},
            heartbeat=20,
            max_msg_size=8 * 1024 * 1024,
        )
        config = {
            "type": "session.update",
            "session": {
                "type": "transcription",
                "audio": {
                    "input": {
                        "format": {"type": "audio/pcm", "rate": SAMPLE_RATE_OUT},
                        "transcription": {
                            "model": "gpt-live-transcribe",
                            "prompt": "German job interview for Transdev Vertrieb, Prüfpersonal im Zug, Tübingen.",
                            "keywords": [
                                "Transdev", "Prüfpersonal", "Fahrgast", "Fahrschein", "Ticket",
                                "Schichtdienst", "Kundenservice", "Tübingen", "Verbindung", "Einarbeitung",
                            ],
                            "languages": ["de"],
                            "delay": "minimal",
                        },
                        "turn_detection": None,
                    }
                },
            },
        }
        await self.ws.send_json(config)
        self.reader_task = asyncio.create_task(self._reader())
        await self.hub.patch(connected=True, status="Dinliyor", last_error="")

    async def close(self) -> None:
        if self.reader_task and not self.reader_task.done():
            self.reader_task.cancel()
        if self.ws and not self.ws.closed:
            await self.ws.close()
        if self.session:
            await self.session.close()
        await self.hub.patch(connected=False, status="Bağlantı kapalı")

    async def send_pcm16(self, pcm: bytes) -> None:
        if not self.ws or self.ws.closed:
            return
        await self.ws.send_json({
            "type": "input_audio_buffer.append",
            "audio": base64.b64encode(pcm).decode("ascii"),
        })

    async def commit(self) -> None:
        if not self.ws or self.ws.closed:
            return
        await self.ws.send_json({"type": "input_audio_buffer.commit"})

    async def _reader(self) -> None:
        assert self.ws is not None
        try:
            async for msg in self.ws:
                if msg.type != aiohttp.WSMsgType.TEXT:
                    continue
                event = json.loads(msg.data)
                etype = event.get("type")
                if etype == "conversation.item.input_audio_transcription.delta":
                    item_id = str(event.get("item_id", "current"))
                    delta = str(event.get("delta", ""))
                    if not delta:
                        continue
                    self.item_buffers[item_id] = self.item_buffers.get(item_id, "") + delta
                    await self.engine.on_transcript(self.item_buffers[item_id], final=False)
                elif etype == "conversation.item.input_audio_transcription.completed":
                    item_id = str(event.get("item_id", "current"))
                    transcript = str(event.get("transcript", "")).strip() or self.item_buffers.get(item_id, "")
                    if transcript:
                        await self.engine.on_transcript(transcript, final=True)
                    self.item_buffers.pop(item_id, None)
                elif etype == "error":
                    err = event.get("error", {})
                    message = err.get("message") if isinstance(err, dict) else str(err)
                    await self.hub.patch(last_error=f"Realtime: {message}", status="Hata")
        except asyncio.CancelledError:
            return
        except Exception as exc:
            await self.hub.patch(
                connected=False,
                last_error=f"Realtime bağlantısı: {exc}",
                status="Bağlantı koptu",
            )


def float_audio_to_pcm24k(data: np.ndarray, source_rate: int) -> bytes:
    if data.size == 0:
        return b""
    arr = np.asarray(data, dtype=np.float32)
    if arr.ndim == 2:
        arr = np.mean(arr, axis=1)
    arr = np.nan_to_num(arr, nan=0.0, posinf=0.0, neginf=0.0)
    arr = np.clip(arr, -1.0, 1.0)
    if source_rate != SAMPLE_RATE_OUT and len(arr) > 1:
        new_len = max(1, round(len(arr) * SAMPLE_RATE_OUT / source_rate))
        old_x = np.linspace(0.0, 1.0, num=len(arr), endpoint=False)
        new_x = np.linspace(0.0, 1.0, num=new_len, endpoint=False)
        arr = np.interp(new_x, old_x, arr).astype(np.float32)
    pcm = (arr * 32767.0).astype("<i2")
    return pcm.tobytes()


class AudioLoopback:
    def __init__(self, speaker_query: str | None = None, source_rate: int = 48_000):
        self.speaker_query = speaker_query
        self.source_rate = source_rate
        self._stop = asyncio.Event()

    @staticmethod
    def list_devices() -> list[str]:
        import soundcard as sc
        return [str(s.name) for s in sc.all_speakers()]

    def _select_loopback(self):
        import soundcard as sc
        speakers = sc.all_speakers()
        if not speakers:
            raise RuntimeError("Hiç ses çıkış aygıtı bulunamadı.")
        speaker = sc.default_speaker()
        if self.speaker_query:
            needle = self.speaker_query.lower()
            matches = [s for s in speakers if needle in str(s.name).lower()]
            if not matches:
                names = " | ".join(str(s.name) for s in speakers)
                raise RuntimeError(f"Speaker bulunamadı: {self.speaker_query}. Mevcut: {names}")
            speaker = matches[0]
        loopbacks = sc.all_microphones(include_loopback=True)
        candidates = [m for m in loopbacks if str(speaker.name).lower() in str(m.name).lower()]
        if not candidates:
            try:
                return sc.get_microphone(str(speaker.name), include_loopback=True), speaker
            except Exception:
                pass
            candidates = [m for m in loopbacks if getattr(m, "isloopback", False)]
        if not candidates:
            raise RuntimeError(f"Loopback aygıtı bulunamadı: {speaker.name}")
        return candidates[0], speaker

    async def run(self, transcriber: RealtimeTranscriber, hub: Hub) -> None:
        loopback, speaker = self._select_loopback()
        await hub.patch(status=f"Dinliyor: {speaker.name}")
        queue: asyncio.Queue[bytes] = asyncio.Queue(maxsize=32)
        loop = asyncio.get_running_loop()

        def capture_worker() -> None:
            try:
                with loopback.recorder(samplerate=self.source_rate, blocksize=2048) as recorder:
                    while not self._stop.is_set():
                        data = recorder.record(numframes=2400)
                        pcm = float_audio_to_pcm24k(data, self.source_rate)
                        if not pcm:
                            continue

                        def put_chunk(chunk: bytes = pcm) -> None:
                            if queue.full():
                                try:
                                    queue.get_nowait()
                                except asyncio.QueueEmpty:
                                    pass
                            queue.put_nowait(chunk)

                        loop.call_soon_threadsafe(put_chunk)
            except Exception as exc:
                loop.call_soon_threadsafe(
                    asyncio.create_task,
                    hub.patch(last_error=f"Audio: {exc}", status="Audio hatası"),
                )

        import threading
        thread = threading.Thread(
            target=capture_worker, daemon=True, name="transdev-audio-loopback"
        )
        thread.start()

        voiced = False
        silent_ms = 0.0
        active_ms = 0.0
        try:
            while not self._stop.is_set():
                pcm = await queue.get()
                await transcriber.send_pcm16(pcm)
                samples = np.frombuffer(pcm, dtype="<i2").astype(np.float32) / 32768.0
                rms = float(np.sqrt(np.mean(samples * samples))) if samples.size else 0.0
                chunk_ms = (len(samples) / SAMPLE_RATE_OUT) * 1000.0
                if rms >= 0.0035:
                    voiced = True
                    silent_ms = 0.0
                    active_ms += chunk_ms
                elif voiced:
                    silent_ms += chunk_ms
                    active_ms += chunk_ms

                # Commit only finalizes a turn. Partial transcript deltas and prepared
                # answers are already flowing before this point.
                if voiced and (silent_ms >= 340.0 or active_ms >= 15_000.0):
                    await transcriber.commit()
                    voiced = False
                    silent_ms = 0.0
                    active_ms = 0.0
        finally:
            self._stop.set()

    def stop(self) -> None:
        self._stop.set()


class LocalServer:
    def __init__(
        self,
        token: str,
        hub: Hub,
        engine: LiveEngine,
        host: str = "0.0.0.0",
        port: int = DEFAULT_PORT,
    ):
        self.token = token
        self.hub = hub
        self.engine = engine
        self.host = host
        self.port = port
        self.runner: web.AppRunner | None = None

    def _valid_token(self, request: web.Request) -> bool:
        supplied = request.query.get("token") or request.headers.get("X-Transdev-Token", "")
        return secrets.compare_digest(str(supplied), self.token)

    async def index(self, request: web.Request) -> web.StreamResponse:
        if not self._valid_token(request):
            raise web.HTTPForbidden(text="Invalid session token")
        response = web.FileResponse(STATIC_DIR / "index.html")
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Robots-Tag"] = "noindex, nofollow, noarchive"
        return response

    async def ws_handler(self, request: web.Request) -> web.StreamResponse:
        if not self._valid_token(request):
            raise web.HTTPForbidden(text="Invalid session token")
        ws = web.WebSocketResponse(heartbeat=20)
        await ws.prepare(request)
        await self.hub.register(ws)
        try:
            async for msg in ws:
                if msg.type == aiohttp.WSMsgType.TEXT and msg.data == "ping":
                    await ws.send_str("pong")
        finally:
            self.hub.clients.discard(ws)
        return ws

    async def health(self, request: web.Request) -> web.Response:
        if not self._valid_token(request):
            return web.json_response({"ok": False}, status=403)
        return web.json_response(
            {"ok": True, "state": asdict(self.hub.state)},
            headers={"Cache-Control": "no-store"},
        )

    async def test_ingest(self, request: web.Request) -> web.Response:
        if not self._valid_token(request):
            return web.json_response({"ok": False}, status=403)
        body = await request.json()
        text = str(body.get("text", "")).strip()
        if not text:
            return web.json_response({"ok": False, "error": "text required"}, status=422)
        await self.engine.on_transcript(text, final=bool(body.get("final", False)))
        return web.json_response(
            {"ok": True, "state": asdict(self.hub.state)},
            headers={"Cache-Control": "no-store"},
        )

    async def start(self) -> None:
        app = web.Application(client_max_size=16 * 1024)
        app.router.add_get("/", self.index)
        app.router.add_get("/ws", self.ws_handler)
        app.router.add_get("/health", self.health)
        app.router.add_post("/test/ingest", self.test_ingest)
        app.router.add_static("/static/", path=STATIC_DIR, show_index=False)
        self.runner = web.AppRunner(app, access_log=None)
        await self.runner.setup()
        site = web.TCPSite(self.runner, self.host, self.port)
        await site.start()

    async def close(self) -> None:
        if self.runner:
            await self.runner.cleanup()


def lan_ip() -> str:
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(("8.8.8.8", 80))
        return str(sock.getsockname()[0])
    except Exception:
        return "127.0.0.1"
    finally:
        sock.close()


def run_self_test(matcher: PreparedMatcher) -> int:
    samples = [
        ("Warum möchten Sie bei Transdev arbeiten?", "why_transdev"),
        ("Was machen Sie bei einem aggressiven Fahrgast?", "aggressive"),
        ("Können Sie nachts und am Wochenende im Schichtdienst arbeiten?", "shift"),
        ("Welche Erfahrungen haben Sie bisher gesammelt?", "experience"),
        ("Wo sehen Sie sich in fünf Jahren?", "future"),
    ]
    failures = 0
    for text, expected in samples:
        match = matcher.match(text)
        got = match.id if match else "NONE"
        ok = got == expected
        failures += 0 if ok else 1
        print(f"{'PASS' if ok else 'FAIL'}  {text} -> {got} ({match.score if match else 0})")
    return failures


async def main_async(args: argparse.Namespace) -> int:
    load_dotenv(ROOT / ".env")
    matcher = PreparedMatcher()
    if args.self_test:
        return 1 if run_self_test(matcher) else 0
    if args.list_devices:
        try:
            for idx, name in enumerate(AudioLoopback.list_devices(), start=1):
                print(f"{idx}. {name}")
            return 0
        except Exception as exc:
            print(f"Ses aygıtları okunamadı: {exc}", file=sys.stderr)
            return 2

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key and not args.no_audio:
        print("OPENAI_API_KEY eksik. .env dosyasına ekleyin.", file=sys.stderr)
        return 2

    token = os.getenv("TRANSDEV_LIVE_TOKEN", "").strip() or secrets.token_urlsafe(18)
    text_model = os.getenv("OPENAI_TEXT_MODEL", "gpt-5.6-luna").strip() or "gpt-5.6-luna"

    hub = Hub()
    fallback = OpenAIFallback(api_key, hub, text_model) if api_key else None
    engine = LiveEngine(matcher, hub, fallback)
    server = LocalServer(token, hub, engine, port=args.port)
    await server.start()

    ip = lan_ip()
    print("\nTransdev Canlı Asistan")
    print("======================")
    print(f"PC:     http://127.0.0.1:{args.port}/?token={token}")
    print(f"Tablet: http://{ip}:{args.port}/?token={token}")
    print("Ses/transkript diske kaydedilmez. Ctrl+C ile kapatın.\n")

    transcriber: RealtimeTranscriber | None = None
    audio: AudioLoopback | None = None
    audio_task: asyncio.Task[None] | None = None
    try:
        if args.no_audio:
            await hub.patch(status="Test modu", connected=False)
        else:
            assert fallback is not None
            await fallback.start()
            transcriber = RealtimeTranscriber(api_key, engine, hub)
            await transcriber.connect()
            audio = AudioLoopback(args.speaker)
            audio_task = asyncio.create_task(audio.run(transcriber, hub))
        while True:
            await asyncio.sleep(3600)
    except (KeyboardInterrupt, asyncio.CancelledError):
        pass
    finally:
        if audio:
            audio.stop()
        if audio_task and not audio_task.done():
            audio_task.cancel()
        if transcriber:
            await transcriber.close()
        if fallback:
            await fallback.close()
        await server.close()
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Transdev live interview assistant prototype")
    parser.add_argument("--speaker", help="Windows çıkış aygıtı adından bir parça (örn. Headphones)")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--list-devices", action="store_true")
    parser.add_argument("--no-audio", action="store_true", help="API/audio olmadan UI ve matcher test modu")
    parser.add_argument("--self-test", action="store_true", help="Hazır soru eşleştiricisini test et")
    return parser.parse_args()


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(main_async(parse_args())))
    except KeyboardInterrupt:
        raise SystemExit(0)
