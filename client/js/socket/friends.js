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

    // =============================================================
    // =============================================================
    // =============================================================

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


    // =============================================================
    // =============================================================
    // =============================================================

    //reject friend
    $(document).on('click', '.reject', function(){
        let userid = $(this).parent().attr('data-id');
        socket.emit('reject_friend', userid);
    })

    // callback on friend rejected
    socket.on('friend_rejected', function(data){
        if(data.success){
            alert('friend rejected');
            $(`.inviteList .user[data-id=${data.user}]`).remove();
            // $('.friendList').append(`.user[data-id=${data.user}`);
        } else {
            alert('error');
        }
    })    

    // =============================================================
    // =============================================================
    // =============================================================
    
    $('.inv_friend').on('click', function(){
        let target_id = $('.profile_id').text();
        socket.emit('invite_friend', target_id)
    });

    socket.on('friend_invited', function(data){
        if(data.success){
            alert('friend invited');
        } else {
            alert('error');
        }
    })

})();