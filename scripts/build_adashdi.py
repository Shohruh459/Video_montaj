#!/usr/bin/env python3
"""'AI adashdi' motion reklama (Zarafshon dasturchilari): Pixabay kadrlari -> 9:16 kadrlar -> Remotion kompozitsiya + SFX/musiqa.
Ishlatish: .venv/bin/python scripts/build_adashdi.py <spec.json> [--scale 0.5] [--frames 0-419] [--keep-shots]"""
import sys, json, pathlib, subprocess, shutil, argparse, re
import numpy as np, soundfile as sf
ROOT = pathlib.Path(__file__).resolve().parent.parent; sys.path.insert(0, str(ROOT / "scripts"))
import sfx_synth as S
ap = argparse.ArgumentParser(); ap.add_argument("spec"); ap.add_argument("--scale", default="0.5"); ap.add_argument("--frames", default=None); ap.add_argument("--skip-render", action="store_true"); a = ap.parse_args()
sp = pathlib.Path(a.spec).resolve(); spec = json.load(open(sp, encoding="utf-8")); proj = sp.parent.parent; K = ROOT / "templates/kinetic"
W = proj / "voice" / f"build_{spec['id']}"; W.mkdir(parents=True, exist_ok=True); SH = proj / "broll" / "shots"; SH.mkdir(parents=True, exist_ok=True)
PUB = K / "public" / "adashdi"; PUB.mkdir(parents=True, exist_ok=True)
def run(*c): subprocess.run([str(x) for x in c], check=True)
def dur_of(p): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout)
def lufs(p):
    o = subprocess.run(["ffmpeg", "-nostats", "-i", str(p), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", o)[-1])
OV = 0.25  # whip-pan ustma-ust vaqti
tl = spec["tl"]
def base(fx):  # istalgan manbadan 9:16 kesim, fokus x (0..1)
    return f"crop='min(iw,ih*9/16)':'min(ih,iw*16/9)':'(iw-min(iw,ih*9/16))*{fx}':'(ih-min(ih,iw*16/9))/2',scale=1080:1920:flags=lanczos"
ENC = ["-an", "-r", 30, "-pix_fmt", "yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", 15, "-g", 30]
files = {}
for i, e in enumerate(tl):
    nxt = tl[i + 1] if i + 1 < len(tl) else None
    ext = OV if (nxt and nxt.get("fin") == "whip") else 0.0
    e["_ext"] = ext
    if e.get("freeze_of"): continue
    src = ROOT / f"projects/zarafshon-ai-adashdi-2026-10-16/broll/pixabay_video_{e['src']}.mp4"; fx = e.get("focus", 0.5)
    out = SH / f"{i:02d}_{e['name']}.mp4"; files[e["name"]] = out.name
    total = e["dur"] + ext
    if e.get("ramp"):
        pieces = [list(p) for p in e["ramp"]]; pieces[-1][1] += ext * pieces[-1][2]; parts = []
        for k, (ss, sd, rate) in enumerate(pieces):
            pf = W / f"{i:02d}_{k}.mp4"; run("ffmpeg", "-v", "error", "-y", "-ss", ss, "-t", sd, "-i", src, "-vf", f"{base(fx)},setpts=PTS/{rate},fps=30", *ENC, pf); parts.append(pf)
        lst = W / f"{i:02d}_list.txt"; lst.write_text("".join(f"file '{p}'\n" for p in parts)); run("ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", 0, "-i", lst, "-c", "copy", out)
    else:
        vf = base(fx) + (",reverse" if e.get("reverse") else "")
        if dur_of(src) < e["ss"] + total: raise SystemExit(f"{e['name']}: manba qisqa ({dur_of(src):.1f} s < {e['ss']+total:.1f})")
        run("ffmpeg", "-v", "error", "-y", "-ss", e["ss"], "-t", total, "-i", src, "-vf", vf, *ENC, out)
    shutil.copy(out, PUB / out.name)
shots = []
for e in tl:
    if e.get("freeze_of"):
        ref = next(x for x in tl if x["name"] == e["freeze_of"]); file = files[ref["name"]]; frz = ref["dur"] - 0.05
    else: file = files[e["name"]]; frz = None
    d = {"file": file, "t": e["t"], "dur": e["dur"] + e["_ext"], "z0": e["z"][0], "z1": e["z"][1], "fin": e.get("fin", "none"), "fout": "whip" if e["_ext"] else "none"}
    for k in ("shake", "vhs", "tint", "blur", "dim"):
        if k in e: d[k] = e[k]
    if frz is not None: d["freeze"] = frz
    shots.append(d)
labels = [{"t": round(e["t"] + 0.15, 2), "dur": round(e["dur"] - 0.15, 2), **e["label"]} for e in tl if e.get("label")]
total = spec["total"]
# audio
sr = S.SR; sfx = S.track(spec["sfx"], total + 0.5, peak=0.7); sfx = np.stack([sfx, sfx], 1); sf.write(W / "sfx.wav", sfx, sr)
m = spec["music"]; mus = W / "music.wav"
run("ffmpeg", "-v", "error", "-y", "-stream_loop", -1, "-ss", m["ss"], "-t", total + 0.5, "-i", m["src"], "-af", f"afade=t=in:d=0.05,afade=t=out:st={total-1.5:.2f}:d=1.5,loudnorm=I={m['lufs']}:TP=-2:LRA=11", "-ar", sr, "-ac", 2, mus)
mix = W / "mix.wav"
run("ffmpeg", "-v", "error", "-y", "-i", mus, "-i", W / "sfx.wav", "-filter_complex", f"[0][1]amix=inputs=2:normalize=0:duration=longest,atrim=0:{total},loudnorm=I=-14:TP=-1.5:LRA=7", "-ar", sr, "-ac", 2, mix)
l, p = lufs(mix); print(f"mix: {l} LUFS, peak {p} dBFS"); shutil.copy(mix, K / "public" / "adashdi_mix.wav")
data = {"totalSec": total, "audio": "adashdi_mix.wav", "shots": shots, "labels": labels, "tags": [{"t": t, "text": x} for t, x in spec["tags"]], "stamps": spec["stamps"], "texts": spec["texts"], "hudEnd": spec["cta"]["t"], "sparkles": spec["sparkles"],
        "cta": {**spec["cta"], "brand": spec["brand"], "phone": spec["phone"]}}
dj = K / "src/data" / f"adashdi_{spec['id']}.json"; json.dump(data, open(dj, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
if a.skip_render: sys.exit(0)
out = proj / "out" / f"adashdi_{spec['id']}_{'draft' if a.scale != '1' else 'final'}.mp4"; raw = W / "raw.mp4"
cmd = ["npx", "remotion", "render", "src/index.ts", "Adashdi", str(raw), f"--props={dj}", f"--scale={a.scale}", "--crf=18", "--pixel-format=yuv420p"] + ([f"--frames={a.frames}"] if a.frames else [])
subprocess.run(cmd, cwd=K, check=True, stdout=subprocess.DEVNULL)
run("ffmpeg", "-v", "error", "-y", "-i", raw, "-vf", "scale=in_range=pc:out_range=tv,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", 18, "-r", 30, "-c:a", "copy", "-movflags", "+faststart", out)
tmp = out.with_name(out.stem + "_tmp.mp4"); run("ffmpeg", "-v", "error", "-y", "-i", out, "-i", mix, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", 48000, "-shortest", "-movflags", "+faststart", tmp); tmp.replace(out)
print("TAYYOR:", out)
