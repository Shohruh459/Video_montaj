#!/usr/bin/env python3
"""Ssenariydan Reels (9:16) yasaydi: MMS ovoz + sintez musiqa + PIL animatsiya + subtitr.
  python scripts/make_reel.py <ssenariy-id-yoki-raqam> [--final] [--shots]
Chiqish: projects/zarafshon-2026-10-11/out/<id>_{draft|final}.mp4
Hammasi dasturiy -> litsenziya muammosi yo'q (musiqa ham shu yerda sintez qilinadi)."""
import sys, os, re, math, argparse, subprocess, random, pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import scipy.io.wavfile as wf, scipy.signal as sg

ROOT = pathlib.Path(__file__).resolve().parent.parent
PROJ = ROOT / "projects" / "zarafshon-2026-10-11"
sys.path.insert(0, str(ROOT / "scripts")); sys.path.insert(0, str(PROJ))
import scenarios

W, H, FPS, SR = 1080, 1920, 30, 48000
BG, CARD, CYAN, VIOLET, GREEN = (15, 23, 42), (30, 41, 59), (56, 189, 248), (167, 139, 250), (52, 211, 153)
TXT, MUTED, BORDER, YELLOW, RED = (226, 232, 240), (148, 163, 184), (51, 65, 85), (250, 204, 21), (248, 113, 113)
ACC = dict(cyan=CYAN, violet=VIOLET, yellow=YELLOW, green=GREEN, red=RED)
FD = "/usr/share/fonts/truetype/dejavu/"
_fc = {}


def font(size, bold=True, mono=False):
    k = (int(size), bold, mono)
    if k not in _fc:
        f = "DejaVuSansMono-Bold.ttf" if mono and bold else "DejaVuSansMono.ttf" if mono else "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
        _fc[k] = ImageFont.truetype(FD + f, int(size))
    return _fc[k]


def norm(s):  # ekran matnida o'zbekcha tutuq belgilarini bir xil qilish
    return s.replace("‘", "ʻ")


def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease(x): x = clamp(x); return 1 - (1 - x) ** 3
def back(x):
    x = clamp(x); c = 1.70158
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
def prog(t, t0, d): return clamp((t - t0) / d)


def alpha_img(im, a):
    if a >= 0.999: return im
    r, g, b, al = im.split()
    return Image.merge("RGBA", (r, g, b, al.point(lambda v: int(v * a))))


def put(cv, im, x, y, a=1.0):
    if a <= 0.003: return
    im = alpha_img(im, a); cv.paste(im, (int(x), int(y)), im)


def put_c(cv, im, cx, cy, a=1.0, scale=1.0):
    if scale != 1.0:
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.BILINEAR)
    put(cv, im, cx - im.width / 2, cy - im.height / 2, a)


def text_layer(lines, size, fill, bold=True, mono=False, stroke=0, spacing=1.18, align="center", maxw=None):
    if isinstance(lines, str): lines = lines.split("\n")
    lines = [norm(l) for l in lines]
    f = font(size, bold, mono)
    if maxw:
        while max(f.getlength(l) for l in lines) > maxw and size > 20:
            size -= 2; f = font(size, bold, mono)
    lh = int(size * spacing); pad = stroke + 6
    w = int(max(f.getlength(l) for l in lines)) + 2 * pad; h = lh * len(lines) + 2 * pad
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for i, l in enumerate(lines):
        lw = f.getlength(l)
        x = pad if align == "left" else (w - lw) / 2
        d.text((x, pad + i * lh), l, font=f, fill=fill + (255,), stroke_width=stroke, stroke_fill=(5, 8, 16, 255))
    return im


_cc = {}


def card(w, h, fill=CARD, outline=BORDER, r=36, glow=None, gr=30, ow=3):
    k = (w, h, fill, outline, r, glow, gr, ow)
    if k in _cc: return _cc[k]
    pad = gr * 2 if glow else 4
    im = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    if glow:
        g = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(g).rounded_rectangle((pad, pad, pad + w, pad + h), r, fill=glow + (150,))
        im.alpha_composite(g.filter(ImageFilter.GaussianBlur(gr)))
    ImageDraw.Draw(im).rounded_rectangle((pad, pad, pad + w, pad + h), r, fill=fill + (255,), outline=outline + (255,) if outline else None, width=ow)
    _cc[k] = (im, pad); return _cc[k]


def put_card(cv, x, y, w, h, a=1.0, **kw):  # x,y = sol-yuqori (karta ichki)
    im, pad = card(w, h, **kw); put(cv, im, x - pad, y - pad, a)


# ---------------------------------------------------------------- fon
def make_bg():
    yy, xx = np.mgrid[0:H, 0:W].astype("float32")
    d = np.sqrt(((xx - W * 0.5) / W) ** 2 + ((yy - H * 0.38) / H) ** 2)
    k = np.clip(1 - d * 1.5, 0, 1)[..., None] ** 2
    base = np.array(BG, "float32") * (1 - 0.45 * (1 - k)) + np.array((22, 38, 70), "float32") * k * 0.9
    return Image.fromarray(np.clip(base, 0, 255).astype("uint8"), "RGB")


