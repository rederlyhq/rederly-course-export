import { getDefObjectFromTopic } from '@rederly/rederly-utils';
import fs from 'fs-extra';
import path from 'path';
import _ from 'lodash';
import configurations from './configurations';
import tar from 'tar';
import logger from './utilities/logger';
import { getAllMatches } from './utilities/string-helper';
import { RederlyCourse, RederlyTopic, RederlyQuestion } from './models';
import { imageInPGFileRegex, dequotePerlQuotes } from '@rederly/rederly-utils/lib/importer';
const { workingTempDirectory, webworkFileLocation } = configurations.paths;

let clearTempFilesPromise = Promise.resolve();
if (configurations.app.autoDeleteTemp) {
    if (fs.existsSync(configurations.paths.workingTempDirectory)) {
        clearTempFilesPromise = fs.remove(configurations.paths.workingTempDirectory).catch(err => {logger.error('Error clearing previous temp files', err)});
    }
}

/**
 * 
 * @param course The course to flatten and get filter private problem paths from
 * @returns An array of problem paths that need to be copied
 */
const getPrivateProblemPathsFromCourse = (course: RederlyCourse): string[] => {
    return _.uniq(_.flattenDeep(
        course.units?.map(
            unit => unit.topics?.map(
                topic => topic.questions?.map(
                    question => question.webworkQuestionPath
                ) ?? [] as string[]
            ) ?? [] as string[]
        ) ?? [] as string[]
    ).filter((wwPath: string) => wwPath.startsWith('private/')));
};

/**
 * For development, this code generates files to make sure the packaging works as expected
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateTestPrivateFiles = async (privateProblemPaths: string[]) => {
    const testPromises = privateProblemPaths.map(async (privateProblemPath) => {
        const filepath = `${webworkFileLocation}/${privateProblemPath}`;
        logger.info(`Generating: ${filepath}`);
        await fs.mkdirp(path.dirname(filepath));
        if (fs.existsSync(filepath)) {
            logger.warn('Dev code to generate private files run but file exists');
        } else {
            await fs.writeFile(filepath, `STARTTEST ${privateProblemPath} TESTEND`);
        }
    });
    await Promise.all(testPromises);
};

/**
 * Copy private files to temp folder for tarring
 * @param course the course to copy private files for
 * @param privateProblemPaths the paths of the private problems
 * @param contentDirectory where the private files should go
 */
const copyPrivateFiles = async (course: RederlyCourse, privateProblemPaths: string[], contentDirectory: string) => {
    const assetPromises: Promise<string | null>[] = [];
    const privateCopyPromises = privateProblemPaths.map(async (privateProblemPath): Promise<string | null> => {
        try {
            const from = path.join(webworkFileLocation, privateProblemPath);
            const to = path.join(workingTempDirectory, course.id.toString(), course.name, privateProblemPath);
            await fs.mkdirp(path.dirname(to));
            await fs.copy(from, to);
            const pgContent = (await fs.readFile(from)).toString();
            const imageInPgFileMatches = getAllMatches(imageInPGFileRegex, pgContent);
            for(const match of imageInPgFileMatches) {
                const imagePath: string = dequotePerlQuotes(match[1] ?? match[2]);
                const imageFrom = path.join(webworkFileLocation, path.dirname(privateProblemPath), imagePath);
                const imageTo = path.join(workingTempDirectory, course.id.toString(), course.name, path.dirname(privateProblemPath), imagePath);
                const assetPromise = fs.copy(imageFrom, imageTo).catch(e => { 
                    throw new Error(`Prob: ${to}; ${e.toString()}`);
                });
                // // This is to avoid promise rejection error, the promise is actually handled with assetCopyErrorPromises
                // // eslint-disable-next-line @typescript-eslint/no-empty-function
                // assetPromise.catch((err) => err.toString());
                assetPromises.push(assetPromise.then(() => null).catch(err => err.toString()));
            }
        } catch (err) {
            // work around since promise.allSettled not on data integrity server
            return err.toString();
        }
        return null;
    });
    // const privateCopyErrorPromises = (await Promise.allSettled(privateCopyPromises)).map(async (promise) => promise.status === 'rejected' && fs.appendFile(path.join(contentDirectory, 'privateFileErrors.txt'), `${promise.reason.toString()}\n`));
    // const assetCopyErrorPromises = (await Promise.allSettled(assetPromises)).map(async (promise) => promise.status === 'rejected' && fs.appendFile(path.join(contentDirectory, 'privateFileErrors.txt'), `${promise.reason.toString()}\n`));
    const privateCopyErrorPromises = (await Promise.all(privateCopyPromises)).map(async (errorString) => errorString && fs.appendFile(path.join(contentDirectory, 'privateFileErrors.txt'), `${errorString}\n`));
    const assetCopyErrorPromises = (await Promise.all(assetPromises)).map(async (errorString) => errorString && fs.appendFile(path.join(contentDirectory, 'privateFileErrors.txt'), `${errorString}\n`));
    await Promise.all(privateCopyErrorPromises);
    await Promise.all(assetCopyErrorPromises);
};

