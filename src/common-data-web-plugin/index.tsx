import { getInitialData } from '../common-data/helper';
import { Container } from '../common-data/container';
import { getAsyncInitialData } from './helper';
import { History } from 'history';
import { CommonDataPluginOptions } from '../common-data/types';
import initCommonDataConfig from '../init-common-data-config';

// 增加一个注入navigation的事件订阅
/**
 * commonDataPlugin
 * @param options 配置项
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

  return {
    component: Container,
    props: { initialState },
  };
}
