var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var _ = require('underscore');

module.exports = function (wagner) {
    var api = express.Router();
    api.use(bodyparser.json());

    api.use('/me/', require('./user')(wagner));
    api.use('/projects/', require('./project')(wagner));
    api.use('/domains/', require('./domain')(wagner));

	return api;
};