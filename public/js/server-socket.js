var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

module.exports = function (){

var connections = [];
var clients = {};
var users = [];


	io.on('connection', function(socket){
	connections.push(socket);


  // var rndClientName = rndName();
  var rndClientName = '';


  socket.on('user-name', function(client){
      rndClientName = client;
      // console.log(client + '  ___user-name');

      socket.username = rndClientName;
      users.push(socket.username);

      updateOnline();

      socket.broadcast.emit('connectedUser', socket.username);
      console.log(colors.yellow(`${socket.username} is connected`));
      

  });  


	// socket.emit('name', rndClientName);




    // console.log(colors.green(`ONLINE IS ${connections.length}`));

    socket.on('disconnect', function(){

      if(socket.username){
        console.log(colors.red(`${socket.username} disconnected`));
      }

    users.splice(users.indexOf(socket.username), 1);

    connections.splice(connections.indexOf(socket), 1);
    // console.log(colors.green(`ONLINE IS ${connections.length}`));

   
    updateOnline();
    socket.broadcast.emit('disconnectedUser', socket.username);

  });

  socket.on('chat message', function(msg){

   	socket.broadcast.emit('chat message', {
   		sender : msg.sender,
      message: msg.message,
   		time: msg.time
   	});

    connection.insert('general_chat', {
    sender: msg.sender,
    message: msg.message
  }, function(err, recordId) {
    if(err){ console.log(err);}


    console.log('MESSAGE \"' + colors.magenta(msg.message) + '\" BY ' + colors.cyan(msg.sender) + ' IS INSERTED INTO ' + 
          colors.magenta('general_chat') + ' WITH ID ' + colors.magenta(recordId));
  });

  });

  socket.on('typing', function(client){
     socket.broadcast.emit('typing', client);
  });  
  socket.on('typingEnd', function(client){
     io.emit('typingEnd', client);
  });

});

	function updateOnline(){
      io.sockets.emit('online', users);
}

}