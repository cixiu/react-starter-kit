import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import tsImportPluginFactory from 'ts-import-plugin';
import autoprefixer from 'autoprefixer';
import WebpackAssetsManifest from 'webpack-assets-manifest';
import nodeExternals from 'webpack-node-externals';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import WriteFilePlugin from 'write-file-webpack-plugin';
import ExtractCssChunks from 'extract-css-chunks-webpack-plugin';
import dotenv from 'dotenv';
// import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
// import notifier from 'node-notifier';
// import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import overrideRules from '../lib/overrideRules';
import pkg from '../../package.json';

// 跟目录
const ROOT_DIR = path.resolve(__dirname, '../../');
const resolvePath = (...args) => path.resolve(ROOT_DIR, ...args);
const SRC_DIR = resolvePath('src');
const BUILD_DIR = resolvePath('build');

const isDebug = !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose');
const isAnalyze =
  process.argv.includes('--analyze') || process.argv.includes('--analyse');

const envExamplePath = path.join(__dirname, '../.env.example');
// const envDevPath = path.join(__dirname, '../.env.dev');
const envProdPath = path.join(__dirname, '../.env.production');

if (!isDebug) {
  if (fs.existsSync(envProdPath)) {
    console.log('正在使用 .env.production 文件来配置环境变量');
    dotenv.config({ path: envProdPath });
  } else {
    // 如果没有 .env.production 文件， 那么就使用 .env.example 文件作为配置文件
    console.log('正在使用 .env.example 文件来配置环境变量');
    dotenv.config({ path: envExamplePath });
  }
}

const reScript = /\.(js|jsx|mjs|ts|tsx)$/;
const reStyle = /\.(css|less|styl|scss|sass|sss)$/;
const reImage = /\.(bmp|gif|jpg|jpeg|png|svg)$/;
const staticAssetName = isDebug
  ? '[path][name].[ext]?[hash:8]'
  : '[hash:8].[ext]';

// CSS Nano options http://cssnano.co/
const minimizeCssOptions = {
  discardComments: { removeAll: true },
};

//
// Common configuration chunk to be used for both
// client-side (client.js) and server-side (server.js) bundles
// -----------------------------------------------------------------------------

