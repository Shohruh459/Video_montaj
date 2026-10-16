#!/usr/bin/env python3
"""Ish e'loni Reel (so'zma-so'z subtitr, punch-zoom, kartochkalar, telefon): moslangan matn (align_uz.py) -> Remotion.
Ishlatish: .venv/bin/python scripts/build_ish.py <spec.json> [--scale 0.5]"""
import sys, json, pathlib, subprocess, shutil, argparse, re
import numpy as np, soundfile as sf
ROOT = pathlib.Path(__file__).resolve().parent.parent; sys.path.insert(0, str(ROOT / "scripts"))
import sfx_synth as S
ap = argparse.ArgumentParser(); ap.add_argument("spec"); ap.add_argument("--scale", default="0.5"); a = ap.parse_args()
sp = pathlib.Path(a.spec).resolve(); spec = json.load(open(sp, encoding="utf-8")); proj = sp.parent.parent; K = ROOT / "templates/kinetic"
W = proj / "voice" / f"build_{spec['id']}"; W.mkdir(parents=True, exist_ok=True)
def run(*c): subprocess.run([str(x) for x in c], check=True)
def lufs(p):
    o = subprocess.run(["ffmpeg", "-nostats", "-i", str(p), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", o)[-1])
src = ROOT / spec["video_src"]
vdur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src], capture_output=True, text=True).stdout)
words = json.load(open(ROOT / spec["align"], encoding="utf-8"))["words"]
speechEnd = round(min(vdur, words[-1]["t1"] + 0.55), 2); total = round(speechEnd + spec["endHold"], 2)
# 1) video 1080x1920
vid = proj / "broll" / "ish_1080.mp4"; vid.parent.mkdir(exist_ok=True)
if not vid.exists():
    run("ffmpeg", "-v", "error", "-y", "-i", src, "-an", "-vf", "scale=1080:1920:flags=lanczos,hqdn3d=2:2:3:3,unsharp=5:5:0.7:5:5:0.0", "-r", 30, "-pix_fmt", "yuv420p", "-c:v", "libx264", "-crf", 14, vid)
shutil.copy(vid, K / "public" / "ish_1080.mp4")
# 2) subtitr guruhlari (har guruh = bir nechta manba qatori; ichida <=rowMax belgili qatorlarga o'raladi)
lines = []
for g in spec["groups"]:
    ws = [{"w": w["w"], "t0": w["t0"], "t1": w["t1"]} for w in words if w["line"] in g]
    rows, cur = [], []
    for w in ws:
        if cur and len(" ".join(x["w"] for x in cur + [w])) > spec["rowMax"]: rows.append(cur); cur = []
        cur.append(w)
    if cur: rows.append(cur)
    lines.append({"t0": ws[0]["t0"], "t1": ws[-1]["t1"], "rows": rows})
def anchor(name): return next(w for w in words if w["w"].strip(".,").lower() == name.lower())
cards = [{"t": round(anchor(c["anchor"])["t0"] - 0.05, 2), "dur": c["dur"], "kind": c["kind"], "title": c["title"], "sub": c.get("sub")} for c in spec["cards"]]
phoneAt = round(anchor(spec["phoneAnchor"])["t0"], 2)
print(f"speechEnd {speechEnd} total {total} phoneAt {phoneAt} cards {[c['t'] for c in cards]} captions {[round(l['t0'],2) for l in lines]}")
# 3) audio: asl ovoz + SFX + musiqa (duck)
sr = S.SR; L = int(sr * (total + 0.5))
og = W / "orig.wav"; run("ffmpeg", "-v", "error", "-y", "-i", src, "-vn", "-t", speechEnd, "-af", f"loudnorm=I={spec['orig_lufs']}:TP=-2:LRA=9,afade=t=out:st={speechEnd-0.05:.2f}:d=0.05", "-ar", sr, "-ac", 2, og)
x, _ = sf.read(og); orig = np.zeros((L, 2)); orig[:len(x)] = x[:L]; sf.write(og, orig, sr)
ev = [{"t": 0.12, "k": "thud", "db": -6}, {"t": 0.1, "k": "whoosh", "db": -8}]
for i, l in enumerate(lines[1:], 1): ev.append({"t": l["t0"] - 0.04, "k": "whoosh", "db": -14 if i % 2 else -11})
for c in cards: ev += [{"t": c["t"], "k": "pop"}, {"t": c["t"] + 0.04, "k": "whoosh", "db": -8}]
ev += [{"t": phoneAt + 0.05, "k": "ding"}, {"t": speechEnd - 0.2, "k": "whoosh", "db": -4}, {"t": speechEnd + 0.15, "k": "thud", "db": -5}, {"t": speechEnd + 2.0, "k": "ding"}, {"t": speechEnd + 2.05, "k": "sparkle", "db": -4}]
sfx = S.track(ev, total + 0.5, peak=0.5); sfx = np.stack([sfx, sfx], 1); sfx = np.pad(sfx, ((0, max(0, L - len(sfx))), (0, 0)))[:L]; sf.write(W / "sfx.wav", sfx, sr)
m = spec["music"]; mus = W / "music.wav"
run("ffmpeg", "-v", "error", "-y", "-stream_loop", -1, "-ss", m["ss"], "-t", total + 0.5, "-i", m["src"], "-af", f"afade=t=in:d=0.4,afade=t=out:st={total-1.4:.2f}:d=1.4,loudnorm=I={m['lufs']}:TP=-3:LRA=11", "-ar", sr, "-ac", 2, mus)
mix = W / "mix.wav"
run("ffmpeg", "-v", "error", "-y", "-i", mus, "-i", og, "-i", W / "sfx.wav", "-filter_complex",
    "[1]asplit=2[sp][sc];[0][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=500[md];[md][sp][2]amix=inputs=3:normalize=0:duration=longest,"
    f"atrim=0:{total},loudnorm=I=-14:TP=-1.5:LRA=7", "-ar", sr, "-ac", 2, mix)
l_, p_ = lufs(mix); print(f"mix: {l_} LUFS, peak {p_} dBFS"); shutil.copy(mix, K / "public" / "ish_mix.wav")
data = {"totalSec": total, "audio": "ish_mix.wav", "video": "ish_1080.mp4", "speechEnd": speechEnd, "lines": lines, "cards": cards, "phone": spec["phone"], "role": spec["role"], "place": spec["place"], "badge": spec["badge"], "phoneAt": phoneAt}
dj = K / "src/data" / f"ish_{spec['id']}.json"; json.dump(data, open(dj, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
out = proj / "out" / f"ish_{spec['id']}_{'draft' if a.scale != '1' else 'final'}.mp4"; raw = W / "raw.mp4"
subprocess.run(["npx", "remotion", "render", "src/index.ts", "Ish", str(raw), f"--props={dj}", f"--scale={a.scale}", "--crf=18", "--pixel-format=yuv420p"], cwd=K, check=True, stdout=subprocess.DEVNULL)
run("ffmpeg", "-v", "error", "-y", "-i", raw, "-vf", "scale=in_range=pc:out_range=tv,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", 18, "-r", 30, "-c:a", "copy", "-movflags", "+faststart", out)
tmp = out.with_name(out.stem + "_tmp.mp4"); run("ffmpeg", "-v", "error", "-y", "-i", out, "-i", mix, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", 48000, "-shortest", "-movflags", "+faststart", tmp); tmp.replace(out)
print("TAYYOR:", out)
