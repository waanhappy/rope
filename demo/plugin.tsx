import { createContext } from 'react';
import { Plugin } from '../lib/rope';

export const demoCtx = createContext({ name: '' });

type PluginProps = {
  value: { name: string };
};

export function plugin(initialData: { name: string }): Plugin<PluginProps, PluginProps> {
  return {
    component: demoCtx.Provider,
    props: { value: initialData },
    subscribes: {
      changeData: (prevState: PluginProps, newValue: any) => {
        return { value: newValue };
      },
    },
  };
}
