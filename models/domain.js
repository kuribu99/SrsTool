var mongoose = require('mongoose');

var domainSchema = {
    _id: {
        type: String,
        default: 'untitled'
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
};

module.exports = new mongoose.Schema(domainSchema);
module.exports.domainSchema = domainSchema;
