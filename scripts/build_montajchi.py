#!/usr/bin/env python3
"""Montajchi (AI montajchi reklamasi): haqiqiy video ostida, tepada uslubli versiya.
Ishlatish: python3 scripts/build_montajchi.py <spec.json> [--scale 0.5]"""
import sys, json, pathlib, subprocess, shutil, argparse, re
import numpy as np, soundfile as sf
ROOT = pathlib.Path(__file__).resolve().parent.parent; sys.path.insert(0, str(ROOT / "scripts"))
import sfx_synth as S
ap = argparse.ArgumentParser(); ap.add_argument("spec"); ap.add_argument("--scale", default="0.5"); a = ap.parse_args()
sp = pathlib.Path(a.spec).resolve(); spec = json.load(open(sp, encoding="utf-8")); proj = sp.parent.parent; K = ROOT / "templates/kinetic"
W = proj / "voice" / f"build_{spec['id']}"; W.mkdir(parents=True, exist_ok=True)
def run(*c): subprocess.run([str(x) for x in c], check=True)
def dur(p): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout)
def lufs(p):
    o = subprocess.run(["ffmpeg", "-nostats", "-i", str(p), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", o)[-1])
# 1) video: 1080x1920 (720p manbadan), yengil o'tkirlash
vid = proj / "broll" / "montajchi_1080.mp4"
if not vid.exists():
    run("ffmpeg", "-v", "error", "-y", "-i", ROOT / spec["video_src"], "-an", "-vf", "scale=1080:1920:flags=lanczos,unsharp=5:5:0.6:5:5:0.0", "-r", 30, "-pix_fmt", "yuv420p", "-c:v", "libx264", "-crf", 14, vid)
shutil.copy(vid, K / "public" / "montajchi_1080.mp4")
# 2) vaqt jadvali
t = spec["introDur"]; segs = []; anns = []
for i, s in enumerate(spec["segs"]):
    s = dict(s); s["t0"] = round(t, 3); segs.append(s); t += s["dur"]
    if i + 1 < len(spec["segs"]):
        n = spec["segs"][i + 1]; anns.append({"t": round(t, 3), "dur": spec["annDur"], "n": i + 2, "name": n["name"], "style": n["style"], "src0": n["src0"]}); t += spec["annDur"]
ctaAt = round(t, 3); cta_wav = ROOT / spec["cta"]["wav"]; cd = dur(cta_wav); total = round(ctaAt + spec["ctaGap"] + cd + spec["tail"], 2)
print(f"jadval: intro {spec['introDur']} | segs {[s['t0'] for s in segs]} | anns {[x['t'] for x in anns]} | cta {ctaAt} | jami {total}")
# 3) audio: asl ovoz (har segment) + SFX + musiqa + CTA ovozi
sr = S.SR; L = int(sr * (total + 0.5)); orig = np.zeros((L, 2))
for s in segs:
    cut = W / f"orig_{s['t0']}.wav"
    run("ffmpeg", "-v", "error", "-y", "-ss", s["src0"], "-t", s["dur"], "-i", ROOT / spec["video_src"], "-vn", "-af", f"loudnorm=I={spec['orig_lufs']}:TP=-2:LRA=9,afade=t=in:d=0.02,afade=t=out:st={s['dur']-0.03:.3f}:d=0.03", "-ar", sr, "-ac", 2, cut)
    x, _ = sf.read(cut); i0 = int(s["t0"] * sr); orig[i0:i0 + len(x)] += x[: L - i0]
cta48 = W / "cta48.wav"; run("ffmpeg", "-v", "error", "-y", "-i", cta_wav, "-ar", sr, "-ac", 2, cta48)
vo = np.zeros((L, 2)); x, r = sf.read(cta48)
if x.ndim == 1: x = np.stack([x, x], 1)
if r != sr: raise SystemExit(f"CTA sample rate {r} != {sr}")
i0 = int((ctaAt + spec["ctaGap"]) * sr); vo[i0:i0 + len(x)] += x[: L - i0]
ev = [{"t": 0.12, "k": "pop"}, {"t": 0.40, "k": "pop"}, {"t": 0.68, "k": "pop"}] + [{"t": 1.15 + i * 0.12, "k": "ding", "db": -6} for i in range(5)] + [{"t": 2.2, "k": "whoosh", "db": -4}]
for a_ in anns: ev += [{"t": a_["t"] - 0.35, "k": "whoosh", "db": -3}, {"t": a_["t"] + 0.05, "k": "chime"}, {"t": a_["t"] + a_["dur"] - 0.35, "k": "whoosh", "db": -3}]
ev += [{"t": ctaAt - 0.3, "k": "whoosh", "db": -3}, {"t": ctaAt + 0.2, "k": "sparkle"}]
sfx = S.track(ev, total + 0.5, peak=0.5); sfx = np.stack([sfx, sfx], 1); sfx = np.pad(sfx, ((0, max(0, L - len(sfx))), (0, 0)))[:L]
sf.write(W / "orig.wav", orig, sr); sf.write(W / "vo.wav", vo, sr); sf.write(W / "sfx.wav", sfx, sr)
m = spec["music"]; mus = W / "music.wav"
run("ffmpeg", "-v", "error", "-y", "-stream_loop", -1, "-ss", m["ss"], "-t", total + 0.5, "-i", m["src"], "-af", f"afade=t=in:d=0.5,afade=t=out:st={total-1.6:.2f}:d=1.6,loudnorm=I={m['lufs']}:TP=-3:LRA=11", "-ar", sr, "-ac", 2, mus)
# musiqa ovoz (asl + CTA) ostida duck bo'ladi
mix = W / "mix.wav"
run("ffmpeg", "-v", "error", "-y", "-i", mus, "-i", W / "orig.wav", "-i", W / "vo.wav", "-i", W / "sfx.wav", "-filter_complex",
    "[1][2]amix=inputs=2:normalize=0,asplit=2[sp][sc];[0][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400[md];[md][sp][3]amix=inputs=3:normalize=0:duration=longest,"
    f"atrim=0:{total},loudnorm=I=-14:TP=-1.5:LRA=7", "-ar", sr, "-ac", 2, mix)
l, p = lufs(mix); print(f"mix: {l} LUFS, peak {p} dBFS")
shutil.copy(mix, K / "public" / "montajchi_mix.wav")
data = {"totalSec": total, "audio": "montajchi_mix.wav", "video": "montajchi_1080.mp4", "introDur": spec["introDur"], "ctaAt": ctaAt, "segs": segs, "anns": anns, "shots": spec["shots"], "brand": spec["brand"], "ctaLines": spec["ctaLines"]}
dj = K / "src/data" / f"montajchi_{spec['id']}.json"; json.dump(data, open(dj, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
out = proj / "out" / f"montajchi_{spec['id']}_{'draft' if a.scale != '1' else 'final'}.mp4"; raw = W / "raw.mp4"
subprocess.run(["npx", "remotion", "render", "src/index.ts", "Montajchi", str(raw), f"--props={dj}", f"--scale={a.scale}", "--crf=18", "--pixel-format=yuv420p"], cwd=K, check=True, stdout=subprocess.DEVNULL)
run("ffmpeg", "-v", "error", "-y", "-i", raw, "-vf", "scale=in_range=pc:out_range=tv,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", 18, "-r", 30, "-c:a", "copy", "-movflags", "+faststart", out)
tmp = out.with_name(out.stem + "_tmp.mp4"); run("ffmpeg", "-v", "error", "-y", "-i", out, "-i", mix, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", 48000, "-shortest", "-movflags", "+faststart", tmp); tmp.replace(out)
print("TAYYOR:", out)