const config = {
  context: ROOT_DIR,

  mode: isDebug ? 'development' : 'production',

  output: {
    path: resolvePath(BUILD_DIR),
    publicPath: '/',
    pathinfo: isVerbose,
    filename: isDebug
      ? 'static/js/[name].js'
      : 'static/js/[name].[chunkhash:8].js',
    chunkFilename: isDebug
      ? 'static/js/[name].chunk.js'
      : 'static/js/[name].[chunkhash:8].chunk.js',
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts', '.json'],
    alias: {
      '@': resolvePath('src'),
      '@store': resolvePath('src/store'),
      '@pages': resolvePath('src/pages'),
      '@components': resolvePath('src/components'),
      '@api': resolvePath('src/api'),
    },
    // Allow absolute paths in imports, e.g. import Button from 'components/Button'
    // Keep in sync with .flowconfig and .eslintrc
    modules: ['node_modules', 'src'],
  },

  module: {
    // Make missing exports an error instead of warning
    strictExportPresence: true,

    rules: [
      {
        test: /\.(ts|tsx)$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        exclude: [resolvePath('node_modules')],
      },
      // Rules for JS / JSX
      {
        test: /\.(ts|tsx)$/,
        exclude: [resolvePath('node_modules')],
        use: [
          // {
          //   loader: 'babel-loader',
          //   options: {
          //     babelrc: true,
          //     plugins: [
          //       // 'react-hot-loader/babel',
          //       '@babel/plugin-syntax-dynamic-import',
          //       // 'transform-runtime',
          //     ],
          //   },
          // },
          {
            loader: 'ts-loader',
            options: {
              // ts-loader配合fork-ts-checker-webpack-plugin插件获取完全的类型检查来加快编译的速度
              transpileOnly: true,
              getCustomTransformers: () => ({
                before: [
                  tsImportPluginFactory({
                    libraryName: 'antd',
                    // libraryDirectory: 'es',
                    // style: 'css',
                    style: name => `${name}/style/index.less`,
                  }),
                ],
              }),
              compilerOptions: {
                module: 'es2015',
              },
            },
          },
        ],
      },

      // Rules for Style Sheets
      {
        test: reStyle,
        exclude: /[\\/]node_modules[\\/].*antd/,
        rules: [
          // Convert CSS into JS module
          {
            issuer: { not: [reStyle] },
            use: 'isomorphic-style-loader',
          },

          // Process external/third-party styles
          {
            exclude: SRC_DIR,
            loader: 'css-loader',
            options: {
              sourceMap: isDebug,
              minimize: isDebug ? false : minimizeCssOptions,
            },
          },

          // Process internal/project styles (from src folder)
          {
            include: SRC_DIR,
            // loader: 'css-loader',
            loader: 'css-loader',
            options: {
              // CSS Loader https://github.com/webpack/css-loader
              importLoaders: 1,
              sourceMap: isDebug,
              // CSS Modules https://github.com/css-modules/css-modules
              modules: true,
              localIdentName: isDebug
                ? '[name]-[local]-[hash:base64:5]'
                : '[hash:base64:5]',
              // CSS Nano http://cssnano.co/
              minimize: isDebug ? false : minimizeCssOptions,
            },
          },

          // Apply PostCSS plugins including autoprefixer
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                autoprefixer({
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 9', // React doesn't support IE8 anyway
                  ],
                  flexbox: 'no-2009',
                }),
              ],
            },
          },

          // Compile Less to CSS
          // https://github.com/webpack-contrib/less-loader
          // Install dependencies before uncommenting: yarn add --dev less-loader less
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            },
          },

          // Compile Sass to CSS
          // https://github.com/webpack-contrib/sass-loader
          // Install dependencies before uncommenting: yarn add --dev sass-loader node-sass
          // {
          //   test: /\.(scss|sass)$/,
          //   loader: 'sass-loader',
          // },
        ],
      },

      // Rules for images
      {
        test: reImage,
        loader: 'url-loader',
        options: {
          limit: 4096,
          name: 'static/images/[name].[ext]?[hash]',
        },
      },

      // Convert plain text into JS module
      {
        test: /\.txt$/,
        loader: 'raw-loader',
      },

      // Convert Markdown into HTML
      {
        test: /\.md$/,
        loader: path.resolve(__dirname, './lib/markdown-loader.js'),
      },

      // Return public URL for all assets unless explicitly excluded
      // DO NOT FORGET to update `exclude` list when you adding a new loader
      {
        exclude: [reScript, reStyle, reImage, /\.json$/, /\.txt$/, /\.md$/],
        loader: 'file-loader',
        options: {
          name: 'static/[name].[ext]',
        },
      },

      // Exclude dev modules from production build
      ...(isDebug
        ? []
        : [
            {
              test: resolvePath(
                'node_modules/react-deep-force-update/lib/index.js',
              ),
              loader: 'null-loader',
            },
          ]),
    ],
  },

  // Don't attempt to continue if there are any errors.
  bail: !isDebug,

  cache: isDebug,

  // Specify what bundle information gets displayed
  // https://webpack.js.org/configuration/stats/
  stats: {
    cached: isVerbose,
    cachedAssets: isVerbose,
    chunks: isVerbose,
    chunkModules: isVerbose,
    colors: true,
    hash: isVerbose,
    modules: isVerbose,
    reasons: isDebug,
    timings: true,
    version: isVerbose,
  },

  // Choose a developer tool to enhance debugging
  // https://webpack.js.org/configuration/devtool/#devtool
  devtool: isDebug ? 'eval-source-map' : 'source-map',
};

//
// Configuration for the client-side bundle (client.js)
// -----------------------------------------------------------------------------

const clientConfig = {
  ...config,

  name: 'client',
  target: 'web',

  entry: {
    client: ['@babel/polyfill', './src/client.tsx'],
  },

  plugins: [
    new WriteFilePlugin(),
    new ExtractCssChunks({
      filename: isDebug
        ? 'static/css/[name].css'
        : 'static/css/[name].[chunkhash:8].css',
      chunkFilename: isDebug
        ? 'static/css/[name].chunk.css'
        : 'static/css/[name].[chunkhash:8].chunk.css',
      hot: isDebug && true,
    }),
    // 以一个单独的进程来运行ts类型检查和lint来加快编译速度，配合ts-loader使用
    // new ForkTsCheckerWebpackPlugin({
    //   async: false,
    //   watch: [resolvePath('src'), resolvePath('server')],
    //   tsconfig: resolvePath('tsconfig.json'),
    //   tslint: resolvePath('tslint.json')
    // }),
    new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]),
    // Define free variables
    // https://webpack.js.org/plugins/define-plugin/
    new webpack.DefinePlugin({
      'process.env.BROWSER': true,
      __DEV__: isDebug,
    }),

    // Emit a file with assets paths
    // https://github.com/webdeveric/webpack-assets-manifest#options
    new WebpackAssetsManifest({
      output: `${BUILD_DIR}/asset-manifest.json`,
      publicPath: true,
      writeToDisk: true,
      customize: ({ key, value }) => {
        // You can prevent adding items to the manifest by returning false.
        if (key.toLowerCase().endsWith('.map')) return false;
        return { key, value };
      },
      done: (manifest, stats) => {
        // Write chunk-manifest.json.json
        const chunkFileName = `${BUILD_DIR}/chunk-manifest.json`;
        try {
          const fileFilter = file => !file.endsWith('.map');
          const addPath = file => manifest.getPublicPath(file);
          const chunkFiles = stats.compilation.chunkGroups.reduce((acc, c) => {
            acc[c.name] = [
              ...(acc[c.name] || []),
              ...c.chunks.reduce(
                (files, cc) => [
                  ...files,
                  ...cc.files.filter(fileFilter).map(addPath),
                ],
                [],
              ),
            ];
            return acc;
          }, Object.create(null));
          fs.writeFileSync(chunkFileName, JSON.stringify(chunkFiles, null, 2));
        } catch (err) {
          console.error(`ERROR: Cannot write ${chunkFileName}: `, err);
          if (!isDebug) process.exit(1);
        }
      },
    }),

    ...(isDebug
      ? []
      : [
          // Webpack Bundle Analyzer
          // https://github.com/th0r/webpack-bundle-analyzer
          ...(isAnalyze ? [new BundleAnalyzerPlugin()] : []),
        ]),
  ],

  // Move modules that occur in multiple entry chunks to a new entry chunk (the commons chunk).
  optimization: {
    runtimeChunk: {
      name: 'runtime',
    },
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'initial',
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
        },
      },
    },
  },

  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  // https://webpack.js.org/configuration/node/
  // https://github.com/webpack/node-libs-browser/tree/master/mock
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
};

