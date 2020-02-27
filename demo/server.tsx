import { RopeServer } from '../lib';
import { App } from './app';
import { plugin } from './plugin';

export async function render() {
  const rope = new RopeServer();
  rope.app(<App />);
  rope.plugin(plugin({ name: '初始值' }));
  const domString = rope.renderToString();
  console.log(domString);
}

render();
