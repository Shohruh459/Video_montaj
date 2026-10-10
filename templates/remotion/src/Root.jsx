import React from 'react';
import {Composition} from 'remotion';
import {Montage} from './Montage.jsx';

export const FPS = 30;
const XFADE = 12; // Montage.jsx dagi X bilan bir xil

// Umumiy davomiylik = sahnalar yig'indisi − kesishmalar (crossfade)
const total = (scenes) =>
  Math.max(1, scenes.reduce((a, s) => a + Math.round(s.dur * FPS), 0) - XFADE * Math.max(0, scenes.length - 1));

export const Root = () => (
  <Composition id="Montage" component={Montage} durationInFrames={30 * FPS}
    fps={FPS} width={1080} height={1920}
    defaultProps={{scenes: [], brand: 'BYD SONG PLUS', cta: 'Sinov haydashga yoziling', subs: []}}
    calculateMetadata={({props}) => ({durationInFrames: total(props.scenes)})} />
);
