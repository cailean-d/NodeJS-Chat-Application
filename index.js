//nodejs modules
let express = require('express');                               // express framework
let router = express.Router();                                  // app routes
let app = require('express')();                                 // express application
let httpExpressServer = require('http').Server(app);            // http server
let io = require('socket.io')(httpExpressServer);               // socket server
let colors = require('colors');                                 // color console
let cookieParser = require('cookie-parser')                     // cookie middleware
let bodyParser = require('body-parser')                         // x-www-form-urlencoded
let bcrypt = require('bcrypt');                                 // encrypt data
let multer  = require('multer');                                // multipart/form-data
let upload = multer();
let favicon = require('serve-favicon');                         // app icon
let pug =  require('pug').renderFile;                           // template engine
let sass = require('node-sass');                                // sass compiler
let sassMiddleware = require('node-sass-middleware');

//local modules
let global_socket       = require('./server/server_global_socket')(io);
let socket_general_chat = require('./server/socket_general_chat')(io);
let socket_friends      = require('./server/server_socket_friends')(io.of('/friends'), io);
let routes              = require('./server/routes');
let ajax                = require('./server/ajax');
let pagenotfound        = require('./server/404');
let authorized          = require('./server/authorized');

// jade template engine
app.engine('pug', pug);
app.set('views', './views');
app.set('view engine', 'pug');

//middlewares
app.use(cookieParser('my-secret'))                             // cookie data
app.use(bodyParser.json());                                    // post data
app.use(bodyParser.urlencoded({ extended: false }));           // post data
app.use(upload.fields([]));                                    // form-data
app.use(favicon('./public/img/chat.ico'));                     // app logo
app.use(sassMiddleware({                                       // sass compile
  src: __dirname + "/sass",
  dest: __dirname + "/public",
  outputStyle: 'compressed',
  sourceMap: true
}));
app.use(express.static('public'));                             // static dir
app.use(authorized);                                           // set authorization bool
app.use(ajax(router));                                         // ajax responses
app.use(routes(router));                                       // app routes
app.use(pagenotfound);                                         // custom 404 page

var ip = '0.0.0.0';
var port = 3000;

httpExpressServer.listen(port, ip, function(){
  console.log(`\nSERVER listening on ${ip}:${port}\n`.green);
});
