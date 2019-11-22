import React from 'react';
// import PropTypes from 'prop-types';
// import { hot } from 'react-hot-loader';
import queryString from 'query-string';

// 引入antd的基础样式
import 'antd/lib/style/index.less';
import StyleContext from 'isomorphic-style-loader/StyleContext';
import { Store } from 'redux';
import { StoreState } from '@store/reducers';

// const ContextType = {
//   // Enables critical path CSS rendering
//   // https://github.com/kriasoft/isomorphic-style-loader
//   insertCss: PropTypes.func.isRequired,
//   // Universal HTTP clientƒ
//   // fetch: PropTypes.func.isRequired,
//   pathname: PropTypes.string.isRequired,
//   query: PropTypes.object,
//   store: PropTypes.object,
// };

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

// @hot(module)
// class App extends React.PureComponent<IProps, any> {
//   static childContextTypes = ContextType;

//   getChildContext() {
//     return this.props.context;
//   }

//   render() {
//     // NOTE: If you need to add or modify header, footer etc. of the app,
//     // please do that inside the Layout component.
//     return React.Children.only(this.props.children);
//   }
// }

export default App;
