import { matchPath } from 'react-router-dom';
import { CommonDataItemConfig } from '../common-data/types';
import { commonDataConfig } from '../init-common-data-config/config';
import { requestCommonData } from '../common-data/helper';

// 匹配路由名称
export function matchPathname(config: CommonDataItemConfig, path?: string) {
  const { excludePath, includeRoute: includePath } = config;
  if (excludePath) {
    if (!path || !matchPath(path, { path: excludePath, exact: true })) {
      return true;
    }
    return false;
  }
  if (includePath) {
    if (path && matchPath(path, { path: includePath, exact: true })) {
      return true;
    }
  }
  return false;
}

/**
 * 获取所有初始异步数据
 * @param path native端的时候routerName为空
 */
export async function getAsyncInitialData(path?: string) {
  const names: string[] = [];
  commonDataConfig.items.forEach((item) => {
    const { name, url } = item;
    if (!url) {
      return;
    }
    if (matchPathname(item, path)) {
      names.push(name);
    }
  });

  return await requestCommonData(names);
}
