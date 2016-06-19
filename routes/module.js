var bodyparser = require('body-parser');
var express = require('express');
var _ = require('underscore');

module.exports = function (wagner) {
    var api = express.Router();
    api.use(bodyparser.json());

    api.get('/all', wagner.invoke(function (Module) {
        return function (req, res) {
            Module.find()
                .then(function (modules) {
                    return res.json({
                        result: true,
                        modules: _.map(modules, function (val) {
                            return val._id;
                        })
                    });
                }, function (error) {
                    if (error) {
                        return res.status(status.INTERNAL_SERVER_ERROR).json({
                            result: false,
                            modules: [],
                            error: error.toString()
                        });
                    }
                });
        }
    }));

    return api;
};
