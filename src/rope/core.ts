import React from 'react';

interface Plugin {
  id: number;
  props: any;
  component: React.ComponentType<any>;
}

export interface Updater {
  id: number;
  setState: (id: number, state: any) => Promise<void>;
  getState: (id: number) => any;
}

interface WrapProps<T> {
  plugins: { id: number; props: any; component: React.ComponentType<any> }[];
  setUpdater: (updater: Updater) => void;
}

// Provider 渲染器
export class Core<T> extends React.Component<WrapProps<T>, any> {
  public static id = 0;

  public id: number;

  public constructor(props: WrapProps<T>) {
    super(props);
    this.id = Core.id++;
    const pluginsPropsMap: { [key: number]: any } = {};
    props.plugins.forEach(plugin => {
      pluginsPropsMap[plugin.id] = plugin.props;
    });
    this.state = pluginsPropsMap;
    props.setUpdater({
      id: this.id,
      getState: (id: number) => this.state[id],
      setState: (id, state: Partial<T>) => {
        return new Promise(resolve => {
          this.setState({ [id]: state }, () => {
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
