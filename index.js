var express = require('express');
var wagner = require('wagner-core');

require('./models')(wagner);

var app = express();

app.use(require('morgan')('[:method] :url'));

//wagner.invoke(require('./auth'), { app: app });

app.use('/api/v1', require('./routes/api')(wagner));
app.use(express.static('./public'/*, { maxAge: 4 * 60 * 60 * 1000 }*/));


console.log('Listening on port 3000!');
app.listen(3000);
