import { matchPath } from 'react-router-dom';
import { CommonDataItemConfig } from '../common-data/types';
import { commonDataConfig } from '../init-common-data-config/config';
import { requestCommonData } from '../common-data/helper';

// 匹配路由名称
export function matchPathname(config: CommonDataItemConfig, path?: string) {
  const { excludeRoute, includeRoute } = config;
  if (excludeRoute) {
    if (!path || !matchPath(path, { path: excludeRoute, exact: true })) {
      return true;
    }
    return false;
  }
  if (includeRoute) {
    if (path && matchPath(path, { path: includeRoute, exact: true })) {
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
    if (matchPathname(item, routerName)) {
      names.push(name);
    }
  });

  return await requestCommonData(names);
}
