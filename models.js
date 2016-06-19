var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function (wagner) {
    mongoose.connect('mongodb://localhost:27017/srs_tool');

    wagner.factory('db', function () {
        return mongoose;
    });

    var models = {
        Project: mongoose.model('Project', require('./models/project.js'), 'projects'),
        Domain: mongoose.model('Domain', require('./models/domain.js'), 'domains'),
        User: mongoose.model('User', require('./models/user.js'), 'users'),
        Module: mongoose.model('Module', require('./models/module.js'), 'modules'),
        Actor: mongoose.model('Actor', require('./models/actor.js'), 'actors'),
        Action: mongoose.model('Action', require('./models/action.js'), 'actions')
    };

    _.each(models, function (value, key) {
        wagner.factory(key, function () {
            return value;
        });
    });

    return models;
};
