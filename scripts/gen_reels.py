#!/usr/bin/env python3
"""Yuksalish Reels loyihalarini yaratadi: python3 scripts/gen_reels.py [--only 1 2 5]
Har ssenariy -> projects/yuksalish-NN-<slug>-2026-10-11/ (scenes.json, voice/script_lines.txt, script.md, CREDITS.md, broll/ ichida kerakli klip havolalari).
Keyin: python3 scripts/make_video.py projects/<loyiha> --final"""
import argparse, json, os, pathlib, re, subprocess, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "reels"))
from yuksalish_scripts import SCRIPTS, CTA  # noqa: E402

LIB = ROOT / "library/motivation"
MUSIC = ["cin_17_2", "cin_27_0", "cin_29_3", "cin_15_1", "cin_54_1", "cin_39_6", "cin_55_2"]
CAT = {
    "walk": [202743, 223578, 212476, 282995, 139365],
    "epic": [59291, 95113, 7127, 205422, 328740, 22619, 38971, 223038],
    "sea": [138588, 135658, 233867, 23014],
    "city": [212404, 231994, 233983, 28860],
    "time": [131994, 61621, 34499, 190332, 3019, 16346],
    "phone": [169445, 736],
    "morning": [16346, 7127, 139365, 328740],
    "crowd": [3630, 3627, 1694],
    "write": [34258, 43869, 130645],
    "read": [84006, 122232, 846, 185092],
    "gym": [135162, 200657],
    "lonely": [78804, 23678, 170258, 189290, 189189, 11722, 28860],
    "hope": [173028, 7127, 328740, 59291],
}
RULES = [  # (kalit so'zlar, kategoriya) — birinchi mos kelgani
    (r"telefon", "phone"), (r"ichingdagi|ovoz", "lonely"), (r"yolg'iz", "lonely"), (r"ertalab|turish", "morning"),
    (r"vaqt|soat|yilda|yildan|ertaga|erta ham|kech|hozir|bir yil", "time"), (r"odam|fikr|atrof|ko'pchilik", "crowd"),
    (r"qo'rq|jasorat", "epic"), (r"intizom|kayfiyat|bajar|kuch|dangasa", "gym"), (r"o'qi|kitob|sahifa", "read"),
    (r"yoz|daftar|va'da", "write"), (r"yo'l|harakat|qadam|boshla|bugun|orzu|natija", "walk"),
    (r"o'zgar|tiril|omad|imkoniyat|sabr|o'sish|yuksal", "epic"),
]
FALLBACK = ["epic", "sea", "city", "walk"]
CX = {200657: 0.8, 135162: 0.62}  # sportchi kadrning o'ng tomonida: kesish markazi


def uz_num(n):
    u = ["", "bir", "ikki", "uch", "to'rt", "besh", "olti", "yetti", "sakkiz", "to'qqiz"]
    t = ["", "o'n", "yigirma", "o'ttiz", "qirq", "ellik", "oltmish", "yetmish", "sakson", "to'qson"]
    if n == 0:
        return "nol"
    out = []
    if n >= 100:
        h = n // 100; out.append("yuz" if h == 1 else f"{u[h]} yuz"); n %= 100
    if n >= 10:
        out.append(t[n // 10]); n %= 10
    if n:
        out.append(u[n])
    return " ".join(out)


def tts_text(s):
    s = s.replace("*", "").replace("«", "").replace("»", "").replace(" — ", ", ").replace("—", ",")
    return re.sub(r"\d+", lambda m: uz_num(int(m.group())), s)


def display(s):
    return re.sub(r"(?<=[oOgG])'", "ʻ", s).replace("'", "ʼ")


def category(line, i, n_lines):
    low = line.lower().replace("*", "")
    for pat, cat in RULES:
        if re.search(pat, low):
            return cat
    return FALLBACK[i % len(FALLBACK)]


def clip_len(cid):
    f = LIB / f"pixabay_video_{cid}.mp4"
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)], capture_output=True, text=True).stdout)


def pick(cat, n, i, used):
    lst = CAT[cat]; k = (n * 3 + i) % len(lst)
    for c in lst[k:] + lst[:k]:
        if c not in used:
            used.add(c); return c
    for c in sum(CAT.values(), []):
        if c not in used:
            used.add(c); return c
    return lst[k]


def start(cid, n, i, need=5.0):
    L = clip_len(cid)
    return round(((n * 7 + i * 13) % 100) / 100 * max(0.0, L - need - 0.5), 1)


ap = argparse.ArgumentParser(); ap.add_argument("--only", nargs="*", type=int)
a = ap.parse_args()
cred = {}
for ln in (ROOT / "library/CREDITS.md").read_text(encoding="utf-8").splitlines():
    m = re.match(r"- pixabay_video_(\d+)\.mp4", ln)
    if m:
        cred[int(m.group(1))] = ln
