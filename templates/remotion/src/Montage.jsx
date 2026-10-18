import React, {createContext, useContext, useEffect, useState} from 'react';
import {AbsoluteFill, Sequence, OffthreadVideo, Img, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, Easing, delayRender, continueRender} from 'remotion';
// Ixtiyoriy shriftlar (OFL, npm: @fontsource): scenes.json da "fontBody"/"fontDisplay" bilan yoqiladi. Standart — Noto Sans.
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/playfair-display/800.css';

const STACK = '"Noto Sans", "DejaVu Sans", Arial, sans-serif';
const FONT = `var(--fb, ${STACK})`;     // asosiy matn (subtitr, yozuvlar)
const DISPLAY = `var(--fd, ${STACK})`;  // sarlavha shrifti (karta, markaz nomi)
// Shrift to'liq yuklanmaguncha kadr olinmasin (aks holda birinchi kadrlar zaxira shriftda chiqadi)
const FontGate = ({families}) => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(families.flatMap((f) => [700, 800].map((w) => document.fonts.load(`${w} 48px "${f}"`, 'Oʻʼo0Aa1')))).then(() => continueRender(h), () => continueRender(h));
  }, []);
  return null;
};
const DEFAULT_ACCENT = '#35d6c0';
const AccentCtx = createContext(DEFAULT_ACCENT);
const X_DEFAULT = 12; // crossfade, kadr (0.4 s); Montage'da xfadeFrames prop bilan o'zgartiriladi

const useIn = (delay = 0, damping = 18) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping, stiffness: 110}});
};

