import { Model, DataTypes } from 'sequelize';
import appSequelize from '../app-sequelize';

export interface CourseQuestionAssessmentInfoInterface {
    id: number;
    courseWWTopicQuestionId: number;
    curriculumQuestionAssessmentInfoId: number;
    randomSeedSet: Array<number>;
    additionalProblemPaths: Array<string>;
    active: boolean;
    originatingQuestionAssessmentInfoId: number;
}
export default class CourseQuestionAssessmentInfo extends Model implements CourseQuestionAssessmentInfoInterface {

    public id!: number;
    public courseWWTopicQuestionId!: number;
    public curriculumQuestionAssessmentInfoId!: number;
    public randomSeedSet!: Array<number>;
    public additionalProblemPaths!: Array<string>;
    public active!: boolean;
    public errors!: CourseTopicQuestionErrors | null;
    public originatingQuestionAssessmentInfoId!: number;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static constraints = {
    }

    static createAssociations(): void {
        // This is a hack to add the associations later to avoid cyclic dependencies
        /* eslint-disable @typescript-eslint/no-use-before-define */
        CourseQuestionAssessmentInfo.belongsTo(CourseWWTopicQuestion, {
            foreignKey: 'courseWWTopicQuestionId',
            targetKey: 'id',
            as: 'courseTopicQuestion'
        });

        CourseQuestionAssessmentInfo.belongsTo(CurriculumQuestionAssessmentInfo, {
            foreignKey: 'curriculumQuestionAssessmentInfoId',
            targetKey: 'id',
            as: 'curriculumQuestionAssessmentInfo'
        });

        CourseQuestionAssessmentInfo.belongsTo(CourseQuestionAssessmentInfo, {
            foreignKey: 'originatingQuestionAssessmentInfoId',
            targetKey: 'id',
            as: 'originatingQuestionAssessmentInfo'
        });

        /* eslint-enable @typescript-eslint/no-use-before-define */
    }
}

CourseQuestionAssessmentInfo.init({
    id: {
        field: 'course_question_assessment_info_id',
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    courseWWTopicQuestionId: {
        field: 'course_topic_question_id',
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    curriculumQuestionAssessmentInfoId: {
        field: 'curriculum_question_assessment_info_id',
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    randomSeedSet: {
        field: 'course_question_assessment_info_random_seed_set',
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: false,
        defaultValue: []
    },
    additionalProblemPaths: {
        field: 'course_question_assessment_info_additional_problem_paths',
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: []
    },
    active: {
        field: 'course_question_assessment_info_active',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    errors: {
        field: 'course_question_assessment_info_errors',
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: null,
    },
    originatingQuestionAssessmentInfoId: {
        field: 'originating_question_assessment_info_id',
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    },
}, {
    tableName: 'course_question_assessment_info',
    sequelize: appSequelize, // this bit is important
});

import CourseWWTopicQuestion, { CourseTopicQuestionErrors } from './course-ww-topic-question';
import CurriculumQuestionAssessmentInfo from './curriculum-question-assessment-info';
