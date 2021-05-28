import * as _ from 'lodash';
import { Model, DataTypes, HasManyGetAssociationsMixin } from 'sequelize';
import appSequelize from '../app-sequelize';

interface TopicAssessmentInfoOverridesInterface {
    duration: number;
    maxVersions: number;
    maxGradedAttemptsPerVersion: number;
    versionDelay: number;
}

export interface TopicAssessmentInfoInterface extends TopicAssessmentInfoOverridesInterface {
    id: number;
    courseTopicContentId: number;
    hardCutoff: boolean;
    hideHints: boolean;
    showItemizedResults: boolean;
    showTotalGradeImmediately: boolean;
    hideProblemsAfterFinish: boolean;
    randomizeOrder: boolean;
    originatingTopicAssessmentInfoId: number;
}

export default class TopicAssessmentInfo extends Model implements TopicAssessmentInfoInterface {
    public id!: number;
    public courseTopicContentId!: number;
    public curriculumTopicAssessmentInfoId!: number;
    public duration!: number; // enforce IN MINUTES
    public hardCutoff!: boolean;
    public maxGradedAttemptsPerVersion!: number;
    public maxVersions!: number;
    public versionDelay!: number; // for consistency do we also force MINUTES here?
    public hideHints!: boolean;
    public showItemizedResults!: boolean;
    public showTotalGradeImmediately!: boolean;
    public hideProblemsAfterFinish!: boolean;
    public randomizeOrder!: boolean;
    public active!: boolean;
    public originatingTopicAssessmentInfoId!: number;

    // public getCurriculumTopicContent!: BelongsToGetAssociationMixin<CurriculumTopicContent>;

    public readonly studentTopicAssessmentOverride?: StudentTopicAssessmentOverride[];
    public readonly studentTopicAssessmentInfo?: StudentTopicAssessmentInfo[];

    public readonly getStudentTopicAssessmentInfo!: HasManyGetAssociationsMixin<StudentTopicAssessmentInfo>;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static getWithOverrides = (obj: TopicAssessmentInfoInterface, overrides: StudentTopicAssessmentOverrideOverridesInterface): TopicAssessmentInfoInterface => {
        // Avoid cyclic dependencies
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return _.assign({}, obj, StudentTopicAssessmentOverride.getOverrides(overrides));
    }

    getWithOverrides = (overrides: StudentTopicAssessmentOverrideOverridesInterface): TopicAssessmentInfoInterface => {
        return TopicAssessmentInfo.getWithOverrides(this.get({ plain: true }) as TopicAssessmentInfoInterface, overrides);
    }

    static constraints = {
    }

    static createAssociations(): void {
        // This is a hack to add the associations later to avoid cyclic dependencies
        /* eslint-disable @typescript-eslint/no-use-before-define */
        TopicAssessmentInfo.belongsTo(CourseTopicContent, {
            foreignKey: 'courseTopicContentId',
            targetKey: 'id',
            as: 'courseTopicContent'
        });

        TopicAssessmentInfo.hasMany(StudentTopicAssessmentOverride, {
            foreignKey: 'topicAssessmentInfoId',
            sourceKey: 'id',
            as: 'studentTopicAssessmentOverride'
        });

        TopicAssessmentInfo.hasMany(StudentTopicAssessmentInfo, {
            foreignKey: 'topicAssessmentInfoId',
            sourceKey: 'id',
            as: 'studentTopicAssessmentInfo'
        });

        TopicAssessmentInfo.belongsTo(CurriculumTopicAssessmentInfo, {
            foreignKey: 'curriculumTopicAssessmentInfoId',
            targetKey: 'id',
            as: 'curriculumTopicAssessmentInfo'
        });

        TopicAssessmentInfo.belongsTo(TopicAssessmentInfo, {
            foreignKey: 'originatingTopicAssessmentInfoId',
            targetKey: 'id',
            as: 'originatingTopicAssessmentInfo'
        });

        /* eslint-enable @typescript-eslint/no-use-before-define */
    }
}

TopicAssessmentInfo.init({
    id: {
        field: 'topic_assessment_info_id',
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    courseTopicContentId: {
        field: 'course_topic_content_id',
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    curriculumTopicAssessmentInfoId: {
        field: 'curriculum_topic_assessment_info_id',
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    duration: {
        field: 'topic_assessment_info_duration',
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    hardCutoff: {
        field: 'topic_assessment_info_hard_cutoff',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    maxGradedAttemptsPerVersion: {
        field: 'topic_assessment_info_max_graded_attempts_per_version',
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    maxVersions: {
        field: 'topic_assessment_info_max_versions',
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    versionDelay: {
        field: 'topic_assessment_info_version_delay',
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    hideHints: {
        field: 'topic_assessment_info_hide_hints',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    showItemizedResults: {
        field: 'topic_assessment_info_show_itemized_results',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    showTotalGradeImmediately: {
        field: 'topic_assessment_info_show_total_grade_immediately',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    hideProblemsAfterFinish: {
        field: 'topic_assessment_info_hide_problems_after_finish',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    randomizeOrder: {
        field: 'topic_assessment_info_randomize_order',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    active: {
        field: 'topic_assessment_info_active',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    originatingTopicAssessmentInfoId: {
        field: 'originating_topic_assessment_info_id',
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    }
}, {
    tableName: 'topic_assessment_info',
    sequelize: appSequelize, // this bit is important
});

import CourseTopicContent from './course-topic-content';
import StudentTopicAssessmentInfo from './student-topic-assessment-info';
import StudentTopicAssessmentOverride, { StudentTopicAssessmentOverrideOverridesInterface } from './student-topic-assessment-override';
import CurriculumTopicAssessmentInfo from './curriculum-topic-assessment-info';
