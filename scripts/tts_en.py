#!/usr/bin/env python3
"""Ingliz tilida TTS (asosiy ovoz profili, seed va boshqa sozlamalar o'zgarmaydi; faqat 'language' = 'en' xotirada).
Ishlatish: python3 scripts/tts_en.py <satrlar.txt> <chiqish_papkasi> [--speed 1.0]
Har satr -> <papka>/line_NN.wav (24 kHz mono), kesh: md5(matn|seed|speed|en). Backend 400/429 bersa qayta urinadi.
LITSENZIYA: OmniVoice CC-BY-NC — faqat demo/sinov (daromadli kanalga YO'Q)."""
import sys, json, hashlib, pathlib, time, argparse, urllib.error
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import tts_vs as T
T.CFG["language"] = "en"
ap = argparse.ArgumentParser(); ap.add_argument("lines"); ap.add_argument("out"); ap.add_argument("--speed", type=float, default=T.CFG["speed"]); a = ap.parse_args()
out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True); cache = out / "cache"; cache.mkdir(exist_ok=True)
lines = [l.strip() for l in pathlib.Path(a.lines).read_text(encoding="utf-8").splitlines() if l.strip()]
T.check_backend(); pid = T.ensure_profile()
for i, line in enumerate(lines):
    key = hashlib.md5(f"{line}|{T.CFG['seed']}|{a.speed}|en".encode()).hexdigest()[:12]; cf = cache / f"{key}.wav"
    if not cf.exists():
        for k in range(10):
            try: cf.write_bytes(T.synth_line(pid, line, T.CFG["seed"], a.speed)); break
            except urllib.error.HTTPError as e:
                print(f"  urinish {k+1}: HTTP {e.code}", flush=True); time.sleep(20)
        else: sys.exit(f"XATO: satr {i+1} sintez bo'lmadi")
    (out / f"line_{i:02d}.wav").write_bytes(cf.read_bytes()); print(f"[{i+1}/{len(lines)}] OK: {line}", flush=True)
print("TAYYOR")
