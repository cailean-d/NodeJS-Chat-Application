(function(){
    let myName =  Cookies.get('nickname');
    let myID = Cookies.get('userID');

    const socket = io({ query: { id: myID, nickname: myName } });

    socket.on('added_to_friends', function(data){
        document.getElementById('notif').play();
        alert('you are added to friend by ' + data)
    })
    socket.on('deleted_from_friends', function(data){
        document.getElementById('notif').play();        
        alert('you are deleted from friends by ' + data)
    })
    socket.on('friendship_rejected', function(data){
        document.getElementById('notif').play();                
        alert('friendship rejected by ' + data)
    })
})();