import {
  createStore,
  applyMiddleware,
  compose,
  Store,
  StoreEnhancer,
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import rootReducer, { StoreState } from './reducers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const composeEnhancers = (...args: any[]): StoreEnhancer<any> => {
  return typeof window !== 'undefined' && __DEV__
    ? composeWithDevTools(...args)
    : compose(...args);
};

const configureStore = (initialState: StoreState): Store<StoreState> => {
  const middlewares = applyMiddleware(thunkMiddleware);
  const enhancers = composeEnhancers(middlewares);
  const store = createStore(rootReducer, initialState, enhancers);
  return store;
};

export default configureStore;
