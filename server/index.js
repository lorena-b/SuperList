var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');


var api_router = require('./routes/api');
var spotify_router = require('./routes/spotify');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 5000;

app.use('/api', api_router);
app.use('/spotify', spotify_router);

app.listen(port);
console.log('Magic happens on port ' + port);
