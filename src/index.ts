import Course from "./database/models/course";
import CourseTopicContent from "./database/models/course-topic-content";
import CourseUnitContent from "./database/models/course-unit-content";
import CourseWWTopicQuestion from "./database/models/course-ww-topic-question";
import './database';
import { getDefObjectFromTopic } from '@rederly/rederly-utils';
import fs from 'fs-extra';
import path from 'path';
import _ from "lodash";
import TopicAssessmentInfo from "./database/models/topic-assessment-info";
import CourseQuestionAssessmentInfo from "./database/models/course-question-assessment-info";
import configurations from "./configurations";
import tar from 'tar';

const { workingTempDirectory, webworkFileLocation } = configurations.paths;

/** TODO move below to shared space because this is shared with the backend */
const httpNegativeLookAhead = '(?!\\s*https?:)';
const assetInPgFileExtensions = '(?:' + // Non capture group to or all the extensions together
[
    '[gG][iI][fF]', // gif
    '[aA]?[pP][nN][gG]', // or apng, png
    '[jJ][pP][eE]?[gG]', // or jpg, jpeg
    '[sS][vV][gG]', // or svg
    '[wW][eE][bB][pP]', // or webp
]
.join('|') // or extensions together
 + ')'; // close non extension capture group

const perlQuotes: Array<[string, string]> = [
    ['"', '"'], // Double quotes
    ["'", "'"], // single quotes
    ['`', '`'], // Backticks
    ['qw\\s*\\(', '\\)'], // qw
    ['qq\\s*\\(', '\\)'], // qq
    ['q\\s*\\(', '\\)'], // q
];

const insideQuoteChacterRegex = (quote: string): string => {
    // if is normal quote
    if (quote === '"' || quote === "'") {
        return `[^${quote}]`;
    } else {
        return '.';
    }
};

export const imageInPGFileRegex = new RegExp(
    [
        '(?<!#.*)(?:', // Comment, using non capture group to spread amongst or
        `(?:image\\s*\\(\\s*(${perlQuotes.map(perlQuote => `${perlQuote[0]}${httpNegativeLookAhead}.+?${perlQuote[1]}`).join('|')})\\s*(?:,(?:\\s|.)*?)?\\))`, // image call
        '|(', // pipe for regex or with capture non image, asset looking strings
        perlQuotes.map(perlQuote => `(?:${perlQuote[0]}${httpNegativeLookAhead}${insideQuoteChacterRegex(perlQuote[0])}*?\.${assetInPgFileExtensions}${perlQuote[1]})`).join('|'), // String check regex
        ')', // close asset looking strings
        ')', // end non capture group for negative look behind
    ].join(''), 'g'
);
/** TODO move above to shared space because this is shared with the backend */

/**
 * 
 * @param course The course to flatten and get filter private problem paths from
 * @returns An array of problem paths that need to be copied
 */
const getPrivateProblemPathsFromCourse = (course: Course): string[] => {
    return _.uniq(_.flattenDeep(
        course.units?.map(
            unit => unit.topics?.map(
                topic => topic.questions?.map(
                    question => question.webworkQuestionPath
                ) ?? [] as string[]
            ) ?? [] as string[]
        ) ?? [] as string[]
    ).filter((wwPath: string) => wwPath.startsWith('private/')))
};

/**
 * For development, this code generates files to make sure the packaging works as expected
 */
const generateTestPrivateFiles = async (privateProblemPaths: string[]) => {
    const testPromises = privateProblemPaths.map(async (privateProblemPath) => {
        const filepath = `${webworkFileLocation}/${privateProblemPath}`;
        console.log(`Generating: ${filepath}`);
        await fs.mkdirp(path.dirname(filepath));
        if (fs.existsSync(filepath)) {
            console.warn('Dev code to generate private files run but file exists');
        } else {
            await fs.writeFile(filepath, `STARTTEST ${privateProblemPath} TESTEND`);
        }
    });
    await Promise.all(testPromises);
}

/**
 * Copy private files to temp folder for tarring
 * @param course the course to copy private files for
 * @param privateProblemPaths the paths of the private problems
 * @param contentDirectory where the private files should go
 */
const copyPrivateFiles = async (course: Course, privateProblemPaths: string[], contentDirectory: string) => {
    const assetPromises: Promise<void>[] = [];
    const privateCopyPromises = privateProblemPaths.map(async (privateProblemPath) => {
        const from = path.join(webworkFileLocation, privateProblemPath);
        const to = path.join(workingTempDirectory, course.id.toString(), course.name, privateProblemPath);
        await fs.mkdirp(path.dirname(to));
        await fs.copy(from, to);
        const pgContent = (await fs.readFile(from)).toString();
        for(const match of pgContent.matchAll(imageInPGFileRegex)) {
            let imagePath: string = match[1] ?? match[2];

            perlQuotes.some(quote => {
                const insideRegex = new RegExp(`${quote[0]}(.*)${quote[1]}`, 'g');
                const matches = imagePath.matchAll(insideRegex);
                // if (matches.length > 1) {
                //     console.warn(`findFilesFromPGFile: insideRegex expected 1 match but got ${matches.length}`);
                // }
                // Will not be nil if different quotes
                const thisMatch = matches.next().value;
                if (!_.isNil(thisMatch)) {
                    // index 1 should be first capture group, should not be nil
                    if (_.isNil(thisMatch[1])) {
                        console.error(`findFilesFromPGFile: No capture group for quote ${quote[0]}`);
                    } else {
                        imagePath = thisMatch[1];
                    }
                    // bow out
                    return true;
                }
                return false;
            });
            const imageFrom = path.join(webworkFileLocation, path.dirname(privateProblemPath), imagePath);
            const imageTo = path.join(workingTempDirectory, course.id.toString(), course.name, path.dirname(privateProblemPath), imagePath);
            const assetPromise = fs.copy(imageFrom, imageTo).catch(e => { 
                throw new Error(`Prob: ${to}; ${e.toString()}`)
            });
            // This is to avoid promise rejection error, the promise is actually handled with assetCopyErrorPromises
            assetPromise.catch(() => {});
            assetPromises.push(assetPromise)
        }
    });
    const privateCopyErrorPromises = (await Promise.allSettled(privateCopyPromises)).map(async (promise) => promise.status === 'rejected' && fs.appendFile(path.join(contentDirectory, 'privateFileErrors.txt'), `${promise.reason.toString()}\n`));
    const assetCopyErrorPromises = (await Promise.allSettled(assetPromises)).map(async (promise) => promise.status === 'rejected' &&
    fs.appendFile(path.join(contentDirectory, 'privateFileErrors.txt'), `${promise.reason.toString()}\n`));
    await Promise.all(privateCopyErrorPromises);
    await Promise.all(assetCopyErrorPromises);
}

