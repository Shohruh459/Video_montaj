import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Sequence, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, Easing} from 'remotion';

const FONT = '"Noto Sans", "DejaVu Sans", Arial, sans-serif';
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
        maxWidth: 940, opacity: k, transform: `translateY(${(1 - k) * 14}px)`, ...boxStyle}}>
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

export const Montage = ({scenes, brand, cta, subs = [], accent, clipFilter, titlePos, xfadeFrames, subBottom = 200, subSize = 38, karaoke = false, subMode = 'color', subBox = true, badge}) => {
  const X = xfadeFrames ?? X_DEFAULT;
  let start = 0;
  return (
    <AccentCtx.Provider value={accent || DEFAULT_ACCENT}>
    <AbsoluteFill style={{background: '#000'}}>
      {scenes.map((s, i) => {
        const dur = Math.round(s.dur * 30);
        const at = start;
        start += dur - (i < scenes.length - 1 ? X : 0);
        return (
          <Sequence key={i} from={at} durationInFrames={dur}>
            <FadeEdges dur={dur} x={X}>
              <Clip src={s.src} from={s.from} dur={dur} cx={s.cx} dim={s.dim !== undefined ? s.dim : ((s.kind === 'title' || s.kind === 'end') ? 0.4 : 0)} filt={s.filter || clipFilter} zoom={s.zoom} zoomOut={s.zoomOut} />
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
