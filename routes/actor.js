var express = require('express');
var _ = require('underscore');

module.exports = function (wagner) {
    var api = express.Router();

    api.get('/all', wagner.invoke(function (Actor) {
        return function (req, res) {
            Actor.find()
                .then(function (actors) {
                    return res.json({
                        result: true,
                        actors: _.map(actors, function (val) {
                            return val._id;
                        })
                    });
                }, function (error) {
                    if (error) {
                        return res.status(status.INTERNAL_SERVER_ERROR).json({
                            result: false,
                            actors: [],
                            error: error.toString()
                        });
                    }
                });
        }
    }));

    return api;
};
