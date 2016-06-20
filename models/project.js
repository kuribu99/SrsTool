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
    accessControlData: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    }
};

module.exports = new mongoose.Schema(projectSchema);
module.exports.domainSchema = projectSchema;
