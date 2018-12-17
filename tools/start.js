import fs from 'fs';
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware';
import chalk from 'chalk';
import dotenv from 'dotenv';
import webpackConfig from './webpack/webpack.config';
import run, { format } from './run';
import clean from './clean';

const envExamplePath = path.join(__dirname, '../.env.example');
const envDevPath = path.join(__dirname, '../.env.dev');

if (fs.existsSync(envDevPath)) {
  console.info(
    `${format(new Date())} ⚙  ${chalk.magentaBright(
      'Using .env.dev file',
    )}`,
  );
  dotenv.config({ path: envDevPath });
} else {
  // 如果没有 .env.dev 文件， 那么就使用 .env.example 文件作为配置文件
  console.info(
    `${format(new Date())} ⚙️  ${chalk.magentaBright(
      'Using .env.example file',
    )}`,
  );
  dotenv.config({ path: envExamplePath });
}

// https://webpack.js.org/configuration/watch/#watchoptions
const watchOptions = {
  // Watching may not work with NFS and machines in VirtualBox
  // Uncomment next line if it is your case (use true or interval in milliseconds)
  // poll: true,
  // Decrease CPU or memory usage in some file systems
  ignored: /node_modules/,
};

// 控制终端的 HMR log 是否显示
const hotOption = {
  info: false,
};

function createCompilationPromise(name, compiler, config) {
  return new Promise((resolve, reject) => {
    let timeStart = new Date();
    compiler.hooks.compile.tap(name, () => {
      timeStart = new Date();
      console.info(`${format(timeStart)} 📦 Compiling '${name}'...`);
    });

    compiler.hooks.done.tap(name, stats => {
      const timeEnd = new Date();
      const time = timeEnd.getTime() - timeStart.getTime();
      if (stats.hasErrors()) {
        console.info(stats.toString(config.stats));
        console.info(
          `${format(timeEnd)} ❌ Failed to compile '${name}' after ${time} ms`,
        );
        reject(new Error('Compilation failed!'));
      } else {
        console.info(
          `${format(timeEnd)} ✨ ${chalk.greenBright(
            `Finished '${name}' compilation after ${time} ms`,
          )}`,
        );
        resolve(stats);
      }
    });
  });
}

let server;

/**
 * Launches a development web server with "live reload" functionality -
 * synchronizing URLs, interactions and code changes across multiple devices.
 */
