var mongoose = require('mongoose');

var moduleSchema = {
    _id: {
        type: String,
        required: true
    }
};

module.exports = new mongoose.Schema(moduleSchema);
module.exports.moduleSchema = moduleSchema;