const FadeEdges = ({children, dur, x}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, x, dur - x, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const Clip = ({src, from, dur, cx = 0.5, dim = 0, filt, zoom = 0.08, zoomOut = false}) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, dur], zoomOut ? [1 + zoom, 1.0] : [1.0, 1 + zoom], {easing: Easing.inOut(Easing.quad)});
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <OffthreadVideo src={staticFile(src)} muted startFrom={Math.round(from * 30)}
        style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${cx * 100}% 50%`,
          transform: `scale(${scale})`, transformOrigin: `${cx * 100}% 50%`, filter: filt || undefined}} />
      <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 55%, rgba(0,0,0,.65) 100%)'}} />
    </AbsoluteFill>
  );
};

const Title = ({text, sub, top = false}) => {
  const ACCENT = useContext(AccentCtx);
  const p = useIn(6, 16);
  const line = useIn(14, 22);
  const sp = interpolate(p, [0, 1], [40, 6]);
  return (
    <AbsoluteFill style={{justifyContent: top ? 'flex-start' : 'center', alignItems: 'center', paddingTop: top ? 240 : 0}}>
      <div style={{fontFamily: FONT, fontWeight: 800, whiteSpace: 'pre-line', lineHeight: 1.15, fontSize: Math.min(96, Math.floor((860 / Math.max(...text.split('\n').map((l) => l.length)) - 6) / 0.85)), color: '#fff', textAlign: 'center',
        letterSpacing: sp, opacity: p, transform: `translateY(${(1 - p) * 30}px)`,
        textShadow: '0 6px 30px rgba(0,0,0,.6)'}}>{text}</div>
      <div style={{height: 6, width: 420 * line, background: ACCENT, marginTop: 28, borderRadius: 3}} />
      {sub ? <div style={{fontFamily: FONT, fontSize: 40, color: '#fff', marginTop: 28, opacity: line,
        textShadow: '0 3px 14px rgba(0,0,0,.6)'}}>{sub}</div> : null}
    </AbsoluteFill>
  );
};

// Pastki "lower-third": xavfsiz zona — pastdan ≥ 10% (192 px)
const Lower = ({text}) => {
  const ACCENT = useContext(AccentCtx);
  const p = useIn(8);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 460}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: p, transform: `translateY(${(1 - p) * 60}px)`}}>
        <div style={{width: 10 * p, height: 84, background: ACCENT, borderRadius: 5}} />
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 64, color: '#fff',
          textShadow: '0 4px 20px rgba(0,0,0,.7)'}}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

const Cta = ({text}) => {
  const ACCENT = useContext(AccentCtx);
  const p = useIn(22, 14);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 460}}>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: Math.min(48, Math.floor(880 / (text.length * 0.66))), color: '#06231f', background: ACCENT, whiteSpace: 'nowrap',
        padding: '26px 54px', borderRadius: 60, opacity: p, transform: `scale(${0.8 + 0.2 * p})`,
        boxShadow: '0 10px 40px rgba(0,0,0,.45)'}}>{text}</div>
    </AbsoluteFill>
  );
};


// Subtitr: pastdan `bottom` px yuqorida (Reels'da pastki ~20% Instagram interfeysi bilan yopiladi), ≤ 2 qator.
// karaoke=true: so'zlar ovoz bilan birga ketma-ket ajratib ko'rsatiladi (so'z vaqti harf soniga mutanosib — taxminiy).
// mode 'color': joriy so'z accent rangida; 'fade': aytilmagan so'zlar xira, aytilganlari to'liq (motivatsion uslub).
// Matnda *so'z* — muhim so'z: accent rangi va kattaroq. box=false: fonsiz, kuchli soya bilan.
const Subtitles = ({subs, bottom = 200, size = 38, karaoke = false, mode = 'color', box = true}) => {
  const ACCENT = useContext(AccentCtx);
  const f = useCurrentFrame();
  const t = f / 30;
  const cur = subs.find((s) => t >= s.from && t <= s.to);
  if (!cur) return null;
  const k = Math.max(0, Math.min(1, (t - cur.from) / 0.12, (cur.to - t) / 0.12));
  const lines = cur.text.split('\n');
  const words = lines.flatMap((l, li) => l.split(' ').map((raw, wi, arr) => {
    const m = raw.match(/^\*(.+?)\*([^\w*]*)$/u);
    return {w: m ? m[1] + m[2] : raw.replace(/\*/g, ''), emph: !!m, br: wi === arr.length - 1 && li < lines.length - 1};
  }));
  const total = words.reduce((a, x) => a + x.w.length + 1, 0);
  const t0 = cur.from + 0.05, t1 = cur.to - 0.2;
  let acc = 0;
  const timed = words.map((x) => { const a0 = t0 + (t1 - t0) * (acc / total); acc += x.w.length + 1; return {...x, a0, a1: t0 + (t1 - t0) * (acc / total)}; });
  const boxStyle = box ? {background: 'rgba(0,0,0,.55)', padding: '14px 28px', borderRadius: 22}
    : {textShadow: '0 4px 28px rgba(0,0,0,.9), 0 0 8px rgba(0,0,0,.75), 0 2px 2px rgba(0,0,0,.8)', padding: '0 20px'};
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: bottom}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.25, color: '#fff', textAlign: 'center',
        maxWidth: 960, opacity: k, transform: `translateY(${(1 - k) * 14}px)`, ...boxStyle}}>
        {karaoke ? timed.map((x, i) => {
          const on = t >= x.a0 && t < x.a1, done = t >= x.a1;
          const spoken = done || on;
          const color = x.emph ? ACCENT : (mode === 'color' && on ? ACCENT : '#fff');
          const opacity = mode === 'fade' ? (spoken ? 1 : 0.28) : (spoken ? 1 : 0.55);
          return (<React.Fragment key={i}>
            <span style={{display: 'inline-block', color, opacity, fontSize: x.emph ? '1.22em' : undefined}}>{x.w}</span>{x.br ? <br /> : ' '}
          </React.Fragment>);
        }) : <span style={{whiteSpace: 'pre-line'}}>{cur.text.replace(/\*/g, '')}</span>}
      </div>
    </AbsoluteFill>
  );
};

// Doimiy joylashuv/belgi chipi (tepada)
const Badge = ({text, top = 170}) => {
  const ACCENT = useContext(AccentCtx);
  const p = useIn(4, 18);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: top}}>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, color: '#fff', background: 'rgba(0,0,0,.5)', padding: '10px 28px',
        borderRadius: 40, borderLeft: `10px solid ${ACCENT}`, opacity: p, transform: `translateY(${(1 - p) * -20}px)`}}>{text}</div>
    </AbsoluteFill>
  );
};


// ───────────── Grafik sahnalar (stok kadrsiz): fon, karta, telefon, ekran, yo'l xaritasi, oxirgi karta ─────────────
// Barcha animatsiyalar `cues` (ovoz qatorlarining sahna boshiga nisbatan vaqti, make_video.py beradi) ga bog'lanadi.
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const rnd = (n) => { const x = Math.sin(n * 127.1 + 11.7) * 43758.5453; return x - Math.floor(x); };
const fmtNum = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const useT = () => useCurrentFrame() / 30;

// Doimiy fon (sahnalar o'zgarganda ham uzluksiz): to'q gradient + sekin siljuvchi olti burchakli to'r
const Bg = () => {
  const f = useCurrentFrame();
  const ACCENT = useContext(AccentCtx);
  const dx = (f * 0.35) % 104, dy = (f * 0.2) % 180;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(120% 75% at 50% 15%, #1e2750 0%, #0d1226 58%, #070a17 100%)'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', opacity: 0.17}}>
        <defs>
          <pattern id="hexgrid" width="104" height="180" patternUnits="userSpaceOnUse" patternTransform={`translate(${dx} ${dy})`}>
            <path d="M52 0 L104 30 L104 90 L52 120 L0 90 L0 30 Z M52 120 L52 180" fill="none" stroke="#9fb0ff" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#hexgrid)" />
      </svg>
      <AbsoluteFill style={{background: `radial-gradient(70% 28% at 50% 100%, ${ACCENT}33 0%, rgba(0,0,0,0) 100%)`}} />
    </AbsoluteFill>
  );
};

const CardScene = ({s}) => {
  const ACCENT = useContext(AccentCtx);
  const t = useT();
  const cues = s.cues || [];
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 180}}>
      {(s.lines || []).map((ln, i) => {
        const at = (cues[i] ? cues[i].from : 0.2 + i * 1.1) - 0.05;
        const p = ease((t - at) / 0.45);
        return (
          <div key={i} style={{fontFamily: DISPLAY, fontWeight: 800, whiteSpace: 'pre-line', textAlign: 'center', lineHeight: 1.1,
            fontSize: ln.size || (ln.accent ? 150 : 118), color: ln.accent ? ACCENT : '#fff', opacity: p,
            transform: `translateY(${(1 - p) * 40}px) scale(${0.94 + 0.06 * p})`, marginTop: i ? 34 : 0,
            textShadow: '0 8px 36px rgba(0,0,0,.55)'}}>{ln.text}</div>
        );
      })}
    </AbsoluteFill>
  );
};

const PHONE_W = 540, PHONE_H = 930, PHONE_TOP = 230;
const Phone = ({enter = 1, children}) => (
  <div style={{position: 'absolute', left: (1080 - PHONE_W) / 2, top: PHONE_TOP + (1 - enter) * 90, width: PHONE_W, height: PHONE_H, opacity: enter,
    borderRadius: 74, background: '#0a0a0f', padding: 16, boxSizing: 'border-box',
    boxShadow: '0 34px 90px rgba(0,0,0,.65), 0 0 0 3px #2b2f45, inset 0 0 0 2px #3a3f5c'}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 58, overflow: 'hidden', background: '#f3f4f8'}}>
      {children}
      <div style={{position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 130, height: 34, borderRadius: 20, background: '#0a0a0f'}} />
    </div>
  </div>
);

const Tag = ({text}) => {
  const ACCENT = useContext(AccentCtx);
  return (<div style={{position: 'absolute', left: 22, top: 66, fontFamily: FONT, fontWeight: 800, fontSize: 21, letterSpacing: 1, color: '#2a1d00',
    background: ACCENT, padding: '6px 16px', borderRadius: 16}}>{text}</div>);
};

// Telefon ramkasida hh.uz vakansiyasi. s.image (broll/ ichida skrinshot) bo'lsa — o'sha; bo'lmasa belgilangan joy (placeholder).
// s.amount (son) bo'lsa — oylik raqami sanab chiqadi; s.hl {top,height} — "Tajriba" qatori (telefon ekrani pikselida) belgilanadi.
const PhoneScene = ({s}) => {
  const ACCENT = useContext(AccentCtx);
  const t = useT();
  const cues = s.cues || [];
  const c1 = cues[1] || {from: 2.2, to: 4};
  const tHl = c1.from + 0.45 * (c1.to - c1.from);
  const hl = ease((t - tHl) / 0.4);
  const cnt = ease((t - 0.35) / 1.5);
  const enter = ease(t / 0.5);
  const hasAmount = typeof s.amount === 'number';
  const roll = (() => { // raqam o'rnidagi aylanuvchi raqamlar (placeholder)
    if (t > 1.9) return 'X XXX XXX';
    const f = Math.floor(t * 18);
    return [0, 1, 2, 3, 4, 5, 6].map((k) => Math.floor(rnd(f * 7 + k) * 10)).join('').replace(/^(\d)(\d{3})(\d{3})$/, '$1 $2 $3');
  })();
  const isRange = hasAmount && typeof s.amountTo === 'number';
  const amountText = hasAmount ? (isRange ? `${fmtNum(s.amount * cnt)} – ${fmtNum(s.amountTo * cnt)}` : fmtNum(s.amount * cnt)) : roll;
  const chip = (
    <div style={{fontFamily: FONT, fontWeight: 800, color: '#14182e'}}>
      <div style={{fontSize: 22, color: '#6b7090', fontWeight: 700, letterSpacing: 1}}>{s.amountLabel || 'OYLIK'}</div>
      <div style={{fontSize: isRange ? 34 : 62, lineHeight: 1.1, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', opacity: (!hasAmount && t <= 1.9) ? 0.45 : 1}}>{amountText}<span style={{fontSize: isRange ? 30 : 30, marginLeft: 10, color: '#6b7090'}}>{s.currency || 'soʻm'}</span></div>
    </div>
  );
  return (
    <>
      <Phone enter={enter}>
        {s.image ? (
          <>
            <Img src={staticFile(s.image)} style={{width: '100%', display: 'block', transform: `translateY(${-(s.scroll || 0) * ease((t - 0.4) / 2.2)}px)`}} />
            {hasAmount ? (<div style={{position: 'absolute', left: 24, right: 24, bottom: 36, background: 'rgba(255,255,255,.94)', padding: '16px 22px', borderRadius: 26,
              boxShadow: '0 10px 40px rgba(0,0,0,.25)'}}>{chip}</div>) : null}
            {(s.hls || (s.hl ? [{...s.hl, at: 1}] : [])).map((h, k) => {
              const c = cues[h.at ?? 1] || {from: 1, to: 3};
              const tt = c.from + (h.at === 0 ? 0.6 : 0.45) * (c.to - c.from);
              const q = ease((t - tt) / 0.35);
              return (<div key={k} style={{position: 'absolute', left: h.left ?? 10, top: h.top, width: h.width, right: h.width ? undefined : 10, height: h.height, borderRadius: 14,
                background: `${ACCENT}${q > 0.02 ? '55' : '00'}`, border: `4px solid ${ACCENT}`, opacity: q, transform: `scale(${1.08 - 0.08 * q})`}} />);
            })}
          </>
        ) : (
          <div style={{position: 'absolute', inset: 0, paddingTop: 118, paddingLeft: 30, paddingRight: 30, boxSizing: 'border-box'}}>
            <Tag text="HH.UZ SKRINSHOTI OʻRNI" />
            <div style={{height: 30, width: '72%', background: '#c9cde0', borderRadius: 12}} />
            <div style={{height: 20, width: '46%', background: '#dde0ee', borderRadius: 10, marginTop: 16}} />
            <div style={{marginTop: 42}}>{chip}</div>
            <div style={{position: 'relative', marginTop: 40, fontFamily: FONT, fontWeight: 700, fontSize: 38, color: '#1b2036', padding: '12px 16px', marginLeft: -16, marginRight: -16, borderRadius: 14}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${hl * 100}%`, background: ACCENT, borderRadius: 14, opacity: 0.92}} />
              <span style={{position: 'relative'}}>Tajriba: 1–3 yil</span>
            </div>
            {[78, 64, 70, 52].map((w, i) => (<div key={i} style={{height: 18, width: `${w}%`, background: '#dde0ee', borderRadius: 9, marginTop: i ? 18 : 44}} />))}
            <div style={{height: 78, borderRadius: 22, background: '#cfd3e6', marginTop: 50}} />
          </div>
        )}
      </Phone>
      <div style={{position: 'absolute', left: 80, right: 80, top: PHONE_TOP + PHONE_H + 20, textAlign: 'center', fontFamily: FONT, fontSize: 30, lineHeight: 1.25,
        color: 'rgba(255,255,255,.82)', opacity: ease((t - 0.7) / 0.4)}}>{s.source}</div>
    </>
  );
};

