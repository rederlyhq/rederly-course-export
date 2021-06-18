// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json');
import logger from 'rederly-course-export/lib/utilities/logger';
import fs from 'fs-extra';
import fastify, { FastifyRequest } from 'fastify';
import { exportCourseById } from './logic';

import configurations from './configurations';
const fastifyInstance = fastify({
    logger: false,
    ajv: {
        customOptions: {
            coerceTypes: true,
            useDefaults: true,
            removeAdditional: 'all',
        }
    }
});

fastifyInstance.register((server, opts, next) => {
    server.get('/version', async () => {
        return {
            statusCode:200,
            status:'Ok',
            message:null,
            data:
            {
                packageJson:version
            }
        };
    });
    
    server.post('/course', {
        schema: {
            body: {
                type: 'object',
                additionalProperties: false,
                required: ['courseId'],
                properties: {
                    courseId: {
                        type: 'number'
                    }
                }
            }
        }
    }, async (request: FastifyRequest<{Body: { courseId: number;}}>, reply) => {
        const { fileLocation, workingDirectory } = await exportCourseById(request.body.courseId);
        reply.type('application/gzip').code(200);
        const readStream = fs.createReadStream(fileLocation);
        reply.send(readStream);
        if (configurations.app.autoDeleteTemp) {
            readStream.on('close', () => fs.remove(workingDirectory).catch(err => logger.error('Error deleting temp file', err)));
        }
    });

    next();
}, { prefix: 'course-exports' });

export const startServer = (): Promise<void> => new Promise<void>((resolve, reject) =>
    fastifyInstance.listen(configurations.server.port, (err, address) => {
        if (err) return reject(err);
        logger.info(`Server is now listening on ${address}`);
        resolve();
    })
);
