'use strict';

//via http://qiita.com/itagakishintaro/items/a1519998a91061cbfb1e

var http = require('http');
var path = require("path");
var express = require('express');
var routes = require('./app/routes');
var parser = require('body-parser');

var app = express();

app.use(parser.urlencoded({extended: true}));
app.use(parser.json());
app.use(express.static(path.join(__dirname, 'public')));

routes.configRoutes(app);

var server = app.listen(process.env.PORT || 3000, 'localhost', function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening on port %d in %s mode', server.address().port, app.settings.env);
});
