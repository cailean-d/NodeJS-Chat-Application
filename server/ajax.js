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

      mysql_module.user_login(email, password, res);

    }
  });

      

  router.post('/add_friend', function(req, res){
    
    let sender = req.signedCookies.userID2;
    let receiver = req.body.id;

    mysql_module.add_friend(sender, receiver);
    res.send(true);  

  });


  return router;
}
