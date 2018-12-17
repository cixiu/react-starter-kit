import {
  createStore,
  applyMiddleware,
  compose,
  Store,
  StoreEnhancer,
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import rootReducer from './reducers';

const composeEnhancers = (...args: any[]): StoreEnhancer<any> => {
  return typeof window !== 'undefined' && __DEV__
    ? composeWithDevTools(...args)
    : compose(...args);
};

const configureStore = (initialState: any): Store => {
  const middlewares = applyMiddleware(thunkMiddleware);
  const enhancers = composeEnhancers(middlewares);
  const store = createStore(rootReducer, initialState, enhancers);
  return store;
};

export default configureStore;
