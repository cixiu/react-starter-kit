import * as types from '../actionTypes';

export interface UserInfo {
  name?: string;
  age?: number;
}

export interface UserInfoAction {
  type: string;
  userInfo: UserInfo;
}

const userInfo = (state = {}, action: UserInfoAction): UserInfo => {
  // console.log(state);
  switch (action.type) {
    case types.USER_INFO:
      return action.userInfo;
    default:
      return state;
  }
};

export default userInfo;
