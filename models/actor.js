var mongoose = require('mongoose');

var actorSchema = {
    _id: {
        type: String,
        required: true
    }
};

module.exports = new mongoose.Schema(actorSchema);
module.exports.actorSchema = actorSchema;
