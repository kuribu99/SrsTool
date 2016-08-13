var express = require('express');
var wagner = require('wagner-core');

// Set whether we are in development mode
const DEV_MODE = false;

var app = express();

// Load configurations
wagner.factory('Config', require('./config')(DEV_MODE));

// Logger
app.use(require('morgan')('[:method] :url'));

// Models
require('./models')(wagner);

// FB authentication module
wagner.invoke(require('./auth'), {app: app});

// Routes
app.use('/api/v1', require('./routes/api')(wagner));

// Serve client files in public folder
app.use(express.static('./public', {maxAge: 4 * 60 * 60 * 1000}));

// Start server
wagner.invoke(function (Config) {
    console.log('Server listening on port ' + Config.ServerPort + '!');
    app.listen(Config.ServerPort);
});