for n, slug, target, cta_key, units in SCRIPTS:
    if a.only and n not in a.only:
        continue
    proj = ROOT / f"projects/yuksalish-{n:02d}-{slug}-2026-10-11"
    for d in ("broll", "voice", "out", "raw"):
        (proj / d).mkdir(parents=True, exist_ok=True)
    say, pill = CTA[cta_key]
    used = set(); scenes = []; voice = []
    for i, u in enumerate(units):
        cat = category(u, i, len(units)); cid = pick(cat, n, i, used)
        s = {"kind": "plain", "src": f"pixabay_video_{cid}.mp4", "from": start(cid, n, i), "dur": 3, "sub": display(u), "zoom": 0.1, "zoomOut": bool(i % 2), "dim": 0.12, **({"cx": CX[cid]} if cid in CX else {})}
        if len(u.split()) >= 9:  # uzun jumla: ikkinchi kadrga o'tish
            c2 = pick(FALLBACK[(n + i) % 4] if cat in ("epic",) else "epic", n, i + 5, used)
            s["alt"] = {"src": f"pixabay_video_{c2}.mp4", "from": start(c2, n, i + 3), "zoomOut": not s["zoomOut"], **({"cx": CX[c2]} if c2 in CX else {})}
        scenes.append(s); voice.append(tts_text(u))
    cid = pick("hope", n, 99, used)
    scenes.append({"kind": "end", "src": f"pixabay_video_{cid}.mp4", "from": start(cid, n, 99), "dur": 3, **({"cx": CX[cid]} if cid in CX else {}), "sub": display(say), "nosub": True, "zoom": 0.08, "dim": 0.3})
    voice.append(tts_text(say))
    mus = MUSIC[(n - 1) % len(MUSIC)]
    mfile = next(p for p in (ROOT / "library/music").glob(f"{mus}.*"))
    # broll: faqat kerakli klip(lar)ga qattiq havola
    need = {s["src"] for s in scenes} | {s["alt"]["src"] for s in scenes if "alt" in s}
    for old in (proj / "broll").glob("*.mp4"):
        if old.name not in need:
            old.unlink()  # ishlatilmaydigan klip havolalari (Remotion butun papkani nusxalaydi)
    for fn in need:
        dst = proj / "broll" / fn
        if not dst.exists():
            os.link(LIB / fn, dst)
    cfg = {"publicDir": "broll", "brand": "@yuksalish713", "cta": display(pill), "accent": "#f5c542",
           "clipFilter": "brightness(0.8) contrast(1.12) saturate(0.92)", "karaoke": True, "subMode": "fade", "subBox": False,
           "subBottom": 760, "subSize": 68, "scenes": scenes,
           "build": {"name": f"yuksalish-{n:02d}", "format": "vertical", "target_duration": target, "lead": 0.4, "tail": 1.8, "min_pause": 0.45,
                     "max_pause": 0.95, "speed": 0.92, "voice_lines": "voice/script_lines.txt", "xfade": 0.2, "preroll": 0.2,
                     "music": os.path.relpath(mfile, proj), "music_start": "auto", "music_comp": True, "music_pause_db": 11.5,
                     "music_duck_db": 8, "also_nomusic": True, "sub_per_line": 24, "sub_wrap": 22, "sub_max_lines": 4}}
    (proj / "scenes.json").write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding="utf-8")
    (proj / "voice/script_lines.txt").write_text("\n".join(voice) + "\n", encoding="utf-8")
    ids = sorted({int(re.findall(r"\d+", f)[0]) for f in need})
    (proj / "CREDITS.md").write_text("# CREDITS\n\n" + "\n".join(cred.get(i, f"- pixabay_video_{i}.mp4 — Pixabay #{i}") for i in ids) +
        f"\n- MUSIQA: `{mus}` — HF dataset `mrfakename/cc0-music-captioned` (library/music), muallif/manba noma'lum, \"CC0\" — dataset egasi iddaosi; litsenziya tekshirilmagan.\n"
        "- OVOZ: VoiceStudio/OmniVoice (CC-BY-NC), asosiy ayol profili.\n", encoding="utf-8")
    (proj / "script.md").write_text(f"# Yuksalish №{n} — {slug}\n\nProfil: @yuksalish713 · Format 9:16 · maqsad ~{target:g} s · CTA: {pill}\n\n## Diktor matni (TTS) / ekran matni\n" +
        "\n".join(f"{i+1}. {v}  →  ekran: {s['sub'] if 'nosub' not in s else '(profil nomi + tugma)'}" for i, (v, s) in enumerate(zip(voice, scenes))) + "\n", encoding="utf-8")
    print(f"№{n:02d} {slug}: {len(scenes)} sahna, musiqa {mus}, klip {len(need)}")
