//nodejs modules
let express = require('express');                               // express framework
let router = express.Router();                                  // app routes
let app = require('express')();                                 // express application
let httpExpressServer = require('http').Server(app);            // http server
let io = require('socket.io')(httpExpressServer);               // socket server
let colors = require('colors');                                 // color console
let cookieParser = require('cookie-parser')                     // cookie middleware
let bodyParser = require('body-parser')                         // x-www-form-urlencoded
let multer  = require('multer');                                // multipart/form-data
let upload = multer();                                          // <--
let favicon = require('serve-favicon');                         // app icon
let pug =  require('pug').renderFile;                           // template engine
let sass = require('node-sass');                                // sass compiler
let sassMiddleware = require('node-sass-middleware');           // <--
let i18n = require("i18n");                                     // internationalization

//socket namespaces
let global = io;
let friends = io.of('/friends');
let general_chat = io.of('/general_chat');

//socket modules
let global_socket       = require('./server/socket/global')(global);
let socket_general_chat = require('./server/socket/general_chat')(global);
let socket_friends      = require('./server/socket/friends')(friends, global);

//local modules
let routes              = require('./server/routes');
let ajax                = require('./server/ajax');
let pagenotfound        = require('./server/404');
let authorized          = require('./server/authorized');

// jade template engine
app.engine('pug', pug);
app.set('views', './views');
app.set('view engine', 'pug');

// internationalization config
i18n.configure({
  locales: ['ru', 'en'],
  directory: __dirname + '/locales',
  defaultLocale: 'en',
  cookie: 'lang',
  queryParameter: 'lang'
});

//sass config
let sassConfig = {
  src: __dirname + "/public/sass",
  dest: __dirname + "/public",
  outputStyle: 'compressed',
  sourceMap: true
}

//middlewares
app.use(cookieParser('my-secret'))                             // cookie data
app.use(i18n.init);                                            // app internationalization
app.use(bodyParser.json());                                    // post data
app.use(bodyParser.urlencoded({ extended: false }));           // post data
app.use(upload.fields([]));                                    // form-data
app.use(favicon('./client/img/chat.ico'));                     // app logo
app.use(sassMiddleware(sassConfig));                           // sass compile
app.use(express.static('client'));                             // static dir
app.use(authorized);                                           // set authorization bool
app.use(ajax(router));                                         // ajax responses
app.use(routes(router));                                       // app routes
app.use(pagenotfound);                                         // custom 404 page

let ip = '0.0.0.0';
let port = 3000;

httpExpressServer.listen(port, ip, function(){
  console.log(`\nSERVER listening on ${ip}:${port}\n`.green);
});

