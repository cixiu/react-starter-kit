import React from 'react';
import Home from './Home';
import { changeCount } from '@store/actions/changeCount';
import { IActionContext } from '@routes/routes';

async function action(ctx: IActionContext, params: any) {
  if (ctx.store.getState().count !== 20) {
    ctx.store.dispatch(changeCount(10));
  }

  return {
    title: 'Home page',
    description: '这是首页的description',
    chunks: ['home'],
    component: <Home path={ctx.pathname} />,
  };
}

export default action;