/**
 * Get data from database for export
 * @param courseId The id of the course to fetch
 * @returns A course with it's units, topics, exam topic info, questions, exam question info
 */
const fetchData = async (courseId: number): Promise<Course> => {
    const course: Course | null = await Course.findOne({
        where: {
            active: true,
            id: courseId
        },
        attributes: ['id', 'name'],
        include: [{
            model: CourseUnitContent,
            as: 'units',
            where: {
                active: true,
            },
            attributes: ['id', 'name'],
            required: false,
            include: [{
                model: CourseTopicContent,
                as: 'topics',
                where: {
                    active: true
                },
                attributes: ['id', 'name', 'topicTypeId', 'startDate', 'endDate', 'deadDate', 'partialExtend', 'description'],
                required: false,
                include: [{
                    model: CourseWWTopicQuestion,
                    as: 'questions',
                    where: {
                        active: true
                    },
                    attributes: ['id', 'problemNumber', 'webworkQuestionPath', 'weight', 'maxAttempts'],
                    required: false,
                    include: [{
                        model: CourseQuestionAssessmentInfo,
                        as: 'courseQuestionAssessmentInfo',
                        where: {
                            active: true
                        },
                        attributes: ['randomSeedSet', 'additionalProblemPaths'],
                        required: false,
                    }]
                }, {
                    model: TopicAssessmentInfo,
                    as: 'topicAssessmentInfo',
                    where: {
                        active: true
                    },
                    attributes: ['duration', 'hardCutoff', 'hideHints', 'hideProblemsAfterFinish', 'maxGradedAttemptsPerVersion', 'maxVersions', 'randomizeOrder', 'showItemizedResults', 'showTotalGradeImmediately', 'versionDelay'],
                    required: false,
                }]
            }]
        }]
    });

    if (_.isNil(course)) {
        throw new Error(`Course (${courseId}) not found.`)
    }
    return course;
}

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
const generateDefFiles = async (course: Course, tmpDirectory: string) => {
    const workingDirectory = path.join(tmpDirectory, course.id.toString());

    const contentDirectory = path.join(workingDirectory, course.name);
    const unitPromises = course.units?.map(async (unit) => {
        const unitPath = path.join(contentDirectory, 'units', unit.name);
        await fs.mkdirp(unitPath);
        const topicPromises = unit.topics?.map(async (topic) => {
            if (_.isNil(topic.questions)) {
                throw new Error('questions is nil');
            }
            const defObject = getDefObjectFromTopic(topic as Omit<CourseTopicContent, 'questions'> & {questions: CourseWWTopicQuestion[]});
            const filePath = path.join(unitPath, `set${topic.name}.def`);
            await fs.writeFile(filePath, defObject.dumpAsDefFileContent());
        });
        await Promise.all(topicPromises ?? [Promise.resolve()]);
    });
    await Promise.all(unitPromises ?? [Promise.resolve()]);
    return {
        contentDirectory: contentDirectory
    }
}

/**
 * In the parent directory of the content directory (which should be the working directory) tar up the content directory
 * @param contentDirectory The directory to tar up
 * @returns a promise that resolves when the stream finishes or rejects on error
 */
const tarUp = (contentDirectory: string) => new Promise((resolve, reject) => {
    const name = path.basename(contentDirectory);
    const workingDirectory = path.dirname(contentDirectory);
    const tarStream = tar.create({
        gzip: true,
        cwd: path.resolve(workingDirectory)
    }, [name]
    ).pipe(fs.createWriteStream(path.join(workingDirectory, `${name}.tgz`)))

    tarStream.on('finish', resolve);
    tarStream.on('error', reject);
});

(async () => {
    await configurations.loadPromise;
    const firstArg = process.argv[2];
    const courseId = parseInt(firstArg, 10);
    console.log(`Exporting ${courseId}`);
    if(_.isNaN(courseId)) {
        throw new Error(`Could not parse first arguement ${firstArg}`)
    }
    if(fs.existsSync(workingTempDirectory)) {
        await fs.remove(workingTempDirectory);
    }
    await fs.mkdirp(workingTempDirectory);

    const course = await fetchData(courseId);
    const {
        contentDirectory
    } = await generateDefFiles(course, workingTempDirectory);

    // const privateProblemPaths = await getPrivateProblemsInCourse(courseId);
    const privateProblemPaths = getPrivateProblemPathsFromCourse(course);
    // generateTestPrivateFiles(privateProblemPaths);

    await copyPrivateFiles(course, privateProblemPaths, contentDirectory);

    await tarUp(contentDirectory);

    // await fs.remove(path.join(workingTempDirectory, courseId.toString()));
})().catch(err => console.error(err));
