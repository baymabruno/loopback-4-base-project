import winston, {format} from 'winston';
import wdrf from 'winston-daily-rotate-file';
import path from 'path';
const appRoot = path.dirname(require.main ? require.main.filename : '');

const options = {
  //daily log rotation config
  daily: {
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxSize: '20mb',
    maxFiles: '10',
    dirname: `${appRoot}//storage//logs`,
    createSymlink: true,
    symlinkName: 'app.log', //current log name will be something like api_support_operations.log or app.log
  },
  //console log config
  console: {
    level: process.env.LOG_LEVEL ?? 'debug',
    handleExceptions: true,
  },
};

//creates a custom print log message
const customFormat = format.printf(info => {
  return `[${
    info.timestamp
  }] ${process.env.APP_ENVIRONMENT?.toLowerCase()}.${info.level.toUpperCase()}: ${
    info.message
  }`;
});

//configuring the logger
export const log = winston.createLogger({
  format: format.combine(
    format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    customFormat,
    format.uncolorize(),
  ),
  transports: [
    new wdrf(options.daily),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false,
});
