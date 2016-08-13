module.exports = function (devMode) {
    return function () {
        if (devMode) {
            return {
                WebsiteURL: 'http://localhost:3000/',
                FacebookAppID: '194865244249963',
                FacebookAppSecret: '9336d356dcf2310bc98ff342ebd9bc0e',
                DbConnection: 'mongodb://localhost:27017/srs_tool',
                ServerPort: 3000
            };
        }
        else {
            return {
                WebsiteURL: 'https://srs-tool.herokuapp.com/',
                FacebookAppID: '194195624316925',
                FacebookAppSecret: '41482af6ae9b160468496fc17155664c',
                DbConnection: 'mongodb://admin:kuribu99@ds019624.mlab.com:19624/srs_tool',
                ServerPort: process.env.PORT || 3000
            };
        }
    }
};