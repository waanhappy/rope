import React, { useEffect } from 'react';
import { getInitialData } from '../common-data/helper';
import { commonDataConfig, initCommonDataConfig } from '../init-common-data-config/config';
import { Container, useCommonData } from '../common-data/container';
import { CommonDataState, CommonDataPluginOptions } from '../common-data/types';
import { getAsyncInitialData, matchRouterName } from './helper';

// 检测路由的变更，根据路由变更自动刷新数据
function CommonDataCheck(props: { navigation: any }): null {
  const { navigation } = props;
  const { refresh, ...commonData } = useCommonData();
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (navigation) {
      const listener = navigation.addListener('action', (event: any) => {
        const { action = {} } = event;
        const { type, routeName } = action;
        const names: string[] = [];
        if (['Navigation/NAVIGATE', 'Navigation/JUMP_TO'].includes(type) && routeName) {
          commonDataConfig.items.forEach((config) => {
            const { name } = config;
            if (matchRouterName(config, routeName) && !Object.prototype.hasOwnProperty.call(commonData, name)) {
              names.push(name);
            }
          });
        }
        if (names.length) {
          refresh(names);
        }
      });
      return () => {
        listener.remove();
      };
    }
  }, [commonData, navigation, refresh]);
  return null;
}

function Provider(props: { navigator: any; initialState: CommonDataState; children: any }) {
  const { navigator, initialState } = props;
  return (
    <Container initialState={initialState}>
      <CommonDataCheck navigation={navigator?._navigation} />
      {props.children}
    </Container>
  );
}

// 增加一个注入navigation的事件订阅
/**
 * commonDataPlugin
 * @param initialData 初始数据
 * @param autoInitData 页面跳转的时候是否自动注入数据
 *
 * autoInitData为true的时候需要，调用 tumbler.trigger('useNavigator', navigator)注入navigator
 *  让commonData监听route变化
 */
export default async function commonDataNativePlugin(options: CommonDataPluginOptions, autoInitData = true) {
  const { items, initialData = {} } = options;
  initCommonDataConfig({ items });
  const staticData = await getInitialData();
  const asyncData = await getAsyncInitialData();
  const initialState = { ...staticData, ...initialData, ...asyncData };

  if (autoInitData) {
    return {
      component: Provider,
      props: { initialState },
      subscribes: {
        useNavigator: (prevState: any, navigator: any) => ({
          ...prevState,
          navigator,
        }),
      },
    };
  }

  return {
    component: Container,
    props: { initialState },
  };
}
