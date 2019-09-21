import React from 'react';
import { rope } from './rope';
import { plugin } from './plugin';
import { App } from './app';

rope.app(<App />);
rope.plugin(plugin({ name: '初始值' }));
rope.start('#root');
