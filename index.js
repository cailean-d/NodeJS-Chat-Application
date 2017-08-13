
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
var bodyParser = require('body-parser')
var colour = require('colour');
const jsonfile = require('jsonfile');



// parse config.json
const SETTINGS = jsonfile.readFileSync('./config.json');




//middlewares
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


var ip = '0.0.0.0';
var port = 3000;
var connections = [];
var clients = {};
var users = [];

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



// app.use(express.static('public'))



app.get('/', function(req, res){    //chat only for registered users

    if(req.cookies.userID == undefined){
       res.redirect('/login');
    } else {
       res.redirect('/general_chat');  
    }

});

app.get('/general_chat', function(req, res){
    if(req.query.logout){
    res.cookie( 'userID', '', { maxAge: -1 , httpOnly: false });
    res.redirect('/login');
  } else {
    res.sendFile(__dirname + '/general_chat.html');
  }
})

app.get('/js/socket-connection.js', function(req, res){
 res.sendFile(__dirname + '/js/socket-connection.js');
});

app.get('/js/libs/js.cookie.js', function(req, res){
 res.sendFile(__dirname + '/js/libs/js.cookie.js');
});

app.get('/css/style.css', function(req, res){
 res.sendFile(__dirname + '/css/style.css');
});

app.get('/js/libs/jquery.min.js', function(req, res){
 res.sendFile(__dirname + '/js/libs/jquery.min.js');
});

app.get('/js/libs/socket.io.js', function(req, res){
 res.sendFile(__dirname + '/js/libs/socket.io.js');
});

app.get('/registration', function(req, res){
 res.sendFile(__dirname + '/registration.html');
});
app.get('/login', function(req, res){
 res.sendFile(__dirname + '/login.html');
});


app.post('/registration', function(req, res){

      connection.insert('users', {
    nickname: req.body.nickname,
    email: req.body.email,
    password: req.body.password
  }, function(err, recordId) {
    if(err){ console.log(err); res.send('cant registrate'); } else {
        console.log(`User \"${colors.green(req.body.nickname)}\"[${colors.yellow(recordId)}] is registred`);
    }

  });

  // console.dir(req.headers.cookie);
  // console.dir(req.body);
  res.redirect('/login');
  
})

app.post('/login', function(req, res){

  if(req.body.login){

      let email = req.body.email;
      let password = req.body.password;

      connection.queryRow('SELECT * FROM users where email=?', [email], function(err, row) {
        // console.dir(row);
        if(row){
        // console.log('valid email');

          if(row.password === password){
            // console.log('valid password');
            res.cookie( 'userID', row.id ,{ maxAge: 60*60*24*30*12, httpOnly: false });
            res.cookie( 'nickname', row.nickname ,{ maxAge: 60*60*24*30*12, httpOnly: false });
            res.redirect('/');

          } else{
            // console.log('invalid password');
            res.send('invalid password');
          }
        } else{
          // console.log('invalid email');
          res.send('invalid email');
        }
      });
  }
});

app.post('/general_chat', function(req, res){
    if(req.body.userID){
       connection.queryRow('SELECT * FROM users where id=?', [req.body.userID], function(err, row) {
            res.send({ nickname: row.nickname, id: row.id });
       });
    } else{
      res.end();
    }
  
})


//=================================================

http.listen(port, ip, function(){
  console.log(colors.green(`\nSERVER listening on ${ip}:${port}\n`));
});


//=================================================

io.on('connection', function(socket){

  socket.userid =  socket.handshake.query.id;
  socket.username =  socket.handshake.query.nickname;
  


	connections.push(socket);
  console.log(`socket connect ${socket.id}[${socket.userid}]--> name - ${socket.username}`);
  // console.log('socket name ' + socket.username);


  // var rndClientName = rndName();
  // var rndClientName = '';


      // rndClientName = client;
      // console.log(client + '  ___user-name');

      // socket.username = rndClientName;
      users.push(socket.username);

      updateOnline();

      socket.broadcast.emit('connectedUser', socket.username);
      console.log(colors.yellow(`${socket.username} is connected`));
      



	// socket.emit('name', rndClientName);




    // console.log(colors.green(`ONLINE IS ${connections.length}`));

    socket.on('disconnect', function(){


  console.log(`socket connect ${socket.id}[${socket.userid}]--> name - ${socket.username}`);
  // console.log('socket disc name ' + socket.username);

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

//==================================================================

function updateOnline(){
      io.sockets.emit('online', users);
}

// function connectedUser(){
// 	socket.broadcast.emit('connectedUser', socket.username);
// }
// function disconnectedUser(){
// 	socket.broadcast.emit('disconnectedUser', socket.username);
// }