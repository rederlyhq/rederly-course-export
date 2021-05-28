export interface RederlyCourse {
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

    units?: RederlyUnit[];
}

export interface RederlyUnit {
    id: number;
    courseId: number;
    name: string;
    active: boolean;
    contentOrder: number;
    curriculumUnitId: number;
    originatingUnitId: number;

    topics?: RederlyTopic[];
}

export interface RederlyTopic {
    id: number;
    curriculumTopicContentId: number;
    courseUnitContentId: number;
    topicTypeId: number;
    name: string;
    active: boolean;
    contentOrder: number;
    startDate: Date;
    endDate: Date;
    deadDate: Date;
    partialExtend: boolean;
    createdAt: Date;
    updatedAt: Date;
    originatingTopicContentId: number;
    gradeIdsThatNeedRetro: number[];
    retroStartedTime: Date | null;
    description: unknown;

    questions?: RederlyQuestion[];
    topicAssessmentInfo?: RederlyTopicAssessmentInfo;
}

export interface RederlyQuestion {
    id: number;
    courseTopicContentId: number;
    problemNumber: number;
    webworkQuestionPath: string;
    weight: number;
    maxAttempts: number;
    hidden: boolean;
    active: boolean;
    optional: boolean;
    curriculumQuestionId: number;
    createdAt: Date;
    updatedAt: Date;
    courseQuestionAssessmentInfo?: RederlyQuestionAssessmentInfo;
    originatingTopicQuestionId: number;
}

export interface RederlyQuestionAssessmentInfo {
    id: number;
    courseWWTopicQuestionId: number;
    curriculumQuestionAssessmentInfoId: number;
    randomSeedSet: Array<number>;
    additionalProblemPaths: Array<string>;
    active: boolean;
    originatingQuestionAssessmentInfoId: number;
}

export interface RederlyTopicAssessmentInfo {
    id: number;
    courseTopicContentId: number;
    hardCutoff: boolean;
    hideHints: boolean;
    showItemizedResults: boolean;
    showTotalGradeImmediately: boolean;
    hideProblemsAfterFinish: boolean;
    randomizeOrder: boolean;
    originatingTopicAssessmentInfoId: number;

    duration: number;
    maxVersions: number;
    maxGradedAttemptsPerVersion: number;
    versionDelay: number;
}
