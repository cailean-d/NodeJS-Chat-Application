// var io = require('socket.io');
// var express = require('express');

// var app = express.createServer();
// var io = io.listen(app);

// app.listen(80);

// io.sockets.on('connection', function (socket) {
//   socket.emit('news', { hello: 'world' });
//   socket.on('my other event', function (data) {
//     console.log(data);
//   });
//   socket.on('disconnect', function () {
//     console.log('user disconnected');
//   });
// });



var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var colors = require('colors/safe');
var mysql = require('mysql');
var mysqlUtilities = require('mysql-utilities');
var now = require("performance-now");
var rndName = require("./randomName");

var ip = '0.0.0.0';
var port = 3000;
var connections = [];
var clients = {};
var users = [];

var connection = mysql.createConnection({
  host:     'localhost',
  user:     'root',
  password: '',
  database: 'test'
});
//=================================================
//                   Routing
//=================================================
app.get('/', function(req, res){
 res.sendFile(__dirname + '/index.html');
});

app.get('/js/socket-connection.js', function(req, res){
 res.sendFile(__dirname + '/js/socket-connection.js');
});
app.get('/css/style.css', function(req, res){
 res.sendFile(__dirname + '/css/style.css');
});

//=================================================

http.listen(port, ip, function(){
  console.log(colors.green(`\nSERVER listening on ${ip}:${port}\n`));
});

io.on('connection', function(socket){
	connections.push(socket);

	var rndClientName = rndName();

	socket.emit('name', rndClientName);
	socket.username = rndClientName;
	users.push(socket.username);

	updateOnline();
	socket.broadcast.emit('connectedUser', socket.username);

    console.log(colors.yellow(`${socket.username} is connected`));
    // console.log(colors.green(`ONLINE IS ${connections.length}`));

    socket.on('disconnect', function(){

    console.log(colors.red(`${socket.username} disconnected`));
    users.splice(users.indexOf(socket.username), 1);

    connections.splice(connections.indexOf(socket), 1);
    // console.log(colors.green(`ONLINE IS ${connections.length}`));

   
    updateOnline();
    socket.broadcast.emit('disconnectedUser', socket.username);

  });

  socket.on('chat message', function(msg){
 
    var table = 'node_test';

 	socket.broadcast.emit('chat message', {
 		message: msg.message,
 		sender : msg.sender,
 		time: msg.time
 	});

	mysqlUtilities.upgrade(connection);
    mysqlUtilities.introspection(connection);

	var start = now();

	connection.insert(table, {
	  a: msg.sender,
	  b: msg.message,
	  c: msg.time,
	}, function(err, recordId) {

	  var end = now();

	  console.log('MESSAGE \"' + colors.magenta(msg.message) + '\" BY ' + colors.cyan(msg.sender) + ' IS INSERTED INTO ' + 
					colors.magenta(table) + ' WITH ID ' + colors.magenta(recordId) + ' IN ' + colors.green((end - start).toFixed(3)) + ' ms');
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

// function connectedUser(){
// 	socket.broadcast.emit('connectedUser', socket.username);
// }
// function disconnectedUser(){
// 	socket.broadcast.emit('disconnectedUser', socket.username);
// }