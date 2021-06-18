import './database';
import logger from 'rederly-course-export/lib/utilities/logger';
import { startServer } from './server';
import { exportCourseById } from './logic';

if (require.main === module) {
    (async () => {
        try {
            const firstArg = process.argv[2];
            if (firstArg === 'noop') {
                logger.info('noop passed, not starting server');
                // Not exiting, want to make sure all promises and everything exits
                return;
            } else if (firstArg === 'server') {
                return await startServer();
            }
            const courseId = parseInt(firstArg, 10);
            logger.info(`Exporting ${courseId}`);
            if(Number.isNaN(courseId)) {
                throw new Error(`Could not parse first arguement ${firstArg}`);
            }
    
            await exportCourseById(courseId);
        } catch (err) {
            logger.error('Failed to run CLI', err);
            process.exit(1);
        }
    })();
}
