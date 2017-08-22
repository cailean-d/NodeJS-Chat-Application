let mysql = require('mysql');
let colors = require('colors');
let color = require('colors/safe');
let jsonfile = require('jsonfile');                             

const SETTINGS = jsonfile.readFileSync('./config.json');

console.log('\nDATABASE CHECKING...\n'.green);

var con = mysql.createPool({
    host:     SETTINGS.db.host,
    user:     SETTINGS.db.user,
    password: SETTINGS.db.password,
});

var con2 = mysql.createPool({
    host:     SETTINGS.db.host,
    user:     SETTINGS.db.user,
    password: SETTINGS.db.password,
    database: "mydb"
});

con.getConnection(function(err, conn){
    if(err) throw err;
    con.query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'mydb'", function(err, res){
        if(err) throw err;
        if(res == ''){ 
            console.log('DATABASE '.red + 'mydb'.cyan.underline + ' DOESNT EXIST.'.red);
            // console.log('CREATING DATABASE...'.yellow);
            con.query("CREATE DATABASE IF NOT EXISTS mydb", function(err, result){
                console.log('DATABASE '.green + 'mydb'.cyan.underline + ' CREATED.'.green)
                create_tables();
            });                    
        } else {
            console.log('DATABASE '.green + 'mydb'.cyan.underline + ' EXISTS.'.green);
                create_tables();
        }
        conn.release();
    });
});

function create_tables(){
    con2.getConnection(function(err, conn){
        create_table('users', users);

        conn.release();
    });
}


let users = [
    { Field: 'id', Type: 'int(11) unsigned', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
    { Field: 'nickname', Type: 'varchar(30)', Null: 'NO', Key: '', Default: null, Extra: '' },
    { Field: 'email',Type: 'varchar(30)', Null: 'NO', Key: '', Default: null, Extra: '' },
    { Field: 'password',Type: 'varchar(70)', Null: 'NO', Key: '', Default: null, Extra: '' },
    { Field: 'about',Type: 'text', Null: 'NO', Key: '', Default: null, Extra: '' },
    { Field: 'avatar',Type: 'varchar(40)', Null: 'NO', Key: '', Default: 'user_thumbnail.jpg', Extra: '' },
    { Field: 'date',Type: 'TIMESTAMP', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' }
]
// function  ll(dbo){
//     let result = ''
//     for(let i=0; i < dbo.length; i++){
//         let Null ='', Key = '';
//         if (dbo[i].Null == 'NO'){Null = 'NOT NULL';} 
//         if (dbo[i].Key == 'PRI'){Key = 'PRIMARY KEY';} 
//         if(i == dbo.length - 1){
//             result+= ` ${dbo[i].Field} ${dbo[i].Type} ${Null} ${Key} ${dbo[i].Extra}`
//         } else {
//             result+= ` ${dbo[i].Field} ${dbo[i].Type} ${Null} ${Key} ${dbo[i].Extra},`            
//         }
//     }
//     return result;
// }

// console.log(ll(table1));

// function table_TEST(){
//     create_table('test',
//     ' Stop_id int unsigned NOT NULL PRIMARY KEY AUTO_INCREMENT,' +
//     ' Stop_name VARCHAR(100) NOT NULL,' +
//     ' Stop_lat VARCHAR(100) NOT NULL,' +
//     ' Stop_lon VARCHAR(100) NOT NULL');
// }

// function table_TEST2(){
//     create_table('test2', ll(table1));
// }

function create_table(tableName, object){

    let table = '';
    for(let i=0; i < object.length; i++){
        let Null ='', Key = '', Default = '';
        if (object[i].Null == 'NO'){Null = 'NOT NULL';} 
        if (object[i].Key == 'PRI'){Key = 'PRIMARY KEY';} 
        if (object[i].Default !== null){
            if(object[i].Default == 'CURRENT_TIMESTAMP'){
                Default = `DEFAULT ${object[i].Default}`;                
            } else {
                Default = `DEFAULT '${object[i].Default}'`;
            }
        } 
        if(i == object.length - 1){
            table+= ` ${object[i].Field} ${object[i].Type} ${Null} ${Key} ${Default} ${object[i].Extra}`
        } else {
            table+= ` ${object[i].Field} ${object[i].Type} ${Null} ${Key} ${Default} ${object[i].Extra},`            
        }
    }

    con2.query(`SELECT 1 FROM ${tableName} LIMIT 1`, function(err, result){
        if(result === undefined){
            console.log('TABLE '.red + `${tableName}`.cyan.underline + ' DOESNT EXIST.'.red);
            con2.query(`CREATE TABLE IF NOT EXISTS ${tableName} (` +
            table + `)`, function(err, result){
                if(err) throw err;
                console.log('TABLE '.green + `${tableName}`.cyan.underline + ' CREATED.'.green)



                
                //====================
                console.log('\nDATABASE IS CHECKED! READY TO START SERVER!\n'.green.underline);        
            });          
        } else {
            console.log('TABLE '.green + `${tableName}`.cyan.underline + ' EXISTS.'.green);    
            // describe_table(tableName);


            //===========================
             console.log('\nDATABASE IS CHECKED! READY TO START SERVER!\n'.green.underline);        
        
        }
    });
}


function describe_table(table){
    con2.query(`DESCRIBE ${table}`, function(err, result){
        console.log(result);
       //  console.log(result.length);
        for( i of result){
            console.log(i.Field);
        }
    });
}