#!/usr/bin/env python3
"""Ruletka-hook (3D, three.js) prototipi: ovoz + SFX + video. Ishlatish:
  python templates/tape/build_hook.py <out.mp4> [--say "Ey-ay keldi. ..."] [--card-json card.json] [--scale 1]
Kerak: node + playwright (/opt/node-tools), VoiceStudio backend (scripts/start_voice.sh)."""
import argparse, io, json, os, pathlib, subprocess, sys, tempfile
import numpy as np, scipy.io.wavfile as wf, scipy.signal as sg
HERE = pathlib.Path(__file__).resolve().parent; ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
SR = 48000
ap = argparse.ArgumentParser(); ap.add_argument("out", nargs="?"); ap.add_argument("--stems", default=None, help="papka: voice.wav, sfx.wav, hook_video.mp4, info.json yozadi (reelga ulash uchun)")
ap.add_argument("--say", default="Ey-ay keldi. Endi dasturchilar kerak emasmi?")
ap.add_argument("--card-json", default=None); ap.add_argument("--scale", type=float, default=1.0)
ap.add_argument("--t-voice", type=float, default=None); ap.add_argument("--kind", default="tape", choices=["tape", "scale", "calendar", "traffic"])
ap.add_argument("--n-pages", type=int, default=7); ap.add_argument("--seed", type=int, default=None); ap.add_argument("--blocks", default=None, help='JSON: [{"t":"AI","bg":"#2563eb","fg":"#fff"},{...}]')
a = ap.parse_args()
KIND = a.kind
TV = {'tape': 0.72, 'scale': 0.75, 'calendar': None, 'traffic': 0.95}
if KIND == 'calendar': CAL_T0, CAL_DT, CAL_FD = 0.3, 0.13, 0.22; a.t_voice = a.t_voice or (CAL_T0 + a.n_pages * CAL_DT + 0.05)
a.t_voice = a.t_voice or TV[KIND]
card = json.load(open(a.card_json)) if a.card_json else [
    {"t": "AI keldi.", "size": 170, "color": "#0f172a"}, {"t": "Endi dasturchilar", "size": 112, "color": "#0f172a"}, {"t": "kerak emasmi?", "size": 128, "color": "#e11d48"}]

# 1) ovoz (asosiy ayol ovoz)
import tts_vs
tts_vs.check_backend(); pid = tts_vs.ensure_profile()
sr, v = wf.read(io.BytesIO(tts_vs.synth_line(pid, a.say, a.seed or tts_vs.CFG["seed"], tts_vs.CFG["speed"])))
v = v.astype("float32") / (32768.0 if v.dtype == np.int16 else 1.0); v = sg.resample_poly(v, SR, sr).astype("float32")
idx = np.where(np.abs(v) > 0.02 * np.abs(v).max())[0]; v = v[max(0, idx[0] - 600): idx[-1] + 1200]; v = v / np.abs(v).max() * 0.7
T_CLICK, T_SNAP, SNAP = 0.42, 0.56, 0.30
dur = max(3.6, a.t_voice + len(v) / SR + 0.55)

# 2) SFX (dasturiy sintez; litsenziya muammosi yo'q)
n = int(dur * SR); sfx = np.zeros(n, "float32"); rnd = np.random.default_rng(5)
def add(t0, x): i = int(t0 * SR); sfx[i:i + len(x)] += x[: n - i]
def tt(d): return np.arange(int(d * SR)) / SR
def click(t0, f=1900, g=1.0): t = tt(0.05); add(t0, ((rnd.standard_normal(len(t)) * np.exp(-t * 140) * 0.6 + np.sin(2 * np.pi * f * t) * np.exp(-t * 110) * 0.5) * g).astype("float32"))
def thud(t0, g=1.0, f=70, metal=1350):
    t = tt(0.28); add(t0, ((np.sin(2 * np.pi * (f + 60 * np.exp(-t * 25)) * t) * np.exp(-t * 14) * 0.9 + rnd.standard_normal(len(t)) * np.exp(-t * 90) * 0.5 + np.sin(2 * np.pi * metal * t) * np.exp(-t * 45) * 0.35) * g).astype("float32"))
def whoosh(t0, d=0.34, g=0.55):
    t = tt(d); f0 = 600 + 5200 * (t / d) ** 1.5; ph = np.cumsum(2 * np.pi * f0 / SR); z = (rnd.standard_normal(len(t)) * 0.35 + np.sin(ph) * 0.25) * (0.3 + 0.7 * (t / d)) * (1 + 0.5 * np.sign(np.sin(2 * np.pi * 95 * t)))
    add(t0, (sg.lfilter(*sg.butter(2, [500 / (SR / 2), 9000 / (SR / 2)], "band"), z) * g).astype("float32"))
