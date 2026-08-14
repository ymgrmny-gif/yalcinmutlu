from __future__ import annotations

import argparse, asyncio, base64, json, os, re, secrets, socket, sys, time, unicodedata
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import aiohttp
import numpy as np
from aiohttp import web
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "static"
CARDS = ROOT / "cards.json"
RATE = 24_000
PORT = 8765


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s.lower().replace("ß", "ss"))
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]+", " ", s)).strip()


def score(text: str, pattern: str) -> float:
    a, b = norm(text), norm(pattern)
    if not a or not b:
        return 0.0
    if a in b or b in a:
        return .82 + .18 * min(len(a), len(b)) / max(len(a), len(b))
    ta, tb = {x for x in a.split() if len(x) > 2}, {x for x in b.split() if len(x) > 2}
    if not ta or not tb:
        return 0.0
    overlap = len(ta & tb)
    if not overlap:
        return 0.0
    recall, precision = overlap / len(tb), overlap / len(ta)
    f1 = 2 * recall * precision / (recall + precision)
    return min(1.0, .62 * recall + .38 * f1)


class Matcher:
    def __init__(self):
        self.cards = json.loads(CARDS.read_text(encoding="utf-8"))

    def match(self, text: str, threshold: float = .56) -> dict[str, Any] | None:
        best = None
        for card in self.cards:
            s = max((score(text, p) for p in card.get("patterns", [])), default=0.0)
            if best is None or s > best[0]:
                best = (s, card)
        if not best or best[0] < threshold:
            return None
        s, c = best
        return {"id": c["id"], "translation": c["tr"], "answer": c["answer"], "score": round(s, 3)}


@dataclass
class State:
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
        self.state = State(updated_at=time.time())
        self.clients: set[web.WebSocketResponse] = set()
        self.lock = asyncio.Lock()

    async def patch(self, **changes):
        async with self.lock:
            for k, v in changes.items():
                if hasattr(self.state, k):
                    setattr(self.state, k, v)
            self.state.updated_at = time.time()
            payload = {"type": "state", "state": asdict(self.state)}
            dead = []
            for ws in self.clients:
                try:
                    await ws.send_json(payload)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.clients.discard(ws)


class Fallback:
    """Starts early on partial text, keeps latest text pending, and refines without waiting for turn-end."""

    def __init__(self, key: str, hub: Hub, model: str):
        self.key, self.hub, self.model = key, hub, model
        self.http: aiohttp.ClientSession | None = None
        self.task: asyncio.Task | None = None
        self.pending: tuple[str, int] | None = None

    async def start(self):
        if not self.http:
            self.http = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=8, connect=4, sock_read=6))

    def cancel(self):
        self.pending = None
        if self.task and not self.task.done():
            self.task.cancel()

    def schedule(self, text: str, rev: int, delay=.28):
        if self.task and not self.task.done():
            self.pending = (text, rev)
            return
        self.task = asyncio.create_task(self._run(text, rev, delay))

    async def _run(self, text: str, rev: int, delay: float):
        try:
            await asyncio.sleep(delay)
            await self.start()
            result = await self._ask(text)
            current = norm(self.hub.state.transcript_de)
            requested = norm(text)
            if result and (current.startswith(requested) or requested.startswith(current) or rev == self.hub.state.revision):
                await self.hub.patch(
                    translation_tr=result["translation_tr"], answer_de=result["answer_de"],
                    answer_source="AI", match_id="", match_score=0.0, status="Cevap hazır", last_error=""
                )
        except asyncio.CancelledError:
            return
        except Exception as e:
            await self.hub.patch(last_error=f"AI: {e}")
        finally:
            pending, self.pending = self.pending, None
            if pending and norm(pending[0]) != norm(text):
                self.task = asyncio.create_task(self._run(pending[0], pending[1], .05))
            else:
                self.task = None

    async def _ask(self, text: str) -> dict[str, str] | None:
        assert self.http
        prompt = f'''Live German job interview assistant for Yalçın Mutlu, Transdev Vertrieb, Prüfpersonal im Zug, Tübingen.
German level: B1. The interviewer may still be speaking.
Current speech: {text}
Truthful background only: Mutlu Akustik technical project manager 2018-Dec 2024 (projects, seven-person team, customers, purchasing/logistics, on-site work); Webrano technical project manager/electronics technician 2010-2018 (business customer support, technical service, five-person team coordination).
Never invent Hermes, Deutsche Post, Lieferando, railway-control experience, or other employment.
Return ONLY JSON: {{"translation_tr":"short Turkish meaning","answer_de":"maximum 2-3 very short natural B1 German sentences"}}. If there is not enough of a question yet, answer_de must be empty.'''
        body = {"model": self.model, "store": False, "reasoning": {"effort": "none"}, "max_output_tokens": 140, "input": prompt}
        async with self.http.post("https://api.openai.com/v1/responses", headers={"Authorization": f"Bearer {self.key}", "Content-Type": "application/json"}, json=body) as r:
            data = await r.json(content_type=None)
            if r.status >= 400:
                raise RuntimeError(f"OpenAI {r.status}: {data.get('error', {}).get('message', 'error')}")
        out = data.get("output_text", "")
        if not out:
            for item in data.get("output", []):
                for part in item.get("content", []) if isinstance(item, dict) else []:
                    if isinstance(part, dict) and isinstance(part.get("text"), str):
                        out = part["text"]
                        break
                if out:
                    break
        out = re.sub(r"^```(?:json)?\s*|\s*```$", "", out.strip(), flags=re.S)
        obj = json.loads(out)
        return {"translation_tr": str(obj.get("translation_tr", "")).strip(), "answer_de": str(obj.get("answer_de", "")).strip()}

    async def close(self):
        self.cancel()
        if self.http:
            await self.http.close()


