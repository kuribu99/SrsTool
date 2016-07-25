var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var _ = require('underscore');

module.exports = function (wagner) {
    var api = express.Router();
    api.use(bodyparser.json());

    // Prevent cache of HTTP responses
    api.use(function (req, res, next) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next()
    });

    api.use('/me/', require('./user')(wagner));
    api.use('/projects/', require('./project')(wagner));
    api.use('/domains/', require('./domain')(wagner));

	return api;
};