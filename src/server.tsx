import fs from 'fs';
import path from 'path';
import express, { Express, ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { Provider } from 'react-redux';
import PrettyError from 'pretty-error';

// import PrettyError from 'pretty-error';
import App from './App';
import Html from './Html';
import configureStore from '@store/configureStore';
import { ErrorPageWithoutStyle } from '@pages/Error/Error';
import errorPageStyle from '@pages/Error/Error.less';
import router from './routes/router';

let chunks: any;

// 生产环境下只需要引入一次
if (!__DEV__) {
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
const trustProxy = process.env.trustProxy;
app.set('trust proxy', trustProxy);

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res, next) => {
  try {
    const css = new Set();

    // Enables critical path CSS rendering
    // https://github.com/kriasoft/isomorphic-style-loader
    const insertCss = (...styles: any[]) => {
      styles.forEach(style => css.add(style._getCss()));
    };

    const initialState = {
      count: 10,
    };

    const store = configureStore(initialState);

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

    const data = { ...route };
    data.children = ReactDOM.renderToString(
      <Provider store={store}>
        <App context={context} insertCss={insertCss}>
          {route.component}
        </App>
      </Provider>,
    );
    data.styles = [{ id: 'css', cssText: [...css].join('') }];

    const scripts = new Set();

    if (__DEV__) {
      const chunksStr = fs.readFileSync('./build/chunk-manifest.json', 'utf8');
      chunks = JSON.parse(chunksStr);
    }

    const addChunk = (chunk: any) => {
      if (chunks[chunk]) {
        chunks[chunk].forEach((asset: any) => scripts.add(asset));
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
declare const module: IHotNodeModule;
interface IAppExtendProps extends Express {
  hot: IHot;
}
if (module.hot) {
  (app as IAppExtendProps).hot = module.hot;
  module.hot.accept('./routes/router');
}

export default app;
