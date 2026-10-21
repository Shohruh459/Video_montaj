#!/usr/bin/env python3
"""Reel spetsifikatsiyasidagi har bir ovoz iborasini o'zbekcha Whisper (navai-uz) bilan tekshiradi; WER>0 bo'lsa qayta sintez qilib eng yaxshisini keshga yozadi.
Ishlatish: .venv/bin/python scripts/tts_uz_pick.py projects/<loyiha>/specs/NN.json [--tries 4]
Eslatma: ASR nisbiy tekshiruv; ovozni baribir inson eshitadi. Seed va sozlamalar o'zgarmaydi."""
import json, hashlib, subprocess, pathlib, sys, tempfile, time, urllib.error, re, argparse
import numpy as np, torch
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import tts_vs
from transformers import pipeline
ap = argparse.ArgumentParser(); ap.add_argument("spec"); ap.add_argument("--tries", type=int, default=4); a = ap.parse_args()
sp = pathlib.Path(a.spec); spec = json.load(open(sp, encoding="utf-8")); vd = sp.parent.parent / "voice" / "cache"
asr = pipeline("automatic-speech-recognition", model="navai-uz/whisper-medium-uzbek", device=-1, dtype=torch.bfloat16)
norm = lambda s: re.sub(r"[^a-z' ]", "", s.lower().replace("ʻ", "'").replace("ʼ", "'").replace("’", "'").replace("-", " ")).split()
def wer(r, h):
    r, h = norm(r), norm(h); d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        p, d[0] = d[0], i
        for j in range(1, len(h) + 1): p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (r[i - 1] != h[j - 1]))
    return d[len(h)] / max(1, len(r))
def hear(path):
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ar", "16000", "-ac", "1", "-f", "f32le", "-"], capture_output=True).stdout, dtype=np.float32)
    return asr({"raw": x, "sampling_rate": 16000}, generate_kwargs={"language": "uz", "task": "transcribe"})["text"].strip()
tts_vs.check_backend(); pid = tts_vs.ensure_profile()
for i, p in enumerate(spec["phrases"]):
    k = hashlib.md5(f'{p["say"]}|{tts_vs.CFG["seed"]}|{tts_vs.CFG["speed"]}'.encode()).hexdigest()[:12]; f = vd / f"v_{k}.wav"
    h = hear(f); w = wer(p["say"], h); print(f"{i+1:02d} WER {w:.2f} | {p['say']} || {h}", flush=True)
    if w == 0: continue
    best = (w, f.read_bytes())
    for t in range(a.tries):
        wb = None
        for _ in range(8):
            try: wb = tts_vs.synth_line(pid, p["say"], tts_vs.CFG["seed"], tts_vs.CFG["speed"]); break
            except urllib.error.HTTPError: time.sleep(20)
        if wb is None: continue
        tmp = pathlib.Path(tempfile.mkstemp(suffix=".wav")[1]); tmp.write_bytes(wb); h2 = hear(tmp); w2 = wer(p["say"], h2)
        print(f"   qayta {t+1}: WER {w2:.2f} | {h2}", flush=True)
        if w2 < best[0]: best = (w2, wb)
        if w2 == 0: break
    f.write_bytes(best[1]); print(f"   -> tanlandi WER {best[0]:.2f}", flush=True)
print("TAYYOR", flush=True)
