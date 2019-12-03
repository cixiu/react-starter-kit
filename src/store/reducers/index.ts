import { combineReducers } from 'redux';
import count from './count';
import userInfo, { UserInfo } from './userInfo';

const rootReducer = combineReducers({
  count,
  userInfo,
});

export interface StoreState {
  count: number;
  userInfo: UserInfo;
}

export default rootReducer;
