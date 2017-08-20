let express = require('express');
let router = express.Router();
let mysql_module = require('../server/mysql')


let connection = mysql_module.connection;


router.post('/update_profile', function(req, res){
    
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


module.exports = router;