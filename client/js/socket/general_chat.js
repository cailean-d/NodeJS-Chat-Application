
   $(function () {

    let myName =  Cookies.get('nickname');
    let myID = Cookies.get('userID');
    let myAvatar = Cookies.get('userAvatar');
    let isTyping = false;
    let type;
    let serverIP = '192.168.0.54';

    let scrl = 10000*10000;

    $('#messages').scrollTop(scrl);
    //connect
    // var socket = io();        // var socket = io(`http://${serverIP}:3000`);

    // console.log(myName);

    const socket = io({ query: { id: myID, nickname: myName } });

    // socket.on('reconnect_attempt', () => {
    //   socket.io.opts.query = { id: myID, nickname: myName }
    // });

    function myMessage(sender, message, time, avatar, id){

      formatter = new Intl.DateTimeFormat('ru',{ hour: "numeric", minute: "numeric" });
      time =  formatter.format(Date.parse(time));

      return  `<div class='myMessage'>` + 
                `<div  class='msg'>` + 
                    `<a class='avatar' href='/id${id}' target='_blank' title=${sender}>`+
                    `<img src='/img/core/user_avatar/${avatar}'></a> `+ 
                    `${message}`+
                `</div>`+
                `<div class='time'><span>${time}</span>`+
                `</div>`+
              `</div>`
    }

    function anotherMessage(sender, message, time, avatar, id){

      formatter = new Intl.DateTimeFormat('ru',{ hour: "numeric", minute: "numeric" });
      time =  formatter.format(Date.parse(time));

      return  `<div class='message'>` + 
                  `<div class='align'>` + 
                    `<div  class='msg'>` + 
                        `<a class='avatar' href='/id${id}' target='_blank' title=${sender}>`+
                        `<img src='/img/core/user_avatar/${avatar}'></a> `+ 
                        `${message}`+
                    `</div>`+
                    `<div class='time'><span>${time}</span>`+
                    `</div>`+
                  `</div>`+
              `</div>`
    }

// ----------------------------------------
//     SEND MESSAGE
// ----------------------------------------
    $('#chat_input').submit(function(){

      if ($('#m').val() != ''){  

        let time = new Date();
        let message = $('#m').val();
        //-------------------------
        socket.emit('chat message', {
          message : message,
          sender: myName,
          time: time,
          avatar: myAvatar,
          id: myID 
        });

        //append my message to chat
        $('#messages').append(myMessage(myName, message, time, myAvatar, myID));
        $('#messages').scrollTop(scrl);

        $('#m').val('');   // clear input
      } 
      return false;
    });

// ----------------------------------------
//     GET MESSAGES
// ----------------------------------------

    socket.on('chat message', function(msg){
        $('#messages').append(anotherMessage(msg.sender, msg.message, msg.time, msg.avatar, msg.id));
        $('#messages').scrollTop(9999999);
    });

// ----------------------------------------
//     GET ONLINE
// ----------------------------------------

    socket.on('online', function(data){
      // console.log(data);
      var html = '';
      for(var i = 0; i < data.userid.length; i++){
        html += `<li data-username='${data.username[i]}'><a href='id${data.userid[i]}'>${i+1}. ${data.username[i]}</a></li>`
      }
      $('.online ul').html(html);
    });

    socket.on('online-count', function(data){
     $('.online-count').text(data);
    })

// ----------------------------------------
//     TYPING
// ----------------------------------------
  
    $('#m').on('keyup', function(){
        clearTimeout(type);
        type = setTimeout(function(){
        isTyping = false;
        socket.emit('typingEnd', myName);
      }, 1000);
    });

    $('#m').on('keydown', function(){
        if(!isTyping) {
           socket.emit('typing', myName);
        }
        isTyping = true;
    });

    socket.on('typing', function(client){
        $('.type ul').append($(`<li class='${client}'>${client} is typing...</li>`));
    });   
    
    socket.on('typingEnd', function(client){
         $('.type ul .' + client).remove();
    });

// ----------------------------------------
//      CONNECTED / DISCONNECTED USER
// ----------------------------------------
  
  socket.on('connectedUser', function(user){
    $('#messages').append(`<div class='connectedUser'><div>${user} connected.</div>`);
    $('#messages').scrollTop(9999999);
  });

  socket.on('disconnectedUser', function(user){
    $('#messages').append(`<div class='disconnectedUser'><div>${user} disconnected.</div>`);
    $('#messages').scrollTop(9999999);
  });

// ----------------------------------------
//      CONNECTED / DISCONNECTED SERVER
// ----------------------------------------

  socket.on('disconnect', function(){
    $('#messages').append(`<div class='disconnectedUser'><div>Server is offline.</div>`);
    $('#messages').scrollTop(9999999);
  });

  socket.on('reconnect', (attemptNumber) => {
    $('#messages').append(`<div class='connectedUser'><div>Server is online.</div>`);
    $('#messages').scrollTop(9999999);
});

});