import appSequelize from './app-sequelize';

import User from './models/user';
import University from './models/university';
import Session from './models/session';
import Permission from './models/permission';
import Course from './models/course';
import UniversityCurriculumPermission from './models/university-curriculum-permission';
import CurriculumUnitContent from './models/curriculum-unit-content';
import CurriculumTopicContent from './models/curriculum-topic-content';
import CurriculumWWTopicQuestion from './models/curriculum-ww-topic-question';
import StudentEnrollment from './models/student-enrollment';
import CourseUnitContent from './models/course-unit-content';
import CourseTopicContent from './models/course-topic-content';
import TopicType from './models/topic-type';
import CourseWWTopicQuestion from './models/course-ww-topic-question';
import StudentGrade from './models/student-grade';
import StudentGradeInstance from './models/student-grade-instance';
import StudentWorkbook from './models/student-workbook';
import Curriculum from './models/curriculum';
import StudentGradeLockAction from './models/student-grade-lock-action';
import StudentGradeOverride from './models/student-grade-override';
import StudentTopicOverride from './models/student-topic-override';
import StudentTopicQuestionOverride from './models/student-topic-question-override';
import StudentTopicAssessmentOverride from './models/student-topic-assessment-override';
import StudentTopicAssessmentInfo from './models/student-topic-assessment-info';
import TopicAssessmentInfo from './models/topic-assessment-info';
import CurriculumTopicAssessmentInfo from './models/curriculum-topic-assessment-info';
import CourseQuestionAssessmentInfo from './models/course-question-assessment-info';
import ProblemAttachment from './models/problem-attachment';
import StudentGradeProblemAttachment from './models/student-grade-problem-attachment';
import StudentGradeInstanceProblemAttachment from './models/student-grade-instance-problem-attachment';
import StudentWorkbookProblemAttachment from './models/student-workbook-problem-attachment';
import CurriculumQuestionAssessmentInfo from './models/curriculum-question-assessment-info';

export const sync = async (): Promise<void> => {
    await appSequelize.authenticate();
    await appSequelize.sync();
};

const models = [
    User,
    University,
    Session,
    Permission,
    Course,
    UniversityCurriculumPermission,
    Curriculum,
    CurriculumUnitContent,
    CurriculumTopicContent,
    CurriculumWWTopicQuestion,
    CurriculumTopicAssessmentInfo,
    StudentEnrollment,
    CourseUnitContent,
    CourseTopicContent,
    TopicType,
    CourseWWTopicQuestion,
    StudentGrade,
    StudentGradeInstance,
    StudentWorkbook,
    StudentGradeLockAction,
    StudentGradeOverride,
    StudentTopicOverride,
    StudentTopicQuestionOverride,
    CourseQuestionAssessmentInfo,
    StudentTopicAssessmentInfo,
    StudentTopicAssessmentOverride,
    TopicAssessmentInfo,
    ProblemAttachment,
    StudentGradeProblemAttachment,
    StudentGradeInstanceProblemAttachment,
    CurriculumQuestionAssessmentInfo,
    StudentWorkbookProblemAttachment,
];

// TODO fix this
// eslint-disable-next-line @typescript-eslint/no-explicit-any
models.forEach((model: any) => {
    if (typeof model.createAssociations === 'function') {
        model.createAssociations();
    }
});

export {
    models,
    appSequelize
};
