from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import secrets
import socket
import time
import unicodedata
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import numpy as np
from aiohttp import web

ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "static"
CARDS = ROOT / "cards.json"
BRIDGE = ROOT / "bridge"
QUESTION_FILE = BRIDGE / "live-question.json"
ANSWER_FILE = BRIDGE / "live-answer.json"
RATE = 16_000
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


class WorkBridge:
    def __init__(self, hub: Hub):
        self.hub = hub
        self.active_id = ""
        self.last_question_norm = ""
        self.last_write = 0.0
        self.task: asyncio.Task | None = None
        BRIDGE.mkdir(parents=True, exist_ok=True)
        if not ANSWER_FILE.exists():
            ANSWER_FILE.write_text('{"request_id":"","translation_tr":"","answer_de":""}\n', encoding="utf-8")

    def clear(self):
        self.active_id = ""

    async def request(self, text: str, rev: int, final: bool):
        n = norm(text)
        now = time.time()
        if not final and n == self.last_question_norm:
            return
        if not final and now - self.last_write < .65:
            return
        self.active_id = f"{rev}-{int(now * 1000)}"
        self.last_question_norm = n
        self.last_write = now
        payload = {
            "request_id": self.active_id,
            "updated_at": now,
            "final": bool(final),
            "question_de": text,
            "role": "Transdev Vertrieb - Prüfpersonal im Zug - Tübingen",
            "german_level": "B1",
            "answer_rule": "Return 1-3 short natural B1 German sentences and a short Turkish meaning. Do not invent experience.",
            "truthful_background": [
                "Mutlu Akustik: Technical Project Manager, 2018-Dec 2024; projects, customers, seven-person technical team, purchasing/logistics, on-site work.",
                "Webrano: Technical Project Manager / Electronics Technician, 2010-2018; business customer support, technical service, five-person team coordination."
            ],
            "forbidden_inventions": ["Hermes", "Deutsche Post", "Lieferando", "railway-control experience"]
        }
        tmp = QUESTION_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        os.replace(tmp, QUESTION_FILE)

    async def watch(self):
        last_sig = None
        while True:
            try:
                if ANSWER_FILE.exists():
                    st = ANSWER_FILE.stat()
                    sig = (st.st_mtime_ns, st.st_size)
                    if sig != last_sig:
                        last_sig = sig
                        data = json.loads(ANSWER_FILE.read_text(encoding="utf-8"))
                        rid = str(data.get("request_id", ""))
                        answer = str(data.get("answer_de", "")).strip()
                        tr = str(data.get("translation_tr", "")).strip()
                        if rid and rid == self.active_id and answer and not self.hub.state.match_id:
                            await self.hub.patch(
                                translation_tr=tr,
                                answer_de=answer,
                                answer_source="ChatGPT Work",
                                status="Cevap hazır",
                                last_error=""
                            )
            except Exception as e:
                await self.hub.patch(last_error=f"Work bridge: {e}")
            await asyncio.sleep(.20)


class Engine:
    def __init__(self, matcher: Matcher, hub: Hub, bridge: WorkBridge):
        self.matcher, self.hub, self.bridge = matcher, hub, bridge

    async def transcript(self, text: str, final=False):
        text = re.sub(r"\s+", " ", text).strip()
        if not text:
            return
        rev = self.hub.state.revision + 1
        m = self.matcher.match(text)
        base = dict(transcript_de=text, revision=rev, last_error="")
        if m:
            self.bridge.clear()
            await self.hub.patch(
                **base,
                translation_tr=m["translation"],
                answer_de=m["answer"],
                answer_source="Hazır",
                match_id=m["id"],
                match_score=m["score"],
                status="Cevap hazır"
            )
            return
        await self.hub.patch(
            **base,
            translation_tr="",
            answer_de="",
            answer_source="ChatGPT Work bekleniyor" if len(text) >= 12 else "",
            match_id="",
            match_score=0.0,
            status="Soru tamamlandı" if final else "Dinliyor"
        )
        if len(text) >= 12:
            await self.bridge.request(text, rev, final)


