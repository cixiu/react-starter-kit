import React from 'react';
import { ActionReturn } from '@routes/routes';

import Error from './Error';

function action(): ActionReturn {
  return {
    title: 'Error Page',
    chunks: ['error'],
    component: <Error />,
  };
}

export default action;
