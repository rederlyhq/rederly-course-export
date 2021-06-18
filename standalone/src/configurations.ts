import path from 'path';
import dotenv from 'dotenv';
dotenv.config({
    path: process.env.DOTENV_LOCATION ? path.resolve(process.env.DOTENV_LOCATION) : undefined
});
import * as _ from 'lodash';
import * as crypto from 'crypto';

import parentConfigurations from 'rederly-course-export/lib/configurations';

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


const configurations = {
    ...parentConfigurations,
    // monitoring: {
    //     memory: {
    //         debugThreshold: readIntValue('MONITORING_MEMORY_DEBUG_THRESHOLD', 40),
    //         warningThreshold: readIntValue('MONITORING_MEMORY_WARNING_THRESHOLD', 60),
    //         errorThreshold: readIntValue('MONITORING_MEMORY_ERROR_THRESHOLD', 80),
    //         interval: readIntValue('MONITORING_MEMORY_INTERVAL', 10000)
    //     }
    // },
    server: {
        port: readIntValue('SERVER_PORT', 3008),
    },
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
    loadPromise: new Promise<void>(async (resolve, reject) => {
        try {
            // check parent options first
            await parentConfigurations.loadPromise;
        } catch(e) {
            reject(e);
            return;
        }

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
