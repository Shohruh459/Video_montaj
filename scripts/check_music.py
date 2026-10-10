#!/usr/bin/env python3
"""Musiqa darajasi tekshiruvi: nutq oynalarida musiqa ovozdan qancha pastda (qoida: −18…−22 dB).
Ishlatish: python3 scripts/check_music.py projects/<loyiha>   (avval make_video.py ishlagan bo'lishi kerak: out/music_stem.wav, voice_final.wav)
make_video.py dagi zanjirni (EQ + gain + ducking) aynan takrorlaydi."""
import json, pathlib, re, subprocess, sys

proj = pathlib.Path(sys.argv[1]).resolve(); out = proj / "out"
b = json.loads((proj / "scenes.json").read_text())["build"]
subs = json.loads((out / "scenes.resolved.json").read_text())["subs"]


def lufs(f, a=None, z=None):
    af = "ebur128" if a is None else f"atrim={a}:{z},ebur128"
    r = subprocess.run(["ffmpeg", "-nostats", "-i", str(f), "-af", af, "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])


v_i, m_i = lufs(out / "voice_final.wav"), lufs(out / "music_stem.wav")
pause_db, duck_db = b.get("music_pause_db", 12), b.get("music_duck_db", 8)
gain = v_i - pause_db - m_i
win = "+".join(f"clip((t-{x['from']-0.3:.3f})/0.3,0,1)*clip(({x['to']+0.3:.3f}-t)/0.3,0,1)" for x in subs)
eq = "highpass=f=70,equalizer=f=250:t=q:w=1:g=-3,equalizer=f=2500:t=q:w=1.2:g=-3," if b.get("music_eq", True) else ""
chk = out / "music_check.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(out / "music_stem.wav"), "-af",
                f"{eq}volume={gain:.2f}dB,volume='pow(10,-{duck_db}*min(1,{win})/20)':eval=frame", str(chk)], check=True)
print(f"ovoz {v_i:.1f} LUFS, musiqa manba {m_i:.1f} LUFS, gain {gain:+.1f} dB")
ok = True
for i, x in enumerate(subs):
    a, z = x["from"] + 0.4, x["to"] - 0.5
    d = lufs(chk, a, z) - lufs(out / "voice_final.wav", a, z)
    flag = "OK" if -23 <= d <= -17 else "CHEKKADA"
    ok &= flag == "OK"
    print(f"  qator {i+1}: musiqa ovozdan {d:+.1f} dB  [{flag}]")
print("NATIJA:", "qoida doirasida (−18…−22, ±1 dB)" if ok else "ba'zi qatorlar qoidadan chiqdi")
