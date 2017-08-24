
let databaseModule = require('./server/database_module');                           

//-------------------------------------------------------------------------------------------------------
//  CREATE TABLES
//-------------------------------------------------------------------------------------------------------

let database = {

    //table users    
    users : [
        { Field: 'id', Type: 'int(11) unsigned', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
        { Field: 'nickname', Type: 'varchar(30)', Null: 'NO', Key: '', Default: null, Extra: '' },
        { Field: 'email',Type: 'varchar(30)', Null: 'NO', Key: '', Default: null, Extra: '' },
        { Field: 'password',Type: 'varchar(70)', Null: 'NO', Key: '', Default: null, Extra: '' },
        { Field: 'about',Type: 'text', Null: 'NO', Key: '', Default: null, Extra: '' },
        { Field: 'avatar',Type: 'varchar(40)', Null: 'NO', Key: '', Default: 'user_thumbnail.jpg', Extra: '' },
        { Field: 'date',Type: 'timestamp', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' }
    ],
    
    //table general_chat
    general_chat : [
        { Field: 'id', Type: 'int(11) unsigned', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
        { Field: 'sender', Type: 'varchar(30)', Null: 'NO', Key: '', Default: null, Extra: '' },
        { Field: 'message',Type: 'text', Null: 'NO', Key: '', Default: null, Extra: '' },
        { Field: 'date',Type: 'timestamp', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' }
    ],
    
    //table friends
    friends : [
        { Field: 'id', Type: 'int(11) unsigned', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
        { Field: 'friend_1', Type: 'int(11) unsigned', Null: 'NO', Key: '', Default: null, Extra: '' },
        { Field: 'friend_2',Type: 'int(11) unsigned', Null: 'NO', Key: '', Default: null, Extra: '' },
        { Field: 'status',Type: "enum('0','1')", Null: 'NO', Key: '', Default: "0", Extra: '' },
        { Field: 'date',Type: 'timestamp', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' }
    ]
}


databaseModule("mydb", database);