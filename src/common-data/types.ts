import { CommonDataDefaultConfig } from './../init-common-data-config/config';
import { RequestOptions } from '@webtanzhi/utils/es/request/types';

export interface CommonDataItemConfig {
  name: string;
  url?: string;
  options?: RequestOptions;
  ssr?: boolean;
  handleData?: (res: any) => any;
  /**
   * 请求时的错误 在onError 处理
   * 如果不配置，直接返回 {}，并在控制台打印错误信息
   */
  onError?: (
    e: Error & {
      data: any;
      response: any;
      hasBeenLogin: boolean;
    },
  ) => any;
  initialData?:  (() => object) | object;
  /**
   * excludePath 和 includePath 二选一、也可以都不配置
   *  * 如果两个都配置，includePath 失效
   *  * excludePath 被排除的页面，跳转至非被排除的页面时（如果还未加载）会发请求
   *  * includePath 包含的页面，跳转至被包含的页面时（如果还未加载）会发请求
   *  * 配置 excludePath = [] 效果等同于 excludePath = undefined
   *  * 配置 includePath = [] 表示所有页面均未被包含，所有页面均不会主动发起请求
   */
  excludePath?: string[];
  includePath?: string[];
  excludeRoute?: string[];
  includeRoute?: string[];
}

export type RefreshTarget = string[] | string | Promise<object>;

export interface CommonData {
  [key: string]: any;
  /**
   * 刷新公共数据
   * @param target commonDataConfig 中配置的name、需要刷新的数据
   * @param preload 自定义数据
   *    typeof target === string
   *        不配置data 调用 commonDataConfig 配置的 name = tagert 接口
   *        配置 data 直接将 commonData 中的 target 的值设置为data
   *    typeof target === string[]
   *        同时调用 commonDataConfig 配置的 name in tagert 接口
   *        data 失效
   *    typeof target === function
   *        promise的返回结果会被展开到commonData中
   */
  refresh: (target?: RefreshTarget, preload?: object) => Promise<void>;
}

export interface CommonDataPluginOptions {
  items: CommonDataDefaultConfig['items'];
  initialData?: any;
}

export type CommonDataState = Omit<CommonData, 'refresh'>;
