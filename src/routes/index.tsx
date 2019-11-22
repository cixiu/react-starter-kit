import React from 'react';
import { TRoute } from './routes';
// import { Route } from 'universal-router';

// The top-level (parent) route
const routes: TRoute = {
  path: '',
  // Keep in mind, routes are evaluated in order
  children: [
    {
      path: '',
      load: () => import(/* webpackChunkName: 'home' */ '@pages/Home'),
    },
    // Wildcard routes, e.g. { path: '(.*)', ... } (must go last)
    {
      path: '(.*)',
      load: () => import(/* webpackChunkName: 'not-found' */ '@pages/NotFound'),
    },
  ],

  async action({ next }) {
    // Execute each child route until one of them return the result
    const route = await next();

    // 防止断开连接后，HMR自动连接导致后台程序出现App组件需要一个ReactElement的props的warning
    if (!route) {
      console.log('waiting for refresh browser...');
      return { component: <div /> };
    }

    // Provide default values for title, description etc.
    route.title = `${route.title || 'Untitled Page'} - www.reactstarterkit.com`;
    route.description = route.description || '';

    return route;
  },
};

// The error page is available by permanent url for development mode
if (__DEV__) {
  routes.children!.unshift({
    path: '/error',
    // action: require('../pages/Error').default,
    load: () => import(/* webpackChunkName: 'error' */ '@pages/Error'),
  });
}

export default routes;
