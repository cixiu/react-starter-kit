import React from 'react';
// import PropTypes from 'prop-types';
// import { hot } from 'react-hot-loader';
// 引入antd的基础样式
import 'antd/lib/style/index.less';
import StyleContext from 'isomorphic-style-loader/StyleContext';

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

interface IProps {
  context: any;
  insertCss: any;
  children: React.ReactElement<any> | string;
}

const App = ({context, insertCss, children}: IProps) => {
  return (
    <StyleContext.Provider value={{insertCss}}>
      {React.Children.only(children)}
    </StyleContext.Provider>
  )
}

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