/**
 * Iterate through all the topics and create def files for each one
 * File structure:
 * /{COURSE_NAME}/privateFileErrors.txt // error that came up during export
 * /{COURSE_NAME}/{RENDERER_PATHS} // RENDERER_PATHS will mostly be private/my/{UUID}/{REMAINING_PATH}.(pg|png|gif|etc.)
 * /{COURSE_NAME}/units/{UNIT_NAME}/{TOPIC_NAME}.def // Each unit is a folder and contains a topic file for each of it's topics
 * @param course The course (with units, topics, exam topic info, questions, exam question info)
 * @param tmpDirectory The location that temp files are store
 * @returns {
 * contentDirectory: The directory that will eventually be tarred up
 * }
 */
const generateDefFiles = async (course: RederlyCourse, tmpDirectory: string) => {
    const workingDirectory = path.join(tmpDirectory, course.id.toString());

    const contentDirectory = path.join(workingDirectory, course.name);
    const unitPromises = course.units?.map(async (unit) => {
        const unitPath = path.join(contentDirectory, 'units', unit.name);
        await fs.mkdirp(unitPath);
        const topicPromises = unit.topics?.map(async (topic) => {
            if (_.isNil(topic.questions)) {
                throw new Error('questions is nil');
            }
            const defObject = getDefObjectFromTopic(topic as Omit<RederlyTopic, 'questions'> & {questions: RederlyQuestion[]});
            const filePath = path.join(unitPath, `set${topic.name}.def`);
            await fs.writeFile(filePath, defObject.dumpAsDefFileContent());
        });
        await Promise.all(topicPromises ?? [Promise.resolve()]);
    });
    await Promise.all(unitPromises ?? [Promise.resolve()]);
    return {
        contentDirectory: contentDirectory,
        workingDirectory: workingDirectory,
    };
};

/**
 * In the parent directory of the content directory (which should be the working directory) tar up the content directory
 * @param contentDirectory The directory to tar up
 * @returns a promise that resolves when the stream finishes or rejects on error
 */
const tarUp = (contentDirectory: string) => new Promise<string>((resolve, reject) => {
    const name = path.basename(contentDirectory);
    const workingDirectory = path.dirname(contentDirectory);
    const fileName = `${path.join(path.resolve(path.dirname(contentDirectory)), `${name}.tgz`)}`;
    const tarStream = tar.create({
        gzip: true,
        cwd: path.resolve(workingDirectory)
    }, [name]
    ).pipe(fs.createWriteStream(path.join(workingDirectory, `${name}.tgz`)));

    tarStream.on('finish', () => resolve(fileName));
    tarStream.on('error', reject);
});

export const run = async (course: RederlyCourse): Promise<{
    workingDirectory: string;
    fileLocation: string;
}> => {
    await configurations.loadPromise;
    await clearTempFilesPromise;
    await fs.mkdirp(workingTempDirectory);

    const {
        contentDirectory,
        workingDirectory
    } = await generateDefFiles(course, workingTempDirectory);

    // const privateProblemPaths = await getPrivateProblemsInCourse(courseId);
    const privateProblemPaths = getPrivateProblemPathsFromCourse(course);
    // generateTestPrivateFiles(privateProblemPaths);

    await copyPrivateFiles(course, privateProblemPaths, contentDirectory);

    const fileLocation = await tarUp(contentDirectory);
    logger.info(`"${fileLocation}" generated`);
    return {
        fileLocation,
        workingDirectory
    };
};
