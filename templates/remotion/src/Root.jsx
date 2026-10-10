import React from 'react';
import {Composition} from 'remotion';
import {Montage} from './Montage.jsx';

export const FPS = 30;
export const Root = () => (
  <Composition id="Montage" component={Montage} durationInFrames={30 * FPS}
    fps={FPS} width={1080} height={1920}
    defaultProps={{scenes: [], brand: 'BYD SONG PLUS', cta: 'Sinov haydashga yoziling'}} />
);