def make_grid():
    g = Image.new("RGBA", (W + 80, H + 80), (0, 0, 0, 0)); d = ImageDraw.Draw(g)
    for x in range(0, W + 80, 80):
        for y in range(0, H + 80, 80): d.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(148, 163, 184, 38))
    return g


def make_blob(c):
    s = Image.new("RGBA", (700, 700), (0, 0, 0, 0)); ImageDraw.Draw(s).ellipse((150, 150, 550, 550), fill=c + (70,))
    return s.filter(ImageFilter.GaussianBlur(90))


BGI, GRID, BL1, BL2 = None, None, None, None


def init_assets():
    global BGI, GRID, BL1, BL2
    BGI, GRID, BL1, BL2 = make_bg(), make_grid(), make_blob(CYAN), make_blob(VIOLET)


def background(t, tot):
    cv = BGI.copy().convert("RGBA")
    put(cv, GRID, -(t * 6) % 80 - 40, -(t * 4) % 80 - 40)
    put(cv, BL1, 120 + 160 * math.sin(t * 0.45) - 350 + 350, 250 + 120 * math.cos(t * 0.37) - 350 + 150, 1)
    put(cv, BL2, 450 + 140 * math.cos(t * 0.33), 1000 + 160 * math.sin(t * 0.41), 1)
    return cv


# ---------------------------------------------------------------- sahnalar
def S_word(cv, lt, sc, tot):
    col = ACC[sc.get("accent", "cyan")]; p = ease(prog(lt, 0, 0.55))
    lay = text_layer(sc["text"], 124, TXT, stroke=0, maxw=900, spacing=1.2)
    put_c(cv, lay, W / 2, 760 + (1 - p) * 40, p, 0.94 + 0.06 * p)
    bw = int((lay.width - 40) * 0.5 * ease(prog(lt, 0.25, 0.6)))
    ImageDraw.Draw(cv).rounded_rectangle((W / 2 - bw, 760 + lay.height / 2 + 24, W / 2 + bw, 760 + lay.height / 2 + 36), 6, fill=col)


def code_lines(cv, x, y, w, n, good, lt, seed):
    rnd = random.Random(seed); d = ImageDraw.Draw(cv)
    cols = [CYAN, VIOLET, TXT, GREEN, (125, 211, 252)] if good else [RED, (251, 146, 60), MUTED, RED, YELLOW]
    ind = 0
    for i in range(n):
        if good: ind = [0, 1, 1, 2, 1, 0][i % 6] * 36
        else: ind = rnd.choice([0, 1, 3, 0, 2, 4]) * 28
        ln = rnd.randint(110, w - 80 - ind)
        a = ease(prog(lt, 0.15 * i, 0.35))
        c = rnd.choice(cols); yy = y + i * 40
        d.rounded_rectangle((x + ind, yy, x + ind + int(ln * a), yy + 18), 8, fill=c + (255,)) if a > 0.02 else None
        if not good and rnd.random() < 0.25 and a > 0.9: d.line((x + ind, yy + 26, x + ind + ln, yy + 26), fill=RED, width=2)


def S_chat(cv, lt, sc, tot):
    good = sc["mode"] == "good"; col = GREEN if good else RED
    e = ease(prog(lt, 0, 0.5))
    put_card(cv, 70, 250 + (1 - e) * 30, 940, 470, e, glow=None)
    d = ImageDraw.Draw(cv)
    for i, c in enumerate((RED, YELLOW, GREEN)): d.ellipse((110 + i * 38, 290 + (1 - e) * 30, 130 + i * 38, 310 + (1 - e) * 30), fill=c)
    put(cv, text_layer("main.ts", 30, MUTED, bold=False, mono=True), 330, 280, e)
    code_lines(cv, 110, 350, 860, 9, good, lt, 11 if not good else 5)
    # chat oynasi
    put_card(cv, 70, 770 + (1 - e) * 30, 940, 560, e, glow=col if sc.get("done") or sc.get("err") else None, outline=col if good or sc.get("err") else BORDER)
    put(cv, text_layer("AI chat", 30, VIOLET, mono=True), 110, 800, e)
    pr = norm(sc["prompt"]); n = len(pr) if sc.get('typed') else int(len(pr) * prog(lt, 0.3, min(1.0, 0.04 * len(pr))))
    put_card(cv, 110, 860, 860, 100, fill=(15, 23, 42), outline=CYAN if True else BORDER, r=28, ow=2)
    put(cv, text_layer(pr[:n] + ("▌" if int(lt * 2.5) % 2 == 0 and n < len(pr) else ""), 40, TXT, bold=False, mono=True, align="left"), 135, 880, 1)
    if lt > 1.6:
        a = ease(prog(lt, 1.6, 0.4))
        if good:
            for i, l in enumerate(["function login() {", "  validate(form);", "}  // ✓ test o‘tdi"][: 1 + int((lt - 1.6) * 3)]):
                put(cv, text_layer(l, 36, GREEN, bold=False, mono=True, align="left"), 135, 1010 + i * 56, a)
        else:
            for i, l in enumerate(["Error: undefined is not", "a function (line 482)", "TypeError ...  ✗"]):
                put(cv, text_layer(l, 36, RED, bold=False, mono=True, align="left"), 135, 1010 + i * 56, a)
    if sc.get("err") and lt > 0.5:
        p = back(prog(lt, 0.5, 0.5)); lay = text_layer("Natija: chalkash", 58, RED)
        put_card(cv, W / 2 - lay.width / 2 - 20, 1160, lay.width + 40, 100, p, fill=(40, 20, 28), outline=RED, r=30)
        put_c(cv, lay, W / 2, 1210, p)
    if sc.get("done") and lt > 0.5:
        p = back(prog(lt, 0.5, 0.5)); lay = text_layer("Tushundim", 58, GREEN)
        put_card(cv, W / 2 - lay.width / 2 - 70, 1160, lay.width + 140, 100, p, fill=(14, 40, 36), outline=GREEN, r=30)
        draw_check(cv, W / 2 - lay.width / 2 - 20, 1210, 30, GREEN, p, 7); put_c(cv, lay, W / 2 + 30, 1210, p)


