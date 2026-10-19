#!/usr/bin/env python3
"""Ingliz TTS satrlarini ASR bilan tekshirib, eng tushunarli variantni tanlaydi (seed o'zgarmaydi — model har chaqiriqda biroz boshqacha chiqaradi).
Ishlatish: .venv/bin/python scripts/tts_en_pick.py <satrlar.txt> <ovoz_papka> <indekslar vergul bilan> [--tries 5]
Eslatma: Whisper tekshiruvi nisbiy; ovozni baribir inson eshitadi."""
import sys, re, pathlib, argparse, subprocess, tempfile, urllib.error, time
import numpy as np
from transformers import pipeline
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import tts_vs as T
T.CFG["language"] = "en"
ap = argparse.ArgumentParser(); ap.add_argument("lines"); ap.add_argument("voice"); ap.add_argument("idx"); ap.add_argument("--tries", type=int, default=5); a = ap.parse_args()
lines = [l.strip() for l in pathlib.Path(a.lines).read_text(encoding="utf-8").splitlines() if l.strip()]
norm = lambda s: re.sub(r"[^a-z ]", "", s.lower().replace("-", " ")).split()
asr = pipeline("automatic-speech-recognition", model="openai/whisper-small.en", device=-1)
T.check_backend(); pid = T.ensure_profile()


def hear(wav):
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", wav, "-ar", "16000", "-ac", "1", "-f", "f32le", "-"], capture_output=True).stdout, dtype=np.float32)
    return asr({"raw": x, "sampling_rate": 16000})["text"]


def wer(ref, hyp):
    r, h = norm(ref), norm(hyp); d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        p, d[0] = d[0], i
        for j in range(1, len(h) + 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (r[i - 1] != h[j - 1]))
    return d[len(h)] / max(1, len(r))


V = pathlib.Path(a.voice)
for i in [int(x) for x in a.idx.split(",")]:
    best = None
    for k in range(a.tries):
        wavb = None
        for _ in range(8):
            try:
                wavb = T.synth_line(pid, lines[i], T.CFG["seed"], T.CFG["speed"]); break
            except urllib.error.HTTPError:
                time.sleep(20)
        if wavb is None: continue
        tmp = pathlib.Path(tempfile.mkstemp(suffix=".wav")[1]); tmp.write_bytes(wavb); hyp = hear(str(tmp)); w = wer(lines[i], hyp)
        print(f"  satr {i} urinish {k+1}: WER {w:.2f} | {hyp.strip()}", flush=True)
        if best is None or w < best[0]: best = (w, wavb)
        if w == 0: break
    if best: (V / f"line_{i:02d}.wav").write_bytes(best[1]); print(f"satr {i}: tanlandi WER {best[0]:.2f}", flush=True)
print("TAYYOR", flush=True)
