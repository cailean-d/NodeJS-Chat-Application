var colors = require('colors/safe');
var mysql_module = require('../mysql');


module.exports = function(io, global){
    io.on('connection', function(socket){
        socket.userid =  socket.handshake.query.id;
        socket.username =  socket.handshake.query.nickname;
        // console.log(socket.userid)
        // console.dir(global.of('/').clients().sockets);
        // for(socketId in global.of('/').clients().sockets){

        //     console.log(global.of('/').clients().sockets[socketId].handshake.query.id);
        // }
        socket.on('add_friend', function(data){
            mysql_module.add_friend(data, socket.userid, function(err){
                if (err) {
                    socket.emit('friend_added', {success: false, user: data})
                } else {
                    socket.emit('friend_added', {success: true, user: data})

                    // notify sender about accepting friendship
                    for(socketId in global.of('/').clients().sockets){
                        if(global.of('/').clients().sockets[socketId].handshake.query.id == data){
                            global.to(socketId).emit('added_to_friends', socket.username);
                        }
                    }
                }
            });
        })
        socket.on('delete_friend', function(data){
            mysql_module.delete_friend(data, socket.userid, function(err){
                if (err) {
                    socket.emit('friend_deleted', {success: false, user: data})
                } else {
                    socket.emit('friend_deleted', {success: true, user: data})

                    // notify sender about deleting friendship
                    for(socketId in global.of('/').clients().sockets){
                        if(global.of('/').clients().sockets[socketId].handshake.query.id == data){
                            global.to(socketId).emit('deleted_from_friends', socket.username);
                        }
                    }
                }            
            });
        });

    });
}
    