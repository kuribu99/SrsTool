var mongoose = require('mongoose');

var boilerplateSchema = {
    _id: {
        type: String,
        required: true
    },
    attributes: [{
        type: String,
        default: []
    }]
};

module.exports = new mongoose.Schema(boilerplateSchema);
module.exports.boilerplateSchema = boilerplateSchema;