class Engine:
    def __init__(self, matcher: Matcher, hub: Hub, fallback: Fallback | None):
        self.matcher, self.hub, self.fallback = matcher, hub, fallback

    async def transcript(self, text: str, final=False):
        text = re.sub(r"\s+", " ", text).strip()
        if not text:
            return
        rev = self.hub.state.revision + 1
        m = self.matcher.match(text)
        base = dict(transcript_de=text, revision=rev, last_error="")
        if m:
            if self.fallback:
                self.fallback.cancel()
            await self.hub.patch(**base, translation_tr=m["translation"], answer_de=m["answer"], answer_source="Hazır", match_id=m["id"], match_score=m["score"], status="Cevap hazır")
            return
        await self.hub.patch(**base, translation_tr="", answer_de="", answer_source="AI hazırlanıyor" if len(text) >= 12 else "", match_id="", match_score=0.0, status="Soru tamamlandı" if final else "Dinliyor")
        if self.fallback and len(text) >= 12:
            self.fallback.schedule(text, rev, .12 if final else .28)


class Realtime:
    def __init__(self, key: str, engine: Engine, hub: Hub):
        self.key, self.engine, self.hub = key, engine, hub
        self.http: aiohttp.ClientSession | None = None
        self.ws: aiohttp.ClientWebSocketResponse | None = None
        self.reader: asyncio.Task | None = None
        self.buffers: dict[str, str] = {}

    async def connect(self):
        self.http = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=None, sock_connect=10))
        self.ws = await self.http.ws_connect("wss://api.openai.com/v1/realtime?model=gpt-realtime-2.1", headers={"Authorization": f"Bearer {self.key}"}, heartbeat=20)
        await self.ws.send_json({"type":"session.update","session":{"type":"transcription","audio":{"input":{"format":{"type":"audio/pcm","rate":RATE},"transcription":{"model":"gpt-live-transcribe","prompt":"German job interview for Transdev Vertrieb, Prüfpersonal im Zug, Tübingen.","keywords":["Transdev","Prüfpersonal","Fahrgast","Fahrschein","Ticket","Schichtdienst","Kundenservice","Tübingen","Verbindung","Einarbeitung"],"languages":["de"],"delay":"minimal"},"turn_detection":None}}}})
        self.reader = asyncio.create_task(self._read())
        await self.hub.patch(connected=True, status="Dinliyor", last_error="")

    async def audio(self, pcm: bytes):
        if self.ws and not self.ws.closed:
            await self.ws.send_json({"type":"input_audio_buffer.append","audio":base64.b64encode(pcm).decode()})

    async def commit(self):
        if self.ws and not self.ws.closed:
            await self.ws.send_json({"type":"input_audio_buffer.commit"})

    async def _read(self):
        assert self.ws
        try:
            async for msg in self.ws:
                if msg.type != aiohttp.WSMsgType.TEXT:
                    continue
                e = json.loads(msg.data)
                typ = e.get("type")
                if typ == "conversation.item.input_audio_transcription.delta":
                    i, d = str(e.get("item_id", "current")), str(e.get("delta", ""))
                    if d:
                        self.buffers[i] = self.buffers.get(i, "") + d
                        await self.engine.transcript(self.buffers[i])
                elif typ == "conversation.item.input_audio_transcription.completed":
                    i = str(e.get("item_id", "current"))
                    text = str(e.get("transcript", "")).strip() or self.buffers.get(i, "")
                    if text:
                        await self.engine.transcript(text, True)
                    self.buffers.pop(i, None)
                elif typ == "error":
                    err = e.get("error", {})
                    await self.hub.patch(status="Hata", last_error=f"Realtime: {err.get('message', err)}")
        except asyncio.CancelledError:
            pass
        except Exception as ex:
            await self.hub.patch(connected=False, status="Bağlantı koptu", last_error=f"Realtime: {ex}")

    async def close(self):
        if self.reader and not self.reader.done():
            self.reader.cancel()
        if self.ws and not self.ws.closed:
            await self.ws.close()
        if self.http:
            await self.http.close()
        await self.hub.patch(connected=False, status="Bağlantı kapalı")


