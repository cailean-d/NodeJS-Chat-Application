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

    // connection: connection,
    general_chat_insert_message: function(sender, msg, handler){

        connection.getConnection(function(err, conn) {
            if(err){ throw err;}
            connection.insert('general_chat', {
                sender: sender,
                message: msg
                }, function(err, recordId) {
                if(err){ console.log(err);}
                   (handler)();
                conn.release();
            });
        });
    },
    update_profile: function(userid, data){

        connection.getConnection(function(err, conn) {
            if(err){throw err;}
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
                        res.cookie( 'userID', row.id ,{ maxAge: 1000*60*60*24*30*12, httpOnly: false });
                        res.cookie( 'nickname', row.nickname ,{ maxAge: 1000*60*60*24*30*12, httpOnly: false});
                        res.cookie( 'userID2', row.id ,{ maxAge: 1000*60*60*24*30*12, httpOnly: true, signed: true });
    
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
    invite_friend: function(sender, receiver){

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
    render_profile: function(id, res, target, myid){
        connection.getConnection(function(err, conn) {
            if(err) throw err;
            connection.queryRow('SELECT * FROM users where id=?', [id], function(err, row) {
                if(row){
                    if(target == 'me'){
                        res.render('main',
                        {   status: false, 
                            target: target, 
                            id: row.id, 
                            nickname: row.nickname, 
                            avatar: row.avatar, 
                            about: row.about
                        });
                    } else {
                        connection.queryRow('SELECT * FROM friends where (friend_1=? AND friend_2=?)' + 
                        ' OR (friend_1=? AND friend_2=?)', [id, myid, myid, id], function(err, row2) {
                            if (err) throw err;
                            if(row2){
                                    if(row2.status == 0 && row2.friend_2 == id){
                                        res.render('main',
                                        {status: 'invited', 
                                        target: target, 
                                        id: row.id, 
                                        nickname: row.nickname, 
                                        avatar: row.avatar, 
                                        about: row.about});
                
                                    } else if(row2.status == 1){
   
                                        res.render('main',
                                        {status: 'friend', 
                                        target: target, 
                                        id: row.id, 
                                        nickname: row.nickname, 
                                        avatar: row.avatar, 
                                        about: row.about});
                                    }
                            } else {
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
                    }
                } else{
                res.status(400);
                res.render('404');
                }
                conn.release();
            });
        
        });
    },
    draw_friends: function(userid, res){
        connection.getConnection(function(err, conn) {
            if(err){ throw err;}
    
            let invites = false;
            let friends = false;

            getInvitesIDS(userid, function(stringID){
                if(stringID[0]){
                    getInvitesUserObjects(stringID, function(object){
                        invites = object;
                        getFriendsIDS(userid, function(stringID2){
                            if(stringID2[0]){
                                getFriendsUserObjects(stringID2, function(object2){
                                    friends = object2;
                                    conn.release();                                                                
                                    res.render('friends', {invites: invites,  friends: friends});
                                });
                            } else {
                                conn.release();                            
                                res.render('friends', {invites: invites,  friends: friends}); 
                            }
                        })
                    });
                } else {
                    getFriendsIDS(userid, function(stringID2){
                        if(stringID2[0]){
                            getFriendsUserObjects(stringID2, function(object2){
                                friends = object2;
                                conn.release();                                                                                                
                                res.render('friends', {invites: invites,  friends: friends});                                
                            });
                        } else {
                                conn.release();                            
                                res.render('friends', {invites: invites,  friends: friends}); 
                        }
                    })
                }
            })
        });
    },
    add_friend: function(user1, user2, callback){
        connection.getConnection(function(err, conn){
            if(err) throw err;
            connection.update(
                'friends',
                { status:'1' },
                { friend_1: user1, friend_2: user2},
                function(err, affectedRows) {
                    if(err) throw err;
                    conn.release();
                    callback(err);
                }
              );
        });
    },
    delete_friend: function (user1, user2, callback){
        connection.getConnection(function(err, conn){
            if(err) throw err;
            // connection.delete(
            //     'friends',
            //     { friend_1: user1, friend_2: user2, status: '1'},
            //     function(err, affectedRows) {
            //         if(err) throw err;
            //         conn.release();
            //         callback(err);
            //     }
            //   );
            connection.query(`DELETE FROM friends WHERE (friend_1=${user1} AND friend_2=${user2}) OR ` + 
            `(friend_1=${user2} AND friend_2=${user1})`, function(err){
                 if(err) throw err;
                    conn.release();
                    callback(err);
            });
        });
    }
}


function getInvitesIDS(userid, callback){
    connection.query(`SELECT * FROM friends WHERE friend_2=${userid} AND status='0'`, function(err, result){
        if(err) throw err;
        let invites_ids = [];
        if(result[0]) {
            for(let i=0; i < result.length; i++){
                invites_ids.push(result[i].friend_1);
            }
        } 
        process.nextTick(function(){
            callback(invites_ids);
        });
    });
}

function getFriendsIDS(userid, callback){
    connection.query(`SELECT * FROM friends WHERE (friend_1=${userid} OR friend_2=${userid}) AND status='1'`, 
    function(err, result){     
        let friends_ids = [];
        if(result[0]) {
            for(let i=0; i < result.length; i++){
                if(result[i].friend_1 == userid){
                    friends_ids.push(result[i].friend_2);                    
                } else {
                    friends_ids.push(result[i].friend_1);                                        
                }
            }
        }  
        process.nextTick(function(){
            callback(friends_ids);
        });
    });
}
        
function getInvitesUserObjects(IDList, callback){
    connection.query(`SELECT * FROM users WHERE id IN (${IDList.toString()})`, function(err, result){
        if(err) throw err;
        process.nextTick(function(){
            callback(result);
        });
    });
}

function getFriendsUserObjects(IDList, callback){
    connection.query(`SELECT * FROM users WHERE id IN (${IDList.toString()})`, 
    function(err, result){
       if(err) throw err;
       process.nextTick(function(){
        callback(result);
       });
    });
}

module.exports = mysql_module; 
