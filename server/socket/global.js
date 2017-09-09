var colors = require('colors/safe');
var mysql_module = require('../mysql');


module.exports = function(io){
    io.on('connection', function(socket){
        socket.userid =  socket.handshake.query.id;
        socket.username =  socket.handshake.query.nickname;
        socket.avatar =  socket.handshake.query.avatar;
    });
}
    