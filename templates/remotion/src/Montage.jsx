import React from 'react';
import {AbsoluteFill, Sequence, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, Easing} from 'remotion';

const FONT = '"Noto Sans", "DejaVu Sans", Arial, sans-serif';
const ACCENT = '#35d6c0';
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
  const p = useIn(6, 16);
  const line = useIn(14, 22);
  const sp = interpolate(p, [0, 1], [40, 6]);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 96, color: '#fff', textAlign: 'center',
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
  const p = useIn(8);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 300}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: p, transform: `translateY(${(1 - p) * 60}px)`}}>
        <div style={{width: 10 * p, height: 84, background: ACCENT, borderRadius: 5}} />
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 64, color: '#fff',
          textShadow: '0 4px 20px rgba(0,0,0,.7)'}}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

const Cta = ({text}) => {
  const p = useIn(22, 14);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 300}}>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 48, color: '#06231f', background: ACCENT,
        padding: '26px 54px', borderRadius: 60, opacity: p, transform: `scale(${0.8 + 0.2 * p})`,
        boxShadow: '0 10px 40px rgba(0,0,0,.45)'}}>{text}</div>
    </AbsoluteFill>
  );
};

export const Montage = ({scenes, brand, cta}) => {
  let start = 0;
  return (
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
    </AbsoluteFill>
  );
};
