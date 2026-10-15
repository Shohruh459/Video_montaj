#!/usr/bin/env python3
"""O'zbekcha nutq -> matn (Whisper, o'zbekchaga sozlangan, Apache-2.0).
Ishlatish: python3 scripts/asr_uz.py <video|audio> <chiqish_prefiksi> [--ss N] [--t N] [--model ID]
Chiqadi: <prefiks>.json (so'zlar+vaqt), <prefiks>.srt (<=42 belgi/qator), <prefiks>.txt.
DIQQAT: natija HAR DOIM odam tomonidan o'qib to'g'rilanadi (WER ~14% toza nutqda, shovqin/she'rda yomonroq). Mijozga tasdiqlanmagan matn subtitr bo'lmaydi.
Venv: .venv/bin/python (transformers, torch). Birinchi marta model ~1.5 GB yuklanadi."""
import sys, json, argparse, subprocess, pathlib, re
import numpy as np, torch
from transformers import pipeline
ap = argparse.ArgumentParser(); ap.add_argument("src"); ap.add_argument("out"); ap.add_argument("--ss", default="0"); ap.add_argument("--t", default=None)
ap.add_argument("--model", default="navai-uz/whisper-medium-uzbek"); a = ap.parse_args()
cmd = ["ffmpeg", "-v", "error", "-ss", a.ss] + (["-t", a.t] if a.t else []) + ["-i", a.src, "-vn", "-ar", "16000", "-ac", "1", "-f", "f32le", "-"]
x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32)
p = pipeline("automatic-speech-recognition", model=a.model, device=-1, dtype=torch.bfloat16, chunk_length_s=30, stride_length_s=5)
r = p({"raw": x, "sampling_rate": 16000}, return_timestamps="word", generate_kwargs={"language": "uz", "task": "transcribe"})
def norm(s):  # loyiha imlosi: oʻ gʻ = U+02BB, tutuq = U+02BC
    s = s.replace("ʻ", "ʻ").replace("‘", "ʻ").replace("’", "ʼ")
    s = re.sub(r"([oOgG])['`´]", lambda m: m.group(1) + "ʻ", s); return re.sub(r"(?<=[a-zA-Z])'(?=[a-zA-Z])", "ʼ", s)
W = []
for c in r["chunks"]:
    t0, t1 = c["timestamp"]; w = norm(c["text"]).strip()
    if w: W.append({"w": w, "t0": t0, "t1": t1 if t1 is not None else (t0 + 0.4)})
for i in range(len(W) - 1):
    if W[i]["t1"] > W[i + 1]["t0"]: W[i]["t1"] = W[i + 1]["t0"]
lines, cur = [], []
for w in W:
    if cur and (len(" ".join(c["w"] for c in cur + [w])) > 42 or w["t0"] - cur[-1]["t1"] > 0.7): lines.append(cur); cur = []
    cur.append(w)
if cur: lines.append(cur)
def ts(t): h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60; return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")
out = pathlib.Path(a.out)
json.dump({"model": a.model, "words": W}, open(f"{out}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(f"{out}.srt", "w", encoding="utf-8").write("\n".join(f"{i+1}\n{ts(l[0]['t0'])} --> {ts(l[-1]['t1'])}\n{' '.join(w['w'] for w in l)}\n" for i, l in enumerate(lines)))
open(f"{out}.txt", "w", encoding="utf-8").write("\n".join(" ".join(w["w"] for w in l) for l in lines) + "\n")
print(open(f"{out}.srt", encoding="utf-8").read())
