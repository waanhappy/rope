import { request, isFunction } from '@webtanzhi/utils';
import { commonDataConfig } from '../init-common-data-config/config';
import { CommonDataItemConfig, CommonData } from './types';

const _DEV_ = process.env.NODE_ENV === 'development';

/**
 * 初始化数据,只获取initialData
 * @param { object } initialData 初始化数据，如果已有数据将不再调用
 */
export async function getInitialData() {
  const initialData: Partial<CommonData> = {};
  const promises = commonDataConfig.items.map(async (config) => {
    const { name, initialData: initD } = config;
    if (initD) {
      if (isFunction(initD)) {
        initialData[name] = await (initD as Function)();
      } else {
        initialData[name] = initD;
      }
    }
  });
  await Promise.all(promises);
  return initialData;
}

/**
 * 根据单个config获取数据
 * @param config 配置项
 * @param ctx 服务端ctx
 */
async function handleConfigRequest(config: CommonDataItemConfig, ctx?: any) {
  const { handleData, url, onError, name } = config;
  try {
    if (url) {
      const data = await request(config.url, {quiet: true, isGlobal: true, ctx, ...config.options});
      return { [name]: handleData ? handleData(data) : data };
    }
    return {};
  } catch (e) {
    if (_DEV_) {
      console.log(e);
    }
    if (onError) {
      return { [name]: onError(e) };
    }
    return {};
  }
}

function getConfig(name: string) {
  return commonDataConfig.items.find((config) => config.name === name);
}

async function assignPromiseData<T>(promises: Promise<T>[]) {
  const list = (await Promise.all(promises)).filter((it) => it);
  if (!list.length) {
    return {};
  }
  return Object.assign.apply([], list);
}

/**
 * 刷新公共数据
 * @param name name
 */
export async function requestCommonData(name: string | string[]) {
  // 传入target只获取target的数据
  if (name) {
    const targets = Array.isArray(name) ? name : [name];
    const promises: Promise<any>[] = [];
    targets.forEach((n) => {
      promises.push(handleConfigRequest(getConfig(n)));
    });

    return await assignPromiseData(promises);
  }
  return undefined;
}
