var express = require('express');

module.exports = function (wagner) {
    var api = express.Router();
    var _ = require('underscore');

    api.get('/names/all', wagner.invoke(function (Domain) {
        return function (req, res) {
            Domain.find()
                .select({_id: true})
                .then(function (domains) {
                    return res.json({
                        result: true,
                        domains: _.map(domains, function (val) {
                            return val._id;
                        })
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

    api.get('/:id', wagner.invoke(function (Domain) {
        return function (req, res) {
            var id = req.params.id;
            Domain.findOne({
                _id: id
            }).then(function (domain) {
                    return res.json({
                        result: domain != null,
                        domain: domain
                    });
                }, function (error) {
                    if (error) {
                        return res.status(status.INTERNAL_SERVER_ERROR).json({
                            result: false,
                            domain: null,
                            error: error.toString()
                        });
                    }
                }
            );
        };
    }));

    return api;
}
;
