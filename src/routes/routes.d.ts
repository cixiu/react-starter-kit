/**
 * 路由配置相关的ts定义文件
 */

import { RouteContext, Route } from 'universal-router';
import { TStore } from '@store/configureStore';

/**
 * action函数的ctx参数
 */
export interface ActionContext extends RouteContext<any> {
  store: TStore;
}

/**
 * 主路由配置
 */
export interface TRoute extends Route {
  children?: TRoute[];
  load?: () => Promise<any>;
}

export interface ActionReturn {
  title?: string;
  description?: string;
  chunks?: string[];
  chunk?: string;
  component: JSX.Element | string;
  // redirect route path
  redirect?: string;
  // response status code
  status?: number;
}
