import { Configuration } from 'log4js';

const config: Configuration = {
  appenders: {
    infos: {
      type: 'file',
      filename: 'log/info.log',
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
    },
    errors: {
      type: 'file',
      filename: 'log/error.log',
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
    },
    'just-errors': {
      type: 'logLevelFilter',
      appender: 'errors',
      level: 'error',
    },
  },
  categories: {
    default: {
      appenders: ['infos', 'just-errors'],
      level: 'debug',
    },
  },
};

export default config;
