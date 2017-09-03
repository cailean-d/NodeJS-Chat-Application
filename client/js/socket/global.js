(function(){

    // cookie
    let myName =  Cookies.get('nickname');
    let myID = Cookies.get('userID');

    // audio files
    let notification = document.getElementById('notif');
    let message = document.getElementById('mes');
    

    const socket = io({ query: { id: myID, nickname: myName } });

    socket.on('added_to_friends', function(data){
        if(!isPlaying(notification)){
            notification.play();
        }
        alert('you are added to friend by ' + data)
    })
    socket.on('deleted_from_friends', function(data){
        if(!isPlaying(notification)){
            notification.play();
        }
        alert('you are deleted from friends by ' + data)
    })
    socket.on('friendship_rejected', function(data){
        if(!isPlaying(notification)){
            notification.play();
        }
        alert('friendship rejected by ' + data)
    })
    socket.on('invited_to_friend', function(data){
        if(!isPlaying(notification)){
            notification.play();
        }
        alert('invited to friend by ' + data)
    })

})();

function isPlaying(audio) { return !audio.paused; }