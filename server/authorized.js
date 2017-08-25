// let mysql = require('mysql');
// let jsonfile = require('jsonfile');     
// var syncSql = require('sync-sql');                    

// const SETTINGS = jsonfile.readFileSync('./config.json');

module.exports = function(req, res, next) {
 
    if(req.signedCookies.userID2 != undefined){

        // var output = syncSql.mysql(
        //     {
        //         host:       SETTINGS.db.host,
        //         user:       SETTINGS.db.user,
        //         password:   SETTINGS.db.password,
        //         database:   SETTINGS.db.database,
        //         port: '3306'
        //     },
        //     `SELECT * FROM users WHERE nickname='${req.cookies.nickname}'`
        // );
    
        // if(output.data.rows[0]){
            req.authorized = true;                    
        // }
    }
  
    next()
}