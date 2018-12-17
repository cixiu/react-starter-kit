import { COUNT } from '../actionTypes';

export const changeCount = (num: number) => {
  return {
    type: COUNT,
    num,
  }
};
