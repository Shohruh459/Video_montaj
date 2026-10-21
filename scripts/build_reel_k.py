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
import numpy as np, soundfile as sf
import sfx_synth as SS
SR = 48000
def _env(n, a=0.005, d=0.2):
    t = np.arange(n) / SR; return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)
def sfx_wave(kind):
    rng = np.random.default_rng(7)
    if kind == "tick":
        n = int(SR * .09); t = np.arange(n) / SR; return 0.6 * np.sin(2 * np.pi * 1900 * t) * _env(n, .001, .018)
    if kind == "type":
        n = int(SR * .03); return 0.5 * rng.standard_normal(n) * _env(n, .0005, .006)
    if kind == "thud":
        n = int(SR * .55); t = np.arange(n) / SR; fr = 48 + 90 * np.exp(-t / .08)
        return (0.95 * np.sin(2 * np.pi * np.cumsum(fr) / SR) * _env(n, .002, .18) + 0.35 * rng.standard_normal(n) * _env(n, .0005, .02))
    if kind == "chime":
        n = int(SR * 1.1); t = np.arange(n) / SR
        return 0.35 * (np.sin(2 * np.pi * 988 * t) + 0.6 * np.sin(2 * np.pi * 1480 * t)) * _env(n, .003, .35)
    if kind == "whoosh":
        n = int(SR * 1.0); t = np.arange(n) / SR; x = rng.standard_normal(n); y = np.zeros(n); a = 0.02; 
        for i in range(n):   # vaqt bo'yicha o'zgaruvchi past chastotali filtr (yuqoriga ochiladi)
            a = 0.02 + 0.55 * (i / n) ** 1.5; y[i] = (y[i-1] if i else 0) + a * (x[i] - (y[i-1] if i else 0))
        env = np.sin(np.pi * np.minimum(t / 1.0, 1)) ** 2; return 0.9 * y * env / (np.abs(y).max() + 1e-9)
    raise ValueError(kind)
GAIN = {"tick": .45, "type": .25, "thud": .9, "chime": .5, "whoosh": .6}
import tts_vs
tts_vs.check_backend(); pid = tts_vs.ensure_profile(); cache = proj / "voice" / "cache"; cache.mkdir(parents=True, exist_ok=True)
ph = spec["phrases"]; files = []
for p in ph:
    key = hashlib.md5(f'{p["say"]}|{tts_vs.CFG["seed"]}|{tts_vs.CFG["speed"]}'.encode()).hexdigest()[:12]; f = cache / f"v_{key}.wav"
    if not f.exists(): f.write_bytes(tts_vs.synth_line(pid, p["say"], tts_vs.CFG["seed"], tts_vs.CFG["speed"]))
    ff = W / (f.stem + "_f.wav"); run("ffmpeg", "-v", "error", "-y", "-i", f, "-c:a", "pcm_s16le", "-ar", 48000, "-ac", 1, ff); files.append(ff)
LEAD, TAIL = 0.15, spec.get('tail', 1.4); t = LEAD; starts = []; durs = [dur(f) for f in files]
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
    cid = pathlib.Path(p["clip"]).stem.replace("pixabay_video_", "c_") if p.get("clip") else ""
    if cid: shutil.copy(proj / "broll" / p["clip"], K / "public" / f"{cid}.mp4")
    words = p["show"].split(" "); acc = set(p.get("acc", []))
    print(f'{s0:6.2f}s [{p.get("style", spec["base_style"]):10}] ' + " ".join(f"[{w}]" if i in acc else w for i, w in enumerate(words)))
    first = s0 == starts[0]; lines.append({"words": [{"t": w, **({"a": True} if i in acc else {})} for i, w in enumerate(words)], "start": 0 if first else s0, "dur": round(d + 0.15 + (s0 if first else 0), 3), "clip": f"{cid}.mp4" if cid else "", "pos": p.get("pos", "50% 50%"), "ss": p.get("ss", 0), "tag": p.get("tag", ""), **({"vpos": p["vpos"]} if p.get("vpos") else {}), "style": p.get("style", spec["base_style"])})
