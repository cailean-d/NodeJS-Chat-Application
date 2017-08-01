if (!window.WebSocket) {
	document.body.innerHTML = 'WebSocket в этом браузере не поддерживается.';
}

// создать подключение
var socket = new WebSocket("ws://localhost:8081");
var myID = '';

// отправить сообщение из формы publish
document.forms.publish.onsubmit = function() {

  var outgoingMessage = this.message.value;

  socket.send(outgoingMessage);
  document.getElementById("message").value = "";
  return false;
};

// обработчик входящих сообщений
socket.onmessage = function(event) {
  // var incomingMessage = event.data;
  var data = JSON.parse(event.data);
  // showMessage(data.type); 

  switch(data.type){
  	  case "message":
  	  		if(data.sender == myId){
  	  			showMessage(data.message, 'myMessage'); 
  	  		} else {
  	  			showMessage(data.message, 'message'); 
  	  		}

  	  	 break;
  	  case "error":
  		 break;
  	  case "socket-id":
  	     myID = (data.ws);
  	     console.log(myID);
  	     break;


  }
};

socket.onclose = function(event) {
  if (event.wasClean) {
    console.log('Соединение закрыто чисто');
  } else {
    console.log('Обрыв соединения'); 
  }
};




// показать сообщение в div#subscribe
function showMessage(message, myclass) {
  var messageElem = document.createElement('div');
  messageElem.classList.add(myclass);
  messageElem.appendChild(document.createTextNode(message));
  document.getElementById('subscribe').appendChild(messageElem);
}




$(document).on('submit', '.form', function(e){
	e.preventDefault();
	// alert("wqeqe");
	var url = "http://127.0.0.1:8080";
	        $.ajax({
            url: url,
            type: 'POST',            
            data: new FormData(this),
            processData: false,
            contentType: false,
            success: function (data){
            	data = JSON.parse(data);

             console.log(data);
            }

        });
});