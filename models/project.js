var mongoose = require('mongoose');

var projectSchema = {
    userID: {
        type: mongoose.Schema.ObjectId,
        //required: true,
        //ref: 'User'
    },
    projectName: {
        type: String,
        default: "untitled"
    },
    domainData: {
        domainName: {
            type: String,
            default: "default"
        },
        actors: [{
            type: String,
            default: []
        }],
        modules: [{
            type: String,
            default: []
        }],
        actions: [{
            type: String,
            default: []
        }]
    },
    generatedRequirements: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    boilerplateData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    accessControlData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    actionControlData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    performanceConstraintData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    functionalConstraintData: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            interfaces: [],
            actionDependencies: [],
            actionRules: []
        }
    },
    compatibilityData: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            operatingSystem: [],
            executionEnvironment: [],
            outputCompatibility: []
        }
    },
    reliabilityData: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            availability: {
                enabled: false,
                value: 99
            },
            maintenance: {
                enabled: false,
                value: '1 hour',
                period: 'week'
            },
            recoveryPeriod: [],
            redundancyOption: [],
            recoveryItem: []
        }
    }
};

module.exports = new mongoose.Schema(projectSchema);
module.exports.domainSchema = projectSchema;
