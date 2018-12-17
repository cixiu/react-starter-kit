import fs from 'fs';
import path from 'path';
import autoprefixer from 'autoprefixer';
import dotenv from 'dotenv';

// 目录
export const ROOT_DIR = path.resolve(__dirname, '../../');
export const resolvePath = (...args) => path.resolve(ROOT_DIR, ...args);
export const SRC_DIR = resolvePath('src');
export const BUILD_DIR = resolvePath('build');

// .env路径
export const envExamplePath = resolvePath('./.env.example');
export const envProdPath = resolvePath('./.env.production');

// 控制变量
export const isDebug = !process.argv.includes('--release');
export const isVerbose = process.argv.includes('--verbose');
export const isAnalyze =
  process.argv.includes('--analyze') || process.argv.includes('--analyse');

// module正则
export const reScript = /\.(js|jsx|mjs|ts|tsx)$/;
export const reStyle = /\.(css|less|styl|scss|sass|sss)$/;
export const reImage = /\.(bmp|gif|jpg|jpeg|png|svg)$/;
export const staticAssetName = isDebug
  ? '[path][name].[ext]?[hash:8]'
  : '[hash:8].[ext]';

// CSS Nano options http://cssnano.co/
export const minimizeCssOptions = {
  discardComments: { removeAll: true },
};

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

export default {
  context: ROOT_DIR,

  mode: isDebug ? 'development' : 'production',

  output: {
    path: resolvePath(BUILD_DIR, 'public/'),
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
  // Choose a developer tool to enhance debugging
  // https://webpack.js.org/configuration/devtool/#devtool
  devtool: isDebug ? 'eval-source-map' : 'source-map',

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
          {
            loader: 'thread-loader',
            options: {
              // there should be 1 cpu for the fork-ts-checker-webpack-plugin
              workers: require('os').cpus().length - 1,
            },
          },
          {
            loader: 'ts-loader',
            options: {
              // ts-loader配合fork-ts-checker-webpack-plugin插件获取完全的类型检查
              transpileOnly: true,
              getCustomTransformers: path.join(
                __dirname,
                './webpack.ts-transformers.js',
              ),
              compilerOptions: {
                module: 'es2015',
              },
              happyPackMode: true,
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
            },
          },

          // Process internal/project styles (from src folder)
          {
            include: SRC_DIR,
            // loader: 'css-loader',
            loader: 'typings-for-css-modules-loader',
            options: {
              // CSS Loader https://github.com/webpack/css-loader
              importLoaders: 2,
              sourceMap: isDebug,
              namedExport: true,
              // CSS Modules https://github.com/css-modules/css-modules
              modules: true,
              camelCase: true,
              slient: true,
              localIdentName: isDebug
                ? '[name]-[local]-[hash:base64:5]'
                : '[hash:base64:5]',
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
};
