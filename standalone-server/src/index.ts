import logger from 'rederly-course-export/lib/utilities/logger';
import { startServer } from './server';

const firstArg = process.argv[2];
if (firstArg === 'noop') {
    logger.info('noop passed, not starting server');
    // Not exiting, want to make sure all promises and everything exits
} else {
    startServer().catch((err) => logger.error(err));
}