def pcm24k(data: np.ndarray, source_rate=48_000) -> bytes:
    if data.size == 0:
        return b""
    a = np.asarray(data, np.float32)
    if a.ndim == 2:
        a = a.mean(axis=1)
    a = np.clip(np.nan_to_num(a), -1, 1)
    if source_rate != RATE and len(a) > 1:
        n = max(1, round(len(a) * RATE / source_rate))
        a = np.interp(np.linspace(0, 1, n, endpoint=False), np.linspace(0, 1, len(a), endpoint=False), a)
    return (a * 32767).astype("<i2").tobytes()


class Audio:
    def __init__(self, query: str | None):
        import threading
        self.query, self.stop_event = query, threading.Event()

    @staticmethod
    def devices():
        import soundcard as sc
        return [str(x.name) for x in sc.all_speakers()]

    def select(self):
        import soundcard as sc
        speakers = sc.all_speakers()
        speaker = sc.default_speaker()
        if self.query:
            found = [s for s in speakers if self.query.lower() in str(s.name).lower()]
            if not found:
                raise RuntimeError(f"Speaker bulunamadı: {self.query}")
            speaker = found[0]
        loops = sc.all_microphones(include_loopback=True)
        same = [m for m in loops if str(speaker.name).lower() in str(m.name).lower()]
        if same:
            return same[0], speaker
        try:
            return sc.get_microphone(str(speaker.name), include_loopback=True), speaker
        except Exception:
            pass
        loops = [m for m in loops if getattr(m, "isloopback", False)]
        if not loops:
            raise RuntimeError(f"Loopback aygıtı bulunamadı: {speaker.name}")
        return loops[0], speaker

    async def run(self, rt: Realtime, hub: Hub):
        mic, speaker = self.select()
        await hub.patch(status=f"Dinliyor: {speaker.name}")
        q: asyncio.Queue[bytes] = asyncio.Queue(32)
        loop = asyncio.get_running_loop()

        def worker():
            try:
                with mic.recorder(samplerate=48_000, blocksize=2048) as rec:
                    while not self.stop_event.is_set():
                        chunk = pcm24k(rec.record(numframes=2400))
                        if chunk:
                            def put(x=chunk):
                                if q.full():
                                    try:
                                        q.get_nowait()
                                    except asyncio.QueueEmpty:
                                        pass
                                q.put_nowait(x)
                            loop.call_soon_threadsafe(put)
            except Exception as ex:
                loop.call_soon_threadsafe(asyncio.create_task, hub.patch(status="Audio hatası", last_error=f"Audio: {ex}"))

        import threading
        threading.Thread(target=worker, daemon=True).start()
        voiced = False
        silent = active = 0.0
        while not self.stop_event.is_set():
            chunk = await q.get()
            await rt.audio(chunk)
            s = np.frombuffer(chunk, dtype="<i2").astype(np.float32) / 32768
            ms = len(s) / RATE * 1000
            rms = float(np.sqrt(np.mean(s * s))) if len(s) else 0
            if rms >= .0035:
                voiced = True
                silent = 0
                active += ms
            elif voiced:
                silent += ms
                active += ms
            if voiced and (silent >= 340 or active >= 15_000):
                await rt.commit()
                voiced = False
                silent = active = 0

    def stop(self):
        self.stop_event.set()