class LocalWhisper:
    def __init__(self, engine: Engine, hub: Hub, model_name: str):
        self.engine, self.hub, self.model_name = engine, hub, model_name
        self.model = None
        self.partial_task: asyncio.Task | None = None

    async def start(self):
        await self.hub.patch(status=f"Yerel Almanca modeli hazırlanıyor: {self.model_name}")
        from faster_whisper import WhisperModel
        self.model = await asyncio.to_thread(WhisperModel, self.model_name, device="cpu", compute_type="int8")
        await self.hub.patch(connected=True, status="Dinliyor", last_error="")

    def _decode(self, pcm: bytes) -> str:
        if not self.model or not pcm:
            return ""
        audio = np.frombuffer(pcm, dtype="<i2").astype(np.float32) / 32768.0
        segments, _ = self.model.transcribe(
            audio,
            language="de",
            beam_size=1,
            best_of=1,
            temperature=0,
            condition_on_previous_text=False,
            vad_filter=False,
            word_timestamps=False,
            initial_prompt="Transdev Vertrieb Prüfpersonal Fahrgast Fahrschein Ticket Schichtdienst Kundenservice Tübingen"
        )
        return " ".join(s.text.strip() for s in segments if s.text.strip()).strip()

    def schedule_partial(self, pcm: bytes):
        if self.partial_task and not self.partial_task.done():
            return
        self.partial_task = asyncio.create_task(self._partial(pcm))

    async def _partial(self, pcm: bytes):
        try:
            text = await asyncio.to_thread(self._decode, pcm)
            if text:
                await self.engine.transcript(text, False)
        except Exception as e:
            await self.hub.patch(last_error=f"Local STT: {e}")

    async def final(self, pcm: bytes):
        if self.partial_task and not self.partial_task.done():
            try:
                await self.partial_task
            except Exception:
                pass
        try:
            text = await asyncio.to_thread(self._decode, pcm)
            if text:
                await self.engine.transcript(text, True)
        except Exception as e:
            await self.hub.patch(last_error=f"Local STT: {e}")


def pcm16k(data: np.ndarray, source_rate=48_000) -> bytes:
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

    async def run(self, stt: LocalWhisper, hub: Hub):
        mic, speaker = self.select()
        await hub.patch(status=f"Dinliyor: {speaker.name}")
        q: asyncio.Queue[bytes] = asyncio.Queue(64)
        loop = asyncio.get_running_loop()

        def worker():
            try:
                with mic.recorder(samplerate=48_000, blocksize=2048) as rec:
                    while not self.stop_event.is_set():
                        chunk = pcm16k(rec.record(numframes=2400))
                        if chunk:
                            def put(x=chunk):
                                if q.full():
                                    try: q.get_nowait()
                                    except asyncio.QueueEmpty: pass
                                q.put_nowait(x)
                            loop.call_soon_threadsafe(put)
            except Exception as ex:
                loop.call_soon_threadsafe(asyncio.create_task, hub.patch(status="Audio hatası", last_error=f"Audio: {ex}"))

        import threading
        threading.Thread(target=worker, daemon=True).start()
        voiced = False
        silent_ms = 0.0
        utterance: list[bytes] = []
        last_partial_ms = 0.0
        total_ms = 0.0
        while not self.stop_event.is_set():
            chunk = await q.get()
            s = np.frombuffer(chunk, dtype="<i2").astype(np.float32) / 32768.0
            ms = len(s) / RATE * 1000
            rms = float(np.sqrt(np.mean(s * s))) if len(s) else 0.0
            if rms >= .0035:
                voiced = True
                silent_ms = 0.0
                utterance.append(chunk)
                total_ms += ms
            elif voiced:
                utterance.append(chunk)
                silent_ms += ms
                total_ms += ms

            if voiced and total_ms >= 1200 and total_ms - last_partial_ms >= 1000:
                stt.schedule_partial(b"".join(utterance))
                last_partial_ms = total_ms

            if voiced and (silent_ms >= 380 or total_ms >= 15_000):
                await stt.final(b"".join(utterance))
                voiced = False
                silent_ms = total_ms = last_partial_ms = 0.0
                utterance = []

    def stop(self):
        self.stop_event.set()


