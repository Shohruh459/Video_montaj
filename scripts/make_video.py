#!/usr/bin/env python3
"""Yagona yig'ish: ovoz → sahna vaqtlari → Remotion → audio mix (ducking, -14 LUFS) → eksport → QC.
Ishlatish:
  python3 scripts/make_video.py projects/<loyiha> --draft   # 540x960, tez (Remotion scale 0.5)
  python3 scripts/make_video.py projects/<loyiha> --final   # 1080x1920, export.sh + qc.sh
Kirish: projects/<loyiha>/scenes.json  ("build" bo'limi: voice_lines, target_duration, lead, tail, music, ...)
Sahna i  <->  ovoz qatori i (soni teng bo'lishi kerak). Sahna uzunliklari ovoz davomiyligidan hisoblanadi.
Ovoz qatorlari keshlanadi (voice/cache/) — matn/tezlik/seed o'zgarmasa qayta generatsiya qilinmaydi."""
import argparse, hashlib, json, pathlib, re, subprocess, sys, textwrap

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import tts_vs  # noqa: E402


def sh(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def dur(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                                capture_output=True, text=True, check=True).stdout.strip())


ap = argparse.ArgumentParser()
ap.add_argument("project")
g = ap.add_mutually_exclusive_group(required=True)
g.add_argument("--draft", action="store_true"); g.add_argument("--final", action="store_true")
g.add_argument("--audio-only", action="store_true", help="faqat audio mix (Remotion/video yo'q) — musiqa darajasini tez tekshirish uchun")
ap.add_argument("--speed", type=float); ap.add_argument("--seed", type=int)
a = ap.parse_args()

proj = pathlib.Path(a.project).resolve()
cfg = json.loads((proj / "scenes.json").read_text(encoding="utf-8"))
b = cfg["build"]
speed = a.speed or b.get("speed", 1.0)
seed = a.seed if a.seed is not None else tts_vs.CFG["seed"]
out = proj / "out"; out.mkdir(exist_ok=True)
cache = proj / "voice/cache"; cache.mkdir(parents=True, exist_ok=True)

# 1) Ovoz qatorlari (kesh)
lines = [l.strip() for l in (proj / b["voice_lines"]).read_text(encoding="utf-8").splitlines() if l.strip()]
scenes = cfg["scenes"]
if len(lines) != len(scenes):
    sys.exit(f"XATO: ovoz qatorlari ({len(lines)}) va sahnalar ({len(scenes)}) soni teng emas")
pid = None; parts = []
ref_sig = hashlib.sha1((tts_vs.ROOT / tts_vs.CFG["ref_audio"]).read_bytes()).hexdigest()[:8]
for i, line in enumerate(lines):
    key = hashlib.sha1(f"{line}|{speed}|{seed}|{ref_sig}".encode()).hexdigest()[:16]
    f = cache / f"{key}.wav"
    if not f.exists():
        if pid is None:
            tts_vs.check_backend(); pid = tts_vs.ensure_profile()
        f.write_bytes(tts_vs.synth_line(pid, line, seed, speed))
        print(f"[ovoz {i+1}/{len(lines)}] yaratildi: {line[:48]}")
    else:
        print(f"[ovoz {i+1}/{len(lines)}] keshdan: {line[:48]}")
    parts.append(f)
d = [dur(p) for p in parts]

# 2) Vaqt: pauza maqsadli davomiylikka moslanadi
lead, tail, xf, pre = b["lead"], b["tail"], b["xfade"], b["preroll"]
pause = (b["target_duration"] - lead - tail - sum(d)) / max(1, len(d) - 1)
pause = max(b["min_pause"], min(b["max_pause"], pause))
starts, t = [], lead
for x in d:
    starts.append(t); t += x + pause
total = starts[-1] + d[-1] + tail
print(f"nutq {sum(d):.1f}s, pauza {pause:.2f}s, jami {total:.1f}s (maqsad {b['target_duration']}s)")
tts_vs.concat_with_pauses(parts, pause, out / "voice_final.wav", lead=lead)

# 3) Sahna uzunliklari (kesishma xf bilan)
t0 = [0.0] + [s - pre for s in starts[1:]]
res = json.loads(json.dumps(cfg)); res.pop("build", None)
res["publicDir"] = str((proj / cfg.get("publicDir", "broll")).resolve())
for i, s in enumerate(res["scenes"]):
    s["dur"] = round((t0[i + 1] - t0[i] + xf) if i < len(scenes) - 1 else (total - t0[i]), 3)
# Subtitr: matn sahnadagi "sub" (bo'lmasa ovoz qatori); vaqt = ovoz qatori oralig'i. Qator: gap bo'yicha, uzun bo'lsa wrap, ≤ 2 qator
def split_lines(text, per_line=36, wrap=30, max_lines=2):
    lines = []
    for sent in re.split(r"(?<=[.!?])\s+", text.strip()):
        lines += [sent] if len(sent) <= per_line else textwrap.wrap(sent, wrap)
    if len(lines) > max_lines:
        print(f"OGOHLANTIRISH: subtitr {len(lines)} qator: {text[:40]}")
    return "\n".join(lines)


