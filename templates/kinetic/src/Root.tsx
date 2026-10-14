import React from 'react';
import {Composition} from 'remotion';
import {Reel, ReelProps} from './Reel';
import ssenariy1 from './data/ssenariy1.json';

const FPS = 30;
export const Root: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel as React.FC<any>}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={Math.round(ssenariy1.durationSec * FPS)}
    defaultProps={ssenariy1 as ReelProps}
  />
);
