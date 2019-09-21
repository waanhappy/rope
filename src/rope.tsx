import React from 'react';
import ReactDom from 'react-dom';
import { Updater, Core } from './core';
import { isPromise } from './is-promise';

type Handler<S> = (prevState: S, preload: any) => Partial<S>;

export interface Plugin<T, S> {
  props: T;
  component: React.ComponentType<T>;
  subscribes: { [key: string]: Handler<S> };
}

/**
 * 主要提供middleware的支持，
 * 增加发布订阅机制以便处理数据变更
 * 用于动态切换一些不常用的值
 */
export class Rope {
  public static id = 0;
  private AppElement: React.ReactNode;

  // 加载中的 plugin
  private __pending: Promise<Plugin<any, any>>[] = [];

  // 加载完成的 plugin
  private __plugins: { id: number; props: any; component: React.ComponentType<any> }[] = null;

  // 钩子
  private __hooks: { id: number; name: string; handler: Handler<any> }[] = [];

  // 更新状态
  private __updater: Updater = null;

  public app(AppElement: React.ReactNode) {
    this.AppElement = AppElement;
  }

  /**
   * {
   *  component,
   *  props,
   *  subscribes: {[string]?(): => any},
   * }
   */
  public plugin<P, S>(plugin: (Plugin<P, S> | Promise<Plugin<P, S>>)[] | Plugin<P, S> | Promise<Plugin<P, S>>) {
    if (Array.isArray(plugin)) {
      plugin.forEach((m) => {
        this.plugin(m);
      });
      return this;
    }
    if (isPromise(plugin)) {
      this.__pending.push(plugin as Promise<Plugin<P, S>>);
    } else {
      this.__pending.push(Promise.resolve(plugin));
    }
    return this;
  }

  /**
   * 触发事件
   * @param name string 订阅的事件
   * @param handler 处理函数
   */
  public async trigger(name: string, handler: <S>(prevState: S) => any) {
    const promises = this.__hooks.map(async (hook) => {
      const { id, handler: subscribesHandler, name: hookName } = hook;
      if (hookName === name) {
        const prevState = this.__updater.getState(id);
        const preload = await handler(prevState);
        const data = await subscribesHandler(prevState, preload);
        await this.__updater.setState({ ...prevState, ...data });
      }
    });
    await Promise.all(promises);
  }

  /**
   * 挂载渲染或返回根组件
   * @param dom Selector<string> | DomObject | null
   * @param isomorphic 是否为同构渲染
   */
  public async start(dom: HTMLElement | string, isomorphic: boolean = false) {
    const app = await this.render();
    if (!dom) {
      return this.getComponent;
    }
    const htmlDom = typeof dom === 'string' ? document.querySelector(dom) : dom;
    if (isomorphic) {
      ReactDom.hydrate(app, htmlDom);
    } else {
      ReactDom.render(app, htmlDom);
    }
  }

  // get the jsx
  public render() {
    if (this.__plugins) {
      return Promise.resolve(this.getComponent());
    }
    return Promise.all(this.__pending)
      .then((loadedPlugins) => {
        this.__handlePlugin(loadedPlugins);
        return this.getComponent();
      })
      .catch((error) => {
        return (
          <div>
            <h3>{error.message}</h3>
            <br />
            {error.stack}
          </div>
        );
      });
  }

  // 异步数据初始化完成
  private __handlePlugin<P, S>(plugins: Plugin<P, S>[]) {
    this.__plugins = [];
    plugins.forEach((plugin) => {
      const id = Rope.id++;

      this.__plugins.push({ id, props: plugin.props, component: plugin.component });

      // 订阅
      const subscribes = plugin.subscribes || {};

      Object.keys(subscribes).forEach((item) => {
        this.__hooks.push({ id, name: item, handler: subscribes[item] });
      });
    });
  }

  // 获取更新函数
  private __setUpdater = (updater: Updater) => {
    this.__updater = updater;
  };

  private getComponent = () => {
    return (
      <Core plugins={this.__plugins} setUpdater={this.__setUpdater}>
        {this.AppElement}
      </Core>
    );
  };
}
