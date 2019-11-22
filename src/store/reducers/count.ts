import * as types from '../actionTypes';

interface CountAction {
  type: string;
  num: number;
}

const count = (state = 0, action: CountAction): number => {
  // console.log(state);
  switch (action.type) {
    case types.COUNT:
      return state + action.num;
    default:
      return state;
  }
};

export default count;