// Telefon ramkasidagi ekran videosi (vertikal yozuv, oldindan kesilgan: holat paneli va pastki tugmalarsiz). s.frame === 'phone' bo'lganda ScreenScene shuni chizadi.
const PhoneVideoScene = ({s}) => {
  const ACCENT = useContext(AccentCtx);
  const t = useT();
  const cues = s.cues || [];
  const enter = ease(t / 0.5);
  const c1 = cues[1] || {from: 3, to: 7};
  const chipAt = c1.from + 0.56 * (c1.to - c1.from), chipGap = 0.44 * (c1.to - c1.from) / 3;
  return (
    <>
      <Phone enter={enter}>
        <div style={{position: 'absolute', inset: 0, background: '#fff'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 54, bottom: 0}}>
          <OffthreadVideo src={staticFile(s.src)} muted startFrom={Math.round((s.from || 0) * 30)} playbackRate={s.rate || 1}
            style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%'}} />
        </div>
      </Phone>
      <div style={{position: 'absolute', left: 0, right: 0, top: PHONE_TOP + PHONE_H + 28, display: 'flex', justifyContent: 'center', gap: 20}}>
        {(s.chips || []).map((c, i) => {
          const p = ease((t - (chipAt + i * chipGap)) / 0.35);
          return (<div key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 50, color: '#2a1d00', background: ACCENT, padding: '8px 36px', borderRadius: 50,
            opacity: p, transform: `translateY(${(1 - p) * 24}px) scale(${0.85 + 0.15 * p})`, boxShadow: '0 10px 36px rgba(0,0,0,.4)'}}>{c}</div>);
        })}
      </div>
    </>
  );
};

