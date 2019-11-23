import React from 'react';
import queryString from 'query-string';

// 引入antd的基础样式
import 'antd/lib/style/index.less';
import StyleContext from 'isomorphic-style-loader/StyleContext';
import { Store } from 'redux';
import { StoreState } from '@store/reducers';

export interface TContext {
  pathname: string;
  query: queryString.ParsedQuery;
  store: Store<StoreState>;
}

interface TInsertCss {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (styles: any[]): void | (() => void);
}

interface Props {
  context: TContext;
  insertCss: TInsertCss;
  children: React.ReactElement<Props> | string;
}

const App = ({ context, insertCss, children }: Props): JSX.Element => {
  return (
    <StyleContext.Provider value={{ insertCss }}>
      {React.Children.only(children)}
    </StyleContext.Provider>
  );
};

export default App;
