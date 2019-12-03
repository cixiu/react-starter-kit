/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import express, { Express, ErrorRequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { Provider } from 'react-redux';
// import { ThunkDispatch } from 'redux-thunk';
import PrettyError from 'pretty-error';

import configureStore from '@store/configureStore';
import { ErrorPageWithoutStyle } from '@pages/Error/Error';
import errorPageStyle from '@pages/Error/Error.less';
import { getUserInfo, addUserInfo } from '@store/actions/userInfo';
import { StoreState } from '@store/reducers';
import App from './App';
import Html, { HtmlProps } from './Html';
import router from './routes/router';
import LoginRouter, { secret, cookieKey } from './middleware/login';

interface Chunks {
  [key: string]: string[];
}

let chunks: Chunks;

// 生产环境下只需要引入一次
// webpack中配置了 __DEV__ 变量
if (!__DEV__) {
  // eslint-disable-next-line global-require
  chunks = require('./chunk-manifest.json');
}

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  // send entire app down. Process manager will restart it
  process.exit(1);
});

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
// global.navigator = global.navigator || {};
// global.navigator.userAgent = global.navigator.userAgent || 'all';

const app = express();

//
// If you are using proxy from external machine, you can set TRUST_PROXY env
// Default is to trust proxy headers only from loopback interface.
// -----------------------------------------------------------------------------
const { trustProxy } = process.env;
app.set('trust proxy', trustProxy);

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/proxy/login', LoginRouter);

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res, next) => {
  let userInfo = {};
  let userId;
  try {
    const jwtToken = Buffer.from(req.cookies[cookieKey], 'base64').toString();
    console.log(`jwtToken: ${jwtToken}`);
    const decode = jwt.verify(jwtToken, secret) as { data: { userId: string } };
    console.log(decode);
    // userInfo = { ...decode.data };
    userId = decode.data.userId;
  } catch (err) {
    if (!req.cookies[cookieKey]) {
      console.log('用户暂未登录');
    } else {
      console.log(`jwt验证失败, message: ${err.message}`);
    }
    userInfo = {};
  }
  try {
    const css = new Set();

    // Enables critical path CSS rendering
    // https://github.com/kriasoft/isomorphic-style-loader
    const insertCss = (...styles: any[]): void => {
      // eslint-disable-next-line no-underscore-dangle
      styles.forEach(style => css.add(style._getCss()));
    };

    // 用户的登录信息，在登录后将用户信息加密存入 cookie 中，
    // 使用时，在从 cookie 中取出解密
    const initialState = {
      count: 10,
      userInfo,
    };

    const store = configureStore(initialState);
    if (userId) {
      // (store.dispatch as ThunkDispatch<StoreState, any, any>)(
      //   getUserInfo(+userId),
      // );
      store.dispatch(addUserInfo({ username: '你好呀' }));
    }

    // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html
    const context = {
      // insertCss,
      // The twins below are wild, be careful!
      pathname: req.path,
      query: req.query,
      store,
    };

    const route = await router.resolve(context);

    if (route.redirect) {
      res.redirect(route.status || 302, route.redirect);
      return;
    }

    const data = { ...route } as HtmlProps;
    data.children = ReactDOM.renderToString(
      <Provider store={store}>
        <App context={context} insertCss={insertCss}>
          {route.component}
        </App>
      </Provider>,
    );
    data.styles = [{ id: 'css', cssText: [...css].join('') }];

    const scripts = new Set<string>();

    if (__DEV__) {
      const chunksStr = fs.readFileSync('./build/chunk-manifest.json', 'utf8');
      chunks = JSON.parse(chunksStr);
    }

    const addChunk = (chunk: string): void => {
      if (chunks[chunk]) {
        chunks[chunk].forEach((asset: string) => scripts.add(asset));
      } else if (__DEV__) {
        throw new Error(`Chunk with name '${chunk}' cannot be found`);
      }
    };

    addChunk('client');

    if (route.chunk) {
      addChunk(route.chunk);
    }

    if (route.chunks) {
      route.chunks.forEach(addChunk);
    }

    data.scripts = Array.from(scripts);
    data.app = {
      state: store.getState(),
    };

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);

    res.status(route.status || 200);
    res.send(`<!doctype html>${html}`);
  } catch (err) {
    next(err);
  }
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

const errorRequestHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(pe.render(err));
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title="Internal Server Error"
      description={err.message}
      component=""
      // eslint-disable-next-line no-underscore-dangle
      styles={[{ id: 'css', cssText: (errorPageStyle as any)._getCss() }]}
    >
      {ReactDOM.renderToString(<ErrorPageWithoutStyle error={err} />)}
    </Html>,
  );
  res.status(err.status || 500);
  res.send(`<!doctype html>${html}`);
};

app.use(errorRequestHandler);

//
// Launch the server
// -----------------------------------------------------------------------------
// 生产环境下
if (!module.hot) {
  const PORT = 3001;
  app.listen(PORT, () => {
    console.info(`The server is running at http://localhost:${PORT}/`);
  });
}

//
// Hot Module Replacement
// -----------------------------------------------------------------------------
// 开发环境
declare const module: THotNodeModule;
interface AppExtendProps extends Express {
  hot: THot;
}
if (module.hot) {
  (app as AppExtendProps).hot = module.hot;
  module.hot.accept('./routes/router');
}

export default app;
