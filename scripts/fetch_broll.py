#!/usr/bin/env python3
"""Pixabay'dan B-roll (video/rasm) qidirish va yuklash. Kalit: PIXABAY_API_KEY (muhitdan; chiqarilmaydi).

Qidirish (yuklamaydi):
  python scripts/fetch_broll.py search "electric car" --type video --per-page 10
Yuklash (tanlangan id lar):
  python scripts/fetch_broll.py get 12345 67890 --type video --out projects/byd-2026-10-10/broll --quality large

Har bir yuklangan fayl --out/../CREDITS.md ga yoziladi (manba, muallif, litsenziya)."""
import argparse, json, os, pathlib, sys, urllib.parse, urllib.request, datetime

API = {"video": "https://pixabay.com/api/videos/", "image": "https://pixabay.com/api/"}
LICENSE = "Pixabay Content License (https://pixabay.com/service/license-summary/)"
QUALITIES = ["large", "medium", "small", "tiny"]


def key():
    k = os.environ.get("PIXABAY_API_KEY")
    if not k:
        sys.exit("XATO: PIXABAY_API_KEY muhitda yo'q (qiymatini chatga yozmang; environment sozlamalariga qo'shing).")
    return k


def call(kind, **params):
    q = urllib.parse.urlencode({"key": key(), **params})
    with urllib.request.urlopen(f"{API[kind]}?{q}", timeout=30) as r:
        return json.load(r)


def pick_url(hit, kind, quality):
    """Tanlangan sifatdan boshlab pastga qarab birinchi bo'sh bo'lmagan URL ni qaytaradi."""
    if kind == "image":
        return hit.get("largeImageURL") or hit.get("webformatURL"), None
    order = QUALITIES[QUALITIES.index(quality):] + QUALITIES[:QUALITIES.index(quality)][::-1]
    for q in order:
        v = hit.get("videos", {}).get(q) or {}
        if v.get("url"):
            return v["url"], q
    return None, None


def cmd_search(a):
    d = call(a.type, q=a.query, per_page=a.per_page, safesearch="true",
             **({"orientation": a.orientation} if a.type == "image" and a.orientation else {}))
    print(f"jami: {d.get('totalHits')}")
    for h in d.get("hits", []):
        dur = f" {h['duration']}s" if "duration" in h else ""
        v = (h.get("videos", {}).get("large") or h.get("videos", {}).get("medium") or {}) if a.type == "video" else {}
        size = f" {v.get('width')}x{v.get('height')}" if v else ""
        print(f"{h['id']}{dur}{size} | {h.get('tags')} | {h.get('user')} | {h.get('pageURL')}")


def cmd_get(a):
    out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
    credits = out.parent / "CREDITS.md"
    for i in a.ids:
        d = call(a.type, id=i)
        hits = d.get("hits", [])
        if not hits:
            print(f"{i}: topilmadi"); continue
        h = hits[0]
        url, q = pick_url(h, a.type, a.quality)
        if not url:
            print(f"{i}: yuklash havolasi yo'q"); continue
        ext = pathlib.Path(urllib.parse.urlparse(url).path).suffix or (".mp4" if a.type == "video" else ".jpg")
        dest = out / f"pixabay_{a.type}_{i}{ext}"
        req = urllib.request.Request(url, headers={"User-Agent": "video-montaj/1.0"})
        with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
            f.write(r.read())
        with open(credits, "a", encoding="utf-8") as f:
            if credits.stat().st_size == 0:
                f.write("# CREDITS\n\n")
            f.write(f"- {dest.name} — Pixabay #{i}, muallif: {h.get('user')}, {h.get('pageURL')}, "
                    f"litsenziya: {LICENSE}, yuklandi: {datetime.date.today()}\n")
        print(f"{i}: OK -> {dest} ({dest.stat().st_size/1e6:.1f} MB{', ' + q if q else ''})")


p = argparse.ArgumentParser()
sub = p.add_subparsers(required=True)
s = sub.add_parser("search"); s.add_argument("query"); s.add_argument("--type", choices=API, default="video")
s.add_argument("--per-page", type=int, default=10); s.add_argument("--orientation", choices=["horizontal", "vertical"])
s.set_defaults(fn=cmd_search)
g = sub.add_parser("get"); g.add_argument("ids", nargs="+"); g.add_argument("--type", choices=API, default="video")
g.add_argument("--out", required=True); g.add_argument("--quality", choices=QUALITIES, default="large")
g.set_defaults(fn=cmd_get)
a = p.parse_args(); a.fn(a)
