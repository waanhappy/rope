import { getInitialData } from '../common-data/helper';
import { Container } from '../common-data/container';
import { getAsyncInitialData } from './helper';
import { History } from 'history';

// 增加一个注入navigation的事件订阅
/**
 * commonDataPlugin
 * @param initialData 初始数据
 * @param history 页面跳转的时候是否自动注入数据
 *
 * history设置之后，commonData监听path变化
 */
export default async function commonDataWebPlugin(initialData = {}, history?: History) {
  const staticData = await getInitialData();
  const asyncData = await getAsyncInitialData();
  const initialState = { ...staticData, ...initialData, ...asyncData };

  return {
    component: Container,
    props: { initialState },
  };
}
