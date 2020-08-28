import fs from 'fs';
import webpack from 'webpack';
import WriteFilePlugin from 'write-file-webpack-plugin';
import ExtractCssChunks from 'extract-css-chunks-webpack-plugin';
// import HappyPack from 'happypack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import WebpackAssetsManifest from 'webpack-assets-manifest';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
// import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import webpackBaseConfig, {
  isDebug,
  BUILD_DIR,
  isAnalyze,
  resolvePath,
} from './webpack.config.base';

const clientConfig = {
  ...webpackBaseConfig,
  name: 'client',
  target: 'web',
  entry: {
    client: ['@babel/polyfill', './src/client.tsx'],
  },
  module: {
    ...webpackBaseConfig.module,
    rules: [
      // 在客户端中使用antd样式
      {
        test: /\.(css|less)$/,
        include: /[\\/]node_modules[\\/].*antd/,
        use: [
          {
            loader: ExtractCssChunks.loader,
            options: {
              hmr: false,
              reloadAll: false,
            },
          },
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
      },
      ...webpackBaseConfig.module.rules,
    ],
  },
  plugins: [
    new WriteFilePlugin(),
    new ExtractCssChunks({
      filename: isDebug
        ? 'static/css/[name].css'
        : 'static/css/[id].[chunkhash:8].css',
      chunkFilename: isDebug
        ? 'static/css/[name].chunk.css'
        : 'static/css/[id].[chunkhash:8].chunk.css',
    }),
    // 以一个单独的进程来运行ts类型检查和lint来加快编译速度，配合ts-loader使用
    new ForkTsCheckerWebpackPlugin({
      async: false,
      typescript: true,
      eslint: {
        files: './src/**/*.{ts,tsx,js,jsx}',
      },
    }),
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
      // chunks: 'all', 默认为 all
      cacheGroups: {
        commons: {
          chunks: 'initial',
          // chunks: 'all',
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

if (!isDebug) {
  clientConfig.optimization.minimizer = [
    new TerserPlugin({
      terserOptions: {
        parse: {
          // we want terser to parse ecma 8 code. However, we don't want it
          // to apply any minfication steps that turns valid ecma 5 code
          // into invalid ecma 5 code. This is why the 'compress' and 'output'
          // sections only apply transformations that are ecma 5 safe
          // https://github.com/facebook/create-react-app/pull/4234
          ecma: 8,
        },
        compress: {
          ecma: 5,
          warnings: false,
          // Disabled because of an issue with Uglify breaking seemingly valid code:
          // https://github.com/facebook/create-react-app/issues/2376
          // Pending further investigation:
          // https://github.com/mishoo/UglifyJS2/issues/2011
          comparisons: false,
          // Disabled because of an issue with Terser breaking valid code:
          // https://github.com/facebook/create-react-app/issues/5250
          // Pending futher investigation:
          // https://github.com/terser-js/terser/issues/120
          inline: 2,
        },
        mangle: {
          safari10: true,
        },
        output: {
          ecma: 5,
          comments: false,
          // Turned on because emoji and regex is not minified properly using default
          // https://github.com/facebook/create-react-app/issues/2488
          ascii_only: true,
        },
      },
      // Use multi-process parallel running to improve the build speed
      // Default number of concurrent runs: os.cpus().length - 1
      parallel: true,
      // Enable file caching
      cache: true,
      sourceMap: true,
    }),
    new OptimizeCSSAssetsPlugin({
      cssProcessorOptions: {
        map: {
          // `inline: false` forces the sourcemap to be output into a
          // separate file
          inline: false,
          // `annotation: true` appends the sourceMappingURL to the end of
          // the css file, helping the browser find the sourcemap
          annotation: true,
        },
      },
    }),
  ];
}

// 抽离antd中的样式
// clientConfig.module.rules.splice(2, 0, {
//   test: /\.(css|less)$/,
//   include: /[\\/]node_modules[\\/].*antd/,
//   use: [
//     ExtractCssChunks.loader,
//     {
//       loader: 'css-loader',
//     },
//     {
//       loader: 'less-loader',
//       options: {
//         javascriptEnabled: true,
//       },
//     },
//   ],
// });

export default clientConfig;
