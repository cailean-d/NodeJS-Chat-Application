let mysql_module = require('../server/mysql')   
let colors = require('colors/safe');                           

module.exports = function(router){

  router.get('/', function(req, res){   

    (req.authorized) ? res.redirect('/main') : res.redirect('/login');

  });

  router.get('/main', function(req, res){
    
    let id = req.signedCookies.userID2;
    let mynickname = req.cookies.nickname;
    let lang = req.cookies.lang;
    
    if(req.authorized){
      mysql_module.render_own_profile(id, function(dbRequest){
        if(dbRequest){
          res.render('profile', 
          {target: 'me', 
          id: dbRequest.id, 
          nickname: dbRequest.nickname, 
          avatar: dbRequest.avatar, 
          about: dbRequest.about,
          mynickname: mynickname,
          lang: lang
          });
        } else{
          res.status(400);
          res.render('404');
        }
      });
    } else{
      res.redirect('/login');      
    }

  });

  router.get('/login', function(req, res){
    (req.authorized) ? res.redirect('/') : res.render('login');
  })

  router.get('/dialogs', function(req, res){
    let mynickname = req.cookies.nickname;
    let lang = req.cookies.lang;

    (req.authorized) ? res.render('dialogs', {mynickname: mynickname, lang: lang}) : res.redirect('/');
  })
  
  router.get('/settings', function(req, res){
    let mynickname = req.cookies.nickname;
    let lang = req.cookies.lang;

    (req.authorized) ? res.render('settings', {mynickname: mynickname, lang: lang}) : res.redirect('/');
  })
  
  router.get('/registration', function(req, res){
    (req.authorized) ? res.redirect('/') : res.render('registration');
  });
      
  router.get('/friends', function(req, res){
    let id = req.signedCookies.userID2;
    let mynickname = req.cookies.nickname;
    let lang = req.cookies.lang;

    if(req.authorized){
      mysql_module.draw_friends(id, function(invites, friends){
        res.render('friends', {
          mynickname: mynickname, 
          invites: invites,  
          friends: friends,
          lang: lang
        });
      });
    } else {
      res.redirect('/login');         
    }
  });
  
  router.get('/general_chat', function(req, res){

    let id = req.signedCookies.userID2;    
    let mynickname = req.cookies.nickname;
    let lang = req.cookies.lang;
    
    if(req.authorized){
      mysql_module.getMessagesFromGeneralMenu(20, function(err, result){
        if (err) throw err;
        res.render('general_chat', {
          myid: id,
          mynickname: mynickname,
          lang: lang,
          messages: result
        });
      });

    } else {
      res.redirect('/login');
    }

  })

  router.post('/registration', function(req, res){

    let nickname = req.body.nickname;
    let email = req.body.email;
    let password = req.body.password;

    mysql_module.registration(nickname, email, password, res, function(){
      console.log(`User \"${colors.green(req.body.nickname)}\" is registred`);    
    })

    res.redirect('/login');

  })

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
      let mynickname = req.cookies.nickname;
      let lang = req.cookies.lang;
    
      mysql_module.render_profile(id, req_id, target, function(row, status){
          res.render('profile',
          {   status: status, 
              target: target, 
              id: row.id, 
              nickname: row.nickname, 
              avatar: row.avatar, 
              about: row.about,
              mynickname: mynickname,
              lang: lang
          });
      });

  });

  return router;
}    
