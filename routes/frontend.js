var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var _ = require('underscore');
var path = require('path');

module.exports = function (wagner) {
    var api = express.Router();

    api.use(bodyparser.json());

    api.get('/', function (req, res) {
        return res.sendFile('./public/index.html');
    });

    return api;
};
