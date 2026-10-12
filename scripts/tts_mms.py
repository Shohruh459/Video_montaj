#!/usr/bin/env python3
"""Zaxira o'zbekcha TTS (HuggingFace MMS, offline-ga yaqin, edge-tts bloklanganda).
Lotin matnni kirillga o'giradi va VITS modeli bilan ovozlaydi.
  python scripts/tts_mms.py "Salom dunyo" out.wav [--model MuzaffarSharofitdinov/mms-tts-uzbek-girl-voice_cyrillic]
Kutubxonadan: from tts_mms import synth"""
import re, sys, argparse

MODEL = "MuzaffarSharofitdinov/mms-tts-uzbek-girl-voice_cyrillic"
_APOS = "ʻʼ‘’'`´"
VOW = set("aeiouоуэаиеёюя")
SIMPLE = dict(a="а", b="б", d="д", f="ф", g="г", h="ҳ", i="и", j="ж", k="к", l="л", m="м", n="н", o="о",
              p="п", q="қ", r="р", s="с", t="т", u="у", v="в", w="в", x="х", y="й", z="з", c="к")


def translit(text: str) -> str:
    t = text.lower()
    for ch in _APOS:
        t = t.replace(ch, "ʼ")
    out = []
    for word in re.split(r"(\W+)", t):
        if not word or not re.match(r"\w", word, re.U) and "ʼ" not in word:
            out.append(word); continue
        w = word.replace("oʼ", "ў").replace("gʼ", "ғ")
        for a, b in (("sh", "ш"), ("ch", "ч"), ("yo", "ё"), ("yu", "ю"), ("ya", "я"), ("ye", "е"), ("ng", "нг"), ("ʼ", "ъ")):
            w = w.replace(a, b)
        res, prev = [], ""
        for i, c in enumerate(w):
            if c == "e":
                c = "э" if (i == 0 or prev in VOW) else "е"
            else:
                c = SIMPLE.get(c, c)
            res.append(c); prev = c
        out.append("".join(res))
    return "".join(out)


_cache = {}


def synth(latin: str, model: str = MODEL):
    """-> (numpy float32 wav, sample_rate)"""
    import torch
    from transformers import VitsModel, AutoTokenizer
    if model not in _cache:
        _cache[model] = (VitsModel.from_pretrained(model).eval(), AutoTokenizer.from_pretrained(model))
    m, tok = _cache[model]
    torch.manual_seed(7)  # bir xil ovoz/ohang har safar
    m.noise_scale = 0.4  # kamroq tebranish = barqarorroq talaffuz
    with torch.no_grad():
        w = m(**tok(translit(latin), return_tensors="pt")).waveform[0].numpy()
    return w, m.config.sampling_rate


if __name__ == "__main__":
    import scipy.io.wavfile as wf
    p = argparse.ArgumentParser(); p.add_argument("text"); p.add_argument("out"); p.add_argument("--model", default=MODEL)
    a = p.parse_args()
    w, sr = synth(a.text, a.model); wf.write(a.out, sr, w); print("OK", a.out, round(len(w) / sr, 2), "s")
