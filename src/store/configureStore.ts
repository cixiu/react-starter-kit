import {
  createStore,
  applyMiddleware,
  compose,
  Store,
  StoreEnhancer,
  AnyAction,
} from 'redux';
import thunk, { ThunkMiddleware, ThunkDispatch } from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import rootReducer, { StoreState } from './reducers';

interface ThunkExt {
  dispatch: ThunkDispatch<StoreState, undefined, AnyAction>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const composeEnhancers = (...args: any[]): StoreEnhancer<ThunkExt> => {
  return typeof window !== 'undefined' && __DEV__
    ? composeWithDevTools(...args)
    : compose(...args);
};

export type TStore = Store<StoreState> & ThunkExt;

const configureStore = (initialState: StoreState): TStore => {
  const middlewares = applyMiddleware(thunk as ThunkMiddleware<StoreState>);
  const enhancers = composeEnhancers(middlewares);
  const store = createStore(rootReducer, initialState, enhancers);
  return store;
};

export default configureStore;