# ---- sahnalar va ovoz effektlari (spec["scenes"]) ----
def T(ref):
    i = ref["p"]
    return starts[i] + (ref["dt"] if "dt" in ref else durs[i] * ref["frac"] if "frac" in ref else durs[i] + ref["end"] if "end" in ref else 0)
scenes, events = [], list(spec.get("sfx", []))
for sc in spec.get("scenes", []):
    fp, tp = sc["from_p"], sc.get("to_p", len(ph) - 1)
    s0 = max(0, starts[fp] - sc.get("lead", 0.15)); s1 = (total if sc["kind"] == "panorama" else starts[tp] + durs[tp] + sc.get("to_extra", 0.3)); P = {}
    if sc["kind"] == "days":
        hops = [T(h) for h in sc["hops"]]; P = {"hops": [round(h - s0, 3) for h in hops]}
        events += [{"t": h + 0.12, "k": "tick"} for h in hops] + [{"t": hops[-1] + 0.3, "k": "thud"}]
    elif sc["kind"] == "back":
        st = T(sc["stamp"]); bk = [T(x) for x in sc["backs"]]; P = {"stamp": round(st - s0, 3), "backs": [round(x - s0, 3) for x in bk]}
        events += [{"t": st, "k": "thud"}] + [{"t": x + 0.05, "k": "tick"} for x in bk]
    elif sc["kind"] == "stop":
        events += [{"t": s0 + 0.2, "k": "thud"}]
    elif sc["kind"] == "task":
        P = {"text": sc["text"], "time": sc["time"]}; ty = s0 + 0.35
        events += [{"t": ty + k * 0.07, "k": "type"} for k in range(len(sc["text"]))] + [{"t": s0 + 1.95, "k": "chime"}, {"t": s0 + 2.65, "k": "tick"}]
    elif sc["kind"] == "fall":
        fa = T(sc["fallAt"]); P = {"fallAt": round(fa - s0, 3)}
        events += [{"t": fa - 0.55, "k": "whoosh", "db": -4}, {"t": fa + 0.49, "k": "thud"}, {"t": fa + 0.95, "k": "tick", "db": -3}]
    elif sc["kind"] == "plan":
        sk = [T(x) for x in sc["strikes"]]; P = {"strikes": [round(x - s0, 3) for x in sk], "items": sc["items"]}
        events += [{"t": x, "k": "tick", "db": 4} for x in sk] + [{"t": sk[-1] + 0.08, "k": "thud", "db": -4}]
    elif sc["kind"] == "zero":
        events += [{"t": s0 + 0.6, "k": "thud"}, {"t": s0 + 0.05, "k": "whoosh", "db": -6}]
    elif sc["kind"] == "fork":
        sp_ = T(sc["split"]); lw = [T(x) for x in sc["left"]]; rw = [T(x) for x in sc["right"]]; go = T(sc["go"])
        P = {"split": round(sp_ - s0, 3), "left": [round(x - s0, 3) for x in lw], "right": [round(x - s0, 3) for x in rw], "go": round(go - s0, 3)}
        events += [{"t": s0 + 0.1, "k": "whoosh"}, {"t": sp_, "k": "ding"}, {"t": lw[0], "k": "thud", "db": -3}, {"t": rw[0], "k": "chime"}, {"t": go, "k": "whoosh"}, {"t": go + 1.3, "k": "sparkle"}, {"t": go + 1.7, "k": "ding"}]
    elif sc["kind"] == "bounce":
        P = {"mode": sc["mode"]}
        if sc["mode"] == "up": events += [{"t": s0 + 0.5, "k": "boing", "db": -4}, {"t": s0 + 1.0, "k": "boing", "db": -2}, {"t": s0 + 1.5, "k": "boing"}, {"t": s0 + 2.0, "k": "sparkle"}]
        else: events += [{"t": s0 + 0.6, "k": "thud"}]
    elif sc["kind"] == "wave":
        tf, tt = T(sc["talkFrom"]), T(sc["talkTo"]); P = {"quote": sc["quote"], "talkFrom": round(tf - s0, 3), "talkTo": round(tt - s0, 3)}
        events += [{"t": tf - 0.05, "k": "tick"}, {"t": tt + 0.1, "k": "chime", "db": -4}]
    elif sc["kind"] == "battery":
        P = {"dur": round(s1 - s0, 3)}; d = s1 - s0
        events += [{"t": s0 + d * 0.5, "k": "tick", "db": 3}, {"t": s0 + d * 0.5 + 0.22, "k": "tick", "db": 3}, {"t": s0 + d * 0.5 + 0.44, "k": "tick", "db": 3}, {"t": s0 + d * 0.88, "k": "thud", "db": -3}]
    elif sc["kind"] == "flip":
        fa = T(sc["flipAt"]); P = {"flipAt": round(fa - s0, 3)}; events += [{"t": fa - 0.05, "k": "whoosh"}, {"t": fa + 0.55, "k": "thud", "db": -3}]
    elif sc["kind"] == "choice":
        ca, ru = T(sc["calm"]), T(sc["run"]); P = {"calm": round(ca - s0, 3), "run": round(ru - s0, 3)}; events += [{"t": ca, "k": "chime", "db": -3}, {"t": ru, "k": "whoosh"}, {"t": ru + 0.1, "k": "tick", "db": 3}]
    elif sc["kind"] == "timer":
        st = T(sc["start"]); P = {"start": round(st - s0, 3)}; events += [{"t": st + 0.3 * i, "k": "tick", "db": -2} for i in range(7)] + [{"t": st + 2.2, "k": "ding"}, {"t": st + 2.25, "k": "sparkle", "db": -4}]
    elif sc["kind"] == "middle":
        events += [{"t": s0 + 0.1, "k": "whoosh", "db": -6}, {"t": s0 + 0.9, "k": "thud", "db": -8}, {"t": s0 + 2.1, "k": "thud", "db": -8}]
    elif sc["kind"] == "week":
        st, cr = T(sc["start"]), T(sc["cross"]); P = {"start": round(st - s0, 3), "cross": round(cr - s0, 3)}; events += [{"t": st + 0.17 * i, "k": "tick", "db": 1} for i in range(7)] + [{"t": cr, "k": "ding"}, {"t": cr + 0.05, "k": "sparkle", "db": -3}]
    elif sc["kind"] == "vada":
        events += [{"t": s0 + 0.05 * i, "k": "tick", "db": 1} for i in range(5)] + [{"t": s0 + 0.1, "k": "whoosh", "db": -6}, {"t": s0 + 1.0, "k": "pop"}, {"t": s0 + 1.5, "k": "thud", "db": 2}]
    elif sc["kind"] == "promise":
        ts = {k: T(sc[k]) for k in ("n1", "n2", "cross", "fall", "cta1", "cta1End", "tiny", "tick")}; br = [T(x) for x in sc["breaks"]]
        P = {k: round(v - s0, 3) for k, v in ts.items()}; P["breaks"] = [round(x - s0, 3) for x in br]; P["end"] = round(s1 - s0, 3)
        events += [{"t": ts["n1"], "k": "thud", "db": -4}, {"t": ts["n2"], "k": "thud", "db": -4}, {"t": ts["cross"], "k": "whoosh", "db": -6}, {"t": ts["cross"] + 0.2, "k": "whoosh", "db": -6}]
        events += [{"t": x, "k": "thud", "db": -2} for x in br] + [{"t": ts["fall"], "k": "whoosh", "db": -3}, {"t": ts["fall"] + 0.7, "k": "thud", "db": -3}]
        events += [{"t": ts["cta1"], "k": "pop"}] + [{"t": ts["cta1"] + 0.5 + 0.07 * i, "k": "type", "db": 2} for i in range(26)]
        events += [{"t": ts["tiny"], "k": "pop"}, {"t": ts["tick"], "k": "ding", "db": -2}, {"t": ts["tick"] + 0.05, "k": "sparkle", "db": -4}, {"t": ts["tick"] + 0.6, "k": "chime", "db": -6}]
    elif sc["kind"] == "know":
        rt, sl = T(sc["right"]), T(sc["slam"]); P = {"right": round(rt - s0, 3), "slam": round(sl - s0, 3)}
        events += [{"t": s0 + 0.1, "k": "pop"}, {"t": s0 + 0.15, "k": "whoosh", "db": -8}, {"t": rt, "k": "pop"}, {"t": sl, "k": "thud", "db": 2}, {"t": sl, "k": "whoosh", "db": -6}]
    elif sc["kind"] == "fade":
        tm, dm = T(sc["tom"]), T(sc["dim"]); P = {"tom": round(tm - s0, 3), "dim": round(dm - s0, 3)}
        events += [{"t": s0 + 0.05, "k": "pop"}, {"t": tm - 0.05, "k": "whoosh", "db": -3}, {"t": dm, "k": "whoosh", "db": -2}, {"t": dm + 1.0, "k": "thud", "db": -3}]
    elif sc["kind"] == "go":
        st, go, sk = T(sc["start"]), T(sc["go"]), T(sc["strike"]); P = {"start": round(st - s0, 3), "go": round(go - s0, 3), "strike": round(sk - s0, 3)}
        events += [{"t": s0 + 0.05, "k": "pop"}] + [{"t": st + 0.5 * i, "k": "tick", "db": -3} for i in range(max(1, int((go - st) / 0.5)))] + [{"t": go, "k": "ding"}, {"t": go + 0.05, "k": "sparkle", "db": -4}, {"t": sk, "k": "tick", "db": 4}, {"t": sk + 0.15, "k": "thud", "db": -4}]
    elif sc["kind"] == "panorama":
        P = {"titles": sc["titles"], "hi": sc.get("hi", 0)}; events += [{"t": s0 + 0.2, "k": "whoosh"}]
    scenes.append({"kind": sc["kind"], "start": round(s0, 3), "dur": round(s1 - s0, 3), "p": P})
    print(f'sahna {sc["kind"]:9} {s0:6.2f}s .. {s1:6.2f}s')
