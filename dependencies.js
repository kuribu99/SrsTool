var fs = require('fs');
var fx = require('./fx');

module.exports = function (wagner) {
    wagner.factory('fx', fx);

    wagner.factory('Config', function () {
        return JSON.parse(fs.readFileSync('./config.json').toString());
    });
};
