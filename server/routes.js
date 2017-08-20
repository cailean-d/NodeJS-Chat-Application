let express = require('express');
let router = express.Router();
let mysql_module = require('../server/mysql')

let connection = mysql_module.connection;

router.get('/', function(req, res){   
    
    if(req.signedCookies.userID2 == undefined){
        res.redirect('/login');
    } else {
        res.redirect('/main');
    }
    
});
    

router.get('/main', function(req, res){

      if(req.signedCookies.userID2 == undefined){
        res.redirect('/login');
    } else {

      let id = req.signedCookies.userID2;
      connection.getConnection(function(err, conn) {
          if(err){
            console.log(err.code);
            res.send('database connection error');
            return;
          }

        connection.queryRow('SELECT * FROM users where id=?', [id], function(err, row) {
            if(row){
                  res.render('main', {target: 'me', id: row.id, nickname: row.nickname, avatar: row.avatar, about: row.about});
            } else{
              res.status(400);
              res.render('404');
            }
              conn.release();
          });

      });

    }

})
    
    
router.get('/general_chat', function(req, res){

    if(req.signedCookies.userID2 == undefined){
        res.redirect('/login');
    } else {
        let nickname = req.cookies.nickname;
        res.render('general_chat', {nickname: nickname});
    }
})

router.get('/friends', function(req, res){
    res.render('friends');
});

router.get('/registration', function(req, res){
  res.sendFile(__dirname + '/views/registration.html');
});

router.get('/login', function(req, res){
  res.sendFile(__dirname + '/views/login.html');
});

router.get('/profile', function(req, res){
  
    res.render('test', { title: 'Hey', message: 'Hello there!', id: req.query.id});

});

router.post('/registration', function(req, res){


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


router.post('/login', function(req, res){

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

router.post('/add_friend', function(req, res){
  console.log(req.signedCookies.userID2 + ' user to ' + ' friend ' + req.body.id)
  let sender = req.signedCookies.userID2;
  let receiver = req.body.id;
  connection.insert('friends', {
    friend_1: sender,
    friend_2: receiver,
    status: "0",
  }, function(err, recordId) {
    if(err){console.dir(err)}
  });

  res.send('l');  

});


router.get('/logout', function(req, res){
    res.cookie( 'userID', '', { maxAge: -1 , httpOnly: false });
    res.cookie( 'nickname', '' ,{ maxAge: -1, httpOnly: false });
    res.cookie( 'userID2', '', { maxAge: -1 , httpOnly: false, signed: true });

    res.redirect('/login');
})

router.get('/id[0-9]*', function(req, res){   // profiles view

    let req_id = req.signedCookies.userID2;
    let string = req.originalUrl;
    let id = string.slice(3);
    let target = (req_id == id) ? 'me' : 'other';

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
                    console.log('invite exist')
                    res.render('main',{status: 'invited', target: target, id: row.id, nickname: row.nickname, avatar: row.avatar, about: row.about});
                  } else if(row2.status == 1){
                    console.log('friend')
                    res.render('main',{status: 'friend', target: target, id: row.id, nickname: row.nickname, avatar: row.avatar, about: row.about});
                  }

                } else{
                  res.render('main',{status: false, target: target, id: row.id, nickname: row.nickname, avatar: row.avatar, about: row.about});
                }

          });

        } else{
          res.status(400);
          res.render('404');
        }
          conn.release();
      });

    });
});
    

module.exports = router;