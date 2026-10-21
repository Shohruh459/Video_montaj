#!/usr/bin/env python3
"""OmniVoice 'instruct' (ovoz dizayni) variantlarini sinov matnida sintez qilib, o'zbekcha Whisper (navai-uz) bilan baholaydi.
Ishlatish: .venv/bin/python scripts/voice_design_scan.py <chiqish_papka> --text "..." [--seeds 11,22,33] [--instr "male, low pitch, young adult" ...]
Natija: <papka>/scan.json (WER, ichki pauzalar). Filtr A (clean_audio) qo'llanadi. Litsenziya: CC-BY-NC (faqat demo)."""
import sys, json, pathlib, subprocess, re, argparse, tempfile, time, urllib.request, urllib.error
import numpy as np, torch
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import tts_vs
from transformers import pipeline
ap = argparse.ArgumentParser(); ap.add_argument("out"); ap.add_argument("--text", required=True); ap.add_argument("--seeds", default="11,22,33"); ap.add_argument("--instr", nargs="*", default=["male, moderate pitch, young adult", "male, low pitch, young adult", "male, low pitch, middle-aged", "male, moderate pitch, middle-aged", "male, high pitch, young adult"]); a = ap.parse_args()
out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
asr = pipeline("automatic-speech-recognition", model="navai-uz/whisper-medium-uzbek", device=-1, dtype=torch.bfloat16)
norm = lambda s: re.sub(r"[^a-z' ]", "", s.lower().replace("ʻ", "'").replace("ʼ", "'").replace("’", "'").replace("“", "").replace("”", "")).split()
def wer(r, h):
    r, h = norm(r), norm(h); d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        p, d[0] = d[0], i
        for j in range(1, len(h) + 1): p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (r[i - 1] != h[j - 1]))
    return d[len(h)] / max(1, len(r))
def gen(text, instr, seed):
    boundary = "----vsboundary"; fields = {"text": text, "language": "Uzbek", "instruct": instr, "seed": str(seed)}
    body = b"".join(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode() for k, v in fields.items()) + f"--{boundary}--\r\n".encode()
    req = urllib.request.Request("http://localhost:3900/generate", body, {"Content-Type": f"multipart/form-data; boundary={boundary}"})
    for _ in range(6):
        try: return urllib.request.urlopen(req, timeout=900).read()
        except urllib.error.HTTPError: time.sleep(20)
def inner_pauses(f):
    o = subprocess.run(["ffmpeg", "-nostats", "-i", str(f), "-af", "silencedetect=n=-38dB:d=0.18", "-f", "null", "-"], capture_output=True, text=True).stderr
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)], capture_output=True, text=True).stdout)
    ends = [(float(e), float(d)) for e, d in re.findall(r"silence_end: ([\d.]+) \| silence_duration: ([\d.]+)", o)]
    return dur, [round(d, 2) for e, d in ends if e - d > 0.3 and e < dur - 0.2]
tts_vs.check_backend(); res = []
for ii, ins in enumerate(a.instr):
    for sd in [int(x) for x in a.seeds.split(",")]:
        wb = gen(a.text, ins, sd)
        if not wb: continue
        wb = tts_vs.clean_audio(wb); f = out / f"i{ii}_s{sd}.wav"; f.write_bytes(wb)
        x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", str(f), "-ar", "16000", "-ac", "1", "-f", "f32le", "-"], capture_output=True).stdout, dtype=np.float32)
        h = asr({"raw": x, "sampling_rate": 16000}, generate_kwargs={"language": "uz", "task": "transcribe"})["text"].strip(); w = wer(a.text, h); dur, pz = inner_pauses(f)
        r = {"file": f.name, "instr": ins, "seed": sd, "wer": round(w, 3), "dur": round(dur, 2), "pauses": pz, "asr": h}; res.append(r)
        print(f"i{ii} s{sd} WER {w:.2f} dur {dur:.1f} pauzalar {pz} | {ins} | {h}", flush=True)
        json.dump(res, open(out / "scan.json", "w"), ensure_ascii=False, indent=1)
print("TAYYOR", flush=True)
