(function(window, document){
  'use strict';
  var evtSrc;
  var clientId;
  var logArea = document.querySelector('.js-console');
  var interval;
  var socket;

  function startSocketSend(){
    var i = 0;
    if(interval){
      return;
    }
    interval = setInterval(function(){
      var msg = 'yo this works '+i;
      log('sending', msg);
      socket.emit('message', {clientId: clientId, data: {msg: msg, time: (new Date()).getTime()}});
      ++i;
    }, 1000);
  }

  function log(){
    var args = Array.prototype.slice.call(arguments);
    var row = document.createElement('div');
    var strong = document.createElement('strong');
    var span = document.createElement('span');
    strong.innerHTML = args[0];
    row.classList.add(args[0]);
    span.innerHTML = ' '+args.slice(1).join(' ');
    row.appendChild(strong);
    row.appendChild(span);
    logArea.appendChild(row);
    if(logArea.scrollTop !== logArea.scrollHeight){
      logArea.scrollTop = logArea.scrollHeight;
    }
  }

  document.querySelector('.js-start').addEventListener('click', function(evt){
    evt.preventDefault();
    evtSrc = new window.EventSource('/sse');
    evtSrc.onopen = function(){
      console.log('event source opened');
    };

    evtSrc.onclose = function(){
      console.log('closed');
    };

    evtSrc.addEventListener('handshake', function(msg){
      var data = JSON.parse(msg.data);
      clientId = data.id;
      console.log('handshake completed, client id', clientId);
    });

    evtSrc.addEventListener('message', function(msg){
      var data = JSON.parse(msg.data);
      msg = data.msg;
      var then = (new Date(data.time)).getTime();
      var now = (new Date()).getTime();
      var diff = now - then;

      log('received', msg, diff+'ms');
    });

    if(socket && socket.disconnected){
      socket.connect();
    } else {
      socket = window.io('http://localhost:8000');
    }
  });

  document.querySelector('.js-stop').addEventListener('click', function(evt){
    evt.preventDefault();
    evtSrc.close();
    clearInterval(interval);
    socket.close();
    interval = undefined;
  });

  document.querySelector('.js-send').addEventListener('click', function(evt){
    var msg = 'yo this works';
    log('sending', msg);
    socket.emit('message', {clientId: clientId, data: {msg: msg, time: (new Date()).getTime()}});
  });

})(window, document);