def draw_check(cv, cx, cy, s, col, p, w=8):
    d = ImageDraw.Draw(cv); pts = [(cx - s * 0.6, cy), (cx - s * 0.15, cy + s * 0.45), (cx + s * 0.7, cy - s * 0.5)]
    segs = [(pts[0], pts[1]), (pts[1], pts[2])]; total = p * 2
    for i, (a, b) in enumerate(segs):
        q = clamp(total - i)
        if q > 0: d.line((a[0], a[1], a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q), fill=col, width=w, joint="curve")


def S_compare(cv, lt, sc, tot):
    st = sc["step"]; bad = "login page yasab ber"; good = "Next.js 14, Tailwind,\ndark mode, responsive,\nTypeScript bilan login\npage yasab ber.\nForm validatsiya ham bo‘lsin."
    dim = 0.25 if st >= 3 else 1.0
    a1 = ease(prog(lt, 0, 0.5)) if st == 0 else 1
    # yomon karta (chapdan)
    s1 = ease(prog(lt, 0, 0.6)) if st == 1 else (1 if st > 1 else 0)
    put_card(cv, 70 + (1 - s1) * -700, 270, 940, 300, s1 * dim, fill=(40, 24, 34), outline=RED, ow=4)
    put(cv, text_layer("Yomon prompt", 34, RED, mono=True, align="left"), 110 + (1 - s1) * -700, 300, s1 * dim)
    put(cv, text_layer("“" + bad + "”", 50, TXT, bold=False, mono=True, align="left", maxw=860), 110 + (1 - s1) * -700, 400, s1 * dim)
    s2 = ease(prog(lt, 0, 0.7)) if st == 2 else (1 if st > 2 else 0)
    glow = 0.6 + 0.4 * math.sin(lt * 3)
    put_card(cv, 70 + (1 - s2) * 700, 640, 940, 520, s2 * dim, fill=(14, 36, 52), outline=CYAN, glow=CYAN, ow=4)
    put(cv, text_layer("Yaxshi prompt", 34, CYAN, mono=True, align="left"), 110 + (1 - s2) * 700, 675, s2 * dim)
    put(cv, text_layer(good, 44, TXT, bold=False, mono=True, align="left", maxw=860, spacing=1.3), 110 + (1 - s2) * 700, 745, s2 * dim)
    if st == 0:
        put(cv, text_layer("?", 320, (51, 65, 85)), W / 2 - 110, 560, a1)
    if st >= 3:  # natija: chiroyli UI
        p = back(prog(lt, 0.05, 0.6))
        put_card(cv, 190, 420, 700, 860, p, fill=(11, 18, 33), outline=CYAN, glow=CYAN, ow=3)
        d = ImageDraw.Draw(cv)
        put_c(cv, text_layer("Xush kelibsiz", 54, TXT), W / 2, 520, p)
        for i, lab in enumerate(("Email", "Parol")):
            y0 = 600 + i * 150
            put(cv, text_layer(lab, 28, MUTED, bold=False, align="left"), 240, y0 - 4, p)
            d.rounded_rectangle((240, y0 + 40, 840, y0 + 110), 16, fill=(30, 41, 59), outline=(71, 85, 105), width=2) if p > 0.5 else None
        if p > 0.5:
            d.rounded_rectangle((240, 930, 840, 1020), 20, fill=CYAN)
            put_c(cv, text_layer("Kirish", 40, (8, 20, 40)), W / 2, 975, 1)
            put_c(cv, text_layer("✓ Forma tekshiruvi", 30, GREEN, bold=False), W / 2, 1090, ease(prog(lt, 0.7, 0.4)))


