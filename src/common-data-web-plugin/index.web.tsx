import { History } from 'history';
import React, { useEffect } from 'react';
import { getInitialData } from '../common-data/helper';
import { commonDataConfig, initCommonDataConfig } from '../init-common-data-config/config';
import { Container, useCommonData } from '../common-data/container';
import { CommonDataState, CommonDataPluginOptions } from '../common-data/types';
import { getAsyncInitialData, matchPathname } from './helper';

// 检测路由的变更，根据路由变更自动刷新数据
function CommonDataCheck(props: { history: History }): null {
  const { history } = props;
  const { refresh, ...commonData } = useCommonData();
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    return history.listen((location) => {
      const { pathname } = location;
      const needRefresh: string[] = [];
      commonDataConfig.items.forEach((config) => {
        const { name } = config;
        // https://cloud.tencent.com/developer/section/1135740
        if (!Object.prototype.hasOwnProperty.call(commonData, name) && matchPathname(config, pathname)) {
          needRefresh.push(name);
        }
      });
      if (needRefresh.length > 0) {
        refresh(needRefresh);
      }
    });
  }, [commonData, history, refresh]);
  return null;
}

function Provider(props: { history: History; initialState: CommonDataState; children: any }) {
  const { history, initialState } = props;
  return (
    <Container initialState={initialState}>
      <CommonDataCheck history={history} />
      {props.children}
    </Container>
  );
}

// 增加一个注入navigation的事件订阅
/**
 * commonDataPlugin
 * @param initialData 初始数据
 * @param history 页面跳转的时候是否自动注入数据
 *
 * history设置之后，commonData监听path变化
 */
export default async function commonDataWebPlugin(options: CommonDataPluginOptions, history?: History) {
  const { items, initialData = {} } = options;
  initCommonDataConfig({ items });
  const staticData = await getInitialData();
  const asyncData = await getAsyncInitialData();
  const initialState = { ...staticData, ...initialData, ...asyncData };

  if (history) {
    return {
      component: Provider,
      props: { initialState, history },
    };
  }

  return {
    component: Container,
    props: { initialState },
  };
}
