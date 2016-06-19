var express = require('express');

module.exports = function (wagner) {
    var api = express.Router();

    api.get('/all', wagner.invoke(function (Module) {
        return function (req, res) {
            Module.find()
                .then(function (modules) {
                    return res.json({
                        result: true,
                        modules: modules
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
