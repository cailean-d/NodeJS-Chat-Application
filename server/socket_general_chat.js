var colors = require('colors/safe');
var mysql_module = require('../server/mysql');


var users = {
  name: [],
  id: []
};


module.exports = function(io){

    io.on('connection', function(socket){

        socket.userid =  socket.handshake.query.id;
        socket.username =  socket.handshake.query.nickname;

        // console.log(`socket connect ${socket.id}[${socket.userid}]--> name - ${socket.username}`);


            if(users.id.indexOf(socket.userid) == -1){
                users.name.push(socket.username);
                users.id.push(socket.userid);

            socket.broadcast.emit('connectedUser', socket.username);
            console.log(colors.yellow(`${socket.username} is connected`));
            }



            updateOnline();




        socket.on('disconnect', function(){

            let id =  socket.userid;
            let clients = [];
            let timeout = 3000;

            setTimeout(function(){

                for(socketId in io.sockets.connected){
                    clients.push(io.sockets.connected[socketId].handshake.query.id);
                }

                // console.log('disconnect  ___ ' + clients);

                if(clients.indexOf(id) == -1){
                    // console.log('client isnt here');
                    // console.log(`socket disconnect ${socket.id}[${socket.userid}]--> name - ${socket.username}`);
                    console.log(colors.red(`${socket.username} disconnected`));

                    users.name.splice(users.name.indexOf(socket.username), 1);
                    users.id.splice(users.id.indexOf(socket.userid), 1);
                    socket.broadcast.emit('disconnectedUser', socket.username);

                    updateOnline();
                }

            }, timeout);

            });

        socket.on('chat message', function(msg){

            socket.broadcast.emit('chat message', {
                sender : msg.sender,
                message: msg.message,
                time: msg.time
            });

           mysql_module.general_chat_insert_message(msg.sender, msg.message, function(){
               
              console.log('MESSAGE \"' + colors.magenta(msg.message) + '\" BY ' + colors.cyan(msg.sender) + ' IS INSERTED INTO ' +
              colors.magenta('general_chat') /* + ' WITH ID ' + colors.magenta(recordId) */);
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
        io.sockets.emit('online', {username: users.name, userid: users.id});
        io.sockets.emit('online-count', users.name.length);
    }
}
//==================================================================
