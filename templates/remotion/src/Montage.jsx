import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Sequence, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, Easing} from 'remotion';

const FONT = '"Noto Sans", "DejaVu Sans", Arial, sans-serif';
const DEFAULT_ACCENT = '#35d6c0';
const AccentCtx = createContext(DEFAULT_ACCENT);
const X = 12; // crossfade, kadr (0.4 s)

const useIn = (delay = 0, damping = 18) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping, stiffness: 110}});
};

const FadeEdges = ({children, dur}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, X, dur - X, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const Clip = ({src, from, dur, cx = 0.5, dim = 0}) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, dur], [1.0, 1.08], {easing: Easing.inOut(Easing.quad)});
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <OffthreadVideo src={staticFile(src)} muted startFrom={Math.round(from * 30)}
        style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${cx * 100}% 50%`,
          transform: `scale(${scale})`, transformOrigin: `${cx * 100}% 50%`}} />
      <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 55%, rgba(0,0,0,.65) 100%)'}} />
    </AbsoluteFill>
  );
};

const Title = ({text, sub}) => {
  const ACCENT = useContext(AccentCtx);
  const p = useIn(6, 16);
  const line = useIn(14, 22);
  const sp = interpolate(p, [0, 1], [40, 6]);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: Math.min(96, Math.floor((860 / text.length - 6) / 0.85)), color: '#fff', textAlign: 'center',
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
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 48, color: '#06231f', background: ACCENT,
        padding: '26px 54px', borderRadius: 60, opacity: p, transform: `scale(${0.8 + 0.2 * p})`,
        boxShadow: '0 10px 40px rgba(0,0,0,.45)'}}>{text}</div>
    </AbsoluteFill>
  );
};


// Subtitr: ekran chetidan 10% (192 px) yuqorida, ≤ 2 qator. Qator uzilishlari make_video.py da belgilanadi.
const Subtitles = ({subs}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const cur = subs.find((s) => t >= s.from && t <= s.to);
  if (!cur) return null;
  const k = Math.min(1, (t - cur.from) / 0.15, (cur.to - t) / 0.15);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 200}}>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 38, lineHeight: 1.3, color: '#fff', textAlign: 'center',
        whiteSpace: 'pre-line', maxWidth: 920, background: 'rgba(0,0,0,.62)', padding: '14px 28px', borderRadius: 18,
        opacity: Math.max(0, k), transform: `translateY(${(1 - Math.max(0, k)) * 12}px)`}}>{cur.text}</div>
    </AbsoluteFill>
  );
};

export const Montage = ({scenes, brand, cta, subs = [], accent}) => {
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
            <FadeEdges dur={dur}>
              <Clip src={s.src} from={s.from} dur={dur} cx={s.cx} dim={s.kind === 'lower' ? 0 : 0.4} />
              {s.kind === 'title' && <Title text={brand} />}
              {s.kind === 'lower' && <Lower text={s.text} />}
              {s.kind === 'end' && (<><Title text={brand} /><Cta text={cta} /></>)}
            </FadeEdges>
          </Sequence>
        );
      })}
      <Subtitles subs={subs} />
    </AbsoluteFill>
    </AccentCtx.Provider>
  );
};
