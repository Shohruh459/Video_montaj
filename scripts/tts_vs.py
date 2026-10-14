#!/usr/bin/env python3
"""Asosiy ovoz (VoiceStudio/OmniVoice, config/voice.json) bilan o'zbekcha TTS.
CLI:  python3 scripts/tts_vs.py matn.txt out.wav [--seed N] [--speed 0.9] [--pause 0.5]
Matn faylidagi har bir QATOR alohida generatsiya qilinadi, qatorlar orasiga --pause soniya jim qo'shiladi.
Modul sifatida: make_video.py dan import qilinadi (synth_line, ensure_profile).
Backend ishlamasa: bash scripts/start_voice.sh
LITSENZIYA: model CC-BY-NC — faqat demo/sinov, mijozning tijoriy ishi uchun emas."""
import argparse, json, pathlib, subprocess, sys, tempfile, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
CFG = json.loads((ROOT / "config/voice.json").read_text(encoding="utf-8"))
BASE = CFG["api"].rsplit("/v1", 1)[0]


def check_backend():
    try:
        urllib.request.urlopen(BASE + "/health", timeout=5)
    except Exception:
        sys.exit("XATO: VoiceStudio backend ishlamayapti (http://localhost:3900). Ishga tushiring: bash scripts/start_voice.sh")


def ensure_profile():
    """Backendda asosiy ovoz profili bo'lmasa, namunadan yaratadi; profil ID sini qaytaradi."""
    for pr in json.loads(urllib.request.urlopen(BASE + "/profiles", timeout=30).read()):
        if pr["name"] == CFG["profile_name"]:
            return pr["id"]
    ref = ROOT / CFG["ref_audio"]
    text = (ROOT / CFG["ref_text_file"]).read_text(encoding="utf-8").strip()
    out = subprocess.run(["curl", "-sS", "--fail-with-body", "-X", "POST", BASE + "/profiles",
                          "-F", f"name={CFG['profile_name']}", "-F", f"ref_audio=@{ref}",
                          "-F", f"ref_text={text}", "-F", "language=Uzbek", "-F", "kind=clone"],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)["id"]


def synth_line(profile_id, line, seed, speed):
    body = {k: CFG[k] for k in ("model", "language", "response_format")}
    body.update(voice=profile_id, input=line, seed=seed, speed=speed)
    req = urllib.request.Request(CFG["api"], json.dumps(body).encode(), {"Content-Type": "application/json"})
    return urllib.request.urlopen(req, timeout=900).read()


def concat_with_pauses(parts, pause, out, lead=0.0):
    tmp = pathlib.Path(tempfile.mkdtemp())
    entries = []
    if lead > 0:
        s = tmp / "lead.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", f"{lead:.3f}", str(s)], check=True)
        entries.append(s)
    sil = tmp / "sil.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", f"{pause:.3f}", str(sil)], check=True)
    for i, p in enumerate(parts):
        entries.append(pathlib.Path(p))
        if i < len(parts) - 1:
            entries.append(sil)
    lst = tmp / "list.txt"
    lst.write_text("".join(f"file '{e}'\n" for e in entries))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c:a", "pcm_s16le", "-ar", "24000", "-ac", "1", str(out)], check=True)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("text_file"); p.add_argument("out")
    p.add_argument("--seed", type=int, default=CFG["seed"])
    p.add_argument("--speed", type=float, default=CFG["speed"])
    p.add_argument("--pause", type=float, default=0.4)
    a = p.parse_args()
    lines = [l.strip() for l in pathlib.Path(a.text_file).read_text(encoding="utf-8").splitlines() if l.strip()]
    check_backend()
    pid = ensure_profile()
    tmp = pathlib.Path(tempfile.mkdtemp()); parts = []
    for i, line in enumerate(lines):
        f = tmp / f"p{i:02d}.wav"; f.write_bytes(synth_line(pid, line, a.seed, a.speed)); parts.append(f)
        print(f"[{i+1}/{len(lines)}] OK: {line[:50]}")
    concat_with_pauses(parts, a.pause, a.out)
    print("TAYYOR:", a.out)
