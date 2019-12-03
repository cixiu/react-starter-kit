import { UserInfo, UserInfoAction } from '@store/reducers/userInfo';
import { USER_INFO } from '../actionTypes';

// eslint-disable-next-line import/prefer-default-export
export const addUserInfo = (userInfo: UserInfo): UserInfoAction => {
  return {
    type: USER_INFO,
    userInfo,
  };
};
