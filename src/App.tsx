import { hot } from 'react-hot-loader/root';
import { setConfig } from 'react-hot-loader';
import React from 'react';
import queryString from 'query-string';

import StyleContext from 'isomorphic-style-loader/StyleContext';
import { Store } from 'redux';
import { StoreState } from '@store/reducers';

if (__DEV__) {
  // 开发环境下直接引用 antd.css 或者 antd.less 样式文件
  // eslint-disable-next-line global-require
  require('antd/dist/antd.less');
} else {
  // 生产环境下进行分包加载，先加载基础样式
  // eslint-disable-next-line global-require
  require('antd/lib/style/index.less');
}

setConfig({
  reloadHooks: false,
  showReactDomPatchNotification: false,
});

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

export default hot(App);
