import React from 'react';

type Plugin = { id: number; props: any; component: React.ComponentType<any> };
export type Updater = {
  id: number;
  setState: (state: any) => Promise<void>;
  getState: (id: number) => any;
};

interface WrapProps<T> {
  appProps: T;
  App: React.ComponentType<T>;
  plugins: { id: number; props: any; component: React.ComponentType<any> }[];
  setUpdater: (updater: Updater) => void;
}

export class Wrapper<T> extends React.PureComponent<WrapProps<T>, any> {
  static id = 0;

  id: number;

  appProps: T;

  constructor(props: WrapProps<T>) {
    super(props);
    this.id = Wrapper.id++;
    const pluginsPropsMap: { [key: number]: any } = {};
    props.plugins.forEach(plugin => {
      pluginsPropsMap[plugin.id] = plugin.props;
    });
    this.state = pluginsPropsMap;
    props.setUpdater({
      id: this.id,
      getState: (id: number) => this.state,
      setState: async (action: (state: T) => Promise<Partial<T>>) => {
        const id = this.id;
        const data = await action(this.state[id]);
        return new Promise(resolve => {
          this.setState({ [id]: data }, () => {
            resolve();
          });
        });
      }
    });
  }

  renderElement(plugins: Plugin[], index: number = 0): React.ReactComponentElement<any> {
    const plugin = plugins[index];
    if (plugin) {
      const { component, id } = plugin;
      return React.createElement(component, this.state[id], this.renderElement(plugins));
    }
    return React.createElement(this.props.App, this.props.appProps);
  }

  render() {
    return this.renderElement(this.props.plugins);
  }
}
