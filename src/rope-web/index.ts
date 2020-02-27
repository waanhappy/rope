import  Rope  from '../rope';
import ReactDom from 'react-dom';

export default class RopeWeb extends Rope {
  /**
   * 挂载渲染或返回根组件
   * @param dom Selector<string> | DomObject | null
   * @param isomorphic 是否为同构渲染
   */
  public async start(dom: HTMLElement | string, isomorphic = false) {
    const app = await this.render();
    if (!dom) {
      return this.getComponent();
    }
    const htmlDom = typeof dom === 'string' ? document.querySelector(dom) : dom;
    if (isomorphic) {
      ReactDom.hydrate(app, htmlDom);
    } else {
      ReactDom.render(app, htmlDom);
    }
  }
}
