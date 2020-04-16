/* eslint-disable @typescript-eslint/no-explicit-any */
import UniversalRouter from 'universal-router';
import routes from '.';
import { ActionReturn, TRoute } from './routes';

export default new UniversalRouter<any, ActionReturn>(routes, {
  resolveRoute(context, params) {
    // you can define this option to work with routes in declarative manner.
    // By default the router calls the action method of matched route.
    const { load } = context.route as TRoute;
    if (typeof load === 'function') {
      return load().then((action: any) => action.default(context, params));
    }
    if (typeof context.route.action === 'function') {
      return context.route.action(context, params);
    }
    return undefined;
  },
});
