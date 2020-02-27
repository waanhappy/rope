import React, { createContext, PureComponent, useContext } from 'react';
import { isPromise } from '@webtanzhi/utils';
import { requestCommonData } from './helper';
import { CommonData, CommonDataState, RefreshTarget } from './types';

const defaultCommonData: CommonData = {} as CommonData;

export const commonDataContext = createContext(defaultCommonData);

export class Container extends PureComponent<CommonDataState, CommonDataState> {
  constructor(props: CommonDataState) {
    super(props);
    this.state = { ...(props.initialState || {}) };
  }

  refresh = async (target: RefreshTarget, preload?: object) => {
    // 如果直接传入preload
    if (preload && typeof target === 'string') {
      const newData = { [target]: preload };
      this.setState(newData);
      return;
    }

    // 空的
    if (Array.isArray(target) && !target.length) {
      return;
    }
    // loading 状态维护
    let newData: CommonDataState = {};
    this.setState({ loading: true });

    if (isPromise(target)) {
      newData = (await target) as CommonDataState;
    } else if (target) {
      newData = await requestCommonData(target as string | string[]);
    }
    newData.loading = false;

    this.setState(newData);
  };

  render() {
    const { children } = this.props;
    return (
      <commonDataContext.Provider value={{ ...this.state, refresh: this.refresh }}>
        {children}
      </commonDataContext.Provider>
    );
  }
}

// useCommonData, 便于hooks操作
export function useCommonData() {
  return useContext(commonDataContext);
}

// export async function commonDataPlugin(initialData = {}) {
//   const staticData = await getInitialData();
//   const asyncData = await getAsyncInitialData();
//   const initialState = { ...staticData, ...initialData, ...asyncData };
//   return {
//     component: Container,
//     props: { initialState },
//   };
// }

export function injectCommonData<T extends CommonData>(CustomComponent: React.ComponentType<T>) {
  return function injectedCommonData(props: T) {
    const commonData = useContext(commonDataContext);
    return <CustomComponent {...commonData} {...props} />;
  };
}
