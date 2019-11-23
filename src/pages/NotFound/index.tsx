import React from 'react';
import { ActionReturn, ActionContext } from '@routes/routes';
import { changeCount } from '@store/actions/changeCount';

import NotFound from './NotFound';

const title = 'Page Not Found';

function action(ctx: ActionContext): ActionReturn {
  ctx.store.dispatch(changeCount(10));
  return {
    chunks: ['not-found'],
    title,
    component: <NotFound title={title} />,
    status: 404,
  };
}

export default action;
