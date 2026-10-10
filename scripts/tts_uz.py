#!/usr/bin/env python3
"""O'zbekcha ovoz (TTS). Ishlatish:
  python scripts/tts_uz.py matn.txt out.mp3 [--voice uz-UZ-MadinaNeural] [--rate -5%]
Ovozlar: uz-UZ-MadinaNeural (ayol), uz-UZ-SardorNeural (erkak).
Eslatma: bu bepul Microsoft neyron ovozi. Eng yuqori sifat kerak bo'lsa
ElevenLabs/Azure Speech ni .env orqali ulang va klientga namuna eshittiring."""
import argparse, asyncio, pathlib, edge_tts

p = argparse.ArgumentParser()
p.add_argument("text_file"); p.add_argument("out")
p.add_argument("--voice", default="uz-UZ-MadinaNeural")
p.add_argument("--rate", default="-5%")   # sal sekinroq = tabiiyroq
p.add_argument("--pitch", default="+0Hz")
a = p.parse_args()
text = pathlib.Path(a.text_file).read_text(encoding="utf-8").strip()
asyncio.run(edge_tts.Communicate(text, a.voice, rate=a.rate, pitch=a.pitch).save(a.out))
print("OK:", a.out)