//
// Configuration for the server-side bundle (server.js)
// -----------------------------------------------------------------------------

const serverConfig = {
  ...config,

  name: 'server',
  target: 'node',

  entry: {
    server: ['@babel/polyfill', './src/server.tsx'],
  },

  output: {
    ...config.output,
    path: BUILD_DIR,
    filename: '[name].js',
    chunkFilename: 'chunks/[name].js',
    libraryTarget: 'commonjs2',
  },

  // Webpack mutates resolve object, so clone it to avoid issues
  // https://github.com/webpack/webpack/issues/4817
  resolve: {
    ...config.resolve,
  },

  module: {
    ...config.module,

    rules: overrideRules(config.module.rules, rule => {
      // Override babel-preset-env configuration for Node.js
      if (rule.loader === 'babel-loader') {
        return {
          ...rule,
          options: {
            ...rule.options,
            presets: rule.options.presets.map(
              preset =>
                preset[0] !== '@babel/preset-env'
                  ? preset
                  : [
                      '@babel/preset-env',
                      {
                        targets: {
                          node: pkg.engines.node.match(/(\d+\.?)+/)[0],
                        },
                        modules: false,
                        useBuiltIns: false,
                        debug: false,
                      },
                    ],
            ),
          },
        };
      }

      // Override paths to static assets
      if (
        rule.loader === 'file-loader' ||
        rule.loader === 'url-loader' ||
        rule.loader === 'svg-url-loader'
      ) {
        return {
          ...rule,
          options: {
            ...rule.options,
            emitFile: false,
          },
        };
      }

      return rule;
    }),
  },

  externals: [
    './chunk-manifest.json',
    './asset-manifest.json',
    nodeExternals({
      whitelist: [reStyle, reImage],
    }),
  ],

  plugins: [
    new WriteFilePlugin(),
    // Define free variables
    // https://webpack.js.org/plugins/define-plugin/
    new webpack.DefinePlugin({
      'process.env.BROWSER': false,
      __DEV__: isDebug,
    }),

    // Adds a banner to the top of each generated chunk
    // https://webpack.js.org/plugins/banner-plugin/
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
    }),
  ],

  // Do not replace node globals with polyfills
  // https://webpack.js.org/configuration/node/
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
  },
};

// clientConfig.module.rules[0].options.plugins = [
//   ...clientConfig.module.rules[0].options.plugins,
//   ['import', { libraryName: 'antd', style: 'css' }],
// ];

// clientConfig.module.rules[1].use[1].options = {
//   // ts-loader配合fork-ts-checker-webpack-plugin插件获取完全的类型检查来加快编译的速度
//   transpileOnly: true,
//   getCustomTransformers: () => ({
//     before: [
//       tsImportPluginFactory({
//         libraryName: 'antd',
//         // libraryDirectory: 'es',
//         style: 'css',
//       }),
//     ],
//   }),
// };

clientConfig.module.rules.splice(2, 0, {
  test: /\.(css|less)$/,
  include: /[\\/]node_modules[\\/].*antd/,
  use: [
    ExtractCssChunks.loader,
    // fallback: 'style-loader',
    {
      loader: 'css-loader',
    },
    {
      loader: 'less-loader',
      options: {
        javascriptEnabled: true,
      },
    },
  ],
});

serverConfig.module.rules.splice(2, 0, {
  test: /\.(css|less)$/,
  include: /[\\/]node_modules[\\/].*antd/,
  use: [
    {
      loader: 'css-loader/locals',
    },
    {
      loader: 'less-loader',
      options: {
        javascriptEnabled: true,
      },
    },
  ],
});

export default [clientConfig, serverConfig];
