
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var colors = require('colors/safe');
var mysql = require('mysql');
var mysqlUtilities = require('mysql-utilities');
// var now = require("performance-now");
// var rndName = require("./randomName");
// var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')      // x-www-form-urlencoded
var colour = require('colour');
const jsonfile = require('jsonfile');
var bcrypt = require('bcrypt');
let multer  = require('multer');            // multipart/form-data
let upload = multer();



// parse config.json
const SETTINGS = jsonfile.readFileSync('./config.json');

//middlewares
app.use(cookieParser('my-secret'))
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(upload.fields([]));


var ip = '0.0.0.0';
var port = 3000;
var users = {
  name: [],
  id: []
};

//=================================================
//                DB Connection
//=================================================

var connection = mysql.createPool({
  host:     SETTINGS.db.host,
  user:     SETTINGS.db.user,
  password: SETTINGS.db.password,
  database: SETTINGS.db.database
});

  mysqlUtilities.upgrade(connection);
  mysqlUtilities.introspection(connection);

//=================================================
//                   Routing
//=================================================

app.use(express.static('public'));

app.get('/', function(req, res){    //chat only for registered users

    if(req.signedCookies.userID2 == undefined){
       res.redirect('/login');
    } else {
       res.redirect('/main');  
    }

});


app.get('/main', function(req, res){

      if(req.signedCookies.userID2 == undefined){
       res.redirect('/login');
    } else {
       res.sendFile(__dirname + '/views/main.html');  
    }
})

app.get('/general_chat', function(req, res){

    if(req.signedCookies.userID2 == undefined){
       res.redirect('/login');
    } else {
       res.sendFile(__dirname + '/views/general_chat.html');  
    }
})

app.get('/registration', function(req, res){
 res.sendFile(__dirname + '/views/registration.html');
});

app.get('/login', function(req, res){
 res.sendFile(__dirname + '/views/login.html');
});

app.get('/my_profile', function(req, res){
 res.sendFile(__dirname + '/views/my_profile.html'); 
});

app.post('/registration', function(req, res){


  bcrypt.hash(req.body.password, 8, function( err, bcryptedPassword) {

    connection.insert('users', {
        nickname: req.body.nickname,
        email: req.body.email,
        password: bcryptedPassword
        }, function(err, recordId) {
        if(err){ console.log(err); res.send('cant registrate'); } else {
            console.log(`User \"${colors.green(req.body.nickname)}\"[${colors.yellow(recordId)}] is registred`);
        }
    });

});


  res.redirect('/login');
  
})


app.post('/profile_data', function(req, res){

       let id = req.body.id;

       connection.getConnection(function(err, conn) {
        if(err){ 
          console.log(err.code); 
          res.send('database connection error');
          return;
        }

       connection.queryRow('SELECT * FROM users where id=?', [id], function(err, row) {
          if(row){ 
                res.send({nickname: row.nickname, avatar: row.avatar, about: row.about});
          } else{
            res.send('cant receive data');
          }
            conn.release();
        });

     });
});


app.post('/update_profile', function(req, res){

       let id = req.signedCookies.userID2;
       let about = req.body.about;
       // console.log(id, about);
       // console.dir(req.body);

     connection.getConnection(function(err, conn) {
        if(err){ 
          console.log(err.code); 
          res.send('database connection error');
          return;
        }
         connection.update(
            'users',
            { about: about },
            { id: id },
            function(err, affectedRows) {
              // console.dir({update:affectedRows});
              conn.release();
              res.send({update: true});
            }
          );

     });


});

app.post('/login', function(req, res){

  if(req.body.login){

      let email = req.body.email;
      let password = req.body.password;
   
     connection.getConnection(function(err, conn) {
        if(err){ 
          console.log(err.code); 
          res.send('database connection error');
          return;
        }

       connection.queryRow('SELECT * FROM users where email=?', [email], function(err, row) {
          if(row){ 
              bcrypt.compare(password, row.password, function(err, doesMatch){
                if (doesMatch){
                    res.cookie( 'userID', row.id ,{ maxAge: 60*60*24*30*12, httpOnly: false });
                    res.cookie( 'nickname', row.nickname ,{ maxAge: 60*60*24*30*12, httpOnly: false});
                    res.cookie( 'userID2', row.id ,{ maxAge: 60*60*24*30*12, httpOnly: true, signed: true });

                    res.redirect('/');
                }else{
                    res.send('invalid password');
                }
              });
          } else{
            res.send('invalid email');
          }
            conn.release();
        });

     });
  }
});


app.get('/logout', function(req, res){
    res.cookie( 'userID', '', { maxAge: -1 , httpOnly: false });
    res.cookie( 'nickname', '' ,{ maxAge: -1, httpOnly: false });
    res.cookie( 'userID2', '', { maxAge: -1 , httpOnly: false, signed: true });

    res.redirect('/login');
})



// custom 404 page
app.use(function(req, res, next) {
    res.status(400);
    res.sendFile(__dirname + '/views/404.html'); 
});

//=================================================

http.listen(port, ip, function(){
  console.log(colors.green(`\nSERVER listening on ${ip}:${port}\n`));
});


//=================================================





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

            console.log('disconnect  ___ ' + clients);

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

//==================================================================

function updateOnline(){
      io.sockets.emit('online', users.name);
      io.sockets.emit('online-count', users.name.length);
}


// function socketCount(){

//   let sockets = [];

//   Object.keys(io.sockets.sockets).forEach(function(id) {
//      sockets.push(id) ;
//      // console.log("ID:",id)  // socketId
//   });

//   return sockets;

// }

// function connectedUser(){
// 	socket.broadcast.emit('connectedUser', socket.username);
// }
// function disconnectedUser(){
// 	socket.broadcast.emit('disconnectedUser', socket.username);
// }