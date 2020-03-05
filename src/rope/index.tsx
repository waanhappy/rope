import React from 'react';
import { Updater, Core } from './core';
import { isPromise, isFunction } from '@webtanzhi/utils';

type Handler<S> = (prevState: S, preload: any) => Partial<S>;

export interface Plugin<T, S> {
  props: T;
  component: React.ComponentType<T>;
  subscribes: { [key: string]: Handler<S> };
}

export type FPluginOptions = <P, S>() =>
  | (Plugin<P, S> | Promise<Plugin<P, S>>)[]
  | Plugin<P, S>
  | Promise<Plugin<P, S>>;
export type OPluginOptions<P, S> = (Plugin<P, S> | Promise<Plugin<P, S>>)[] | Plugin<P, S> | Promise<Plugin<P, S>>;
export type PluginOptions<P, S> = FPluginOptions | OPluginOptions<P, S>;
/**
 * 主要提供middleware的支持，
 * 增加发布订阅机制以便处理数据变更
 * 用于动态切换一些不常用的值
 */
export default class Rope {
  public static id = 0;
  private AppElement: React.ReactNode;

  // 初始状态的pulgin
  private __origin_plugins: FPluginOptions[] = [];

  // 加载中的 plugin
  private __pending: Promise<Plugin<any, any>>[] = [];

  // 加载完成的 plugin
  private __plugins: { id: number; props: any; component: React.ComponentType<any> }[] = null;

  // 钩子
  private __hooks: { id: number; name: string; handler: Handler<any> }[] = [];

  // 更新状态
  private __updater: Updater = null;

  public useApp(AppElement: React.ReactNode) {
    this.AppElement = AppElement;
  }

  /**
   * {
   *  component,
   *  props,
   *  subscribes: {[string]?(): => any},
   * }
   */
  public plugin(plugin: PluginOptions<any, any>) {
    if (isFunction(plugin)) {
      this.__origin_plugins.push(plugin);
      return this;
    }
    this.__origin_plugins.push(() => {
      if (isPromise(plugin)) {
        return plugin;
      }
      return plugin;
    });
    return this;
  }

  /**
   * {
   *  component,
   *  props,
   *  subscribes: {[string]?(): => any},
   * }
   */
  public applyPlugin<P, S>(plugin: (Plugin<P, S> | Promise<Plugin<P, S>>)[] | Plugin<P, S> | Promise<Plugin<P, S>>) {
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
      // 循环hooks找到对应的handler，处理数据
      const { id, handler: subscribesHandler, name: hookName } = hook;
      if (hookName === name) {
        const prevState = this.__updater.getState(id);
        const preload = await handler(prevState);
        const data = await subscribesHandler(prevState, preload);
        await this.__updater.setState(id, { ...prevState, ...data });
      }
    });
    await Promise.all(promises);
  }

  // get the jsx
  public render() {
    // plugin的异步不能提前执行
    this.__origin_plugins.forEach((plugin) => {
      this.applyPlugin(plugin());
    });
    if (this.__plugins) {
      return Promise.resolve(this.getComponent());
    }
    return Promise.all(this.__pending)
      .then((loadedPlugins) => {
        this.__handlePlugin(loadedPlugins);
        return this.getComponent();
      })
      .catch((error) => {
        console.error(error);
        return null;
      });
  }

  // 异步数据初始化完成
  public __handlePlugin<P, S>(plugins: Plugin<P, S>[]) {
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
  public __setUpdater = (updater: Updater) => {
    this.__updater = updater;
  };

  public getComponent() {
    return (
      <Core plugins={this.__plugins} setUpdater={this.__setUpdater}>
        {this.AppElement}
      </Core>
    );
  }
}
