import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import log4js from 'log4js';
import log4jsConfig from './log4js';

if (!__DEV__) {
  const envProdPath = path.join(__dirname, '../.env.production');
  if (fs.existsSync(envProdPath)) {
    console.log('正在使用 .env.production 文件来配置环境变量');
    dotenv.config({ path: envProdPath });
  }
} else {
  // 开发环境下，同步输入 log 信息至命令行
  log4jsConfig.appenders.stdouts = {
    type: 'stdout',
  };
  if (!log4jsConfig.categories.default.appenders.includes('stdouts')) {
    log4jsConfig.categories.default.appenders.push('stdouts');
  }
}

log4js.configure(log4jsConfig);

const logger = log4js.getLogger('default');

export default logger;
