var bodyparser = require('body-parser');
var express = require('express');
var _ = require('underscore');

module.exports = function (wagner) {
    var api = express.Router();
    api.use(bodyparser.json());

    api.get('/', wagner.invoke(function (Boilerplate) {
        return function (req, res) {
            Boilerplate.find()
                .then(function (boilerplates) {
                    return res.json({
                        result: true,
                        boilerplates: boilerplates
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

    api.get('/attributes/:attributes', wagner.invoke(function (Boilerplate) {
        return function (req, res) {
            var id = req.params.attributes;

            Boilerplate.find({
                attributes: attributes
            }).then(function (boilerplates) {
                    return res.json({
                        result: boilerplates != null,
                        boilerplates: boilerplates
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
