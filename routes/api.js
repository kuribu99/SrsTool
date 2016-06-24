var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var _ = require('underscore');

module.exports = function (wagner) {
    var api = express.Router();
    api.use(bodyparser.json());

    api.use('/projects/', require('./project')(wagner));
    api.use('/domains/', require('./domain')(wagner));
    api.use('/boilerplate/', require('./boilerplate')(wagner));

	return api;
};