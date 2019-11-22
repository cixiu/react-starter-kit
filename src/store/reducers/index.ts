import { combineReducers } from 'redux';
import count from './count';

const rootReducer = combineReducers({
  count,
});

export interface StoreState {
  count: number;
}

export default rootReducer;
