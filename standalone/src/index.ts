import './database';
import Course from './database/models/course';
import CourseQuestionAssessmentInfo from './database/models/course-question-assessment-info';
import CourseTopicContent from './database/models/course-topic-content';
import CourseUnitContent from './database/models/course-unit-content';
import CourseWWTopicQuestion from './database/models/course-ww-topic-question';
import TopicAssessmentInfo from './database/models/topic-assessment-info';

import { run } from 'rederly-course-export';
import logger from 'rederly-course-export/lib/utilities/logger';

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

    if (course === null) {
        throw new Error(`Course (${courseId}) not found.`);
    }
    return course;
};

(async () => {
    const firstArg = process.argv[2];
    const courseId = parseInt(firstArg, 10);
    logger.info(`Exporting ${courseId}`);
    if(Number.isNaN(courseId)) {
        throw new Error(`Could not parse first arguement ${firstArg}`);
    }

    const course = await fetchData(courseId);
    await run(course);
})().catch(err => logger.error(err));
