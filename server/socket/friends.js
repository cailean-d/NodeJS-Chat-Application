var colors = require('colors/safe');
var mysql_module = require('../mysql');


module.exports = function(io, global){
    io.on('connection', function(socket){

        socket.userid =  socket.handshake.query.id;
        socket.username =  socket.handshake.query.nickname;
        socket.avatar =  socket.handshake.query.avatar;

        socket.on('add_friend', function(data){
            mysql_module.add_friend(data, socket.userid, function(err){
                if (err) {
                    socket.emit('friend_added', {success: false, user: false})
                } else {
                    mysql_module.getUser(data, function(userObject){
                        socket.emit('friend_added', {success: true, user: {
                            id: userObject[0].id,
                            nickname: userObject[0].nickname,
                            avatar: userObject[0].avatar
                        }})
                    });

                    // notify sender about accepting friendship
                    sendToSpecificUser(global, data, 'added_to_friends', socket.username)                    
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
                    sendToSpecificUser(global, data, 'deleted_from_friends', {
                        username: socket.username,
                        id: socket.userid
                    })
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

        socket.on('invite_friend', function(data){
            mysql_module.invite_friend(socket.userid, data, function(err){
                if (err) {
                    socket.emit('friend_invited', {success: false, user: data})
                } else {
                    socket.emit('friend_invited', {success: true, user: data})

                    // notify sender about invite
                    sendToSpecificUser(global, data, 'invited_to_friend', {
                        username: socket.username,
                        id: socket.userid,
                        avatar: socket.avatar
                    })
                }    
            });
        })

    });
}
    


//==========================================================================

function sendToSpecificUser(globalIO, userid, event, data){
    for(socketId in globalIO.of('/').clients().sockets){
        if(globalIO.of('/').clients().sockets[socketId].handshake.query.id == userid){
            globalIO.to(socketId).emit(event, data);
        }
    }
}