import Course from './database/models/course';
import CourseQuestionAssessmentInfo from './database/models/course-question-assessment-info';
import CourseTopicContent from './database/models/course-topic-content';
import CourseUnitContent from './database/models/course-unit-content';
import CourseWWTopicQuestion from './database/models/course-ww-topic-question';
import TopicAssessmentInfo from './database/models/topic-assessment-info';

import { run, RunResult } from 'rederly-course-export';

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
            order: ['contentOrder'],
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
                order: ['contentOrder'],
                include: [{
                    model: CourseWWTopicQuestion,
                    as: 'questions',
                    where: {
                        active: true
                    },
                    order: ['problemOrder'],
                    attributes: ['id', 'problemNumber', 'webworkQuestionPath', 'weight', 'maxAttempts', 'optional'],
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

export const exportCourseById = async (courseId: number): Promise<RunResult> => {
    const course = await fetchData(courseId);
    return await run(course);
};
