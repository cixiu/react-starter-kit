import { IS_INITIAL_RENDER } from '../actionTypes';

export interface IsInitialRenderAction {
  type: IS_INITIAL_RENDER;
  flag: boolean;
}

// eslint-disable-next-line import/prefer-default-export
export const switchIsInitialRender = (flag: boolean): IsInitialRenderAction => {
  return {
    type: IS_INITIAL_RENDER,
    flag,
  };
};
