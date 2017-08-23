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


module.exports = function(database_name, database_object){

//check database
    check_database(database_name, function(){
        //if db doesnt exist
        create_database(database_name, function(){
            //callback
            create_all_tables(database_object);
        })
    }, function(){
        //if db exists
        check_tables(function(){
            //if no tables
            create_all_tables(database_object);
        }, function(tables){

            check_existing_tables(database_object, tables, function(table){
                console.log('TABLE '.green + table.cyan.underline + ' EXISTS'.green);                    

            }, function(table){
                //if table doesnt exist in database object
                delete_excess_tables(table);
            });
        });
    });    
}




//create all tables
function create_all_tables(tables){
    con2.getConnection(function(err, conn){

        for(item in tables){
            create_table(item, tables[item]);
        }
        conn.release();
    });
}

// create specific table
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
            });          
        } else {
            console.log('TABLE '.green + `${tableName}`.cyan.underline + ' EXISTS.'.green);    
        }
    });
}


function check_table(table){
    con2.query(`DESCRIBE ${table}`, function(err, result){
        console.log(result);
       //  console.log(result.length);
        for( i of result){
            console.log(i.Field);
        }
    });
}

function check_database(database, ifdoesntexist, ifexist){
    con.getConnection(function(err, conn){
        if(err) throw err;
        con.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${database}'`, function(err, res){
            if(err) throw err;
            if(res == ''){ 
                console.log('DATABASE '.red + `${database}`.cyan.underline + ' DOESNT EXIST.'.red);
                process.nextTick(function(){
                    ifdoesntexist();
                });                    
            } else {
                console.log('DATABASE '.green + `${database}`.cyan.underline + ' EXISTS.'.green);
                process.nextTick(function(){
                    ifexist();                    
                });
            }
            conn.release();
        });
    });
}


function create_database(database, callback){
    con.query(`CREATE DATABASE IF NOT EXISTS ${database}`, function(err, result){
        console.log('DATABASE '.green + `${database}`.cyan.underline + ' CREATED.'.green);
        process.nextTick(function(){
            callback();        
        });
    });  
}

function check_tables(ifdoesntexist, ifexist){
    con2.query("SHOW TABLES", function(err, result){
        // console.log(result);
        if(result == ''){
            console.log('no tables'.red);
            process.nextTick(function () {
                ifdoesntexist();            
            });
        } else {
            process.nextTick(function () {
                ifexist(result);
            });
        }
    });
}

function check_existing_tables(db_tables, tables, checkTable, deleteTables){

    function listOfTablesl(){
        let listOfTables = [];
        
        for(item in db_tables){
           listOfTables.push(item);
        }    
        return listOfTables;
    }

    let listOfTables = listOfTablesl();
    
        for(let i=0; i < tables.length; i++){
  
            for(item in tables[i]){
    
                let currTable = tables[i][item];
                if (listOfTables.includes(currTable)){
                    process.nextTick(function(){
                        checkTable(currTable);
                    });                   
                } else {
                    process.nextTick(function(){
                        deleteTables(currTable);
                    });
                }
            }
  
        }
}

function delete_excess_tables(table){
    con2.query(`DROP TABLE ${table}`, function(){
        console.log('TABLE '.red + table.cyan.underline + ' DELETED'.red);
    });  
}