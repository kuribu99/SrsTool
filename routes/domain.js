var express = require('express');

module.exports = function (wagner) {
    var api = express.Router();

    api.get('/all', wagner.invoke(function (Domain) {
        return function (req, res) {
            Domain.find()
                .then(function (domains) {
                    return res.json({
                        result: true,
                        domains: domains
                    });
                }, function (error) {
                    if (error) {
                        return res.status(status.INTERNAL_SERVER_ERROR).json({
                            result: false,
                            domains: [],
                            error: error.toString()
                        });
                    }
                });
        }
    }));

    return api;
};
