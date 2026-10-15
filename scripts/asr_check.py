# Ovoz tushunarliligini tekshirish (Whisper-small, so'z vaqtlari): .venv/bin/python scripts/asr_check.py fayl.wav ...  (Whisper o'zbekchada kuchsiz: faqat nisbiy taqqos uchun)
import sys, soundfile as sf, numpy as np, torch
from transformers import pipeline
p = pipeline("automatic-speech-recognition", model="openai/whisper-small", device=-1, torch_dtype=torch.float32)
for f in sys.argv[1:]:
    x, sr = sf.read(f); x = x if x.ndim == 1 else x.mean(1)
    if sr != 16000:
        import subprocess, io
        raw = subprocess.run(["ffmpeg","-v","error","-i",f,"-ar","16000","-ac","1","-f","f32le","-"],capture_output=True).stdout; x = np.frombuffer(raw, dtype=np.float32); sr = 16000
    r = p({"raw": x.astype(np.float32), "sampling_rate": 16000}, return_timestamps="word", generate_kwargs={"language": "uz", "task": "transcribe"})
    print(f.split('/')[-1], '|', r["text"].strip())
    for c in r["chunks"]: print(f'   {c["timestamp"][0]:5.2f}-{c["timestamp"][1]:5.2f}  {c["text"]}')
