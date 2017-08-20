let mysql = require('mysql');
let mysqlUtilities = require('mysql-utilities');
let jsonfile = require('jsonfile');

const SETTINGS = jsonfile.readFileSync('./config.json');

var connection = mysql.createPool({
    host:     SETTINGS.db.host,
    user:     SETTINGS.db.user,
    password: SETTINGS.db.password,
    database: SETTINGS.db.database
    });
    
mysqlUtilities.upgrade(connection);
mysqlUtilities.introspection(connection);
        


exports.connection = connection;
