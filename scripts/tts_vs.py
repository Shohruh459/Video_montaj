#!/usr/bin/env python3
"""Asosiy ovoz (VoiceStudio/OmniVoice, config/voice.json) bilan o'zbekcha TTS.
Ishlatish: python3 scripts/tts_vs.py matn.txt out.wav [--seed N] [--speed 0.9] [--pause 0.5]
Matn faylidagi har bir QATOR alohida generatsiya qilinadi, qatorlar orasiga --pause soniya jim qo'shiladi.
Backend ishlamasa:  cd <voicestudio> && setsid nohup bun scripts/dev-backend.mjs &   (health: :3900/health)
LITSENZIYA: model CC-BY-NC — faqat demo/sinov, mijozning tijoriy ishi uchun emas."""
import argparse, json, pathlib, subprocess, sys, tempfile, urllib.request

root = pathlib.Path(__file__).resolve().parent.parent
cfg = json.loads((root / "config/voice.json").read_text(encoding="utf-8"))
p = argparse.ArgumentParser()
p.add_argument("text_file"); p.add_argument("out")
p.add_argument("--seed", type=int, default=cfg["seed"])
p.add_argument("--speed", type=float, default=cfg["speed"])
p.add_argument("--pause", type=float, default=0.4)
a = p.parse_args()

lines = [l.strip() for l in pathlib.Path(a.text_file).read_text(encoding="utf-8").splitlines() if l.strip()]
try:
    urllib.request.urlopen(cfg["api"].rsplit("/v1", 1)[0] + "/health", timeout=5)
except Exception:
    sys.exit("XATO: VoiceStudio backend ishlamayapti (http://localhost:3900). Ishga tushiring (fayl boshidagi izohga qarang).")

tmp = pathlib.Path(tempfile.mkdtemp())
parts = []
for i, line in enumerate(lines):
    body = {k: cfg[k] for k in ("model", "language", "instruct", "response_format")}
    body.update(voice="default", input=line, seed=a.seed, speed=a.speed)
    req = urllib.request.Request(cfg["api"], json.dumps(body).encode(), {"Content-Type": "application/json"})
    f = tmp / f"p{i:02d}.wav"
    f.write_bytes(urllib.request.urlopen(req, timeout=900).read())
    parts.append(f)
    print(f"[{i+1}/{len(lines)}] OK: {line[:50]}")

sil = tmp / "sil.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(a.pause), str(sil)], check=True)
lst = tmp / "list.txt"
lst.write_text("".join(f"file '{x}'\nfile '{sil}'\n" for x in parts[:-1]) + f"file '{parts[-1]}'\n")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c:a", "pcm_s16le", a.out], check=True)
print("TAYYOR:", a.out)
