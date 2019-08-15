import React from 'react';

interface Plugin {
  id: number;
  props: any;
  component: React.ComponentType<any>;
}
export interface Updater {
  id: number;
  setState: (state: any) => Promise<void>;
  getState: (id: number) => any;
}

interface WrapProps<T> {
  plugins: { id: number; props: any; component: React.ComponentType<any> }[];
  setUpdater: (updater: Updater) => void;
}

export class Wrapper<T> extends React.PureComponent<WrapProps<T>, any> {
  public static id = 0;

  public id: number;

  public constructor(props: WrapProps<T>) {
    super(props);
    this.id = Wrapper.id++;
    const pluginsPropsMap: { [key: number]: any } = {};
    props.plugins.forEach((plugin) => {
      pluginsPropsMap[plugin.id] = plugin.props;
    });
    this.state = pluginsPropsMap;
    props.setUpdater({
      id: this.id,
      getState: (id: number) => this.state,
      setState: async (action: (state: T) => Promise<Partial<T>>) => {
        const id = this.id;
        const data = await action(this.state[id]);
        return new Promise((resolve) => {
          this.setState({ [id]: data }, () => {
            resolve();
          });
        });
      },
    });
  }

  public render() {
    return this.renderElement(this.props.plugins);
  }

  private renderElement(plugins: Plugin[], index = 0): React.ReactNode {
    const plugin = plugins[index];
    if (plugin) {
      const { component, id } = plugin;
      return React.createElement(component, this.state[id], this.renderElement(plugins, index + 1));
    }
    return this.props.children;
  }
}