TL = [("1-kun", "G‘oya va dizayn"), ("2–4 kun", "Frontend"), ("5-kun", "Backend va baza"), ("6-kun", "Deploy va tozalash"), ("7-kun", "GitHub + Live demo")]


def S_timeline(cv, lt, sc, tot):
    st = sc["step"]; d = ImageDraw.Draw(cv); x = 200
    top, bot = 330, 330 + 4 * 262
    drawn = top + (bot - top) * min(1.0, (max(st, -1) + 1 + ease(prog(lt, 0, 0.8))) / 5) if st >= 0 else top + (bot - top) * 0.1 * ease(prog(lt, 0, 1.0))
    d.line((x, top, x, drawn), fill=BORDER, width=8)
    for i, (day, what) in enumerate(TL):
        y = top + i * 262
        if i > st:
            put(cv, text_layer(day, 52, (71, 85, 105), align="left"), x + 70, y - 52, 0.55 * ease(prog(lt, 0, 0.8)))
            ImageDraw.Draw(cv).ellipse((x - 12, y - 12, x + 12, y + 12), fill=(51, 65, 85))
            continue
        p = back(prog(lt, 0.05, 0.5)) if i == st else 1.0
        act = (i == st)
        r = int((26 if act else 18) * p)
        d.ellipse((x - r - 8, y - r - 8, x + r + 8, y + r + 8), fill=(CYAN if act else (71, 85, 105)) + (255,)) if act else None
        d.ellipse((x - r, y - r, x + r, y + r), fill=(CYAN if act else VIOLET))
        a = 1.0 if act else 0.62
        put(cv, text_layer(day, 78 if act else 56, CYAN if act else TXT, align="left"), x + 70, y - 78, a * min(1, p))
        put(cv, text_layer(what, 54 if act else 40, TXT if act else MUTED, bold=False, align="left", maxw=700), x + 72, y + 24, a * min(1, p))


TOOLS = [("Cursor", "Kod yozish va tahrirlash", CYAN, "cursor.jpg"), ("Claude", "Uzun va murakkab mantiq", VIOLET, "claude.png"), ("ChatGPT", "Tez g‘oya va tushuntirish", GREEN, "chatgpt.png")]
_logo = {}


