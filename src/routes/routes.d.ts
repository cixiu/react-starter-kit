/**
 * 路由配置相关的ts定义文件
 */

import { ActionContext, Route, Params } from 'universal-router';
import { Store } from 'redux';

interface IRouteChildren extends Route {
  load?: () => Promise<any>;
  children?: IRouteChildren[];
}

/**
 * action函数的ctx参数
 */
export interface IActionContext extends ActionContext<any> {
  store: Store;
}

/**
 * 主路由配置
 */
export interface IRoutes extends Route {
  path?: string;
  children: IRouteChildren[];
  action?: (ctx: IActionContext, params?: Params) => any;
}