def srt_time(x):
    h, m, sec = int(x // 3600), int(x % 3600 // 60), x % 60
    return f"{h:02d}:{m:02d}:{int(sec):02d},{int(round((sec % 1) * 1000)):03d}"


subs = []
for i, s in enumerate(scenes):
    if s.get("nosub"):
        continue  # bu sahnada subtitr yo'q (ekran yozuvi o'zi yetarli)
    txt = split_lines(s.get("sub") or lines[i], b.get("sub_per_line", 36), b.get("sub_wrap", 30), b.get("sub_max_lines", 2))
    longest = max(len(l) for l in txt.split("\n"))
    if longest > 42:
        print(f"OGOHLANTIRISH: subtitr qatori {longest} belgi (>42): {txt[:40]}")
    subs.append({"text": txt, "from": round(max(0, starts[i] - 0.1), 3), "to": round(min(total, starts[i] + d[i] + 0.25), 3)})
res["subs"] = subs
res["xfadeFrames"] = int(round(xf * 30))
(out / f"{b['name']}.srt").write_text("\n".join(
    f"{i+1}\n{srt_time(x['from'])} --> {srt_time(x['to'])}\n{x['text'].replace('*', '')}\n" for i, x in enumerate(subs)), encoding="utf-8")
# Uzun sahnani ikkiga bo'lish: sahnada "alt" ({"src","from"}) bo'lsa, vaqt o'rtasida ikkinchi kadrga o'tadi (tez kesish)
_rs = []
for i, s in enumerate(res["scenes"]):
    last = i == len(res["scenes"]) - 1
    st, en = t0[i], (total if last else t0[i + 1])
    if s.get("alt"):
        mid = (st + en) / 2
        a_ = {k: v for k, v in s.items() if k != "alt"}; a_["dur"] = round(mid - st + xf, 3)
        b_ = {k: v for k, v in s.items() if k != "alt"}; b_.update(s["alt"]); b_["dur"] = round(en - mid + (0 if last else xf), 3)
        _rs += [a_, b_]
    else:
        _rs.append(s)
res["scenes"] = _rs
(out / "scenes.resolved.json").write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding="utf-8")

# 4) Remotion
raw = out / "video_raw.mp4"
scale, crf = ("0.5", "23") if (a.draft or a.audio_only) else ("1", "14")
if not a.audio_only:
    sh(["node", str(ROOT / "templates/remotion/render.mjs"), str(out / "scenes.resolved.json"), str(raw), scale, crf])

# 5) Audio mix: ovoz (+ musiqa: -20 dB past + ducking) → -14 LUFS, TP -1
mix = out / "audio_mix.wav"
inputs = ["-i", str(out / "voice_final.wav")]


def lufs(path):
    r = subprocess.run(["ffmpeg", "-nostats", "-i", str(path), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])


