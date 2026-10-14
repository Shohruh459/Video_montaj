import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Sequence, continueRender, delayRender} from 'remotion';

type Line = {t: string; a?: boolean; big?: boolean; gap?: boolean};
type SceneT = {start: number; dur: number; label?: string; cta?: boolean; lines: Line[]};
export type ReelProps = {durationSec: number; handle: string; ctaText: string; scenes: SceneT[]};

const GOLD = '#F2B84B';
const FONT = 'YB';
const SAFE = 150; // ~8% yon, 10%+ tepa/past xavfsiz zona

const useFonts = () => {
  const [h] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    const b = new FontFace(FONT, `url(${staticFile('font-bold.ttf')})`, {weight: '700'});
    b.load().then((f) => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }, [h]);
};

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const p = f / durationInFrames;
  const particles = Array.from({length: 38}, (_, i) => {
    const x = random(`x${i}`) * width;
    const speed = 12 + random(`s${i}`) * 30;
    const y = (random(`y${i}`) * height - f * speed / 30 * 1.0 + height * 3) % height;
    const r = 1.5 + random(`r${i}`) * 3.5;
    const tw = 0.15 + 0.35 * Math.abs(Math.sin(f / 40 + i));
    return <div key={i} style={{position: 'absolute', left: x + Math.sin(f / 90 + i) * 20, top: y, width: r * 2, height: r * 2, borderRadius: '50%', background: GOLD, opacity: tw * 0.7, filter: 'blur(1px)'}} />;
  });
  return (
    <AbsoluteFill style={{background: '#06080d'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at ${50 + Math.sin(p * 6) * 12}% ${35 + p * 25}%, rgba(242,184,75,0.16), transparent 70%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.75) 100%)'}} />
      {particles}
    </AbsoluteFill>
  );
};

const Word: React.FC<{w: string; delay: number; accent?: boolean; size: number; dur: number}> = ({w, delay, accent, size, dur}) => {
  const f = useCurrentFrame();
  const inP = interpolate(f - delay, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const out = interpolate(f, [dur - 9, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const o = inP * out;
  return (
    <span style={{display: 'inline-block', marginRight: size * 0.28, opacity: o, transform: `translateY(${(1 - inP) * 36}px) scale(${0.94 + 0.06 * inP})`, filter: `blur(${(1 - inP) * 10}px)`, color: accent ? GOLD : '#fff', textShadow: accent ? '0 0 40px rgba(242,184,75,0.45)' : '0 4px 30px rgba(0,0,0,0.6)'}}>{w}</span>
  );
};

const CountUp: React.FC<{text: string; delay: number; size: number; dur: number}> = ({text, delay, size, dur}) => {
  const f = useCurrentFrame();
  const m = text.match(/^(\d+)(.*)$/);
  if (!m) return <Word w={text} delay={delay} accent size={size} dur={dur} />;
  const target = parseInt(m[1], 10);
  const v = Math.round(interpolate(f - delay, [0, 36], [0, target], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}));
  return <Word w={`${v}${m[2]}`} delay={delay} accent size={size} dur={dur} />;
};

const SceneView: React.FC<{s: SceneT; handle: string; ctaText: string; frames: number}> = ({s, handle, ctaText, frames}) => {
  const f = useCurrentFrame();
  const drift = interpolate(f, [0, frames], [1, 1.045]);
  if (s.cta) {
    const o = interpolate(f, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
    const lineW = interpolate(f, [10, 40], [0, 520], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o, transform: `scale(${drift})`}}>
        <div style={{fontFamily: FONT, fontWeight: 700, color: '#fff', fontSize: 84, textAlign: 'center', padding: `0 ${SAFE}px`, lineHeight: 1.2}}>{ctaText}</div>
        <div style={{height: 4, width: lineW, background: GOLD, margin: '44px 0'}} />
        <div style={{fontFamily: FONT, fontWeight: 700, color: GOLD, fontSize: 70, letterSpacing: 1}}>{handle}</div>
      </AbsoluteFill>
    );
  }
  let wordIdx = 0;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${drift})`}}>
      {s.label && (
        <div style={{position: 'absolute', top: 330, fontFamily: FONT, fontWeight: 700, fontSize: 38, letterSpacing: 14, color: GOLD, opacity: interpolate(f, [0, 12, frames - 9, frames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>{s.label}</div>
      )}
      <div style={{padding: `0 ${SAFE}px`, textAlign: 'center', fontFamily: FONT, fontWeight: 700}}>
        {s.lines.map((l, i) => {
          const base = l.big ? 150 : 92;
          const size = Math.min(base, Math.floor((1080 - 2 * SAFE) / (l.t.length * 0.64)));
          const words = l.t.split(' ');
          return (
            <div key={i} style={{fontSize: size, lineHeight: 1.18, marginTop: l.gap ? 70 : 0, whiteSpace: 'nowrap'}}>
              {l.big && /^\d/.test(l.t) ? (
                <CountUp text={l.t} delay={4 + wordIdx++ * 7} size={size} dur={frames} />
              ) : (
                words.map((w, j) => <Word key={j} w={w} delay={4 + wordIdx++ * 7} accent={l.a} size={size} dur={frames} />)
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = ({scenes, handle, ctaText}) => {
  useFonts();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Background />
      {scenes.map((s, i) => {
        const frames = Math.round(s.dur * fps);
        return (
          <Sequence key={i} from={Math.round(s.start * fps)} durationInFrames={frames}>
            <SceneView s={s} handle={handle} ctaText={ctaText} frames={frames} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
