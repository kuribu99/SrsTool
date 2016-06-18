var express = require('express');
var wagner = require('wagner-core');

require('./models')(wagner);
require('./dependencies')(wagner);

var app = express();

//app.use(require('morgan')());

//wagner.invoke(require('./auth'), { app: app });

app.use('/api/v1', require('./routes/api')(wagner));
app.use(express.static('./public'/*, { maxAge: 4 * 60 * 60 * 1000 }*/));

app.listen(wagner.invoke(function (Config) {
    console.log('Listening on port ' + Config.port + '!');
    return Config.port;
}));
