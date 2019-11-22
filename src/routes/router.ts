/* eslint-disable @typescript-eslint/no-explicit-any */
import UniversalRouter from 'universal-router';
import routes from '.';
import { ActionReturn } from './routes';

export default new UniversalRouter<any, ActionReturn>(routes, {
  resolveRoute(context, params) {
    if (typeof context.route.load === 'function') {
      return context.route
        .load()
        .then((action: any) => action.default(context, params));
    }
    if (typeof context.route.action === 'function') {
      return context.route.action(context, params);
    }
    return undefined;
  },
});
