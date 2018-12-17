import * as types from '../actionTypes';

interface ICountAction {
  type: string;
  num: number;
}

const count = (state = 0, action: ICountAction) => {
  // console.log(state);
  switch (action.type) {
    case types.COUNT:
      return state + action.num;
    default:
      return state;
  }
};

export default count;
