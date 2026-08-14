# Transdev Live Listener — Prototype

Local Windows helper for the Transdev interview study project. It captures the selected Windows output device through WASAPI loopback, streams live German audio to OpenAI realtime transcription, matches common Transdev interview questions locally, and serves a tablet-friendly answer screen on the local network.

## Privacy / scope

- Audio and transcripts are **not written to files by this helper**.
- The OpenAI API key stays in the local `.env` file and is never sent to the tablet/browser.
- The web UI is protected by a random per-run token.
- This prototype captures the **selected output device**, not yet the individual Teams process. Keep other audio applications quiet or route Teams to a dedicated headset/output. Per-process Teams capture is the next hardening step.

## Requirements

- Windows 10/11
- Python 3.11+
- Teams audio playing through a Windows output device
- OpenAI API key
- PC and tablet on the same local network for tablet mode

## Fast setup on Windows

From PowerShell inside this folder:

```powershell
.\start.ps1
```

The first run creates `.venv`, installs dependencies and creates `.env`. If the API key is missing, Notepad opens the local `.env` file. Put the key only there; do not commit or paste it into chat. Run `start.ps1` again after saving.

## Manual setup

```powershell
cd tools\transdev-listener
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
notepad .env
```

Put the API key in `.env`:

```text
OPENAI_API_KEY=...
```

## Check the matcher without audio or API

```powershell
python app.py --self-test
```

## List Windows output devices

```powershell
python app.py --list-devices
```

## Run live

Default output device:

```powershell
python app.py
```

Or choose a speaker/headset by part of its name:

```powershell
python app.py --speaker "Headphones"
```

You can also pass that argument through the launcher:

```powershell
.\start.ps1 --speaker "Headphones"
```

At startup the helper prints two tokenized URLs. Open the `Tablet:` URL on the tablet/phone. The tablet never receives the API key.

## UI / matcher test without audio

```powershell
python app.py --no-audio
```

Open the printed PC URL. In another PowerShell, use the same token:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://127.0.0.1:8765/test/ingest?token=TOKEN" `
  -ContentType "application/json" `
  -Body '{"text":"Warum möchten Sie bei Transdev arbeiten?","final":false}'
```

The prepared B1 answer should appear immediately in the browser.

## Current latency strategy

1. Realtime transcript deltas update while the interviewer is still speaking.
2. Every partial transcript is checked against `cards.json` locally.
3. A strong prepared-question match shows its B1 answer immediately without waiting for an LLM answer.
4. For an unknown question, the first meaningful partial starts the AI fallback early. While that request is running, the newest partial transcript is kept pending and used for an immediate refinement; the system does not wait for turn-end before starting an answer.
5. Local silence detection is used only to commit/finalize a speech segment; prepared-answer matching and the AI fallback start before finalization.

## Known prototype limitation

The audio backend is device-level WASAPI loopback via `soundcard`. It does not yet isolate only `Teams.exe`. For the first live test, use a dedicated Teams output device or ensure no unrelated audio is playing. A future Windows-native Application Loopback capture backend can isolate the Teams process while leaving the rest of the pipeline unchanged.
