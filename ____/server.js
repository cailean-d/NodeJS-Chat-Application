var http = require('http');
var Static = require('node-static');
var WebSocketServer = new require('ws');
var mysql = require('mysql');
var mysqlUtilities = require('mysql-utilities');
var url = require('url');
// var util = require('util');
var querystring = require('querystring');
var colors = require('colors/safe');


var connection = mysql.createConnection({
  host:     'localhost',
  user:     'root',
  password: '',
  database: 'test'
});


// подключенные клиенты
var clients = {};

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({port: 8081});
webSocketServer.on('connection', function(ws) {

  var id = Math.floor(Math.random()*10000);
  clients[id] = ws;

	 ws.on('open', function open() {1
		  clients[id].send(
			JSON.stringify ({
			type: 'socket-id',
			ws: "www22"
		}));
	});

  
  console.log(colors.yellow("новое соединение " + id));

  ws.on('message', function(message) {
    console.log(colors.cyan('получено сообщение ' + message));


    for(var key in clients) {
      clients[key].send(
      	JSON.stringify ({
			type: 'message',
			message: message,
			sender: id
		}));
    }


	// connection.connect();

	// mysqlUtilities.upgrade(connection);
	// mysqlUtilities.introspection(connection);

	// connection.queryValue('SELECT name FROM users where id=?', [84],
	//   function(err, name) {
	//   console.dir({queryValue:name});
	// });



  		mysqlUtilities.upgrade(connection);
	    mysqlUtilities.introspection(connection);

    	connection.insert('node_test', {
		  a: 'name',
		  b: message,
		  c:'TT',
		}, function(err, recordId) {
		  console.dir({insert:recordId});
		});



	// connection.end();

  });

  ws.on('close', function() {
    console.log(colors.red('соединение закрыто ' + id));
    delete clients[id];
  });

});


// обычный сервер (статика) на порту 8080
var fileServer = new Static.Server('.');
var server = http.createServer(function (req, res) {
  
  fileServer.serve(req, res);

}).listen(8080);

console.log(colors.green("\nHTTP сервер запущен ") + colors.magenta("[8080]") + 
	  colors.green("\nWebSocket сервер запущен ") + colors.magenta("[8081]\n"));



// при обращении к серверу через http
server.on('request', function(request, response) {
  
     var $_GET = GET(request);
     var $_POST = POST(request);
     var key;

     for(key in $_GET){
     	console.log( colors.magenta("GET ") + "VAR: " + key + "   VALUE: " + $_GET[key]);
     }

     for(key in $_POST){
     	console.log( colors.magenta("POST ") + "VAR: " + key + "   VALUE: " + $_POST[key]);
     }

  //   if ($_POST.sendMessage){

  // 		mysqlUtilities.upgrade(connection);
	 //    mysqlUtilities.introspection(connection);
  //   	connection.insert('node_test', {
		//   a: $_POST.name,
		//   b: $_POST.msg,
		//   c:'TT',
		// }, function(err, recordId) {
		//   console.dir({insert:recordId});
		// });
  //   }
    // response.writeHead(200, {'Content-Type': 'application/json'});
    // response.write(JSON.stringify({"message": "Hello world!"}));
    // response.end();

    // console.log(request.method);s
    // console.log(request.headers);
    // console.log(request.url);
    // response.write('hi');
    // response.end();
});


   function GET(request){
      if (request.method == "GET"){
    	return querystring.parse(url.parse(request.url).query);
      }
   }


  function POST(request){
     var post = '';   
  	    if (request.method == "POST"){
		    request.on('data', function(chunk){    
		        post += chunk;
		    });

		    request.on('end', function(){   
		        post = querystring.parse(post);
		    });
        }
 	return post;
  }