class Server:
    def __init__(self, token: str, hub: Hub, engine: Engine, port: int):
        self.token, self.hub, self.engine, self.port = token, hub, engine, port
        self.runner = None

    def ok(self, r):
        return secrets.compare_digest(str(r.query.get("token") or r.headers.get("X-Transdev-Token", "")), self.token)

    async def index(self, r):
        if not self.ok(r): raise web.HTTPForbidden()
        resp = web.FileResponse(STATIC / "index.html")
        resp.headers.update({"Cache-Control":"no-store", "X-Robots-Tag":"noindex, nofollow, noarchive"})
        return resp

    async def ws(self, r):
        if not self.ok(r): raise web.HTTPForbidden()
        ws = web.WebSocketResponse(heartbeat=20)
        await ws.prepare(r)
        self.hub.clients.add(ws)
        await ws.send_json({"type":"state", "state":asdict(self.hub.state)})
        try:
            async for _ in ws: pass
        finally:
            self.hub.clients.discard(ws)
        return ws

    async def health(self, r):
        valid = self.ok(r)
        return web.json_response({"ok":valid, "state":asdict(self.hub.state) if valid else None}, status=200 if valid else 403, headers={"Cache-Control":"no-store"})

    async def ingest(self, r):
        if not self.ok(r): raise web.HTTPForbidden()
        b = await r.json()
        text = str(b.get("text", "")).strip()
        if not text: return web.json_response({"ok":False}, status=422)
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
        if self.runner: await self.runner.cleanup()


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
    matcher = Matcher()
    if args.self_test: return self_test(matcher)
    if args.list_devices:
        for i, n in enumerate(Audio.devices(), 1): print(f"{i}. {n}")
        return 0

    token = os.getenv("TRANSDEV_LIVE_TOKEN", "").strip() or secrets.token_urlsafe(18)
    hub = Hub()
    bridge = WorkBridge(hub)
    eng = Engine(matcher, hub, bridge)
    srv = Server(token, hub, eng, args.port)
    await srv.start()
    bridge.task = asyncio.create_task(bridge.watch())

    print(f"PC: http://127.0.0.1:{args.port}/?token={token}")
    print(f"Tablet: http://{local_ip()}:{args.port}/?token={token}")
    print(f"ChatGPT Work bridge: {BRIDGE}")
    print("API key gerekmez. Ses kaydı yapılmaz.")

    stt = audio = task = None
    try:
        if args.no_audio:
            await hub.patch(connected=True, status="Test modu")
        else:
            stt = LocalWhisper(eng, hub, args.model)
            await stt.start()
            audio = Audio(args.speaker)
            task = asyncio.create_task(audio.run(stt, hub))
        while True: await asyncio.sleep(3600)
    except (KeyboardInterrupt, asyncio.CancelledError):
        pass
    finally:
        if audio: audio.stop()
        if task and not task.done(): task.cancel()
        if bridge.task and not bridge.task.done(): bridge.task.cancel()
        await srv.close()
    return 0


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--speaker")
    p.add_argument("--port", type=int, default=PORT)
    p.add_argument("--model", default=os.getenv("TRANSDEV_WHISPER_MODEL", "base"))
    p.add_argument("--list-devices", action="store_true")
    p.add_argument("--no-audio", action="store_true")
    p.add_argument("--self-test", action="store_true")
    return p.parse_args()


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(main(parse_args())))
    except KeyboardInterrupt:
        raise SystemExit(0)
