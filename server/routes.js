let mysql_module = require('../server/mysql')   
let colors = require('colors/safe');                           

module.exports = function(router){

  router.get('/', function(req, res){   

    (req.authorized) ? res.redirect('/main') : res.redirect('/login');

  });

  router.get('/main', function(req, res){
    let id = req.signedCookies.userID2;
    
    (req.authorized) ? mysql_module.render_own_profile(id, res) : res.redirect('/login');

  });

  router.get('/login', function(req, res){
    (req.authorized) ? res.redirect('/') : res.render('login');
  })
  router.get('/registration', function(req, res){
    (req.authorized) ? res.redirect('/') : res.render('registration');
  });
      
  router.get('/friends', function(req, res){
    let id = req.signedCookies.userID2;
    (req.authorized) ? mysql_module.draw_friends(id, res) : res.redirect('/login');   
  });
  
  router.get('/general_chat', function(req, res){
    let nickname = req.cookies.nickname;
     
    (req.authorized) ? res.render('general_chat', {nickname: nickname}) : res.redirect('/login');

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

      mysql_module.render_profile(id, res, target, req_id);

  });

  router.get('/test', function(req, res){
    res.render('main_template')
  })

  return router;
}    
