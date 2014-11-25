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
      socket.emit('message', {clientId: clientId, data: msg});
      ++i;
    }, 1000);
  }

  function log(type, msg){
    var row = document.createElement('div');
    var strong = document.createElement('strong');
    var span = document.createElement('span');
    strong.innerHTML = type;
    row.classList.add(type);
    span.innerHTML = ' '+msg;
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
      startSocketSend();
    });

    evtSrc.addEventListener('message', function(msg){
      var data = msg.data;
      log('received', data);
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
})(window, document);