'use strict';

//via http://qiita.com/itagakishintaro/items/a1519998a91061cbfb1e

var configRoutes;
var mongo = require('./mongo');

configRoutes = function(app) {
  app.all('/*', function(request, response, next){
    response.contentType('json');
    response.header('Access-Control-Allow-Origin', '*');
    next();
  });
  app.get('/404', function(request, response) {
    response.status(404).send('Not Found');
  });
  app.get('/', function(request, response) {
    response.redirect('/index.html');
  });
  app.get('/findgiji', function(request, response) {
    mongo.find('giji', {}, {}, {},
      function(list){
        response.send(list);
      }
    );
  });
  app.get('/find', function(request, response) {
    mongo.find('test', {}, {}, {createdOn: -1},
      function(list){
        response.send(list);
      }
    );
  });
  app.get('/find/:name', function(request, response) {
    mongo.find('test', {createdOn: request.params.name}, {}, {},
      function(list){
        response.send(list);
      }
    );
  });

  app.post('/insertgiji', function(request, response) {
    mongo.insert('giji', request.body, {},
      function(result){
        response.send(result);
      }
    );
  });
  app.post('/insert', function(request, response) {
    mongo.insert('test', request.body, {},
      function(result){
        response.send(result);
      }
    );
  });
  app.get('/update/:name1/:name2', function(request, response) {
    mongo.update('test', {name: request.params.name1}, {name: request.params.name2}, {},
      function(result){
        response.send(result);
      }
    );
  });
  app.get('/remove/:name', function(request, response) {
    mongo.remove('test', {createdOn: request.params.name}, {justOne: false},
      function(result){
        response.send(result);
      }
    );
  });
  app.get('/remove', function(request, response) {
    mongo.remove('test', {}, {justOne: false},
      function(result){
        response.send(result);
      }
    );
  });
}

module.exports = {configRoutes: configRoutes};
