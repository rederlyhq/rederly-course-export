import path from 'path';
import dotenv from 'dotenv';
dotenv.config({
    path: process.env.DOTENV_LOCATION ? path.resolve(process.env.DOTENV_LOCATION) : undefined
});
import _ from 'lodash';
import { LoggingLevelType, LOGGING_LEVEL } from './utilities/logger-logging-levels';
import * as crypto from 'crypto';

let logs: Array<string> | null = [];

const fromBooleanField = (value: string | undefined | null): boolean | null => {
    switch (value?.toLowerCase()) {
        case 'true':
            return true;
        case 'false':
            return false;
        default:
            return null;
    }
};

const fromIntValue = (value: string | undefined | null): number | null => {
    if (_.isNil(value)) {
        return null;
    }
    
    const result = parseInt(value, 10);
    if (isNaN(result)) {
        return null;
    }
    return result;
};

const generateLog = (key: string, value: string | undefined, defaultValue: unknown): string => `Configuration for [${key}] not recognized with value [${value}] using default value [${defaultValue}]`;

function readStringValue(key: string, defaultValue: string): string;
function readStringValue(key: string, defaultValue?: string | null | undefined): string | null;
function readStringValue(key: string, defaultValue?: string | null | undefined): string | null {
    const rawValue = process.env[key];
    const value = rawValue;
    if (_.isNil(value)) {
        logs?.push(generateLog(key, value, defaultValue));
        return defaultValue ?? null;
    }
    return value;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function readIntValue(key: string, defaultValue: number): number;
function readIntValue(key: string, defaultValue?: number | null | undefined): number | null;
function readIntValue(key: string, defaultValue?: number | null | undefined): number | null {
    const rawValue = process.env[key];
    const value = fromIntValue(rawValue);
    if (_.isNil(value)) {
        logs?.push(generateLog(key, rawValue, defaultValue));
        return defaultValue ?? null;
    }
    return value;
}

function readBooleanValue(key: string, defaultValue: boolean): boolean;
function readBooleanValue(key: string, defaultValue?: boolean | null | undefined): boolean | null;
function readBooleanValue(key: string, defaultValue?: boolean | null | undefined): boolean | null {
    const rawValue = process.env[key];
    const value = fromBooleanField(rawValue);
    if (_.isNil(value)) {
        logs?.push(generateLog(key, rawValue, defaultValue));
        return defaultValue ?? null;
    }
    return value;
}

// Developer check, would be cool to have a preprocessor strip this code out
if (process.env.NODE_ENV !== 'production') {
    Object.keys(LOGGING_LEVEL).forEach((loggingLevelKey: string) => {
        if (loggingLevelKey !== loggingLevelKey.toUpperCase()) {
            throw new Error('Logging levels constant should be all upper case');
        }
    });
}

const getLoggingLevel = (key: string, defaultValue: LoggingLevelType | null): LoggingLevelType | null => {
    let rawValue = process.env[key];
    // Not set
    if (_.isUndefined(rawValue)) {
        logs?.push(generateLog(key, rawValue, defaultValue));
        return defaultValue;
    }

    // Explicit not set
    if (rawValue === 'null') {
        return null;
    }

    // upper case for case insensitive search (should be validation above to make sure all keys are uppercased)
    rawValue = rawValue.toUpperCase();
    if (Object.keys(LOGGING_LEVEL).indexOf(rawValue) < 0) {
        logs?.push(generateLog(key, rawValue, defaultValue));
        return defaultValue;
    }

    return LOGGING_LEVEL[rawValue as keyof typeof LOGGING_LEVEL];
};

const loggingLevel = getLoggingLevel('LOGGING_LEVEL', LOGGING_LEVEL.INFO);
const loggingLevelForFile = getLoggingLevel('LOGGING_LEVEL_FOR_FILE', loggingLevel);
const loggingLevelForConsole = getLoggingLevel('LOGGING_LEVEL_FOR_CONSOLE', loggingLevel);

const nodeEnv = readStringValue('NODE_ENV', 'development');
// needs to be read ahead of of time to be used in configurations
const isProduction = nodeEnv === 'production';

const configurations = {
    app: {
        nodeEnv: nodeEnv,
        isProduction: isProduction,
        logMissingConfigurations: readBooleanValue('LOG_MISSING_CONFIGURATIONS', true),
        failOnMissingConfigurations: readBooleanValue('FAIL_ON_MISSING_CONFIGURATIONS', isProduction),
        configSalt: readStringValue('CONFIG_SALT', ''),
        autoDeleteTemp: readBooleanValue('AUTO_DELETE_TEMP_FILES', true),
    },
    // monitoring: {
    //     memory: {
    //         debugThreshold: readIntValue('MONITORING_MEMORY_DEBUG_THRESHOLD', 40),
    //         warningThreshold: readIntValue('MONITORING_MEMORY_WARNING_THRESHOLD', 60),
    //         errorThreshold: readIntValue('MONITORING_MEMORY_ERROR_THRESHOLD', 80),
    //         interval: readIntValue('MONITORING_MEMORY_INTERVAL', 10000)
    //     }
    // },
    // If we put logging level in the configurations we have a cyclic dependency if we ever want to log from this file...
    logging: {
        loggingLevel,
        loggingLevelForFile,
        loggingLevelForConsole,
        logJson: readBooleanValue('LOGGING_LOG_JSON', isProduction),
    },
    paths: {
        workingTempDirectory: readStringValue('WORKING_TEMP_DIRECTORY', 'tmp'),
        webworkFileLocation: readStringValue('WEBWORK_FILE_LOCATION', '../core/test-webwork-files')
    },
    loadPromise: new Promise<void>((resolve, reject) => {
        // Avoid cyclic dependency by deferring the logging until after all the imports are done
        setTimeout(() => {
            // Can't use require statement in callback
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const logger = require('./utilities/logger').default;
            // THIS IS FOR DEBUGGING, DO NOT COMMIT UNCOMMENTED
            // logger.info(JSON.stringify(configurations, null, 2));

            if (_.isNil(logs)) {
                logger.error('configuration logs nil before reading');
            } else if (configurations.app.logMissingConfigurations) {
                logs.forEach((log: string) => {
                    logger.warn(log);
                });
            }

            if (configurations.app.isProduction && !configurations.app.autoDeleteTemp) {
                logger.warn('Application configured to run in production but not to auto delete temp files! AUTO_DELETE_TEMP_FILES should always be true unless debugging!!');
            }            
            
            // Log count defaults to 1 so it fails on null which has already been logged
            if (configurations.app.failOnMissingConfigurations && (logs?.length ?? 1 > 0)) {
                return reject(new Error(`Missing configurations:\n${logs?.join('\n') ?? 'Logs are null'}`));
            } else {
                resolve();
            }
            // After we log the warnings we can drop the logs, figured it would cause cleanup
            logs = null;
        });
    }),
    hash: ''
};

configurations.loadPromise
.then(() => {
    configurations.hash = crypto.createHash('sha256').update(JSON.stringify(configurations)).digest('hex');
})
.catch(() => null);

export default configurations;
