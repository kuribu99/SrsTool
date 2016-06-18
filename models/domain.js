var mongoose = require('mongoose');

var domainSchema = {
    _id: {
        type: String,
        required: true
    },
    actors: [{
        type: String
    }],
    modules: [{
        type: String
    }],
    actions: [{
        type: String
    }]
};

module.exports = new mongoose.Schema(domainSchema);
module.exports.domainSchema = domainSchema;
