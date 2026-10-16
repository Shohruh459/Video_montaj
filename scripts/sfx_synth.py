#!/usr/bin/env python3
"""Dasturiy SFX sintezi (litsenziya muammosisiz, numpy). build_mushuk.py va boshqalar ishlatadi.
kinds: tick type thud chime whoosh boing pop sparkle ding squeak heart ring confetti"""
import numpy as np
SR = 48000
def _t(n): return np.arange(n) / SR
def _env(n, a=0.005, d=0.2): t = _t(n); return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)
def _rng(): return np.random.default_rng(7)

def tick():
    n = int(SR * .09); return 0.6 * np.sin(2 * np.pi * 1900 * _t(n)) * _env(n, .001, .018)
def type_():
    n = int(SR * .03); return 0.5 * _rng().standard_normal(n) * _env(n, .0005, .006)
def thud():
    n = int(SR * .55); t = _t(n); fr = 48 + 90 * np.exp(-t / .08)
    return 0.95 * np.sin(2 * np.pi * np.cumsum(fr) / SR) * _env(n, .002, .18) + 0.35 * _rng().standard_normal(n) * _env(n, .0005, .02)
def chime():
    n = int(SR * 1.1); t = _t(n); return 0.35 * (np.sin(2 * np.pi * 988 * t) + 0.6 * np.sin(2 * np.pi * 1480 * t)) * _env(n, .003, .35)
def whoosh():
    n = int(SR * 1.0); t = _t(n); x = _rng().standard_normal(n); y = np.zeros(n)
    for i in range(n):
        a = 0.02 + 0.55 * (i / n) ** 1.5; y[i] = (y[i - 1] if i else 0) + a * (x[i] - (y[i - 1] if i else 0))
    return 0.9 * y * np.sin(np.pi * np.minimum(t, 1)) ** 2 / (np.abs(y).max() + 1e-9)
def boing():
    n = int(SR * .6); t = _t(n); f0 = 170 + 420 * np.exp(-t / .16) * (1 + 0.45 * np.sin(2 * np.pi * 14 * t))
    ph = 2 * np.pi * np.cumsum(f0) / SR; return 0.7 * (np.sin(ph) + 0.35 * np.sin(2 * ph)) * _env(n, .004, .22)
def pop():
    n = int(SR * .16); t = _t(n); f = 1100 * np.exp(-t / .025) + 180
    return 0.9 * np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(n, .001, .04) + 0.25 * _rng().standard_normal(n) * _env(n, .0004, .004)
def sparkle():
    n = int(SR * .9); out = np.zeros(n)
    for k, fr in enumerate([1568, 2093, 2637, 3136, 3951, 3136]):
        i0 = int(k * 0.06 * SR); m = int(SR * .35); t = _t(m)
        w = 0.35 * (np.sin(2 * np.pi * fr * t) + 0.3 * np.sin(4 * np.pi * fr * t)) * _env(m, .002, .09); out[i0:i0 + m] += w[: n - i0]
    return out
def ding():
    n = int(SR * 1.2); t = _t(n)
    return 0.4 * (np.sin(2 * np.pi * 1320 * t) + 0.4 * np.sin(2 * np.pi * 2640 * t) + 0.2 * np.sin(2 * np.pi * 3960 * t)) * _env(n, .002, .4)
def squeak():
    n = int(SR * .22); t = _t(n); f = 1100 + 1300 * np.sin(np.pi * np.minimum(t / .2, 1)) ** 0.7 + 60 * np.sin(2 * np.pi * 28 * t)
    return 0.55 * np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(n, .004, .12)
def heart():
    n = int(SR * .35); out = np.zeros(n); a, b = pop(), pop()
    out[: len(a)] += 0.8 * a * 0.7; i1 = int(.09 * SR); out[i1:i1 + len(b)] += 0.7 * np.interp(np.arange(len(b)) * 0.7, np.arange(len(b)), b)[: n - i1]
    return out[:n]
