export interface RederlyCourse {
    id: number;
    name: string;
    units?: RederlyUnit[];
}

export interface RederlyUnit {
    name: string;
    topics?: RederlyTopic[];
}

export interface RederlyTopic {
    name: string;
    startDate: Date;
    endDate: Date;
    deadDate: Date;
    partialExtend: boolean;
    description: unknown;

    topicTypeId: number;

    questions?: RederlyQuestion[];
    topicAssessmentInfo?: RederlyTopicAssessmentInfo | null;
}

export interface RederlyQuestion {
    id: number;
    problemNumber: number;
    webworkQuestionPath: string;
    weight: number;
    maxAttempts: number;
    optional: boolean;

    courseQuestionAssessmentInfo?: RederlyQuestionAssessmentInfo | null;
}

export interface RederlyQuestionAssessmentInfo {
    randomSeedSet: Array<number>;
    additionalProblemPaths: Array<string>;
}

export interface RederlyTopicAssessmentInfo {
    hardCutoff: boolean;
    hideHints: boolean;
    showItemizedResults: boolean;
    showTotalGradeImmediately: boolean;
    hideProblemsAfterFinish: boolean;
    randomizeOrder: boolean;

    duration: number;
    maxVersions: number;
    maxGradedAttemptsPerVersion: number;
    versionDelay: number;
}
