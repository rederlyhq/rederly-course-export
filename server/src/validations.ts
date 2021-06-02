export const postCourseBodySchema = {
    type: 'object',
    required: ['id', 'name', 'units'],
    additionalProperties: false,
    properties: {
        id: {
            type: 'number'
        },
        name: {
            type: 'string'
        },
        units: {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'name', 'topics'],
                additionalProperties: false,
                properties: {
                    id: {
                        type: 'number'
                    },
                    name: {
                        type: 'string',
                    },
                    topics: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['name', 'startDate', 'endDate', 'deadDate', 'partialExtend', 'description', 'topicTypeId', 'questions', 'topicAssessmentInfo'],
                            additionalProperties: false,
                            properties: {
                                id: {
                                    type: 'number'
                                },
                                name: {
                                    type: 'string',
                                },
                                startDate: {
                                    type: 'string',
                                    format: 'date-time',
                                    tsType: 'Date',
                                    description: 'When the course is scheduled to start.',
                                    example: '2019-09-28T02:00:00.000Z',
                                    maxLength: 30
                                },
                                endDate: {
                                    type: 'string',
                                    format: 'date-time',
                                    tsType: 'Date',
                                    description: 'When the course is scheduled to start.',
                                    example: '2019-09-28T02:00:00.000Z',
                                    maxLength: 30
                                },
                                deadDate: {
                                    type: 'string',
                                    format: 'date-time',
                                    tsType: 'Date',
                                    description: 'When the course is scheduled to start.',
                                    example: '2019-09-28T02:00:00.000Z',
                                    maxLength: 30
                                },
                                partialExtend: {
                                    type: 'boolean',

                                },
                                description: {
                                    oneOf: [{
                                        type: 'object',
                                        additionalProperties: true
                                    }, {
                                        type: 'null'
                                    }]
                                },
                                topicTypeId: {
                                    type: 'number',
                                },
                                questions: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        required: ['id', 'problemNumber', 'webworkQuestionPath', 'weight', 'maxAttempts', 'courseQuestionAssessmentInfo', 'optional'],
                                        additionalProperties: false,
                                        properties: {
                                            id: {
                                                type: 'number'
                                            },
                                            problemNumber: {
                                                type: 'number'
                                            },
                                            webworkQuestionPath: {
                                                type: 'string'
                                            },
                                            weight: {
                                                type: 'number'
                                            },
                                            maxAttempts: {
                                                type: 'number'
                                            },
                                            optional: {
                                                type: 'boolean'
                                            },
                                            courseQuestionAssessmentInfo: {
                                                oneOf: [{
                                                    type: 'null'
                                                }, {
                                                    type: 'object',
                                                    required: ['randomSeedSet', 'additionalProblemPaths'],
                                                    additionalProperties: false,
                                                    properties: {
                                                        randomSeedSet: {
                                                            type: 'array',
                                                            items: {
                                                                type: 'number'
                                                            }
                                                        },
                                                        additionalProblemPaths: {
                                                            type: 'array',
                                                            items: {
                                                                type: 'string'
                                                            }
                                                        },
                                                    }    
                                                }]
                                            },
                                        }
                                    }
                                },
                                topicAssessmentInfo: {
                                    oneOf: [{
                                        type: 'null',
                                    }, {
                                        type: 'object',
                                        required: ['duration', 'hardCutoff', 'hideHints', 'hideProblemsAfterFinish', 'maxGradedAttemptsPerVersion', 'maxVersions', 'randomizeOrder', 'showItemizedResults', 'showTotalGradeImmediately', 'versionDelay'],
                                        additionalProperties: false,
                                        properties: {
                                            duration: {
                                                type: 'number'
                                            },
                                            hardCutoff: {
                                                type: 'boolean'
                                            },
                                            hideHints: {
                                                type: 'boolean'
                                            },
                                            hideProblemsAfterFinish: {
                                                type: 'boolean'
                                            },
                                            maxGradedAttemptsPerVersion: {
                                                type: 'number'
                                            },
                                            maxVersions: {
                                                type: 'number'
                                            },
                                            randomizeOrder: {
                                                type: 'boolean'
                                            },
                                            showItemizedResults: {
                                                type: 'boolean'
                                            },
                                            showTotalGradeImmediately: {
                                                type: 'boolean'
                                            },
                                            versionDelay: {
                                                type: 'number'
                                            },                                                    
                                        }
                                    }]
                                }
                            }
                        }
                    }
                }
            }
        },
    }
};
