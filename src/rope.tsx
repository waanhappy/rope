import React from 'react';
import ReactDom from 'react-dom';
import { Wrapper, Updater } from './wrapper';

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
export class Rope<T> {
  static id: number = 0;
  App: React.ComponentType<T>;

  appProps: T;

  constructor(App: React.ComponentType<T>, appProps: any) {
    this.App = App;
    this.appProps = appProps;
  }

  // 加载中的 plugin
  __pending: Promise<Plugin<any>>[] = [];

  // 加载完成的 plugin
  __plugins: { id: number; props: any; component: React.ComponentType<any> }[] = null;

  // 钩子
  __hooks: { id: number; name: string; action: <P>(prevProps: P) => Partial<P> }[] = [];

  // 更新状态
  __updater: Updater = null;

  /**
   * {
   *  component,
   *  props,
   *  subscribes: {[string]?(): => any},
   * }
   */
  plugin<P>(plugin: (Plugin<P> | Promise<Plugin<P>>)[] | Plugin<P> | Promise<Plugin<P>>) {
    if (Array.isArray(plugin)) {
      plugin.forEach(m => {
        this.plugin(m);
      });
      return this;
    }
    if (isPromise(plugin)) {
      this.__pending.push(plugin as Promise<Plugin<P>>);
    } else {
      this.__pending.push(Promise.resolve(plugin));
    }
    return this;
  }

  // 异步数据初始化完成
  __handlePlugin<P>(plugins: Plugin<P>[]) {
    this.__plugins = [];
    plugins.forEach(plugin => {
      const id = Rope.id++;

      this.__plugins.push({ id, props: plugin.props, component: plugin.component });

      // 订阅
      const subscribes = plugin.subscribes || {};

      Object.keys(subscribes).forEach(item => {
        this.__hooks.push({ id, name: item, action: subscribes[item] });
      });
    });
  }

  trigger(name: string, hanlder: <S>(prevState: S) => Partial<S>) {
    this.__hooks.forEach(async hook => {
      const { id, action, name: hookName } = hook;
      if (hookName === name) {
        const prevState = this.__updater.getState(id);
        const newState = await hanlder(prevState);
        const data = await action(newState);
        await this.__updater.setState(data);
      }
    });
  }

  /**
   * 挂载渲染或返回根组件
   * @param dom Selector<string> | DomObject | null
   * @param isomorphic 是否为同构渲染
   */
  async start(dom: HTMLElement | string, isomorphic: boolean) {
    const app = await this.render();
    if (!dom) {
      return this.getComponent;
    }
    const htmlDom = typeof dom === 'string' ? document.getElementById(dom) : dom;
    if (isomorphic) {
      ReactDom.hydrate(app, htmlDom);
    } else {
      ReactDom.render(app, htmlDom);
    }
  }

  // 获取更新函数
  __setUpdater = (updater: Updater) => {
    this.__updater = updater;
  };

  getComponent = () => {
    return <Wrapper plugins={this.__plugins} App={this.App} appProps={this.appProps} setUpdater={this.__setUpdater} />;
  };

  render() {
    if (this.__plugins) {
      return Promise.resolve(this.getComponent());
    }
    return Promise.all(this.__pending)
      .then(loadedPlugins => {
        this.__handlePlugin(loadedPlugins);
        return this.getComponent();
      })
      .catch(error => {
        return (
          <div>
            <h3>{error.message}</h3>
            <br />
            {error.stack}
          </div>
        );
      });
  }
}
