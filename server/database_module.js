let mysql = require('mysql');
let colors = require('colors');
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
            // check tables which exist in db
            check_existing_tables(database_object, tables, function(table){
 
                    check_specific_table(database_object, table, function(table, columnName, columnObject){
                        // compare columns, change modified columns
                        modify_column(table, columnName, columnObject, function(table){
                            //======================sort table
                        });           
                        
                    }, function(table, column){
                        //if column doesnt exist in local table
                        delete_excess_columns(table, column);
                    }, function(tableName, tableObject, columnName){
                        //if column doesnt exist in external database
                        create_column(tableName, tableObject, columnName);
                    });                 

            }, function(table){
                //if table doesnt exist in local database
                delete_excess_tables(table);
            }, function(){
                //==================create deleted tables
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


function check_specific_table(local_table, table, checkColumn, deleteColumns, createColumn){
    con2.query(`DESCRIBE ${table}`, function(err, result){
        if(err) throw err;

        let current_local_table = local_table[table];

        function list_of_columns(table){
            let listOfColumns = [];
            for(let i=0; i < table.length; i++){
                listOfColumns.push(table[i].Field);
            } 
            return listOfColumns;            
        }

        let columns_of_local_table = list_of_columns(current_local_table);
        let columns_of_db_table = list_of_columns(result);

        for(let i=0; i < columns_of_db_table.length; i++){
            if(!columns_of_local_table.includes(columns_of_db_table[i])){
                process.nextTick(function(){
                    deleteColumns(table, columns_of_db_table[i]);
                });
            }
        }

        for(let i=0; i < columns_of_local_table.length; i++){              
            if(!columns_of_db_table.includes(columns_of_local_table[i])){
                process.nextTick(function(){
                    createColumn(table, current_local_table[i], columns_of_local_table[i]);
                });
            } 
        }

        for(let i=0; i < result.length; i++){
            if(columns_of_local_table.includes(result[i].Field)){
                for(item in result[i]){
                    let curr_local_column = select_column(current_local_table, result[i].Field)
                    if(result[i][item] != curr_local_column[item]){
                        process.nextTick(function(){
                            checkColumn(table, result[i].Field, curr_local_column);
                        });
                    }
                }
            }
        } 
    });
}

function delete_excess_columns(table, column){
    con2.query(`ALTER TABLE ${table} DROP COLUMN ${column}`, function(err, res){
        if(err) throw err;
        console.log(table.red + ' ['.red + column + '] DELETED'.red);                    
    });
}

function check_database(database, ifdoesntexist, ifexists){
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
                    ifexists();                    
                });
            }
            conn.release();
        });
    });
}


function create_database(database, callback){
    con.query(`CREATE DATABASE IF NOT EXISTS ${database}`, function(err, result){
        if(err) throw err;
        console.log('DATABASE '.green + `${database}`.cyan.underline + ' CREATED.'.green);
        process.nextTick(function(){
            callback();        
        });
    });  
}

function check_tables(ifdoesntexist, ifexists){
    con2.query("SHOW TABLES", function(err, result){
 
        if(result == ''){
            console.log('no tables'.red);
            process.nextTick(function () {
                ifdoesntexist();            
            });
        } else {
            process.nextTick(function () {
                ifexists(result);
            });
        }
    });
}

function check_existing_tables(db_tables, tables, checkTable, deleteTables, createTable){

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
    con2.query(`DROP TABLE ${table}`, function(err, res){
        if(err) throw err;
        console.log('TABLE '.red + table.cyan.underline + ' DELETED'.red);
    });  
}

function generate_column(object){

    let string = '';
  
        let Null ='', Key = '', Default = '';
        if (object.Null == 'NO'){Null = 'NOT NULL';} 
        if (object.Key == 'PRI'){Key = 'PRIMARY KEY';} 
        if (object.Default !== null){
            if(object.Default == 'CURRENT_TIMESTAMP'){
                Default = `DEFAULT ${object.Default}`;                
            } else {
                Default = `DEFAULT '${object.Default}'`;
            }
        } 
        string+= `${object.Field} ${object.Type} ${Null} ${Key} ${Default} ${object.Extra}`


    return string;
}

function create_column(table_name, table, column){
    console.log(`COLUMN `.red + table_name.cyan + `[`.red + column + '] DOESNT EXIST'.red);
    let columnQuery = generate_column(table);
    con2.query(`ALTER TABLE ${table_name} ADD ${columnQuery}`, function(err, result){
        if(err) throw err;
        console.log('COLUMN '.green + table_name.cyan + '[' + column + ']' + ' CREATED'.green)
    });
}

function modify_column(table, column2, column, callback){
    let columnQuery = generate_column(column);
    con2.query(`ALTER TABLE ${table} CHANGE ${column2} ${columnQuery}`, function(err, res){
        if (err) throw err;
        console.log(`COLUMN `.yellow + table.cyan + `[`.yellow + column2 + '] CHANGED'.yellow);    
    });
    process.nextTick(function(){
        callback(table);
    });
}

function select_column(table, column_name){
    for(let i=0; i < table.length; i++){
        if(table[i].Field == column_name){
            return table[i];
        }
    }
}