// Ekran videosi (kompyuter oynasi). s.src (broll/ ichida video) bo'lsa — o'sha; bo'lmasa kod → sahifa yig'ilishi sxemasi (placeholder).
const ScreenScene = ({s}) => {
  if (s.frame === 'phone') return <PhoneVideoScene s={s} />;
  const ACCENT = useContext(AccentCtx);
  const t = useT();
  const cues = s.cues || [];
  const enter = ease(t / 0.5);
  const W = 980, H = 590, TOP = 290;
  const c1 = cues[1] || {from: 3, to: 7};
  const chipAt = c1.from + 0.56 * (c1.to - c1.from), chipGap = 0.44 * (c1.to - c1.from) / 3;
  const code = Array.from({length: 15}, (_, k) => ({w: 22 + rnd(k) * 62, ind: [0, 1, 1, 2, 2, 1, 0, 1, 2, 2, 1, 0, 1, 1, 0][k], c: [ACCENT, '#7aa2ff', '#9aa3c7'][k % 3], at: 0.3 + k * 0.45}));
  const blocks = [
    {x: 24, y: 20, w: 496, h: 34, at: 1.0, c: '#1b2036'},
    {x: 24, y: 76, w: 496, h: 130, at: 2.2, c: '#c9d3ff'},
    {x: 24, y: 226, w: 190, h: 52, at: 3.4, c: ACCENT},
    {x: 24, y: 304, w: 152, h: 150, at: 4.4, c: '#dfe3f3'},
    {x: 196, y: 304, w: 152, h: 150, at: 5.0, c: '#dfe3f3'},
    {x: 368, y: 304, w: 152, h: 150, at: 5.6, c: '#dfe3f3'},
  ];
  return (
    <>
      <div style={{position: 'absolute', left: (1080 - W) / 2, top: TOP + (1 - enter) * 80, width: W, height: H, opacity: enter, borderRadius: 30, background: '#0a0a0f', padding: 14,
        boxSizing: 'border-box', boxShadow: '0 30px 90px rgba(0,0,0,.6), 0 0 0 3px #2b2f45'}}>
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', background: '#10152b'}}>
          <div style={{height: 50, background: '#1a2040', display: 'flex', alignItems: 'center', paddingLeft: 20, gap: 10}}>
            {['#ff6b6b', '#ffd166', '#6bd68c'].map((c) => (<div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />))}
            <div style={{height: 24, width: 360, marginLeft: 24, borderRadius: 12, background: '#2a3158'}} />
          </div>
          {s.src ? (
            <OffthreadVideo src={staticFile(s.src)} muted startFrom={Math.round((s.from || 0) * 30)} playbackRate={s.rate || 1}
              style={{width: '100%', height: 'calc(100% - 50px)', objectFit: 'cover'}} />
          ) : (
            <div style={{display: 'flex', height: 'calc(100% - 50px)'}}>
              <div style={{width: '40%', padding: '26px 22px', boxSizing: 'border-box', background: '#0d1126'}}>
                {code.map((l, k) => (<div key={k} style={{height: 14, borderRadius: 7, marginBottom: 20, marginLeft: l.ind * 26, background: l.c, opacity: 0.85,
                  width: `${l.w * ease((t - l.at) / 0.4) * (1 - l.ind * 0.12)}%`}} />))}
              </div>
              <div style={{position: 'relative', flex: 1, background: '#f3f4f8'}}>
                {blocks.map((b, k) => (<div key={k} style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: 12, background: b.c,
                  opacity: ease((t - b.at) / 0.4), transform: `translateY(${(1 - ease((t - b.at) / 0.4)) * 22}px)`}} />))}
              </div>
            </div>
          )}
          {!s.src ? <div style={{position: 'absolute', right: 18, top: 62}}><Tag text="EKRAN VIDEOSI OʻRNI" /></div> : null}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: TOP + H + 70, display: 'flex', justifyContent: 'center', gap: 22}}>
        {(s.chips || []).map((c, i) => {
          const p = ease((t - (chipAt + i * chipGap)) / 0.35);
          return (<div key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 60, color: '#2a1d00', background: ACCENT, padding: '12px 40px', borderRadius: 50,
            opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${0.85 + 0.15 * p})`, boxShadow: '0 10px 36px rgba(0,0,0,.4)'}}>{c}</div>);
        })}
      </div>
    </>
  );
};

// Yo'l xaritasi: oylar ketma-ket paydo bo'ladi (birinchi ovoz qatori davomida), 2-qatorda "joy" belgisi.
const RoadmapScene = ({s}) => {
  const ACCENT = useContext(AccentCtx);
  const t = useT();
  const cues = s.cues || [];
  const steps = s.steps || [];
  const c0 = cues[0] || {from: 0.3, to: 5};
  const c1 = cues[1] || {from: 5.4, to: 6.6};
  const span = Math.max(1, c0.to - c0.from - 0.5);
  const at = (i) => c0.from + 0.1 + (i * span) / steps.length;
  const ROW = 140, TOP = 240;
  const lineP = ease((t - at(0)) / Math.max(0.5, span + 0.4));
  return (
    <>
      <div style={{position: 'absolute', left: 215, top: TOP + 48, width: 6, height: ROW * (steps.length - 1) * lineP, background: `linear-gradient(${ACCENT}, ${ACCENT}55)`, borderRadius: 3}} />
      {steps.map((st, i) => {
        const p = ease((t - at(i)) / 0.4);
        const last = i === steps.length - 1;
        return (
          <div key={i} style={{position: 'absolute', left: 170, right: 60, top: TOP + i * ROW, height: 96, display: 'flex', alignItems: 'center', gap: 38,
            opacity: p, transform: `translateX(${(1 - p) * -60}px)`}}>
            <div style={{width: 96, height: 96, borderRadius: 48, flex: 'none', background: last ? ACCENT : '#141a36', border: `5px solid ${ACCENT}`, color: last ? '#2a1d00' : ACCENT,
              fontFamily: FONT, fontWeight: 800, fontSize: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: last ? `0 0 40px ${ACCENT}88` : 'none'}}>{i + 1}</div>
            <div style={{fontFamily: FONT, lineHeight: 1.1}}>
              <div style={{fontSize: 32, fontWeight: 700, color: ACCENT, letterSpacing: 1}}>{st.m}</div>
              <div style={{fontSize: 52, fontWeight: 800, color: '#fff'}}>{st.t}</div>
            </div>
          </div>
        );
      })}
      {s.place ? (() => { const p = ease((t - c1.from) / 0.4);
        return (<div style={{position: 'absolute', left: 0, right: 0, top: TOP + ROW * steps.length - 6, display: 'flex', justifyContent: 'center', opacity: p, transform: `scale(${0.85 + 0.15 * p})`}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 46, color: '#2a1d00', background: ACCENT, padding: '8px 36px', borderRadius: 44, display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{width: 18, height: 18, borderRadius: 9, background: '#2a1d00'}} />{s.place}
          </div></div>); })() : null}
      {s.footer ? (<div style={{position: 'absolute', left: 60, right: 60, top: TOP + ROW * steps.length + 78, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 34,
        color: 'rgba(255,255,255,.88)', opacity: ease((t - 0.8) / 0.5)}}>{s.footer}</div>) : null}
    </>
  );
};

// Oxirgi karta: logotip (broll/ ichida s.logo — oq plastinada, o'zgartirilmaydi; bo'lmasa belgilangan joy), markaz nomi, shartlar, telefon.
const EndCardScene = ({s}) => {
  const ACCENT = useContext(AccentCtx);
  const t = useT();
  const cues = s.cues || [];
  const enter = ease(t / 0.5);
  const phoneAt = (cues[2] ? cues[2].from : 3.4) - 0.2;
  const pp = ease((t - phoneAt) / 0.45);
  const LW = s.logoWidth || 760;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', opacity: enter, transform: `translateY(${(1 - enter) * 30}px)`}}>
        {s.logo ? (
          <div style={{background: '#fff', borderRadius: 34, padding: '16px 24px', boxShadow: '0 20px 60px rgba(0,0,0,.45), 0 0 0 2px rgba(232,174,28,.55)'}}>
            <Img src={staticFile(s.logo)} style={{display: 'block', width: LW}} />
          </div>
        ) : (
          <div style={{width: 440, height: 170, borderRadius: 26, border: `4px dashed ${ACCENT}`, color: ACCENT, fontFamily: FONT, fontWeight: 800, fontSize: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: 1}}>LOGOTIP OʻRNI</div>)}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: s.logo ? 522 : 432, textAlign: 'center', opacity: enter}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 48, color: '#fff'}}>{s.name}</div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 34, color: ACCENT, marginTop: 8}}>{s.course}</div>
      </div>
      <div style={{position: 'absolute', left: 110, right: 70, top: 670}}>
        {(s.items || []).map((it, i) => {
          const p = ease((t - (0.35 + i * 0.32)) / 0.4);
          return (<div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 22, marginBottom: 16, opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
            <div style={{flex: 'none', width: 14, height: 26, marginTop: 5, marginLeft: 8, borderRight: `7px solid ${ACCENT}`, borderBottom: `7px solid ${ACCENT}`, transform: 'rotate(45deg)'}} />
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 35, lineHeight: 1.2, color: '#fff'}}>{it}</div>
          </div>);
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1035, display: 'flex', justifyContent: 'center', opacity: pp, transform: `scale(${0.85 + 0.15 * pp})`}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 62, color: '#2a1d00', background: ACCENT, padding: '14px 44px', borderRadius: 60, whiteSpace: 'nowrap',
          boxShadow: `0 12px 44px rgba(0,0,0,.5), 0 0 ${40 * pp}px ${ACCENT}66`}}>{s.phone}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Montage = ({scenes, brand, cta, subs = [], accent, clipFilter, titlePos, xfadeFrames, subBottom = 200, subSize = 38, karaoke = false, subMode = 'color', subBox = true, badge, bg = false, fontBody, fontDisplay}) => {
  const X = xfadeFrames ?? X_DEFAULT;
  let start = 0;
  return (
    <AccentCtx.Provider value={accent || DEFAULT_ACCENT}>
    <AbsoluteFill style={{background: '#000', ...(fontBody ? {'--fb': `"${fontBody}", ${STACK}`} : {}), ...(fontDisplay || fontBody ? {'--fd': `"${fontDisplay || fontBody}", ${STACK}`} : {})}}>
      {(fontBody || fontDisplay) ? <FontGate families={[fontBody, fontDisplay].filter(Boolean)} /> : null}
      {bg ? <Bg /> : null}
      {scenes.map((s, i) => {
        const dur = Math.round(s.dur * 30);
        const at = start;
        start += dur - (i < scenes.length - 1 ? X : 0);
        return (
          <Sequence key={i} from={at} durationInFrames={dur}>
            <FadeEdges dur={dur} x={X}>
              {s.src && !['screen'].includes(s.kind) ? <Clip src={s.src} from={s.from} dur={dur} cx={s.cx} dim={s.dim !== undefined ? s.dim : ((s.kind === 'title' || s.kind === 'end') ? 0.4 : 0)} filt={s.filter || clipFilter} zoom={s.zoom} zoomOut={s.zoomOut} /> : null}
              {s.kind === 'card' && <CardScene s={s} />}
              {s.kind === 'phone' && <PhoneScene s={s} />}
              {s.kind === 'screen' && <ScreenScene s={s} />}
              {s.kind === 'roadmap' && <RoadmapScene s={s} />}
              {s.kind === 'endcard' && <EndCardScene s={s} />}
              {s.kind === 'title' && <Title text={brand} top={titlePos === 'top'} />}
              {s.kind === 'lower' && <Lower text={s.text} />}
              {s.kind === 'end' && (<><Title text={brand} top={titlePos === 'top'} /><Cta text={cta} /></>)}
            </FadeEdges>
          </Sequence>
        );
      })}
      <Subtitles subs={subs} bottom={subBottom} size={subSize} karaoke={karaoke} mode={subMode} box={subBox} />
      {badge ? <Badge text={badge} /> : null}
    </AbsoluteFill>
    </AccentCtx.Provider>
  );
};
