import { combineReducers } from 'redux';
import count from './count';
import isInitialRender from './isInitialRender';
import userInfo, { UserInfo } from './userInfo';

const rootReducer = combineReducers({
  count,
  userInfo,
  isInitialRender,
});

export interface StoreState {
  count: number;
  userInfo: UserInfo;
  isInitialRender: boolean;
}

export default rootReducer;
