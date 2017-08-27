(function(){

    let myName =  Cookies.get('nickname');
    let myID = Cookies.get('userID');

    const socket = io('/friends',{ query: { id: myID, nickname: myName } });

    // accept invite
    $(document).on('click', '.accept', function(){
        let userid = $(this).parent().attr('data-id');
        socket.emit('add_friend', userid);
    })

    // callback on friend invite
    socket.on('friend_added', function(data){
        if(data.success){
            alert('friend added');
            $(`.inviteList .user[data-id=${data.user}]`).remove();
        } else {
            alert('error');
        }
    })

    //delete friend
    $(document).on('click', '.delete_friend', function(){
        let userid = $(this).parent().attr('data-id');
        socket.emit('delete_friend', userid);
    })

    // callback on friend delete
    socket.on('friend_deleted', function(data){
        if(data.success){
            alert('friend deleted');
            $(`.friendList .user[data-id=${data.user}]`).remove();
            // $('.friendList').append(`.user[data-id=${data.user}`);
        } else {
            alert('error');
        }
    })
})();