# SFX trek
if events:
    n = int(SR * (total + 1)); tr = np.zeros(n)
    for e in events:
        w = SS.wave(e["k"], e.get("db", 0)); i0 = int(e["t"] * SR)
        if i0 < n: tr[i0:i0 + len(w)] += w[: n - i0]
    tr *= 0.2 / (np.abs(tr).max() + 1e-9); sf.write(W / "sfx.wav", np.stack([tr, tr], 1), SR)
    run("ffmpeg", "-v", "error", "-y", "-i", W / "voice_full.wav", "-i", mus, "-i", W / "sfx.wav", "-filter_complex",
        "[0]asplit=2[v1][v2];[1][v1]sidechaincompress=threshold=0.02:ratio=4:attack=30:release=500[md];[v2]pan=stereo|c0=c0|c1=c0[vs];[vs][md][2]amix=inputs=3:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=7",
        "-ar", 48000, "-ac", 2, W / "mix.wav")
    ml, mp = lufs(W / "mix.wav"); print(f"SFX bilan miks: {ml} LUFS, peak {mp} dBFS"); shutil.copy(W / "mix.wav", K / "public" / mixname)
data = {"style": spec["base_style"], "totalSec": total, "audio": mixname, "lines": lines, **({"scenes": scenes} if scenes else {})}
dj = K / "src/data" / f"reel_{spec['id']}.json"; json.dump(data, open(dj, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
out = proj / "out" / f"reel_{spec['id']}_{'draft' if a.scale != '1' else 'final'}.mp4"; out.parent.mkdir(exist_ok=True)
run("bash", K / "render.sh", spec["base_style"], out, a.scale, dj)
# audio: Remotion AAC o'rniga toza miksdan AAC 256k / 48 kHz (standart)
tmp = out.with_name(out.stem + "_tmp.mp4"); run("ffmpeg", "-v", "error", "-y", "-i", out, "-i", W / "mix.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", 48000, "-shortest", "-movflags", "+faststart", tmp); tmp.replace(out)
print("TAYYOR:", out, f"{total}s")
