// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json');
import { run } from 'rederly-course-export';
import logger from 'rederly-course-export/lib/utilities/logger';
import fs from 'fs-extra';
import fastify, { FastifyRequest } from 'fastify';

import { postCourseBodySchema } from './validations';
import { PostCourseBodySchema } from './request-types';
import { tsTypeKeywordCompileFunc } from './ajv-extras';

import configurations from './configurations';
const fastifyInstance = fastify({
    logger: true,
    ajv: {
        customOptions: {
            keywords: {
                tsType: {
                    compile: tsTypeKeywordCompileFunc,
                    keyword: 'tsType',
                    modifying: true,
                    errors: true,                
                }
            },
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
            body: postCourseBodySchema
        }
    }, async (request: FastifyRequest<{Body: PostCourseBodySchema}>, reply) => {
        const { fileLocation, workingDirectory } = await run(request.body);
        reply.type('application/gzip').code(200);
        const readStream = fs.createReadStream(fileLocation);
        reply.send(readStream);
        if (configurations.app.autoDeleteTemp) {
            readStream.on('close', () => fs.remove(workingDirectory).catch(err => logger.error('Error deleting temp file', err)));
        }
    });

    next();
}, { prefix: 'course-exports' });


fastifyInstance.listen(configurations.server.port, (err, address) => {
    if (err) throw err;
    logger.info(`Server is now listening on ${address}`);
});
