import dotenv from 'dotenv';
dotenv.config();
import * as _ from 'lodash';
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
    // server: {
    //     port: readStringValue('SERVER_PORT', '3001'),
    //     basePath: readStringValue('SERVER_BASE_PATH', '/backend-api'),
    //     logInvalidlyPrefixedRequests: readBooleanValue('SERVER_LOG_INVALIDLY_PREFIXED_REQUESTS', true),
    //     blockInvalidlyPrefixedRequests: readBooleanValue('SERVER_BLOCK_INVALIDLY_PREFIXED_REQUESTS', true),
    //     logAccess: readBooleanValue('SERVER_LOG_ACCESS', true),
    //     logAccessSlowRequestThreshold: readIntValue('SERVER_LOG_ACCESS_SLOW_REQUEST_THRESHOLD', 30000),
    //     requestTimeout: readIntValue('SERVER_REQUEST_TIMEOUT', 150000),
    //     limiter: {
    //         windowLength: readIntValue('SERVER_LIMITER_WINDOW_LENGTH', 60000),
    //         maxRequests: readIntValue('SERVER_LIMITER_MAX_REQUESTS', 100),
    //     },
    // },
    db: {
        host: readStringValue('DB_HOST', 'localhost'),
        port: readIntValue('DB_PORT', 5432),
        name: readStringValue('DB_NAME', 'rederly'),
        user: readStringValue('DB_USER', 'postgres'),
        password: readStringValue('DB_PASSWORD', 'password'),
        logging: readBooleanValue('DB_LOGGING', false),
        sync: readBooleanValue('DB_SYNC', false),
        statementTimeout: readIntValue('DB_STATEMENT_TIMEOUT', 60000),
    },
    // If we put logging level in the configurations we have a cyclic dependency if we ever want to log from this file...
    paths: {
        workingTempDirectory: readStringValue('WORKING_TEMP_DIRECTORY', 'tmp'),
        webworkFileLocation: readStringValue('WEBWORK_FILE_LOCATION', 'test-webwork-files')
    },
    loadPromise: new Promise<void>((resolve, reject) => {
        // Avoid cyclic dependency by deferring the logging until after all the imports are done
        setTimeout(() => {
            // Can't use require statement in callback
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const logger = require('rederly-course-export/lib/utilities/logger').default;
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
