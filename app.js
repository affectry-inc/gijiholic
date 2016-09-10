'use strict';

//via http://qiita.com/itagakishintaro/items/a1519998a91061cbfb1e

var http = require('http');
var path = require("path");
var express = require('express');
var routes = require('./app/routes');
var parser = require('body-parser');

var app = express();
var server = http.createServer(app);

app.use(parser.urlencoded({extended: true}));
app.use(parser.json());
app.use(express.static(path.join(__dirname, 'public')));

routes.configRoutes(app, server);

server.listen(3000);

console.log('Listening on port %d in %s mode', server.address().port, app.settings.env);