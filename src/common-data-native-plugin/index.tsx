import { getInitialData } from '../common-data/helper';
import { Container } from '../common-data/container';
import { getAsyncInitialData } from './helper';

// 增加一个注入navigation的事件订阅
/**
 * commonDataPlugin
 * @param initialData 初始数据
 * @param autoInitData 页面跳转的时候是否自动注入数据
 *
 * autoInitData为true的时候需要，调用 tumbler.trigger('useNavigator', navigator)注入navigator
 *  让commonData监听route变化
 */
export default async function commonDataNativePlugin(initialData = {}, autoInitData: boolean = true) {
  const staticData = await getInitialData();
  const asyncData = await getAsyncInitialData();
  const initialState = { ...staticData, ...initialData, ...asyncData };

  return {
    component: Container,
    props: { initialState },
  };
}
