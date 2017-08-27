var colors = require('colors/safe');
var mysql_module = require('../server/mysql');


module.exports = function(io){
    io.on('connection', function(socket){
        socket.userid =  socket.handshake.query.id;
        socket.username =  socket.handshake.query.nickname;
        
    });
}
    