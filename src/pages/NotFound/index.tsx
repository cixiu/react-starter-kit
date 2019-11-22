import React from 'react';
import { ActionReturn } from '@routes/routes';

import NotFound from './NotFound';

const title = 'Page Not Found';

function action(): ActionReturn {
  return {
    chunks: ['not-found'],
    title,
    component: <NotFound title={title} />,
    status: 404,
  };
}

export default action;