async function start() {
  if (server) return server;
  server = express();
  server.use(errorOverlayMiddleware());
  server.use(express.static(path.resolve(__dirname, '../public')));

  // Configure client-side hot module replacement
  const clientConfig = webpackConfig.find(config => config.name === 'client');
  clientConfig.entry.client = ['./tools/lib/webpackHotDevClient']
    .concat(clientConfig.entry.client)
    .sort((a, b) => b.includes('polyfill') - a.includes('polyfill'));
  clientConfig.output.filename = clientConfig.output.filename.replace(
    'chunkhash',
    'hash',
  );
  clientConfig.output.chunkFilename = clientConfig.output.chunkFilename.replace(
    'chunkhash',
    'hash',
  );
  clientConfig.module.rules = clientConfig.module.rules.filter(
    x => x.loader !== 'null-loader',
  );
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

  // Configure server-side hot module replacement
  const serverConfig = webpackConfig.find(config => config.name === 'server');
  serverConfig.output.hotUpdateMainFilename = 'updates/[hash].hot-update.json';
  serverConfig.output.hotUpdateChunkFilename =
    'updates/[id].[hash].hot-update.js';
  serverConfig.module.rules = serverConfig.module.rules.filter(
    x => x.loader !== 'null-loader',
  );
  serverConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

  // Configure compilation
  await run(clean);
  const multiCompiler = webpack(webpackConfig);
  const clientCompiler = multiCompiler.compilers.find(
    compiler => compiler.name === 'client',
  );
  const serverCompiler = multiCompiler.compilers.find(
    compiler => compiler.name === 'server',
  );
  const clientPromise = createCompilationPromise(
    'client',
    clientCompiler,
    clientConfig,
  );
  const serverPromise = createCompilationPromise(
    'server',
    serverCompiler,
    serverConfig,
  );

  // https://github.com/webpack/webpack-dev-middleware
  server.use(
    webpackDevMiddleware(clientCompiler, {
      publicPath: clientConfig.output.publicPath,
      logLevel: 'silent',
      watchOptions,
    }),
  );

  // https://github.com/glenjamin/webpack-hot-middleware
  server.use(webpackHotMiddleware(clientCompiler, { log: false }));

  let appPromise;
  let appPromiseResolve;
  let appPromiseIsResolved = true;
  serverCompiler.hooks.compile.tap('server', () => {
    if (!appPromiseIsResolved) return;
    appPromiseIsResolved = false;
    // eslint-disable-next-line no-return-assign
    appPromise = new Promise(resolve => (appPromiseResolve = resolve));
  });

  let app;
  server.use((req, res) => {
    appPromise
      .then(() => app.handle(req, res))
      .catch(error => console.error(error));
  });

  function checkForUpdate(fromUpdate) {
    const hmrPrefix = '[\x1b[35mHMR\x1b[0m] ';
    if (!app.hot) {
      throw new Error(`${hmrPrefix}Hot Module Replacement is disabled.`);
    }
    if (app.hot.status() !== 'idle') {
      return Promise.resolve();
    }
    return app.hot
      .check(true)
      .then(updatedModules => {
        if (!updatedModules) {
          if (fromUpdate && hotOption.info) {
            console.info(`${hmrPrefix}Update applied.`);
          }
          return;
        }
        if (updatedModules.length === 0 && hotOption.info) {
          console.info(`${hmrPrefix}Nothing hot updated.`);
        } else {
          if (hotOption.info) {
            console.info(`${hmrPrefix}Updated modules:`);
          }
          updatedModules.forEach(moduleId => {
            if (hotOption.info) {
              console.info(`${hmrPrefix} - ${moduleId}`);
            }
          });
          checkForUpdate(true);
        }
      })
      .catch(error => {
        if (['abort', 'fail'].includes(app.hot.status())) {
          console.warn(`${hmrPrefix}Cannot apply update.`);
          delete require.cache[require.resolve('../build/server')];
          // eslint-disable-next-line global-require, import/no-unresolved
          app = require('../build/server').default;
          console.warn(`${hmrPrefix}App has been reloaded.`);
        } else {
          console.warn(
            `${hmrPrefix}Update failed: ${error.stack || error.message}`,
          );
        }
      });
  }

  serverCompiler.watch(watchOptions, (error, stats) => {
    if (app && !error && !stats.hasErrors()) {
      const startTimeStamp = Date.now();
      checkForUpdate().then(() => {
        const endTimeStamp = new Date();
        console.info(
          `${format(endTimeStamp)} ${chalk.bgMagenta(
            '[HMR]',
          )} 🔥 Update finished ${+endTimeStamp - startTimeStamp}ms`,
        );
        appPromiseIsResolved = true;
        appPromiseResolve();
      });
    }
  });

  // Wait until both client-side and server-side bundles are ready
  await clientPromise;
  await serverPromise;

  const timeStart = new Date();
  console.info(`${format(timeStart)} 🚗 Launching server...`);

  // Load compiled src/server.js as a middleware
  // eslint-disable-next-line global-require, import/no-unresolved
  app = require('../build/server').default;
  appPromiseIsResolved = true;
  appPromiseResolve();

  server.listen(3000, () => {
    console.info(
      `${format(new Date())} 🚀 ${chalk.greenBright(
        `The server is running at http://localhost:${3000}/`,
      )}`,
    );
  });

  const timeEnd = new Date();
  const time = timeEnd.getTime() - timeStart.getTime();
  console.info(`${format(timeEnd)} ⏰ Server launched after ${time} ms`);
  return server;
}

export default start;
