#!/usr/bin/env python3
"""Spec dagi har bir iborani asosiy ovoz (tts_vs, filtr A) bilan sintez qiladi; matn xeshi bo'yicha keshlaydi.
Ishlatish: python3 scripts/reel_voice.py projects/<loyiha>/specs/01.json"""
import sys, json, hashlib, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import tts_vs
spec_p = pathlib.Path(sys.argv[1]); spec = json.load(open(spec_p, encoding="utf-8"))
vdir = spec_p.parent.parent / "voice" / "cache"; vdir.mkdir(parents=True, exist_ok=True)
tts_vs.check_backend(); pid = tts_vs.ensure_profile()
for i, p in enumerate(spec["phrases"]):
    key = hashlib.md5(f'{p["say"]}|{tts_vs.CFG["seed"]}|{tts_vs.CFG["speed"]}'.encode()).hexdigest()[:12]
    f = vdir / f"v_{key}.wav"
    if not f.exists():
        f.write_bytes(tts_vs.synth_line(pid, p["say"], tts_vs.CFG["seed"], tts_vs.CFG["speed"]))
    print(f"[{i+1}/{len(spec['phrases'])}] {f.name} {p['say'][:48]}", flush=True)
print("TAYYOR")
