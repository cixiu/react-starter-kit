/**
 * ts-import-plugin 使用 happyPackMode时，配合 thread-loader 冲突的解决
 *
 * 详情：https://github.com/Igorbek/typescript-plugin-styled-components#forked-process-configuration
 *
 */

const createTransformer = require('ts-import-plugin');

const tsImportPluginFactory = createTransformer({
  libraryName: 'antd',
  // libraryDirectory: 'es',
  // 自定义引入文件
  style: name => `${name}/style/index.less`,
});

const getCustomTransformers = () => ({ before: [tsImportPluginFactory] });

module.exports = getCustomTransformers;