def paper(t0, g=0.8):
    t = tt(0.16); z = rnd.standard_normal(len(t)) * np.exp(-t * 22) * (0.4 + 0.6 * np.minimum(1, t / 0.03)); add(t0, (sg.lfilter(*sg.butter(2, [1800 / (SR / 2), 9000 / (SR / 2)], "band"), z) * g).astype("float32"))
def ding(t0, f=1568, g=0.4): t = tt(0.5); add(t0, ((np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 7) * g).astype("float32"))
EV = {}
if KIND == "tape":
    click(T_CLICK); whoosh(T_SNAP); T_HIT = T_SNAP + SNAP
    for dt, g in ((0, 1.0), (0.11, 0.45), (0.2, 0.2)): thud(T_HIT + dt, g)
    EV = dict(page="tape.html", t_click=T_CLICK, t_snap=T_SNAP, snap_dur=SNAP, l_far=12)
elif KIND == "scale":
    T1, T2, DOL = 0.55, 1.05, 1.3
    whoosh(T1 - 0.30, 0.3, 0.3); thud(T1, 1.0, 60); click(T1 + 0.12, 700, 0.6); whoosh(T2 - 0.30, 0.3, 0.3); thud(T2, 1.0, 66); click(T2 + 0.15, 900, 0.5); whoosh(DOL, 0.4, 0.5); thud(DOL + 0.43, 0.8, 80)
    EV = dict(page="scale.html", T1=T1, T2=T2, dolly=DOL, dolly_dur=0.45, fast=[1.2, 1.9], blocks=json.loads(a.blocks) if a.blocks else [{"t": "AI", "bg": "#2563eb", "fg": "#ffffff"}, {"t": "ODAM", "bg": "#facc15", "fg": "#111111"}])
elif KIND == "calendar":
    for k in range(a.n_pages): paper(CAL_T0 + k * CAL_DT, 0.9)
    DOL = CAL_T0 + a.n_pages * CAL_DT + 0.2; whoosh(DOL, 0.4, 0.45); thud(DOL + 0.4, 0.8, 85, 900)
    EV = dict(page="calendar.html", n=a.n_pages, t0=CAL_T0, dt=CAL_DT, fdur=CAL_FD, dolly=DOL, dolly_dur=0.4, fast=[CAL_T0 - 0.05, DOL + 0.5], label="KUN")
elif KIND == "traffic":
    TY, TG, DOL = 0.6, 1.0, 1.35
    click(TY, 1200, 0.9); click(TG, 1500, 0.9); ding(TG + 0.02, 1568, 0.45); whoosh(DOL, 0.4, 0.5); thud(DOL + 0.43, 0.8, 85)
    EV = dict(page="traffic.html", ty=TY, tg=TG, dolly=DOL, dolly_dur=0.45, fast=[DOL - 0.05, DOL + 0.65])
sfx *= 0.9 / max(1e-6, np.abs(sfx).max())
vox = np.zeros(n, "float32"); i = int(a.t_voice * SR); vox[i:i + len(v)] = v[: n - i]
mix = (vox * 1.0 + sfx * 0.55)[:, None].repeat(2, 1)
import pyloudnorm as pln
mix *= 10 ** ((-14 - pln.Meter(SR).integrated_loudness(mix)) / 20)
tmp = pathlib.Path(tempfile.mkdtemp()); wav = tmp / "a.wav"; wf.write(wav, SR, mix.astype("float32"))
if a.stems:
    sd = pathlib.Path(a.stems); sd.mkdir(parents=True, exist_ok=True); wf.write(sd / "voice.wav", SR, vox.astype("float32")); wf.write(sd / "sfx.wav", SR, sfx.astype("float32"))

# 3) 3D kadrlar
W, H = int(540 * a.scale), int(960 * a.scale)
P = dict(w=W, h=H, fps=30, duration=dur, brand="", card=card); P.update(EV)
pj = tmp / "p.json"; pj.write_text(json.dumps(P)); fr = tmp / "f"
subprocess.run(["node", str(HERE / "render.mjs"), str(pj), str(fr)], check=True)
if a.stems:
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "30", "-i", str(fr / "f%04d.png"), "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p", str(sd / "hook_video.mp4")], check=True)
    (sd / "info.json").write_text(json.dumps({"dur": dur})); print("STEMS", sd, f"{dur:.2f}s"); sys.exit(0)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "30", "-i", str(fr / "f%04d.png"), "-i", str(wav), "-c:v", "libx264", "-crf", "17", "-preset", "medium",
                "-pix_fmt", "yuv420p", "-profile:v", "high", "-af", "alimiter=limit=0.89:level=disabled", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart",
                "-shortest", a.out], check=True)
print("OK", a.out, f"{dur:.2f}s")
