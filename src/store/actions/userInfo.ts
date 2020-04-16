import { UserInfo, UserInfoAction } from '@store/reducers/userInfo';
import axios from 'axios';
import { Dispatch } from 'redux';
import { StoreState } from '@store/reducers';

import { USER_INFO } from '../actionTypes';

interface LoginData {
  username: string;
  password: string;
}

// eslint-disable-next-line import/prefer-default-export
export const addUserInfo = (userInfo: UserInfo): UserInfoAction => {
  return {
    type: USER_INFO,
    userInfo,
  };
};

export const postLogin = (data: LoginData) => async (
  dispatch: Dispatch<UserInfoAction>,
  getState: () => StoreState,
): Promise<UserInfo> => {
  const url = `/proxy/login`;
  try {
    console.log('login...');
    const res = await axios.post(url, data);
    if (res.data.code === 0) {
      dispatch(addUserInfo(res.data.data));
    }
    return Promise.resolve(res.data.data);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

export const getUserInfo = (userId: number) => async (
  dispatch: Dispatch<UserInfoAction>,
  getState: () => StoreState,
): Promise<UserInfo> => {
  const url = 'http://94.191.82.146:9002/api/user/info';
  try {
    console.log('getUserInfo...');
    const res = await axios.get(url, {
      params: {
        user_id: userId,
      },
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
