let mysql = require('mysql');
let mysqlUtilities = require('mysql-utilities');
let jsonfile = require('jsonfile');
let bcrypt = require('bcrypt');                                

const SETTINGS = jsonfile.readFileSync('./config.json');

var connection = mysql.createPool({
    host:     SETTINGS.db.host,
    user:     SETTINGS.db.user,
    password: SETTINGS.db.password,
    database: SETTINGS.db.database
    });
    
mysqlUtilities.upgrade(connection);
mysqlUtilities.introspection(connection);

let mysql_module = {

    connection: connection,
    general_chat_insert_message: function(sender, msg, handler){

        connection.insert('general_chat', {
            sender: sender,
            message: msg
            }, function(err, recordId) {
            if(err){ console.log(err);}
               (handler)();
        });
    },
    update_profile: function(userid, data){

        connection.getConnection(function(err, conn) {
            if(err){
              throw new Error('DATABASE CONNECTION ERROR');
            }
              connection.update(
                'users',
                 data,
                { id: userid },
                function(err, affectedRows) {
                  conn.release();
                  if(err){
                      throw err;
                  }
                }
              );          
        });
    },
    user_login: function(email, password, res){

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
    
                        res.send('OK');
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
    },
    add_friend: function(sender, receiver){

        connection.insert('friends', {
            friend_1: sender,
            friend_2: receiver,
            status: "0",
          }, function(err, recordId) {
            if(err){console.dir(err)}
          });
      
    },
    render_own_profile: function(id, res){
        connection.getConnection(function(err, conn) {
            if(err){
              console.log(err.code);
              res.send('database connection error');
              return;
            }
  
          connection.queryRow('SELECT * FROM users where id=?', [id], function(err, row) {
              if(row){
                    res.render('main', 
                    {target: 'me', 
                    id: row.id, 
                    nickname: row.nickname, 
                    avatar: row.avatar, 
                    about: row.about
                });
              } else{
                res.status(400);
                res.render('404');
              }
                conn.release();
            });
  
        });
    },
    registration: function(nickname, email, password, res, handler){
        
        bcrypt.hash(password, 8, function( err, bcryptedPassword) {
    
            connection.insert('users', {
                nickname: nickname,
                email: email,
                password: bcryptedPassword
                }, function(err, recordId) {
                if(err){
                   console.log(err); 
                   res.send('cant registrate'); 
                } else {
                    (handler)();
                }
            });
    
      });
    
    },
    render_profile: function(id, res, target){
        connection.getConnection(function(err, conn) {
            if(err){
                console.log(err.code);
                res.send('database connection error');
                return;
            }
        
            connection.queryRow('SELECT * FROM users where id=?', [id], function(err, row) {
                if(row){
        
                connection.queryRow('SELECT * FROM friends where friend_2=?', [id], function(err, row2) {
                    if(row2){
                    if(row2.status == 0){

                        // console.log('invite exist')
                        res.render('main',
                        {status: 'invited', 
                        target: target, 
                        id: row.id, 
                        nickname: row.nickname, 
                        avatar: row.avatar, 
                        about: row.about});

                    } else if(row2.status == 1){

                        // console.log('friend')
                        res.render('main',
                        {status: 'friend', 
                        target: target, 
                        id: row.id, 
                        nickname: row.nickname, 
                        avatar: row.avatar, 
                        about: row.about});
                    }
    
                    } else{
                    res.render('main',
                        {   status: false, 
                            target: target, 
                            id: row.id, 
                            nickname: row.nickname, 
                            avatar: row.avatar, 
                            about: row.about
                        });
                    }
        
                });
        
                } else{
                res.status(400);
                res.render('404');
                }
                conn.release();
            });
        
        });
    }
}
        

module.exports = mysql_module; 
