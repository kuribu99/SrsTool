var express = require('express');
var wagner = require('wagner-core');

require('./models')(wagner);

var app = express();

// Load configurations
wagner.factory('Config', require('./config'));

// Logger
app.use(require('morgan')('[:method] :url'));

// FB authentication module
wagner.invoke(require('./auth'), {app: app});

// Routes
app.use('/api/v1', require('./routes/api')(wagner));

// Serve client files in public folder
app.use(express.static('./public'/*, { maxAge: 4 * 60 * 60 * 1000 }*/));

// Start server
console.log('Listening on port 3000!');
app.listen(3000);
