import winston = require('winston');
import * as _ from 'lodash';
import configurations from '../configurations';

const {
  format,
} = winston;
const {
  loggingLevelForFile,
  loggingLevelForConsole,
} = configurations.logging;

const transports = [];
if (!_.isNil(loggingLevelForConsole)) {
  transports.push(
    new winston.transports.Console({
      level: loggingLevelForConsole.key,
      format: configurations.logging.logJson ? winston.format.printf(info => {
        const { level } = info;
        if (!configurations.logging.urlInMeta && level !== 'error' && level !== 'warn') {
          delete info.metadata.requestMeta?.url;
        }
        return JSON.stringify(info);
      }) : format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf(info => {
          const requestMetadata = _.omitBy(info.metadata.requestMeta, _.isUndefined);
          const requestId = `request-${(requestMetadata.requestId ?? 'null')}`;
          let message = `${info.timestamp} [${info.level}]: ${requestId} ${info.message}`;
          if (configurations.logging.metaInLogs) {
            const requestMetadataString = _.isEmpty(requestMetadata) ? '' : JSON.stringify(requestMetadata);
            message += requestMetadataString;
          }
          return message;
        }),
      )
    })
  );
}

if (!_.isNil(loggingLevelForFile)) {
  transports.push(
    new winston.transports.File({
      level: loggingLevelForFile.key,
      filename: './logs/all-logs.log',
      handleExceptions: true,
      // json:             true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      // colorize:         false
    })
  );
}

// If the logger has no tranpsort it logs the following message to console (with the log content)
// [winston] Attempt to write logs with no transports ${LOG_OBJECT}
const logger = winston.createLogger({
  defaultMeta: {
    // get requestMeta(): unknown {
    //   return rederlyRequestNamespaceDump();
    // },
  },
  format: format.combine(
    format.errors({ stack: true }),
    format.metadata(),
    format.json(),
  ),
  transports: transports
});

// This is an intentional any. I could extend the Global interface to have this fit in
// However I don't want internal use of this attribute
// The intention here is to share this with npm modules that need to use the logger
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).logger = logger;

export default logger;
