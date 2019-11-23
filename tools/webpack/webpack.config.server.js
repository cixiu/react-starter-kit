import webpack from 'webpack';
import WriteFilePlugin from 'write-file-webpack-plugin';
import nodeExternals from 'webpack-node-externals';

import webpackBaseConfig, {
  isDebug,
  BUILD_DIR,
  reStyle,
  reImage,
} from './webpack.config.base';
import overrideRules from '../lib/overrideRules';
import pkg from '../../package.json';

const serverConfig = {
  ...webpackBaseConfig,
  name: 'server',
  target: 'node',

  entry: {
    server: ['@babel/polyfill', './src/server.tsx'],
  },

  output: {
    ...webpackBaseConfig.output,
    path: BUILD_DIR,
    filename: '[name].js',
    chunkFilename: 'chunks/[name].js',
    libraryTarget: 'commonjs2',
  },

  // Webpack mutates resolve object, so clone it to avoid issues
  // https://github.com/webpack/webpack/issues/4817
  resolve: {
    ...webpackBaseConfig.resolve,
  },

  module: {
    ...webpackBaseConfig.module,

    rules: [
      // 在服务端中使用antd的样式
      {
        test: /\.(css|less)$/,
        include: /[\\/]node_modules[\\/].*antd/,
        use: [
          {
            // for css-loader@3.x
            loader: 'css-loader',
            options: {
              onlyLocals: true,
            },
            // for css-loader@2.x
            /* loader: 'css-loader',
            options: {
              exportOnlyLocals: true,
            }, */
            // for css-loader@1.x
            // loader: 'css-loader/locals',
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            },
          },
        ],
      },
      ...overrideRules(webpackBaseConfig.module.rules, rule => {
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
    ],
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

    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    })
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

// serverConfig.module.rules.splice(2, 0, {
//   test: /\.(css|less)$/,
//   include: /[\\/]node_modules[\\/].*antd/,
//   use: [
//     {
//       loader: 'css-loader/locals',
//     },
//     {
//       loader: 'less-loader',
//       options: {
//         javascriptEnabled: true,
//       },
//     },
//   ],
// });

export default serverConfig;
