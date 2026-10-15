#!/usr/bin/env python3
"""Mushuk (hadiya) reklama Reel: video tayyorlash + SFX/musiqa miksi + Remotion render.
Ishlatish: python3 scripts/build_mushuk.py projects/zarafshon-mushuk-2026-10-15/specs/01.json [--scale 0.5] [--alt]"""
import sys, json, pathlib, subprocess, shutil, argparse, re
import numpy as np, soundfile as sf
ROOT = pathlib.Path(__file__).resolve().parent.parent; sys.path.insert(0, str(ROOT / "scripts"))
import sfx_synth as S
ap = argparse.ArgumentParser(); ap.add_argument("spec"); ap.add_argument("--scale", default="0.5"); ap.add_argument("--alt", action="store_true"); a = ap.parse_args()
sp = pathlib.Path(a.spec).resolve(); spec = json.load(open(sp, encoding="utf-8")); proj = sp.parent.parent; K = ROOT / "templates/kinetic"; W = proj / "voice" / f"build_{spec['id']}"; W.mkdir(parents=True, exist_ok=True)
def run(*c): subprocess.run([str(x) for x in c], check=True)
def lufs(p):
    o = subprocess.run(["ffmpeg", "-nostats", "-i", str(p), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", o)[-1])
total = spec["totalSec"]
# 1) video: 1080x1920, shovqinni kamaytirish, yoritish, o'tkirlash (720p manbadan)
vid = proj / "broll" / "mushuk_1080.mp4"
if not vid.exists():
    run("ffmpeg", "-v", "error", "-y", "-t", spec["trim_end"], "-i", ROOT / spec["video_src"], "-an", "-vf",
        "scale=1080:1920:flags=lanczos,hqdn3d=3:3:4:4,eq=brightness=0.06:contrast=1.1:saturation=1.25:gamma=1.08,unsharp=5:5:0.8:5:5:0.0",
        "-r", 30, "-pix_fmt", "yuv420p", "-c:v", "libx264", "-crf", 14, vid)
shutil.copy(vid, K / "public" / "mushuk_1080.mp4")
# 2) SFX treki
tr = S.track(spec["events"], total + 0.5, peak=0.5); sf.write(W / "sfx.wav", np.stack([tr, tr], 1), S.SR)
def mix(m, out):
    cut = W / f"music_{out.stem}.wav"
    run("ffmpeg", "-v", "error", "-y", "-stream_loop", -1, "-ss", m["ss"], "-t", total + 0.5, "-i", m["src"], "-af", f"afade=t=in:d=0.4,afade=t=out:st={total-1.4:.2f}:d=1.4,loudnorm=I={m['lufs']}:TP=-3:LRA=11", "-ar", 48000, "-ac", 2, cut)
    run("ffmpeg", "-v", "error", "-y", "-i", cut, "-i", W / "sfx.wav", "-filter_complex", f"[0][1]amix=inputs=2:normalize=0:duration=longest,atrim=0:{total},loudnorm=I=-14:TP=-1.5:LRA=7", "-ar", 48000, "-ac", 2, out)
    l, p = lufs(out); print(f"{out.name}: {l} LUFS, peak {p} dBFS")
mix(spec["music"], W / "mix.wav"); shutil.copy(W / "mix.wav", K / "public" / "mushuk_mix.wav")
if a.alt: mix(spec["music_alt"], W / "mix_alt.wav")
data = {k: spec[k] for k in ("totalSec", "zooms", "stickers", "phone", "place", "endAt")}; data.update(audio="mushuk_mix.wav", video="mushuk_1080.mp4")
dj = K / "src/data" / f"mushuk_{spec['id']}.json"; json.dump(data, open(dj, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
out = proj / "out" / f"mushuk_{spec['id']}_{'draft' if a.scale != '1' else 'final'}.mp4"; raw = W / "raw.mp4"
run("npx", "--prefix", K, "remotion", "render", K / "src/index.ts", "Mushuk", raw, f"--props={dj}", f"--scale={a.scale}", "--crf=18", "--pixel-format=yuv420p") if False else subprocess.run(["npx", "remotion", "render", "src/index.ts", "Mushuk", str(raw), f"--props={dj}", f"--scale={a.scale}", "--crf=18", "--pixel-format=yuv420p"], cwd=K, check=True, stdout=subprocess.DEVNULL)
run("ffmpeg", "-v", "error", "-y", "-i", raw, "-vf", "scale=in_range=pc:out_range=tv,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", 18, "-r", 30, "-c:a", "copy", "-movflags", "+faststart", out)
print("TAYYOR:", out)
if a.alt:
    alt = out.with_name(out.stem + "_musiqaB.mp4"); run("ffmpeg", "-v", "error", "-y", "-i", out, "-i", W / "mix_alt.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", alt); print("TAYYOR (B musiqa):", alt)
