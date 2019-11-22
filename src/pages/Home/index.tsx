import React from 'react';
import { changeCount } from '@store/actions/changeCount';
import { ActionContext, ActionReturn } from '@routes/routes';

import Home from './Home';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function action(ctx: ActionContext, params: any): Promise<ActionReturn> {
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
