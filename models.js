var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function (wagner) {
    //mongoose.connect('mongodb://localhost:27017/srs_tool');
    mongoose.connect('mongodb://admin:kuribu99@ds019624.mlab.com:19624/srs_tool');

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
};
