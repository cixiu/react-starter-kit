import { UserInfo, UserInfoAction } from '@store/reducers/userInfo';
import axios from 'axios';
import { Dispatch } from 'redux';
import { StoreState } from '@store/reducers';

import { USER_INFO } from '../actionTypes';

// eslint-disable-next-line import/prefer-default-export
export const addUserInfo = (userInfo: UserInfo): UserInfoAction => {
  return {
    type: USER_INFO,
    userInfo,
  };
};

export const getUserInfo = (userId: number) => async (
  dispatch: Dispatch<UserInfoAction>,
  getState: () => StoreState,
): Promise<UserInfo> => {
  const url = `/proxy/login`;
  try {
    console.log('loggggggggggggggg');
    const res = await axios.post(url, {
      user_id: userId,
    });
    if (res.data.code === 0) {
      dispatch(addUserInfo(res.data.data));
    }
    return Promise.resolve(res.data.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};
