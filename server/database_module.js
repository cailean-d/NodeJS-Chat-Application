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
    database: SETTINGS.db.database
});

let database_name = SETTINGS.db.database;


module.exports = function(database_object){

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
                        modify_column(table, columnName, columnObject);           
                        
                    }, function(tableName, column, var1, var2, var3){
                        //if column doesnt exist in local table
                        delete_excess_columns(tableName, column, function(){
                                     //sort tables
                                     sort_columns(database_name, tableName, var1, var2, var3);     
                        });
                    }, function(tableName, tableObject, columnName, var1, var2, var3){
                        //if column doesnt exist in external database
                        create_column(tableName, tableObject, columnName, function(){
                                    //sort tables
                                     sort_columns(database_name, tableName, var1, var2, var3);                                
                        });
                    }, function(tableName, var1, var2, var3){
                                    //sort tables
                                     sort_columns(database_name, tableName, var1, var2, var3);                        
                    });                 

            }, function(tableName){
                //if table doesnt exist in local database
                delete_excess_tables(tableName);
            }, function(tableNamel, tablel){
                //create deleted tables
                create_table(tableNamel, tablel);
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
            console.log('TABLE '.red + `${tableName}`.cyan + ' DOESNT EXIST.'.red);
            con2.query(`CREATE TABLE IF NOT EXISTS ${tableName} (` +
            table + `)`, function(err, result){
                if(err) throw err;
                console.log('TABLE '.green + `${tableName}`.cyan + ' CREATED.'.green)      
            });          
        } else {
            console.log('TABLE '.green + `${tableName}`.cyan + ' EXISTS.'.green);    
        }
    });
}


function check_specific_table(local_table, table, checkColumn, deleteColumns, createColumn, sortTable){
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
                    deleteColumns(table, columns_of_db_table[i], current_local_table, columns_of_db_table, columns_of_local_table);
                });
            }
        }

        for(let i=0; i < columns_of_local_table.length; i++){              
            if(!columns_of_db_table.includes(columns_of_local_table[i])){
                process.nextTick(function(){
                    createColumn(table, current_local_table[i], columns_of_local_table[i], current_local_table, columns_of_db_table, columns_of_local_table);
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

        process.nextTick(function(){
            sortTable(table, current_local_table, columns_of_db_table, columns_of_local_table);
        });
 
    });
}

function delete_excess_columns(table, column, callback){
    con2.query(`ALTER TABLE ${table} DROP COLUMN ${column}`, function(err, res){
        if(err) throw err;
        console.log(table.red + ' ['.red + column + '] DELETED'.red);      
        process.nextTick(function(){
            callback();
        });              
    });
}

function check_database(database, ifdoesntexist, ifexists){
    con.getConnection(function(err, conn){
        if(err) throw err;
        con.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${database}'`, function(err, res){
            if(err) throw err;
            if(res == ''){ 
                console.log('DATABASE '.red + `${database}`.cyan + ' DOESNT EXIST.'.red);
                process.nextTick(function(){
                    ifdoesntexist();
                });                    
            } else {
                console.log('DATABASE '.green + `${database}`.cyan + ' EXISTS.'.green);
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
        console.log('DATABASE '.green + `${database}`.cyan + ' CREATED.'.green);
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

function check_existing_tables(db_tables, tables, changeTable, deleteTables, createTable){

    function list_of_local_tables(tbls){
        let list = [];
        
        for(item in tbls){
           list.push(item);
        }    
        return list;
    }
    function list_of_external_tables(tbls){
        let list = [];
        for(let i=0; i < tbls.length; i++){
            for(item in tbls[i]){
                list.push(tbls[i][item]);
            } 
        }
        return list;
    }

    let listOfLocalTables = list_of_local_tables(db_tables);
    let listOfExternalTables = list_of_external_tables(tables);

    for(let i=0; i < listOfExternalTables.length; i++){
        if(!listOfLocalTables.includes(listOfExternalTables[i])){
            process.nextTick(function(){
                deleteTables(listOfExternalTables[i]);                
            });
        }
    }

    for(let i=0; i < listOfLocalTables.length; i++){              
        if(!listOfExternalTables.includes(listOfLocalTables[i])){
            for(item in db_tables){
                if(item == listOfLocalTables[i]){
                    createTable(item,db_tables[item]);               
                }
            }
        } 
    }

    for(let i=0; i < tables.length; i++){
        for(item in tables[i]){
            let currTable = tables[i][item];
            if (listOfLocalTables.includes(currTable)){
                process.nextTick(function(){
                    changeTable(currTable);
                });                   
            }
        }
    }
}

function delete_excess_tables(table){
    con2.query(`DROP TABLE ${table}`, function(err, res){
        if(err) throw err;
        console.log('TABLE '.red + table.cyan + ' DELETED'.red);
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

function create_column(table_name, table, column, callback){
    console.log(`COLUMN `.red + table_name.cyan + `[`.red + column + '] DOESNT EXIST'.red);
    let columnQuery = generate_column(table);
    con2.query(`ALTER TABLE ${table_name} ADD ${columnQuery}`, function(err, result){
        if(err) throw err;
        console.log('COLUMN '.green + table_name.cyan + '[' + column + ']' + ' CREATED'.green)
        process.nextTick(function(){
            callback();
        });
    });
}

function modify_column(table, column2, column){
    let columnQuery = generate_column(column);
    con2.query(`ALTER TABLE ${table} CHANGE ${column2} ${columnQuery}`, function(err, res){
        if (err) throw err;
        console.log(`COLUMN `.yellow + table.cyan + `[`.yellow + column2 + '] CHANGED'.yellow);    
    });
}

function select_column(table, column_name){
    for(let i=0; i < table.length; i++){
        if(table[i].Field == column_name){
            return table[i];
        }
    }
}

function sort_columns(databaseName, tableName, currLocalTable, extColumns, localColumns){
    for(let i=0; i < extColumns.length; i++){
        if(localColumns.includes(extColumns[i])){
            if(extColumns[i] != localColumns[i]){
                if(extColumns[i] != localColumns[0]){                
                    for(let j=0; j < localColumns.length; j++){
                        if(extColumns[i] == localColumns[j]){
                            con2.query(`SELECT * FROM information_schema.COLUMNS` + 
                            ` WHERE TABLE_SCHEMA = '${databaseName}' ` + 
                            ` AND TABLE_NAME = '${tableName}' ` + 
                            `AND COLUMN_NAME = '${localColumns[j-1]}'`, function(err, result){                   
                                if(err) throw err;
                                if(result[0]){
                                    for(let q=0; q < localColumns.length; q++){
                                        if(currLocalTable[q].Field == extColumns[i]){                                             
                                            let column_options = generate_column(currLocalTable[q]);
                                            con2.query(`ALTER TABLE ${tableName} MODIFY COLUMN ${column_options} ` + 
                                            `AFTER ${localColumns[j-1]}`, function(err, result){
                                                if(err) throw err;
                                                console.log('COLUMN '.yellow + tableName.cyan + 
                                                '[' + extColumns[i] +'] SORTED'.yellow);
                                            });
                                        }
                                    }
                                }
                            });
                        }
                    }                      
                }
            }
        }
    } 
}