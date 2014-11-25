'use strict';

var http = require('http');
var fs = require('fs');
var crypto = require('crypto');

var socketio = require('socket.io');

var clients = {};

function randomToken(len) {
  return crypto.randomBytes(Math.ceil(len / 2))
    .toString('hex')
    .slice(0, len);
}

function sendEvent(client, namespace, data){
  var res = clients[client];
  if(!res){
    console.log('no client', res);
    return;
  }
  console.log('emitting event', namespace, 'to client', client);

  data = typeof data === 'string' ? data : JSON.stringify(data);
  var namespace = 'event: '+namespace;
  var info = 'data: '+data;
  var msg = [namespace, info, '\n'].join('\n')
  res.write(msg);
}

var app = http.createServer(function(req, res){
  if(req.url === '/sse'){
    var client = randomToken(32);
    var handshake = {id: client};
    var headers = {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      'connection': 'keep-alive'
    };

    if(!clients[client]){
      console.log('setting client into object');
      headers['set-cookie'] = 'clientId='+client
      clients[client] = res;
    }

    res.writeHead(200, headers);
    res.write('retry: 1000\n');
    res.on('close', function(){
      console.log('client disconnected from see', client);
    });

    res.on('end', function(){
      console.log('client disconnected from see', client);
    });

    sendEvent(client, 'handshake', handshake);
  } else if(req.url === '/client.js'){
    res.writeHead(200, {'content-type': 'application/javascript'});
    fs.createReadStream('client.js').pipe(res);
  } else {
    res.writeHead(200, {'content-type': 'text/html', 'cache-control': 'no-cache'});
    fs.createReadStream('index.html').pipe(res);
  }
});

var io = socketio(app);
app.listen(8000);
console.log('listening on 8000');

io.on('connection', function(socket){
  console.log('socket connected');

  socket.on('message', function(msg){
    console.log('received message from', msg.clientId);
    var clientId = msg.clientId;
    sendEvent(clientId, 'message', msg.data);
  });
});