class Server:
    def __init__(self, token: str, hub: Hub, engine: Engine, port: int):
        self.token, self.hub, self.engine, self.port = token, hub, engine, port
        self.runner = None

    def ok(self, r):
        return secrets.compare_digest(str(r.query.get("token") or r.headers.get("X-Transdev-Token", "")), self.token)

    async def index(self, r):
        if not self.ok(r):
            raise web.HTTPForbidden()
        resp = web.FileResponse(STATIC / "index.html")
        resp.headers.update({"Cache-Control":"no-store", "X-Robots-Tag":"noindex, nofollow, noarchive"})
        return resp

    async def ws(self, r):
        if not self.ok(r):
            raise web.HTTPForbidden()
        ws = web.WebSocketResponse(heartbeat=20)
        await ws.prepare(r)
        self.hub.clients.add(ws)
        await ws.send_json({"type":"state", "state":asdict(self.hub.state)})
        try:
            async for _ in ws:
                pass
        finally:
            self.hub.clients.discard(ws)
        return ws

    async def health(self, r):
        valid = self.ok(r)
        return web.json_response({"ok":valid, "state":asdict(self.hub.state) if valid else None}, status=200 if valid else 403, headers={"Cache-Control":"no-store"})

    async def ingest(self, r):
        if not self.ok(r):
            raise web.HTTPForbidden()
        b = await r.json()
        text = str(b.get("text", "")).strip()
        if not text:
            return web.json_response({"ok":False}, status=422)
        await self.engine.transcript(text, bool(b.get("final")))
        return web.json_response({"ok":True, "state":asdict(self.hub.state)})

    async def start(self):
        a = web.Application(client_max_size=16384)
        a.router.add_get("/", self.index)
        a.router.add_get("/ws", self.ws)
        a.router.add_get("/health", self.health)
        a.router.add_post("/test/ingest", self.ingest)
        a.router.add_static("/static/", STATIC)
        self.runner = web.AppRunner(a, access_log=None)
        await self.runner.setup()
        await web.TCPSite(self.runner, "0.0.0.0", self.port).start()

    async def close(self):
        if self.runner:
            await self.runner.cleanup()


def local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()


def self_test(m: Matcher):
    tests = [
        ("Warum möchten Sie bei Transdev arbeiten?", "why_transdev"),
        ("Was machen Sie bei einem aggressiven Fahrgast?", "aggressive"),
        ("Können Sie nachts und am Wochenende im Schichtdienst arbeiten?", "shift"),
        ("Welche Erfahrungen haben Sie bisher gesammelt?", "experience"),
        ("Wo sehen Sie sich in fünf Jahren?", "future"),
    ]
    bad = 0
    for text, want in tests:
        got = (m.match(text) or {}).get("id", "NONE")
        ok = got == want
        bad += not ok
        print(("PASS" if ok else "FAIL"), text, "->", got)
    return int(bool(bad))


async def main(args):
    load_dotenv(ROOT / ".env")
    matcher = Matcher()
    if args.self_test:
        return self_test(matcher)
    if args.list_devices:
        for i, n in enumerate(Audio.devices(), 1):
            print(f"{i}. {n}")
        return 0
    key = os.getenv("OPENAI_API_KEY", "").strip()
    if not key and not args.no_audio:
        print("OPENAI_API_KEY eksik.", file=sys.stderr)
        return 2
    token = os.getenv("TRANSDEV_LIVE_TOKEN", "").strip() or secrets.token_urlsafe(18)
    hub = Hub()
    fb = Fallback(key, hub, os.getenv("OPENAI_TEXT_MODEL", "gpt-5.6-luna")) if key else None
    eng = Engine(matcher, hub, fb)
    srv = Server(token, hub, eng, args.port)
    await srv.start()
    print(f"PC: http://127.0.0.1:{args.port}/?token={token}\nTablet: http://{local_ip()}:{args.port}/?token={token}\nSes/transkript diske kaydedilmez.")
    rt = audio = task = None
    try:
        if args.no_audio:
            await hub.patch(status="Test modu")
        else:
            await fb.start()
            rt = Realtime(key, eng, hub)
            await rt.connect()
            audio = Audio(args.speaker)
            task = asyncio.create_task(audio.run(rt, hub))
        while True:
            await asyncio.sleep(3600)
    except (KeyboardInterrupt, asyncio.CancelledError):
        pass
    finally:
        if audio:
            audio.stop()
        if task and not task.done():
            task.cancel()
        if rt:
            await rt.close()
        if fb:
            await fb.close()
        await srv.close()
    return 0


def args():
    p = argparse.ArgumentParser()
    p.add_argument("--speaker")
    p.add_argument("--port", type=int, default=PORT)
    p.add_argument("--list-devices", action="store_true")
    p.add_argument("--no-audio", action="store_true")
    p.add_argument("--self-test", action="store_true")
    return p.parse_args()


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(main(args())))
    except KeyboardInterrupt:
        raise SystemExit(0)
