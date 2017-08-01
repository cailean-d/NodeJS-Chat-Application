// var socket = io('http://localhost');
//   socket.on('connect', function(){});
//   socket.on('event', function(data){});
//   socket.on('disconnect', function(){});



//   	socket.on('eventClient', function (data) {
// 		console.log(data);
// 	});
// 	socket.emit('eventServer', { data: 'Hello Server' });

//   socket.on('news', function (data) {
//     console.log(data);
//     socket.emit('my other event', { my: 'data' });
//   });



  $(function () {
    var socket = io("http://localhost:3000");
    $('#chat').submit(function(){
      socket.emit('chat message', $('#message').val());
      $('#message').val('');
      return false;
    });
  });
