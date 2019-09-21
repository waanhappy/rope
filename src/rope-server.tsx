import React from 'react';
import { renderToString, renderToNodeStream, renderToStaticMarkup, renderToStaticNodeStream } from 'react-dom/server';
import { Rope } from './index';

export interface Plugin<T> {
  props: T;
  component: React.ComponentType<T>;
  subscribes: { [key: string]: <T>(prevProps: T) => Partial<T> };
}

/**
 * 主要提供middleware的支持，
 * 增加发布订阅机制以便处理数据变更
 * 用于动态切换一些不常用的值
 */
export class RopeServer extends Rope {
  /**
   * 服务端渲染
   */
  public async renderToString() {
    const app = await this.render();
    return renderToString(app);
  }

  /**
   * 服务端渲染
   */
  public async renderToNodeStream() {
    const app = await this.render();
    return renderToNodeStream(app);
  }

  /**
   * 服务端渲染
   */
  public async renderToStaticMarkup() {
    const app = await this.render();
    return renderToStaticMarkup(app);
  }

  /**
   * 服务端渲染
   */
  public async renderToStaticNodeStream() {
    const app = await this.render();
    return renderToStaticNodeStream(app);
  }
}
