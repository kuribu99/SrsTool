var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var _ = require('underscore');

module.exports = function (wagner) {
    var api = express.Router();
    api.use(bodyparser.json());

    api.get('/', function (req, res) {
        return res.json({user: req.user? req.user: null});
    });

    return api;
};
