var express = require('express');

module.exports = function (wagner) {
    var api = express.Router();

    api.get('/all', wagner.invoke(function (Action) {
        return function (req, res) {
            Action.find()
                .then(function (actions) {
                    return res.json({
                        result: true,
                        actions: actions
                    });
                }, function (error) {
                    if (error) {
                        return res.status(status.INTERNAL_SERVER_ERROR).json({
                            result: false,
                            actions: [],
                            error: error.toString()
                        });
                    }
                });
        }
    }));

    return api;
};
