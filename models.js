var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function (wagner) {
    return wagner.invoke(function (Config) {
        mongoose.connect(Config.DbConnection);

        wagner.factory('db', function () {
            return mongoose;
        });

        var models = {
            Project: mongoose.model('Project', require('./models/project.js'), 'projects'),
            Domain: mongoose.model('Domain', require('./models/domain.js'), 'domains'),
            User: mongoose.model('User', require('./models/user.js'), 'users')
        };

        _.each(models, function (value, key) {
            wagner.factory(key, function () {
                return value;
            });
        });

        return models;
    });
};
