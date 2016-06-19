var mongoose = require('mongoose');

var actionSchema = {
    _id: {
        type: String,
        required: true
    }
};

module.exports = new mongoose.Schema(actionSchema);
module.exports.actionSchema = actionSchema;
