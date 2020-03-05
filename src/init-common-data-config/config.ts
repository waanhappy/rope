import { CommonDataItemConfig } from '../common-data/types';

export interface CommonDataDefaultConfig {
  items: CommonDataItemConfig[];
}

export const commonDataConfig: CommonDataDefaultConfig = {
  items: [],
};

/**
 * 配置项合并
 * @param options 新配置项
 */
export function initCommonDataConfig(options: CommonDataDefaultConfig) {
  Object.assign(commonDataConfig, options);
}
