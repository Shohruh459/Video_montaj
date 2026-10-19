#!/usr/bin/env python3
"""Bolalar multfilmi epizodi (Benny, ranglar): ovoz satrlari -> vaqt jadvali -> lipsync -> SFX/musiqa -> Remotion.
Ishlatish: .venv/bin/python scripts/build_kids_ep.py <lines.json> <voice_dir> [--scale 0.6667] [--skip-render]"""
import sys, json, pathlib, subprocess, shutil, argparse, re
import numpy as np, soundfile as sf
ROOT = pathlib.Path(__file__).resolve().parent.parent; sys.path.insert(0, str(ROOT / "scripts"))
import sfx_synth as S
ap = argparse.ArgumentParser(); ap.add_argument("lines"); ap.add_argument("voice"); ap.add_argument("--scale", default="0.6667"); ap.add_argument("--skip-render", action="store_true"); ap.add_argument("--music", default="/tmp/music/raw/s31_r1_ukulele-hushtak.wav"); ap.add_argument("--mss", type=float, default=8.0); ap.add_argument("--name", default="ep1_test"); a = ap.parse_args()
spec = json.load(open(a.lines, encoding="utf-8")); VD = pathlib.Path(a.voice); proj = ROOT / "projects/kids-yt-2026-10-19"; K = ROOT / "templates/kinetic"; W = proj / "voice" / f"build_{a.name}"; W.mkdir(parents=True, exist_ok=True)
def run(*c): subprocess.run([str(x) for x in c], check=True)
def dur_of(p): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout)
def lufs(p):
    o = subprocess.run(["ffmpeg", "-nostats", "-i", str(p), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", o)[-1])
# 1) vaqt jadvali
cur = 0.9; lines = []; prevs = None; idx_in_scene = {}
for i, l in enumerate(spec):
    d = dur_of(VD / f"line_{i:02d}.wav")
    if prevs is not None and l["scene"] != prevs: cur += 0.5
    k = idx_in_scene.get(l["scene"], 0); idx_in_scene[l["scene"]] = k + 1
    sc = l["scene"]; g = "wave" if sc in ("intro", "outro") else "cheer" if sc == "recap" else ("point" if k < 2 else "ear")
    lines.append({"t": round(cur, 3), "dur": round(d, 3), "text": l["text"], "scene": sc, "gesture": g, "pause": l["pause"]}); cur += d + l["pause"]; prevs = sc
total = round(cur + 2.2, 2)
scenes = []
for sc in dict.fromkeys(l["scene"] for l in lines):
    ls = [l for l in lines if l["scene"] == sc]; t0 = 0.0 if sc == "intro" else round(ls[0]["t"] - 0.35, 3)
    end = total if sc in ("recap", "outro") else round(ls[-1]["t"] + ls[-1]["dur"] + ls[-1]["pause"] + 0.25, 3)
    if sc == "recap": end = lines[[l["scene"] for l in lines].index("outro")]["t"] - 0.3
    scenes.append({"kind": sc, "t": t0, "end": end})
print("jami", total, "s | sahnalar", [(s["kind"], s["t"], s["end"]) for s in scenes])
# 2) ovoz treki + lipsync
sr = S.SR; L = int(sr * (total + 0.5)); vo = np.zeros((L, 2))
for i, l in enumerate(lines):
    w = W / f"v{i:02d}.wav"; run("ffmpeg", "-v", "error", "-y", "-i", VD / f"line_{i:02d}.wav", "-ar", sr, "-ac", 2, w)
    l0, _ = lufs(w); g = 10 ** ((-16 - l0) / 20); x, _ = sf.read(w); i0 = int(l["t"] * sr); n = min(len(x), L - i0); vo[i0:i0 + n] += x[:n] * g
sf.write(W / "vo.wav", vo, sr)
mono = vo.mean(1); fps = 30; win = sr // fps; nfr = int(total * fps) + 1
rms = np.array([np.sqrt(np.mean(mono[i * win:(i + 1) * win] ** 2) + 1e-12) for i in range(nfr)])
ref = np.percentile(rms[rms > 1e-3], 90) if (rms > 1e-3).any() else 1.0
env = np.clip(rms / ref, 0, 1) ** 0.8; env[rms < 2e-3] = 0
sm = np.zeros(nfr)
for i in range(nfr): sm[i] = env[i] if env[i] > sm[i - 1] else sm[i - 1] * 0.55 + env[i] * 0.45  # tez ochiladi, yumshoq yopiladi
mouth = [round(float(v), 3) for v in sm]
# 3) SFX
ev = [{"t": 0.25, "k": "boing", "db": -4}, {"t": 0.6, "k": "sparkle", "db": -8}]
for s in scenes:
    if s["kind"] in ("red", "blue", "yellow", "green"):
        ev += [{"t": s["t"] - 0.1, "k": "whoosh", "db": -8}, {"t": s["t"] + 0.1, "k": "pop"}, {"t": s["t"] + 0.5, "k": "sparkle", "db": -6}]
        if s["kind"] == "blue":
            n = 0
            while n * 0.8727 < s["end"]:
                tt = n * 0.8727
                if s["t"] + 0.7 < tt < s["end"] - 0.3: ev.append({"t": tt, "k": "boing", "db": -10})
                n += 1
        if s["kind"] == "green":
            n = 0
            while n * 0.982 < s["end"]:
                tt = n * 0.982
                if s["t"] + 0.7 < tt < s["end"] - 0.3: ev.append({"t": tt, "k": "pop", "db": -8})
                n += 1
    if s["kind"] == "recap": ev += [{"t": s["t"] + 0.2, "k": "whoosh", "db": -6}] + [{"t": s["t"] + 0.15 + i * 0.35, "k": "pop"} for i in range(4)] + [{"t": s["t"] + 0.4, "k": "confetti"}, {"t": s["t"] + 1.2, "k": "confetti"}, {"t": s["t"] + 1.3, "k": "chime"}]
    if s["kind"] == "outro": ev += [{"t": s["t"] + 0.05, "k": "whoosh", "db": -4}, {"t": s["t"] + 0.5, "k": "pop"}, {"t": s["t"] + 0.6, "k": "ding", "db": -6}]
for l in lines:
    if l["gesture"] == "ear": ev.append({"t": l["t"] + l["dur"] + l["pause"] - 0.15, "k": "ding", "db": -2})
sfx = S.track(ev, total + 0.5, peak=0.45); sfx = np.stack([sfx, sfx], 1); sfx = np.pad(sfx, ((0, max(0, L - len(sfx))), (0, 0)))[:L]; sf.write(W / "sfx.wav", sfx, sr)
mus = W / "music.wav"
run("ffmpeg", "-v", "error", "-y", "-stream_loop", -1, "-ss", a.mss, "-t", total + 0.5, "-i", a.music, "-af", f"afade=t=in:d=0.5,afade=t=out:st={total-2:.2f}:d=2,loudnorm=I=-24:TP=-2:LRA=11", "-ar", sr, "-ac", 2, mus)
mix = W / "mix.wav"
run("ffmpeg", "-v", "error", "-y", "-i", mus, "-i", W / "vo.wav", "-i", W / "sfx.wav", "-filter_complex",
    "[1]asplit=2[vsp][vsc];[0][vsc]sidechaincompress=threshold=0.015:ratio=5:attack=20:release=400[md];"
    f"[md][vsp][2]amix=inputs=3:normalize=0:duration=longest,atrim=0:{total},loudnorm=I=-14:TP=-1.5:LRA=7", "-ar", sr, "-ac", 2, mix)
l_, p_ = lufs(mix); print(f"mix: {l_} LUFS, peak {p_} dBFS"); shutil.copy(mix, K / "public" / "kidsep_mix.wav")
data = {"totalSec": total, "audio": "kidsep_mix.wav", "mouth": mouth, "lines": lines, "scenes": scenes, "title": "LITTLE EXPLORERS"}
dj = K / "src/data" / f"kidsep_{a.name}.json"; json.dump(data, open(dj, "w"), ensure_ascii=False)
if a.skip_render: sys.exit(0)
out = proj / "out" / f"{a.name}.mp4"; raw = W / "raw.mp4"
subprocess.run(["npx", "remotion", "render", "src/index.ts", "KidsEp", str(raw), f"--props={dj}", f"--scale={a.scale}", "--crf=18", "--pixel-format=yuv420p"], cwd=K, check=True, stdout=subprocess.DEVNULL)
run("ffmpeg", "-v", "error", "-y", "-i", raw, "-vf", "scale=in_range=pc:out_range=tv,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", 18, "-r", 30, "-c:a", "copy", "-movflags", "+faststart", out)
tmp = out.with_name(out.stem + "_tmp.mp4"); run("ffmpeg", "-v", "error", "-y", "-i", out, "-i", mix, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", 48000, "-shortest", "-movflags", "+faststart", tmp); tmp.replace(out)
print("TAYYOR:", out)