def steadiest_start(path, length):
    """Trekda `length` soniyalik eng barqaror balandlikdagi oyna boshlanishi (s) — qisqa muddatli LUFS tebranishi eng kam."""
    import statistics as st
    r = subprocess.run(["ffmpeg", "-nostats", "-i", str(path), "-af", "ebur128=metadata=1,ametadata=print:key=lavfi.r128.S:file=-", "-f", "null", "-"], capture_output=True, text=True)
    v = [float(x) for x in re.findall(r"lavfi.r128.S=(-?[\d.]+)", r.stdout)]
    sec = [st.mean([y for y in v[i * 10:(i + 1) * 10] if y > -100] or [-70]) for i in range(len(v) // 10)]
    L = int(length) + 1
    if len(sec) <= L:
        return 0
    return min(range(0, len(sec) - L), key=lambda s0: st.pstdev(sec[s0:s0 + L]) + (3 if sec[s0] < -40 else 0))


if b.get("music"):
    # Musiqa: pauzadagi daraja = ovoz − music_pause_db (12); nutq paytida yana −music_duck_db (8) → ovozdan ≈ −20 dB (qoida: −18…−22).
    # Ducking ovoz qatorlari vaqti bo'yicha, silliq (0.3 s) o'tish bilan — deterministik.
    m = (proj / b["music"]).resolve()
    stem = out / "music_stem.wav"
    mstart = b.get("music_start", 0)
    if mstart == "auto":
        mstart = steadiest_start(m, total)
        print(f"musiqa boshlanishi (avto): {mstart} s")
    sh(["ffmpeg", "-v", "error", "-y", "-ss", str(mstart), "-stream_loop", "-1", "-i", str(m), "-t", f"{total:.3f}",
        *(["-af", "acompressor=threshold=-26dB:ratio=3:attack=300:release=1200:makeup=1"] if b.get("music_comp") else []),  # dinamikasi katta treklar: daraja kompressordan KEYIN o'lchanadi
        "-ar", "48000", "-ac", "2", str(stem)])
    v_i, m_i = lufs(out / "voice_final.wav"), lufs(stem)
    pause_db, duck_db = b.get("music_pause_db", 12), b.get("music_duck_db", 8)
    gain = v_i - pause_db - m_i
    win = "+".join(f"clip((t-{x['from']-0.3:.3f})/0.3,0,1)*clip(({x['to']+0.3:.3f}-t)/0.3,0,1)" for x in subs)
    print(f"musiqa: manba {m_i:.1f} LUFS, ovoz {v_i:.1f} LUFS → gain {gain:+.1f} dB; pauzada ovozdan -{pause_db} dB, nutqda -{pause_db + duck_db} dB")
    # Ovoz tiniqligi uchun musiqada "joy ochish": past gul (<70 Hz) kesiladi, 250 Hz loyqalik va 2.5 kHz nutq sohasi biroz pasaytiriladi
    eq = "highpass=f=70,equalizer=f=250:t=q:w=1:g=-3,equalizer=f=2500:t=q:w=1.2:g=-3," if b.get("music_eq", True) else ""
    inputs += ["-i", str(stem)]
    fc = (f"[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,apad=whole_dur={total:.3f}[v];"
          f"[1:a]{eq}volume={gain:.2f}dB,volume='pow(10,-{duck_db}*min(1,{win})/20)':eval=frame,"
          f"afade=t=in:d=1.2,afade=t=out:st={total-2:.2f}:d=2[md];"
          f"[v][md]amix=inputs=2:normalize=0:duration=first[mx]")
else:
    fc = f"[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,apad=whole_dur={total:.3f}[mx]"
fc += f";[mx]atrim=0:{total:.3f},highpass=f=70,afade=t=in:d=0.02,afade=t=out:st={total-0.4:.3f}:d=0.4[pre]"
sh(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[pre]", "-ar", "48000", "-ac", "2", str(out / "audio_pre.wav")])
meas = subprocess.run(["ffmpeg", "-nostats", "-i", str(out / "audio_pre.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                      capture_output=True, text=True).stderr
mj = json.loads(re.search(r"\{[^{}]*input_i[^{}]*\}", meas, re.S).group(0))
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={mj['input_i']}:measured_TP={mj['input_tp']}:"
      f"measured_LRA={mj['input_lra']}:measured_thresh={mj['input_thresh']}:offset={mj['target_offset']}:linear=true")
sh(["ffmpeg", "-v", "error", "-y", "-i", str(out / "audio_pre.wav"), "-af", ln, "-ar", "48000", "-ac", "2", str(mix)])

if a.audio_only:
    print("TAYYOR (audio):", mix); sys.exit(0)

# 6) Mux + eksport (yuv420p, 30 fps, faststart, AAC 256k/48k)
name = b["name"]
if a.draft:
    final = out / f"{name}_draft.mp4"
    sh(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-i", str(mix), "-map", "0:v", "-map", "1:a", "-vf", "fps=30,format=yuv420p",
        "-c:v", "libx264", "-profile:v", "high", "-crf", "20", "-preset", "veryfast", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
        "-t", f"{total:.3f}", "-movflags", "+faststart", str(final)])
else:
    tmp = out / "mux_tmp.mp4"
    sh(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-i", str(mix), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "pcm_s16le",
        "-t", f"{total:.3f}", str(tmp)])
    final = out / f"{name}_final.mp4"
    sh(["bash", str(ROOT / "scripts/export.sh"), str(tmp), str(final), b.get("format", "vertical")])
    tmp.unlink()
print("TAYYOR:", final)
if a.final and b.get("also_nomusic"):
    # Faqat ovoz (−14 LUFS) — Instagram'da o'z litsenziyali musiqasini qo'shish uchun
    va = out / "audio_voice_only.wav"
    vp = out / "voice_pre.wav"
    sh(["ffmpeg", "-v", "error", "-y", "-i", str(out / "voice_final.wav"), "-af",
        f"aresample=48000,pan=stereo|c0=c0|c1=c0,apad=whole_dur={total:.3f},atrim=0:{total:.3f},highpass=f=70,afade=t=out:st={total-0.4:.3f}:d=0.4", "-ar", "48000", str(vp)])
    sh(["ffmpeg", "-v", "error", "-y", "-i", str(vp), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-ac", "2", str(va)])
    tmp2 = out / "mux_tmp2.mp4"
    sh(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-i", str(va), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "pcm_s16le", "-t", f"{total:.3f}", str(tmp2)])
    nm = out / f"{name}_musiqasiz.mp4"
    sh(["bash", str(ROOT / "scripts/export.sh"), str(tmp2), str(nm), b.get("format", "vertical")])
    tmp2.unlink()
    print("TAYYOR (musiqasiz):", nm)
if a.final:
    sh(["bash", str(ROOT / "scripts/qc.sh"), str(final)])
