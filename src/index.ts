import { Op, Sequelize } from "sequelize";
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

const getPrivateProblemsInCourse = async (courseId: number) => {
    const privateQuestions: CourseWWTopicQuestion[] = await CourseWWTopicQuestion.findAll({
        include: [{
            model: CourseTopicContent,
            as: 'topic',
            where: {
                active: true,
            },
            include: [{
                model: CourseUnitContent,
                as: 'unit',
                where: {
                    active: true,
                    courseId: courseId,
                }
                // include: [{
                //     model: Course,
                //     as: 'course',
                //     where: {
                //         instructorId: userId
                //     }
                // }]
            }]
        }],
        where: {
            webworkQuestionPath: {
                [Op.like]: 'private/%'
            },
            active: true
        },
        attributes: [
            'webworkQuestionPath'
        ]
    });
    const privateProblemPaths = [...new Set(privateQuestions.map(question => question.webworkQuestionPath))];
    return privateProblemPaths;
};

export const generateDefFiles = async (courseId: number, tmpDirectory: string) => {
    const workingDirectory = path.join(tmpDirectory, courseId.toString());
    const course: Course = await Course.findOne({
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

    const contentDirectory = path.join(workingDirectory, course.name);
    const unitPromises = course.units?.map(async (unit) => {
        const unitPath = path.join(contentDirectory, unit.name);
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
        course: course,
        workingDirectory: workingDirectory,
        contentDirectory: contentDirectory
    }
}
(async () => {
    const { workingTempDirectory, webworkFileLocation } = configurations.paths;
    const courseId = -1;
    if(fs.existsSync(workingTempDirectory)) {
        await fs.remove(workingTempDirectory);
    }
    await fs.promises.mkdir(workingTempDirectory);
    const {
        course,
        workingDirectory,
        contentDirectory
    } = await generateDefFiles(courseId, workingTempDirectory);

    // const privateProblemPaths = await getPrivateProblemsInCourse(courseId);
    const privateProblemPaths = _.uniq(_.flattenDeep(
        course.units?.map(
            unit => unit.topics?.map(
                topic => topic.questions?.map(
                    question => question.webworkQuestionPath
                ) ?? [] as string[]
            ) ?? [] as string[]
        ) ?? [] as string[]
    ).filter((wwPath: string) => wwPath.startsWith('private/')));

    // const testPromises = privateProblemPaths.map(async (privateProblemPath) => {
    //     const filepath = `${webworkFileLocation}/${privateProblemPath}`;
    //     console.log(path.dirname(filepath));
    //     await fs.mkdirp(path.dirname(filepath));
    //     await fs.writeFile(filepath, `STARTTOM ${privateProblemPath} TOMEND`);
    // });
    // await Promise.all(testPromises);

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
            assetPromises.push(fs.copy(imageFrom, imageTo).catch(e => { throw new Error(`Prob: ${to}; ${e.toString()}`)}))
        }
    });
    const privateCopyErrorPromises = (await Promise.allSettled(privateCopyPromises)).map(async (promise) => promise.status === 'rejected' && fs.appendFile(path.join(contentDirectory, 'privateFileErrors.txt'), `${promise.reason.toString()}\n`));
    const assetCopyErrorPromises = (await Promise.allSettled(assetPromises)).map(async (promise) => promise.status === 'rejected' &&
    fs.appendFile(path.join(contentDirectory, 'privateFileErrors.txt'), `${promise.reason.toString()}\n`));
    await Promise.all(privateCopyErrorPromises);
    await Promise.all(assetCopyErrorPromises);

    const tarStream = tar.create({
        gzip: true,
        cwd: path.resolve(contentDirectory)
    }, ['.']
    ).pipe(fs.createWriteStream(path.join(workingDirectory, `${course.name}.tgz`)))

    await new Promise((resolve, reject) => {
        tarStream.on('finish', resolve);
        tarStream.on('error', reject);
    })
    // await fs.remove(path.join(workingTempDirectory, courseId.toString()));
})();
