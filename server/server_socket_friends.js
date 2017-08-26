var colors = require('colors/safe');
var mysql_module = require('../server/mysql');


module.exports = function(io){
    io.on('connection', function(socket){
        socket.userid =  socket.handshake.query.id;
        socket.username =  socket.handshake.query.nickname;
        
        socket.on('add_friend', function(data){
            mysql_module.add_friend(data, socket.userid, function(err){
                if (err) {
                    socket.emit('friend_added', {success: false, user: data})
                } else {
                    socket.emit('friend_added', {success: true, user: data})
                }
            });
        })
        socket.on('delete_friend', function(data){
            mysql_module.delete_friend(data, socket.userid, function(err){
                if (err) {
                    socket.emit('friend_deleted', {success: false, user: data})
                } else {
                    socket.emit('friend_deleted', {success: true, user: data})
                }            
            });
        });

    });
}
    