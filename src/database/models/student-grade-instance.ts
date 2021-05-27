import { Model, DataTypes, BelongsToGetAssociationMixin, HasManyGetAssociationsMixin, BelongsToManyGetAssociationsMixin } from 'sequelize';
import appSequelize from '../app-sequelize';
import * as _ from 'lodash';

export interface StudentGradeInstanceQuestionOverridesInterface {
    webworkQuestionPath: string;
    problemNumber: number;
}

export interface StudentGradeInstanceGradeOverridesInterface {
    randomSeed: number;
    // This is a jsonb field so it could be any (from db)
    // Submitted in workbook used any so I'm going to keep it consistent here
    // If this is used for form data we will never know any info about what keys are available
    // Might make sense to make this an unknown type since I don't think we will ever access the types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentProblemState: any;
}

export interface StudentGradeInstanceInterface extends StudentGradeInstanceQuestionOverridesInterface, StudentGradeInstanceGradeOverridesInterface {
    id: number;
    studentGradeId: number;
    // userId: number;
    studentTopicAssessmentInfoId: number;
    scoreForBestVersion: number; // the score from the highest-scoring exam submission
    overallBestScore: number; // the best score on this problem alone
    active: boolean;
    bestIndividualAttemptId: number;
    bestVersionAttemptId: number;
}

export default class StudentGradeInstance extends Model implements StudentGradeInstanceInterface {
    public id!: number;
    public studentGradeId!: number;
    // public userId!: number;
    public studentTopicAssessmentInfoId!: number;
    public randomSeed!: number;
    public webworkQuestionPath!: string;
    public problemNumber!: number;
    public scoreForBestVersion!: number;
    public overallBestScore!: number;
    public active!: boolean;
    // This is a jsonb field so it could be any (from db)
    // Submitted in workbook used any so I'm going to keep it consistent here
    // If this is used for form data we will never know any info about what keys are available
    // Might make sense to make this an unknown type since I don't think we will ever access the types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public currentProblemState!: any;

    public bestIndividualAttemptId!: number;
    public bestVersionAttemptId!: number;

    public getUser!: BelongsToGetAssociationMixin<User>;
    public getGrade!: BelongsToGetAssociationMixin<StudentGrade>;
    public getWorkbooks!: HasManyGetAssociationsMixin<StudentWorkbook>;
    public getStudentAssessmentInfo!: BelongsToGetAssociationMixin<StudentTopicAssessmentInfo>;
    public getProblemAttachments!: BelongsToManyGetAssociationsMixin<ProblemAttachment>;
    public problemAttachments?: ProblemAttachment[];

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static getQuestionOverrides = (obj: StudentGradeInstanceQuestionOverridesInterface): StudentGradeInstanceQuestionOverridesInterface => {
        return _.pick(obj, ['webworkQuestionPath', 'problemNumber']);
    }

    getQuestionOverrides = (): StudentGradeInstanceQuestionOverridesInterface => {
        return StudentGradeInstance.getQuestionOverrides(this);
    }

    static constraints = {
    }

    static createAssociations(): void {
        // This is a hack to add the associations later to avoid cyclic dependencies
        /* eslint-disable @typescript-eslint/no-use-before-define */
        StudentGradeInstance.belongsTo(User, {
            foreignKey: 'userId',
            targetKey: 'id',
            as: 'user'
        });

        StudentGradeInstance.belongsTo(StudentGrade, {
            foreignKey: 'studentGradeId',
            targetKey: 'id',
            as: 'grade',
        });

        StudentGradeInstance.belongsTo(StudentTopicAssessmentInfo, {
            foreignKey: 'studentTopicAssessmentInfoId',
            targetKey: 'id',
            as: 'studentAssessmentInfo',
        });

        StudentGradeInstance.hasMany(StudentWorkbook, {
            foreignKey: 'studentGradeInstanceId',
            sourceKey: 'id',
            as: 'workbooks',
        });

        StudentGradeInstance.belongsTo(StudentWorkbook, {
            foreignKey: 'bestIndividualAttemptId',
            targetKey: 'id',
            as: 'bestIndividualAttempt',
            constraints: false,
        });

        StudentGradeInstance.belongsTo(StudentWorkbook, {
            foreignKey: 'bestVersionAttemptId',
            targetKey: 'id',
            as: 'bestVersionAttempt',
            constraints: false,
        });

        StudentGradeInstance.hasMany(StudentGradeInstanceProblemAttachment, {
            foreignKey: 'studentGradeInstanceId',
            sourceKey: 'id',
            as: 'studentGradeInstanceProblemAttachments',
            constraints: false,
        });

        StudentGradeInstance.belongsToMany(ProblemAttachment, {
            through: StudentGradeInstanceProblemAttachment,
            as: 'problemAttachments',
        });

        /* eslint-enable @typescript-eslint/no-use-before-define */
    }
}

StudentGradeInstance.init({
    id: {
        field: 'student_grade_instance_id',
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    studentGradeId: {
        field: 'student_grade_id',
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        field: 'user_id',
        type: DataTypes.INTEGER,
        allowNull: false
    },
    studentTopicAssessmentInfoId: {
        field: 'student_topic_assessment_info_id',
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    bestIndividualAttemptId: {
        field: 'student_grade_instance_best_individual_workbook_id',
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    bestVersionAttemptId: {
        field: 'student_grade_instance_best_version_workbook_id',
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    randomSeed: {
        field: 'student_grade_instance_random_seed',
        type: DataTypes.INTEGER,
        allowNull: false
    },
    webworkQuestionPath: {
        field: 'student_grade_instance_problem_path',
        type: DataTypes.TEXT,
        allowNull: false
    },
    problemNumber: {
        field: 'student_grade_instance_problem_number',
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    scoreForBestVersion: {
        field: 'student_grade_instance_score_for_best_version',
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    overallBestScore: {
        field: 'student_grade_instance_overall_best_score',
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    active: {
        field: 'student_grade_instance_active',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    currentProblemState: {
        field: 'student_grade_instance_current_problem_state',
        type: DataTypes.JSONB,
        allowNull: true,
    },
}, {
    tableName: 'student_grade_instance',
    sequelize: appSequelize, // this bit is important
});

import StudentGrade from './student-grade';
import StudentTopicAssessmentInfo from './student-topic-assessment-info';
import StudentWorkbook from './student-workbook';
import User from './user';
import StudentGradeInstanceProblemAttachment from './student-grade-instance-problem-attachment';
import ProblemAttachment from './problem-attachment';
