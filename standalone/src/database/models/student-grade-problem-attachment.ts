import { Model, DataTypes } from 'sequelize';
import appSequelize from '../app-sequelize';

interface StudentGradeProblemAttachmentInterface {
    id: number;
    studentGradeId: number;
    problemAttachmentId: number;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

export default class StudentGradeProblemAttachment extends Model implements StudentGradeProblemAttachmentInterface {
    public id!: number;
    public studentGradeId!: number;
    public problemAttachmentId!: number;
    public active!: boolean;
    
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static constraints = {
    }

    static createAssociations(): void {
        // This is a hack to add the associations later to avoid cyclic dependencies
        /* eslint-disable @typescript-eslint/no-use-before-define */
        StudentGradeProblemAttachment.belongsTo(ProblemAttachment, {
            foreignKey: 'problemAttachmentId',
            targetKey: 'id',
            as: 'problemAttachment'
        });
        StudentGradeProblemAttachment.belongsTo(StudentGrade, {
            foreignKey: 'studentGradeId',
            targetKey: 'id',
            as: 'studentGrade'
        });
        /* eslint-enable @typescript-eslint/no-use-before-define */
    }
}

StudentGradeProblemAttachment.init({
    id: {
        field: 'student_grade_problem_attachment_id',
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    studentGradeId: {
        field: 'student_grade_id',
        type: DataTypes.INTEGER,
        allowNull: false
    },
    problemAttachmentId: {
        field: 'problem_attachment_id',
        type: DataTypes.INTEGER,
        allowNull: false
    },
    active: {
        field: 'student_grade_problem_attachment_active',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
}, {
    tableName: 'student_grade_problem_attachment',
    sequelize: appSequelize, // this bit is important
});

import ProblemAttachment from './problem-attachment';
import StudentGrade from './student-grade';
