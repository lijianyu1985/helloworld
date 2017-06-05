"use strict";

var Hapi = require("hapi");
var pool = require("./db.js");

var server = new Hapi.Server();
server.connection({port: 80, host: "0.0.0.0"});

server.route([
  {
    method: "GET",
    path: "/",
    handler: function (request, reply) {
      pool
        .query('insert into access_log (ip, access_datetime) values($1, current_timestamp)', [request.info.remoteAddress], function (err, res) {
          if (err) {
            return console.error('error running query', err);
          }
        });
      reply.file("index.html");
    }
  }, {
    method: "GET",
    path: "/AccessLogs",
    handler: function (request, reply) {
      pool
        .query('SELECT ip, access_datetime from access_log', {}, function (err, res) {
          if (err) {
            reply(err);
          } else {
            reply(res.rows);
          }
        });
    }
  }
]);

server.register([require("inert")], function(err) {
  if (err) {
    return console.error(err);
  }
  server.start(function(e){
    if (e) {
      throw e;
    }
    server
      .connections
      .forEach(function(item){
        console.log('Server running at: ' + item.info.uri);
      });
  });
});
