import { COUNT } from '../actionTypes';

export interface CountAction {
  type: COUNT;
  num: number;
}

// eslint-disable-next-line import/prefer-default-export
export const changeCount = (num: number): CountAction => {
  return {
    type: COUNT,
    num,
  };
};
