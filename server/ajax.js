let mysql_module = require('../server/mysql')

module.exports = function(router){

  router.post('/update_profile', function(req, res){
      
    let id = req.signedCookies.userID2;
    let data = req.body;

    result = mysql_module.update_profile(id, data);
    res.send(true);
 
       
  });


  router.post('/login', function(req, res){

    if(req.body.login){
  
      let email = req.body.email;
      let password = req.body.password;

      mysql_module.user_login(email, password, function(data, row){
        if(data == 'OK'){
          res.cookie( 'userID', row.id ,{ maxAge: 1000*60*60*24*30*12, httpOnly: false });
          res.cookie( 'nickname', row.nickname ,{ maxAge: 1000*60*60*24*30*12, httpOnly: false});
          res.cookie( 'userID2', row.id ,{ maxAge: 1000*60*60*24*30*12, httpOnly: true, signed: true });
          res.cookie( 'userAvatar', row.avatar ,{ maxAge: 1000*60*60*24*30*12, httpOnly: false});
          res.send('OK');

        } else if(data =='INVALID_PASSWORD'){
          res.send('invalid password');
        } else if(data =='INVALID_EMAIL'){
          res.send('invalid email');
        } else if(data =='IDATABASE_ERROR'){
          res.send('database connection error');
        }
      });

    }
  });

      


  return router;
}
