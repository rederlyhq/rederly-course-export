import { Model, DataTypes, HasManyGetAssociationsMixin, HasOneGetAssociationMixin } from 'sequelize';
import appSequelize from '../app-sequelize';

export interface CourseInterface {
    id: number;
    active: boolean;
    curriculumId: number;
    instructorId: number;
    universityId: number;
    name: string;
    code: string;
    start: Date;
    end: Date;
    sectionCode: string;
    semesterCode: string;
    originatingCourseId: number;
}
export default class Course extends Model implements CourseInterface {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public active!: boolean;
    public curriculumId!: number;
    public instructorId!: number;
    public universityId!: number;
    public name!: string;
    public code!: string;
    public start!: Date;
    public end!: Date;
    public sectionCode!: string;
    public semesterCode!: string;
    public originatingCourseId!: number;

    public units?: CourseUnitContent[];
    public enrolledStudents?: StudentEnrollment[];

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public readonly instructor?: User;

    public getUnits!: HasManyGetAssociationsMixin<CourseUnitContent>;
    public getEnrolledStudents!: HasManyGetAssociationsMixin<StudentEnrollment>;
    public getInstructor!: HasOneGetAssociationMixin<User>;
    public getUniversity!: HasOneGetAssociationMixin<University>;

    static constraints = {
        uniqueCourseCode: 'course_course_code_key',

        foreignKeyCurriculum: 'course_curriculum_id_fkey'
    }
    static createAssociations(): void {
        // This is a hack to add the associations later to avoid cyclic dependencies
        /* eslint-disable @typescript-eslint/no-use-before-define */
        Course.belongsTo(User, {
            foreignKey: 'instructorId',
            targetKey: 'id',
            as: 'instructor'
        });

        Course.belongsTo(University, {
            foreignKey: 'universityId',
            targetKey: 'id',
            as: 'university'
        });

        Course.belongsTo(Curriculum, {
            foreignKey: 'curriculumId',
            targetKey: 'id',
            as: 'curriculum'
        });

        Course.belongsTo(Course, {
            foreignKey: 'originatingCourseId',
            targetKey: 'id',
            as: 'originatingCourse'
        });

        Course.hasMany(StudentEnrollment, {
            foreignKey: 'courseId',
            sourceKey: 'id',
            as: 'enrolledStudents'
        });

        Course.hasMany(CourseUnitContent, {
            foreignKey: 'courseId',
            sourceKey: 'id',
            as: 'units'
        });
        /* eslint-enable @typescript-eslint/no-use-before-define */
    }
}

Course.init({
    id: {
        field: 'course_id',
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    active: {
        field: 'course_active',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    curriculumId: {
        field: 'curriculum_id',
        type: DataTypes.INTEGER,
        allowNull: true
    },
    instructorId: {
        field: 'user_id',
        type: DataTypes.INTEGER,
        allowNull: false
    },
    universityId: {
        field: 'university_id',
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        field: 'course_name',
        type: DataTypes.TEXT,
        allowNull: false,
    },
    textbooks: {
        field: 'course_textbooks',
        type: DataTypes.TEXT,
        allowNull: false
    },
    code: {
        field: 'course_code',
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    start: {
        field: 'course_start',
        type: DataTypes.DATE,
        allowNull: false
    },
    end: {
        field: 'course_end',
        type: DataTypes.DATE,
        allowNull: false
    },
    sectionCode: {
        field: 'course_section_code',
        type: DataTypes.TEXT,
        allowNull: false,
    },
    semesterCode: {
        field: 'course_semester_code',
        type: DataTypes.TEXT,
        allowNull: false,
    },
    originatingCourseId: {
        field: 'originating_course_id',
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    }
}, {
    tableName: 'course',
    sequelize: appSequelize, // this bit is important
});

import User from './user';
import StudentEnrollment from './student-enrollment';
import CourseUnitContent from './course-unit-content';
import Curriculum from './curriculum';
import University from './university';
