var express = require('express');

module.exports = function (wagner) {
    var api = express.Router();

    api.get('/all', wagner.invoke(function (Actor) {
        return function (req, res) {
            Actor.find()
                .then(function (actors) {
                    return res.json({
                        result: true,
                        actors: actors
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