def ring():
    n = int(SR * 1.7); t = _t(n); out = np.zeros(n)
    for s0 in (0.0, 0.55):   # ikki "brr-brr" portlashi
        i0 = int(s0 * SR); m = int(SR * .42); tt = _t(m)
        gate = (np.sin(2 * np.pi * 22 * tt) > -0.2).astype(float)
        w = 0.5 * (np.sin(2 * np.pi * 1350 * tt) + 0.5 * np.sin(2 * np.pi * 1720 * tt)) * gate * np.minimum(tt / .01, 1) * np.minimum((.42 - tt) / .02, 1)
        out[i0:i0 + m] += w
    return out
def confetti():
    n = int(SR * .5); x = _rng().standard_normal(n); y = x - np.convolve(x, np.ones(6) / 6, mode='same')
    clicks = (_rng().random(n) > 0.9985) * _rng().standard_normal(n) * 3
    return 0.45 * (y + clicks) * np.exp(-_t(n) / .14)

def scratch():  # plastinka "ziiip" — AI adashdi
    n = int(SR * .42); t = _t(n); f = 1800 * np.exp(-t / .12) + 120
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return 0.7 * (saw * 0.7 + 0.5 * _rng().standard_normal(n) * np.exp(-t / .1)) * np.minimum(t / .004, 1) * np.exp(-t / .22)
def rewind():  # lenta orqaga: ko'tariluvchi "viiiiu" + flutter
    n = int(SR * 1.4); t = _t(n); f = 250 + 2600 * (t / 1.4) ** 1.6 + 40 * np.sin(2 * np.pi * 17 * t)
    sq = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)); noise = _rng().standard_normal(n)
    return 0.45 * (0.55 * sq + 0.45 * noise * (0.4 + 0.6 * (t / 1.4))) * np.minimum(t / .03, 1) * np.minimum((1.4 - t) / .06, 1)
def glitch():  # raqamli "bzzt" bo'laklari
    n = int(SR * .3); out = np.zeros(n); r = _rng()
    for k in range(6):
        i0 = int(k * .045 * SR); m = int(SR * (.02 + .02 * r.random())); tt = _t(m)
        out[i0:i0 + m] += (np.sign(np.sin(2 * np.pi * (300 + 1500 * r.random()) * tt)) * 0.5 + 0.3 * r.standard_normal(m)) * np.minimum((m - np.arange(m)) / (SR * .004), 1)
    return 0.55 * out
def riser():  # hook oldidan ko'tarilish
    n = int(SR * 1.0); t = _t(n); x = _rng().standard_normal(n); y = np.zeros(n); a = 0.03 + 0.6 * (t / 1.0) ** 2
    for i in range(1, n): y[i] = y[i - 1] + a[i] * (x[i] - y[i - 1])
    return 0.9 * y / (np.abs(y).max() + 1e-9) * (t / 1.0) ** 1.4
def stamp():  # muhr: past zarb + qisqa tak
    n = int(SR * .5); t = _t(n); return 0.9 * np.sin(2 * np.pi * np.cumsum(70 + 120 * np.exp(-t / .05)) / SR) * _env(n, .001, .14) + 0.4 * _rng().standard_normal(n) * _env(n, .0005, .012)
KINDS = {"scratch": scratch, "rewind": rewind, "glitch": glitch, "riser": riser, "stamp": stamp, "tick": tick, "type": type_, "thud": thud, "chime": chime, "whoosh": whoosh, "boing": boing, "pop": pop, "sparkle": sparkle, "ding": ding, "squeak": squeak, "heart": heart, "ring": ring, "confetti": confetti}
GAIN = {"scratch": .8, "rewind": .5, "glitch": .6, "riser": .6, "stamp": .55, "tick": .45, "type": .25, "thud": .9, "chime": .5, "whoosh": .6, "boing": .8, "pop": .75, "sparkle": .55, "ding": .6, "squeak": .6, "heart": .6, "ring": .8, "confetti": .5}
def wave(kind, db=0.0): return KINDS[kind]() * GAIN[kind] * 10 ** (db / 20)
def track(events, total_sec, peak=0.5):
    n = int(SR * total_sec); tr = np.zeros(n)
    for e in events:
        w = wave(e["k"], e.get("db", 0)); i0 = int(e["t"] * SR)
        if 0 <= i0 < n: tr[i0:i0 + len(w)] += w[: n - i0]
    return tr * peak / (np.abs(tr).max() + 1e-9)