def logo_tile(fn, sz=170):
    """Mijoz logotipi o'zgartirilmaydi: faqat bo'sh chekkasi kesiladi va plitka ustiga joylanadi."""
    if fn in _logo: return _logo[fn]
    im = Image.open(ROOT / "assets/logos" / fn).convert("RGBA")
    if fn == "chatgpt.png":
        bb = Image.eval(im.convert("L"), lambda v: 255 - v).getbbox(); im = im.crop(bb); bg = (255, 255, 255)
    elif fn == "claude.png": bg = (30, 41, 59)
    else: bg = None
    inner = sz if bg is None else int(sz * 0.74)
    im = im.resize((inner, int(inner * im.height / im.width)) if im.width >= im.height else (int(inner * im.width / im.height), inner), Image.LANCZOS)
    tile = Image.new("RGBA", (sz, sz), (0, 0, 0, 0)); m = Image.new("L", (sz, sz), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, sz - 1, sz - 1), 36, fill=255)
    if bg: ImageDraw.Draw(tile).rounded_rectangle((0, 0, sz - 1, sz - 1), 36, fill=bg + (255,))
    tile.alpha_composite(im, ((sz - im.width) // 2, (sz - im.height) // 2))
    tile.putalpha(Image.composite(tile.getchannel("A"), Image.new("L", (sz, sz), 0), m)); _logo[fn] = tile; return tile


def S_tools(cv, lt, sc, tot):
    st = sc["step"]
    for i, (nm, what, col, lg) in enumerate(TOOLS):
        y = 300 + i * 330; vis = ease(prog(lt, 0.12 * i, 0.5)) if st == -1 else 1.0
        act = (st == i); allp = st == 3
        a = vis * (1.0 if (act or allp) else (0.45 if st >= 0 else 0.9))
        sc_ = 1.04 if act else 1.0
        im, pad = card(940, 270, fill=(30, 41, 59) if not (act or allp) else (26, 36, 66), outline=col if (act or allp) else BORDER, r=40, glow=col if (act or allp) else None, ow=4 if act else 3)
        put_c(cv, im, W / 2 + (1 - vis) * -120, y + 135, a, sc_)
        ox = (1 - vis) * -120
        put_c(cv, logo_tile(lg), 215 + ox, y + 135, a, sc_)
        put(cv, text_layer(nm, 78, col if (act or allp) else TXT, align="left"), 340 + ox, y + 40, a)
        put(cv, text_layer(what, 40, TXT if act else MUTED, bold=False, align="left", maxw=560), 342 + ox, y + 150, a)
        if allp:
            draw_check(cv, 930, y + 70, 28, GREEN, ease(prog(lt, 0.2 + 0.2 * i, 0.4)), 8)


def S_typing(cv, lt, sc, tot):
    p = ease(prog(lt, 0, 0.4)); txt = norm(sc["text"]); n = int(len(txt) * prog(lt, 0.1, min(1.3, 0.07 * len(txt))))
    if sc.get("q"): put_c(cv, text_layer("?", 760, (30, 41, 59)), W / 2, 760, 0.8 * p)
    lay = text_layer((txt[:n] + ("▌" if int(lt * 2.5) % 2 == 0 and n < len(txt) else "")).split("\n"), 112, TXT, maxw=900, spacing=1.2)
    pulse = 0.93 + 0.07 * math.sin(lt * 3)
    put_c(cv, lay, W / 2, 780, p * (pulse if n >= len(txt) else 1.0))
    bw = int(300 * ease(prog(lt, 0.2, 0.8)))
    ImageDraw.Draw(cv).rounded_rectangle((W / 2 - bw, 1010, W / 2 + bw, 1022), 6, fill=YELLOW if sc.get("q") else CYAN)


def S_warn(cv, lt, sc, tot):
    p = back(prog(lt, 0, 0.55)); lay = text_layer(sc["text"], 100, TXT, maxw=800)
    w, h = max(lay.width + 120, 700), lay.height + 330
    y = 640
    put_card(cv, W / 2 - w / 2, y, w, h, p, fill=(44, 38, 18), outline=YELLOW, glow=YELLOW, ow=4)
    d = ImageDraw.Draw(cv)
    cx, cy = W / 2, y + 100
    d.polygon([(cx, cy - 60), (cx - 66, cy + 50), (cx + 66, cy + 50)], outline=YELLOW, width=8) if p > 0.3 else None
    d.line((cx, cy - 18, cx, cy + 14), fill=YELLOW, width=9) if p > 0.3 else None
    d.ellipse((cx - 5, cy + 26, cx + 5, cy + 36), fill=YELLOW) if p > 0.3 else None
    put_c(cv, lay, W / 2, y + 240 + (lay.height - 120) / 2 + 10, p)


def S_check(cv, lt, sc, tot):
    p = ease(prog(lt, 0, 0.5)); d = ImageDraw.Draw(cv)
    put_c(cv, card(360, 360, fill=(14, 40, 36), outline=GREEN, r=180, glow=GREEN, ow=6)[0], W / 2, 640, p)
    draw_check(cv, W / 2, 650, 100, GREEN, ease(prog(lt, 0.3, 0.6)), 22)
    put_c(cv, text_layer(sc["text"], 96, TXT, maxw=900), W / 2, 960, ease(prog(lt, 0.5, 0.5)))


def S_cta(cv, lt, sc, tot):
    p = back(prog(lt, 0, 0.6)); f = font(64); ls = []
    for para in sc["text"].split("\n"):
        cur = ""
        for w in para.split():
            if cur and f.getlength(cur + " " + w) > 820: ls.append(cur); cur = w
            else: cur = (cur + " " + w).strip()
        ls.append(cur)
    lay = text_layer(ls, 64, TXT, maxw=860, spacing=1.35)
    w, h = 940, lay.height + 260
    put_card(cv, 70, 560, w, h, p, fill=(20, 32, 58), outline=CYAN, glow=VIOLET, ow=3)
    put_c(cv, lay, W / 2, 560 + 90 + lay.height / 2, p)
    put_c(cv, text_layer("↓", 130, CYAN), W / 2, 560 + h - 85 + 14 * math.sin(lt * 5), p)
    put_c(cv, text_layer(scenarios.BRAND, 56, CYAN), W / 2, 560 + h + 140, ease(prog(lt, 0.5, 0.6)))


SCENES = dict(word=S_word, chat=S_chat, compare=S_compare, timeline=S_timeline, tools=S_tools, typing=S_typing, warn=S_warn, check=S_check, cta=S_cta)

# ---------------------------------------------------------------- subtitr
SUBW, SUBF = 920, 56


def wnorm(w): return re.sub(r"[^\w]", "", norm(w).lower().replace("ʻ", "").replace("’", ""))


def sub_chunks(sub, hl):
    f = font(SUBF); hln = {wnorm(h) for h in hl}; words = norm(sub).split(); lines, cur = [], []
    for w in words:
        t = " ".join(cur + [w])
        if f.getlength(t) > SUBW and cur: lines.append(cur); cur = [w]
        else: cur.append(w)
    if cur: lines.append(cur)
    k = 1 if len(lines) % 2 else 0  # toq bo'lsa birinchi chunk 1 qator (har chunk <= 2 qator)
    chunks = ([lines[:1]] if k else []) + [lines[i:i + 2] for i in range(k, len(lines), 2)]
    return [[[(w, wnorm(w) in hln) for w in ln] for ln in ch] for ch in chunks]


def sub_layer(ch, hcol):
    f = font(SUBF); lh = 80; pad = 14
    im = Image.new("RGBA", (SUBW + 2 * pad + 60, lh * len(ch) + 2 * pad), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for i, ln in enumerate(ch):
        full = " ".join(w for w, _ in ln); x = (im.width - f.getlength(full)) / 2; sp = f.getlength(" ")
        for w, h in ln:
            d.text((x, pad + i * lh), w, font=f, fill=(hcol if h else (255, 255, 255)) + (255,), stroke_width=7, stroke_fill=(4, 8, 18, 255))
            x += f.getlength(w) + sp
    return im


# ---------------------------------------------------------------- ovoz + musiqa
def trim(x, thr_db=-42):
    m = np.abs(x); th = 10 ** (thr_db / 20) * m.max(); idx = np.where(m > th)[0]
    return x[max(0, idx[0] - int(0.02 * SR)): idx[-1] + int(0.05 * SR)]


TEMPO = 1.0  # nutq tezligi (1.0 = asl); balandligi o'zgarmaydi


def tempo(w, r):
    if r == 1.0: return w
    pr = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", f"atempo={r}", "-f", "f32le", "-"],
                        input=w.astype("float32").tobytes(), capture_output=True, check=True)
    return np.frombuffer(pr.stdout, "float32").copy()


def voice_track(sc, cache):
    from tts_mms import synth
    items = [(g["say"], g) for g in sc["segs"]] + [(sc["cta_say"], None)]
    clips = []
    for i, (say, _) in enumerate(items):
        fp = cache / f"{sc['id']}_{i:02d}.wav"
        if fp.exists(): sr, w = wf.read(fp); w = w.astype("float32")
        else:
            w, sr = synth(say); wf.write(fp, sr, w.astype("float32"))
        w = sg.resample_poly(w, SR, sr).astype("float32") if sr != SR else w
        w = trim(w); w = tempo(w, TEMPO); w = w / (np.abs(w).max() + 1e-9) * 0.7
        n = int(0.015 * SR); w[:n] *= np.linspace(0, 1, n); w[-n:] *= np.linspace(1, 0, n)
        clips.append(w)
    return clips


MIN = [0, 8, 3, 10]  # i-VI-III-VII (minor): ildiz ustidan yarim tonlar
CH = {0: (0, 3, 7), 8: (0, 4, 7), 3: (0, 4, 7), 10: (0, 4, 7)}


def mtof(m): return 440 * 2 ** ((m - 69) / 12)


def synth_music(style, bpm, key, dur):
    n = int(dur * SR); t = np.arange(n) / SR; L = np.zeros(n, "float32"); R = np.zeros(n, "float32")
    beat = 60 / bpm; bar = 4 * beat; rnd = np.random.default_rng(3)
    nb = int(dur / bar) + 2
    for b in range(nb):
        root = key + MIN[(b // 2) % 4]; t0 = b * bar; s0 = int(t0 * SR); s1 = min(n, int((t0 + bar + 0.6) * SR))
        if s0 >= n: break
        tt = np.arange(s1 - s0) / SR; env = np.clip(tt / 0.9, 0, 1) * np.clip((bar + 0.6 - tt) / 0.8, 0, 1)
        notes = [root - 12 + i for i in CH[MIN[(b // 2) % 4]]] + [root + i + 12 for i in CH[MIN[(b // 2) % 4]]]
        for k, m in enumerate(notes):
            f = mtof(m)
            for det, pan in ((1.0, 0.35), (1.0, 0.65)):
                sig = (np.sin(2 * np.pi * f * det * tt) + 0.4 * np.sin(4 * np.pi * f * det * tt) + 0.15 * np.sin(6 * np.pi * f * det * tt)) * env * (0.045 if style != "ambient" else 0.06)
                L[s0:s1] += (sig * (1 - pan)).astype("float32"); R[s0:s1] += (sig * pan).astype("float32")
        bs = np.sin(2 * np.pi * mtof(root - 24) * tt) * env * 0.16  # bas
        L[s0:s1] += bs.astype("float32"); R[s0:s1] += bs.astype("float32")
        if style in ("tech", "progressive", "clean", "lofi"):
            step = beat / 2; arp = [root + i for i in (0, 7, 12, 15, 12, 7, 19, 12)] if style != "lofi" else [root + 12 + i for i in (0, 7, 3, 10)]
            div = 8 if style != "lofi" else 4
            for j in range(div):
                ts = t0 + j * (bar / div)
                if ts >= dur: break
                m = arp[j % len(arp)] + 12; f = mtof(m); ln = int(0.35 * SR); a = int(ts * SR); e = min(n, a + ln)
                tp = np.arange(e - a) / SR; sig = (np.sin(2 * np.pi * f * tp) + 0.3 * np.sin(4 * np.pi * f * tp)) * np.exp(-tp * 9) * (0.07 if style != "lofi" else 0.09)
                pan = 0.3 + 0.4 * ((j % 4) / 3)
                L[a:e] += (sig * (1 - pan)).astype("float32"); R[a:e] += (sig * pan).astype("float32")
                d2 = int(beat * 0.75 * SR)  # aks-sado
                if e + d2 < n: L[a + d2:e + d2] += (sig * 0.3 * pan).astype("float32"); R[a + d2:e + d2] += (sig * 0.3 * (1 - pan)).astype("float32")
        if style in ("tech", "progressive", "clean"):  # yumshoq kik
            for j in range(4):
                ts = t0 + j * beat
                if ts >= dur: break
                a = int(ts * SR); e = min(n, a + int(0.25 * SR)); tp = np.arange(e - a) / SR
                k_ = np.sin(2 * np.pi * (45 + 80 * np.exp(-tp * 30)) * tp) * np.exp(-tp * 12) * (0.18 if style != "clean" else 0.1)
                L[a:e] += k_.astype("float32"); R[a:e] += k_.astype("float32")
        if style in ("lofi", "progressive", "tech"):  # hi-hat
            for j in range(8):
                ts = t0 + (j + 0.5) * beat / 2 if style == "lofi" else t0 + j * beat / 2 + beat / 4
                if ts >= dur or (style == "lofi" and j % 2): continue
                a = int(ts * SR); e = min(n, a + int(0.05 * SR)); tp = np.arange(e - a) / SR
                nz = rnd.standard_normal(e - a) * np.exp(-tp * 90) * 0.03
                nz = sg.lfilter(*sg.butter(2, 6000 / (SR / 2), "high"), nz)
                L[a:e] += nz.astype("float32"); R[a:e] += nz.astype("float32")
    if style == "lofi":
        nz = rnd.standard_normal(n).astype("float32") * 0.004; L += nz; R += nz
    st = np.stack([L, R], 1)
    b, a = sg.butter(2, 7500 / (SR / 2)); st = sg.lfilter(b, a, st, axis=0)
    st /= (np.sqrt((st ** 2).mean()) + 1e-9)
    return st.astype("float32")


def build_audio(sc, cache):
    clips = voice_track(sc, cache); lead, gap, tail = 0.5, 0.28, 1.5
    starts, t = [], lead
    for i, c in enumerate(clips):
        if i == len(clips) - 1: t += 0.25
        starts.append(t); t += len(c) / SR + (gap if i < len(clips) - 2 else 0.3)
    total = starts[-1] + len(clips[-1]) / SR + tail
    vox = np.zeros(int(total * SR) + SR, "float32")
    for s, c in zip(starts, clips): vox[int(s * SR): int(s * SR) + len(c)] += c
    music = synth_music(sc["style"], sc["bpm"], sc["key"], total + 1)
    # ducking: ovoz envelope
    env = sg.lfilter(*sg.butter(1, 6 / (SR / 2)), np.abs(vox)); env = np.clip(env / (0.12), 0, 1)
    duck = sg.lfilter(*sg.butter(1, 3 / (SR / 2)), env)  # silliq
    duck = np.clip(duck * 1.6, 0, 1)
    vrms = np.sqrt((vox[np.abs(vox) > 0.02] ** 2).mean())
    open_g = vrms * 10 ** (-9 / 20); duck_g = vrms * 10 ** (-21 / 20)
    gain = open_g + (duck_g - open_g) * duck
    ramp = np.clip((np.arange(len(vox)) / SR - (starts[-1] - 0.5)) / 1.0, 0, 1)  # CTA da biroz kuchayadi
    gain = gain * (1 + 0.5 * ramp)
    fade = np.clip((total - np.arange(len(vox)) / SR) / 1.2, 0, 1)
    mus = music[: len(vox)] * (gain * fade)[:, None]
    mix = np.stack([vox, vox], 1) * 1.0 + mus
    mix = mix[: int(total * SR)]
    import pyloudnorm as pln
    m = pln.Meter(SR); loud = m.integrated_loudness(mix); mix = mix * 10 ** ((-14 - loud) / 20)
    pk = np.abs(mix).max()
    if pk > 0.85: mix = np.tanh(mix / pk * 0.9 * 1.0) / np.tanh(0.9) * 0.85 if False else mix  # limiter pastda (ffmpeg)
    return mix.astype("float32"), starts, [len(c) / SR for c in clips], total


# ---------------------------------------------------------------- kadr
class Timeline:
    pass


def build_tl(sc, starts, durs, total):
    tl = Timeline(); tl.segs = []; n = len(sc["segs"])
    for i, g in enumerate(sc["segs"]):
        s0, d = starts[i], durs[i]; chunks = sub_chunks(g["sub"], g["hl"]); w = [sum(len(w) for ln in ch for w, _ in ln) + 1 for ch in chunks]
        cum, ct = 0, []
        for ch, ww in zip(chunks, w): ct.append((s0 + d * cum / sum(w), s0 + d * (cum + ww) / sum(w), ch)); cum += ww
        vis0 = 0.0 if i == 0 else s0 - 0.12
        tl.segs.append(dict(scene=g["scene"], vis0=vis0, s0=s0, d=d, chunks=ct, hcol=[CYAN, YELLOW][i % 2]))
    cta_s = starts[-1]
    tl.segs.append(dict(scene=dict(t="cta", text=norm(sc["cta"])), vis0=cta_s - 0.15, s0=cta_s, d=durs[-1], chunks=[], hcol=CYAN))
    for i, s in enumerate(tl.segs): s["vis1"] = tl.segs[i + 1]["vis0"] if i + 1 < len(tl.segs) else total
    tl.total = total; return tl


TL_ = None


def render_frame(fi):
    t = fi / FPS; tl = TL_
    cv = background(t, tl.total)
    seg = next((s for s in tl.segs if s["vis0"] <= t < s["vis1"]), tl.segs[-1])
    lt = max(0.0, t - seg["vis0"])
    sc = seg["scene"]
    # chiqishda yumshoq yo'qolish
    fo = clamp((seg["vis1"] - t) / 0.18) if seg is not tl.segs[-1] else 1.0
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    SCENES[sc["t"]](layer, lt, sc, tl.total)
    cv.paste(layer if fo >= 0.999 else alpha_img(layer, 0.25 + 0.75 * fo), (0, 0), layer if fo >= 0.999 else alpha_img(layer, 0.25 + 0.75 * fo))
    # sarlavha chipi
    put_c(cv, text_layer(scenarios.BRAND.upper(), 28, MUTED, bold=True), W / 2, 150, 0.9)
    ImageDraw.Draw(cv).ellipse((W / 2 - 250, 143, W / 2 - 238, 155), fill=CYAN)
    # subtitr
    for (a, b, ch) in seg["chunks"]:
        if a - 0.02 <= t < b + (0.12 if ch is seg["chunks"][-1][2] else 0):
            p = ease(prog(t, a, 0.22)); lay = sub_layer(ch, seg["hcol"])
            put(cv, lay, (W - lay.width) / 2, 1560 - lay.height + (1 - p) * 22, p)
    # progress
    ImageDraw.Draw(cv).rectangle((0, H - 10, int(W * t / tl.total), H), fill=CYAN)
    return cv.convert("RGB")


def render_bytes(fi): return render_frame(fi).tobytes()


def main():
    global TL_
    ap = argparse.ArgumentParser(); ap.add_argument("which"); ap.add_argument("--final", action="store_true"); ap.add_argument("--shots", action="store_true")
    a = ap.parse_args()
    sc = scenarios.S[int(a.which) - 1] if a.which.isdigit() else next(s for s in scenarios.S if s["id"].startswith(a.which))
    out = PROJ / "out"; out.mkdir(exist_ok=True); cache = PROJ / "voice"; cache.mkdir(exist_ok=True)
    init_assets()
    mix, starts, durs, total = build_audio(sc, cache)
    wav = out / f"{sc['id']}_audio.wav"; wf.write(wav, SR, mix)
    TL_ = build_tl(sc, starts, durs, total)
    nf = int(total * FPS)
    mp4 = out / f"{sc['id']}_{'final' if a.final else 'draft'}.mp4"
    vf = ["-vf", "scale=540:960:flags=lanczos"] if not a.final else []
    enc = ["-c:v", "libx264", "-preset", "slow", "-crf", "17"] if a.final else ["-c:v", "libx264", "-preset", "veryfast", "-crf", "24"]
    af = "alimiter=limit=0.89:level=disabled:attack=3:release=60"
    cmd = ["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", str(wav)] + vf + enc + \
          ["-profile:v", "high", "-pix_fmt", "yuv420p", "-af", af, "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", "-shortest", str(mp4)]
    if a.shots:
        for lbl, tt in (("start", 0.9), ("mid", total * 0.5), ("end", total - 0.4)):
            render_frame(int(tt * FPS)).save(out / f"{sc['id']}_{lbl}.png")
        for i, s in enumerate(TL_.segs): render_frame(int((s["s0"] + min(1.2, s["d"] * 0.6)) * FPS)).resize((360, 640)).save(out / f"{sc['id']}_seg{i}.png")
    import multiprocessing as mpx
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with mpx.get_context("fork").Pool(4) as pool:
        for b in pool.imap(render_bytes, range(nf), chunksize=4): pr.stdin.write(b)
    pr.stdin.close(); pr.wait()
    print("OK", mp4, f"{total:.1f}s", "voice segs:", [round(d, 1) for d in durs])


if __name__ == "__main__":
    main()
