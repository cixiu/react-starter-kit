import React from 'react';
import Error from './Error';

function action() {
  return {
    title: 'Error Page',
    chunks: ['error'],
    component: <Error />,
  };
}

export default action;
