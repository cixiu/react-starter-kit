/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 路由配置相关的ts定义文件
 */

import { RouteContext, Route, Result } from 'universal-router';
import { Store } from 'redux';
import { TStore } from '@store/configureStore';

interface RouteChildren extends Route {
  load?: () => Promise<any>;
  children?: RouteChildren[];
}

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
  // path?: string;
  children: RouteChildren[];
  // action?: (ctx: ActionContext, params?: Params) => any;
  // load(): Promise<any>
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
