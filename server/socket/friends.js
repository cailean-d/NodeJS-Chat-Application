var colors = require('colors/safe');
var mysql_module = require('../mysql');


module.exports = function(io, global){
    io.on('connection', function(socket){

        socket.userid =  socket.handshake.query.id;
        socket.username =  socket.handshake.query.nickname;

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

        socket.on('reject_friend', function(data){
            mysql_module.reject_friend(data, socket.userid, function(err){
                if (err) {
                    socket.emit('friend_rejected', {success: false, user: data})
                } else {
                    socket.emit('friend_rejected', {success: true, user: data})

                    // notify sender about denying friendship
                    sendToSpecificUser(global, data, 'friendship_rejected', socket.username)
                }            
            });
        });

    });
}
    

function sendToSpecificUser(globalIO, userid, event, data){
    for(socketId in globalIO.of('/').clients().sockets){
        if(globalIO.of('/').clients().sockets[socketId].handshake.query.id == userid){
            globalIO.to(socketId).emit(event, data);
        }
    }
}