import * as types from '../actionTypes';

interface IsInitialRenderAction {
  type: string;
  flag: boolean;
}

const isInitialRender = (
  state = true,
  action: IsInitialRenderAction,
): boolean => {
  // console.log(state);
  switch (action.type) {
    case types.IS_INITIAL_RENDER:
      return action.flag;
    default:
      return state;
  }
};

export default isInitialRender;
