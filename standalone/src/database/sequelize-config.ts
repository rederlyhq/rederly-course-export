import configurations from '../configurations';
import { Sequelize, Options as SequelizeOptions } from 'sequelize';
import cls = require('cls-hooked');
import { Constants } from '../constants';
import logger from 'rederly-course-export/lib/utilities/logger';
import winston from 'winston';

const namespace = cls.createNamespace(Constants.Application.REDERLY_CLS_NAMESPACE_NAME);
Sequelize.useCLS(namespace);
// import { format } from 'sql-formatter';

function formatter(): winston.LeveledLogMethod | ((sql: string) => void) {
    if (process.env.NODE_ENV === 'production') {
        logger.warn('SQL Logging isn\'t prettified in production.');
        return logger.debug;
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { format } = require('sql-formatter');

    // The console log below is for development so this is an acceptable eslint exception
    // eslint-disable-next-line no-console
    return ((sqlString: string): void => console.log(format(sqlString, {
        language: 'postgresql', // Defaults to "sql" (see the above list of supported dialects)
        indent: '    ', // Defaults to two spaces
        uppercase: true, // Defaults to false
    })));
}

const {
    host,
    port,
    name,
    user,
    password,
    logging,
    statementTimeout
} = configurations.db;

const sequelizeConfig: SequelizeOptions = {
    username: user,
    password: password,
    database: name,
    host: host,
    port: port,
    dialect: 'postgres',
    logging: logging && formatter(),
    dialectOptions: {
        // set a limit for how long a query can take to run (in millis)
        // Can't disable this right now because air bnb issue https://github.com/typescript-eslint/typescript-eslint/issues/2077#issuecomment-634811363
        // // eslint-disable-next-line @typescript-eslint/camelcase
        statement_timeout: statementTimeout
    },
    define: {
        timestamps: true,
        underscored: true
    },
    pool: {
        max: 150,
        min: 0,
        idle: 10000
    },
    minifyAliases: true
};

// Sequelize requires it like this
module.exports = sequelizeConfig;
