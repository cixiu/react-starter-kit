import * as types from '../actionTypes';

export interface UserInfo {
  avatar?: string;
  createAt?: number;
  create_address?: string;
  create_time?: string;
  id?: number;
  username?: string;
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
