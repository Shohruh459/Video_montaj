#!/usr/bin/env python3
"""Spec (projects/<loyiha>/specs/NN.json) dan to'liq Reel yig'adi: ovoz (kesh) -> vaqtlar -> musiqa miksi (ducking, -14 LUFS) -> Remotion render.
Ishlatish: python3 scripts/build_reel_k.py projects/yuksalish-2026-10-14/specs/01.json [--scale 0.5]
Spec: {id, base_style, music:{src,ss,db}, phrases:[{say, show, acc:[so'z indekslari], style, clip:<broll fayl nomi>, ss, pos, pause}]}"""
import sys, json, hashlib, pathlib, subprocess, shutil, argparse, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
ap = argparse.ArgumentParser(); ap.add_argument("spec"); ap.add_argument("--scale", default="0.5"); a = ap.parse_args()
spec_p = pathlib.Path(a.spec).resolve(); spec = json.load(open(spec_p, encoding="utf-8"))
proj = spec_p.parent.parent; K = ROOT / "templates/kinetic"; W = proj / "voice" / f"build_{spec['id']}"; W.mkdir(parents=True, exist_ok=True)
def run(*c): subprocess.run([str(x) for x in c], check=True)
def dur(p): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]))
def lufs(p):
    o = subprocess.run(["ffmpeg", "-nostats", "-i", str(p), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", o)[-1])
import tts_vs
tts_vs.check_backend(); pid = tts_vs.ensure_profile(); cache = proj / "voice" / "cache"; cache.mkdir(parents=True, exist_ok=True)
ph = spec["phrases"]; files = []
for p in ph:
    key = hashlib.md5(f'{p["say"]}|{tts_vs.CFG["seed"]}|{tts_vs.CFG["speed"]}'.encode()).hexdigest()[:12]; f = cache / f"v_{key}.wav"
    if not f.exists(): f.write_bytes(tts_vs.synth_line(pid, p["say"], tts_vs.CFG["seed"], tts_vs.CFG["speed"]))
    ff = W / (f.stem + "_f.wav"); run("ffmpeg", "-v", "error", "-y", "-i", f, "-c:a", "pcm_s16le", "-ar", 48000, "-ac", 1, ff); files.append(ff)
LEAD, TAIL = 0.15, 1.4; t = LEAD; starts = []; durs = [dur(f) for f in files]
for p, d in zip(ph, durs): starts.append(round(t, 3)); t += d + p.get("pause", 0.45)
total = round(starts[-1] + durs[-1] + TAIL, 2)
# ovoz treki
def sil(n, s): run("ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", s, "-c:a", "pcm_s16le", W / n)
sil("lead.wav", LEAD); ent = ["lead.wav"]
for i, (f, p) in enumerate(zip(files, ph)):
    ent.append(str(f)); g = p.get("pause", 0.45) if i < len(ph) - 1 else TAIL; n = f"s{i}.wav"; sil(n, g); ent.append(n)
(W / "l.txt").write_text("".join(f"file '{W / e if '/' not in e else e}'\n" for e in ent))
run("ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", 0, "-i", W / "l.txt", "-c:a", "pcm_s16le", W / "voice_full.wav")
vd = dur(W / "voice_full.wav"); total = max(total, round(vd, 2))
vl, vp = lufs(W / "voice_full.wav"); print(f"ovoz: {vd:.1f}s, {vl} LUFS, peak {vp}")
# musiqa: ovozdan -20 dB pastda
m = spec["music"]; mus = W / "music_cut.wav"
run("ffmpeg", "-v", "error", "-y", "-ss", m["ss"], "-t", total + 1, "-i", m["src"], "-af", f"afade=t=in:d=1.8,afade=t=out:st={total-3:.2f}:d=3,loudnorm=I={vl + m.get('rel_db', -20):.1f}:TP=-3:LRA=11", "-ar", 48000, "-ac", 2, mus)
run("ffmpeg", "-v", "error", "-y", "-i", W / "voice_full.wav", "-i", mus, "-filter_complex",
    "[0]asplit=2[v1][v2];[1][v1]sidechaincompress=threshold=0.02:ratio=4:attack=30:release=500[md];[v2]pan=stereo|c0=c0|c1=c0[vs];[vs][md]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=7",
    "-ar", 48000, "-ac", 2, W / "mix.wav")
ml, mp = lufs(W / "mix.wav"); print(f"miks: {ml} LUFS, peak {mp} dBFS (maqsad -14 / <= -1)")
mixname = f"reel{spec['id']}_mix.wav"; shutil.copy(W / "mix.wav", K / "public" / mixname)
lines = []
for p, s0, d in zip(ph, starts, durs):
    cid = pathlib.Path(p["clip"]).stem.replace("pixabay_video_", "c_"); shutil.copy(proj / "broll" / p["clip"], K / "public" / f"{cid}.mp4")
    words = p["show"].split(" "); acc = set(p.get("acc", []))
    print(f'{s0:6.2f}s [{p.get("style", spec["base_style"]):10}] ' + " ".join(f"[{w}]" if i in acc else w for i, w in enumerate(words)))
    first = s0 == starts[0]; lines.append({"words": [{"t": w, **({"a": True} if i in acc else {})} for i, w in enumerate(words)], "start": 0 if first else s0, "dur": round(d + 0.15 + (s0 if first else 0), 3), "clip": f"{cid}.mp4", "pos": p.get("pos", "50% 50%"), "ss": p.get("ss", 0), "tag": p.get("tag", ""), **({"vpos": p["vpos"]} if p.get("vpos") else {}), "style": p.get("style", spec["base_style"])})
data = {"style": spec["base_style"], "totalSec": total, "audio": mixname, "lines": lines}
dj = K / "src/data" / f"reel_{spec['id']}.json"; json.dump(data, open(dj, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
out = proj / "out" / f"reel_{spec['id']}_{'draft' if a.scale != '1' else 'final'}.mp4"; out.parent.mkdir(exist_ok=True)
run("bash", K / "render.sh", spec["base_style"], out, a.scale, dj)
print("TAYYOR:", out, f"{total}s")
