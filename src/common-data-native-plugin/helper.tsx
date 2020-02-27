import { CommonDataItemConfig } from '../common-data/types';
import { commonDataConfig } from '../init-common-data-config/config';
import { requestCommonData } from '../common-data/helper';

// 匹配路由名称
export function matchRouterName(config: CommonDataItemConfig, routerName?: string) {
  const { excludeRoute, includeRoute } = config;
  if (excludeRoute) {
    if (!routerName || !excludeRoute.includes(routerName)) {
      return true;
    }
    return false;
  }
  if (includeRoute) {
    if (routerName && includeRoute.includes(routerName)) {
      return true;
    }
  }
  return false;
}

/**
 * 获取所有初始异步数据
 * @param routerName native端的时候routerName为空
 */
export async function getAsyncInitialData(routerName?: string) {
  const names: string[] = [];
  commonDataConfig.items.forEach((item) => {
    const { name, url } = item;
    if (!url) {
      return;
    }
    if (matchRouterName(item, routerName)) {
      names.push(name);
    }
  });

  return await requestCommonData(names);
}
