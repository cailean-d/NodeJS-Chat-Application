
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
            console.log('friend added');
            
            let invitesCount =  $('.tabs-buttons .invites .count').text();
            let friendsCount =  $('.tabs-buttons .all-friends .count').text();
            
            $(`.inviteList .user[data-id=${data.user.id}]`).remove();     // remove userObject
            $('.tabs-buttons .invites .count').text(+invitesCount - 1);   // decrease count


            if(friendsCount == 0){
                $('.tabs-body .all-friends').html(`<div class='friendList'></div>`);
                $('.tabs-body .friendList').append(user_friend(data.user.id, data.user.avatar, data.user.nickname));
            } else{
                $('.tabs-body .friendList').append(user_friend(data.user.id, data.user.avatar, data.user.nickname));
            }
            $('.tabs-buttons .all-friends .count').text(+friendsCount + 1);
            
            if($('.tabs-buttons .invites .count').text() == 0){
                $('.tabs-body .invites').html(`<h3>You have no invites`);
            }
        } else {
            console.log('error');
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
            console.log('friend deleted');
            
            let friendsCount =  $('.tabs-buttons .all-friends .count').text();

            $(`.friendList .user[data-id=${data.user}]`).remove();  // remove userObject

            $('.tabs-buttons .all-friends .count').text(+friendsCount - 1); // decrease count

            if($('.tabs-buttons .all-friends .count').text() == 0){
                $('.tabs-body .all-friends').html(`<h3>You have no friends</h3>`);
            }
        } else {
            console.log('error');
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
            console.log('friend rejected');

            let invitesCount =  $('.tabs-buttons .invites .count').text();

            $(`.inviteList .user[data-id=${data.user}]`).remove(); // remove userObject
            $('.tabs-buttons .invites .count').text(+invitesCount - 1);  // decrease count
            if($('.tabs-buttons .invites .count').text() == 0){
                $('.tabs-body .invites').html(`<h3>You have no invites`);
            }
        } else {
            console.log('error');
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
            console.log('friend invited');
            $('.thumbnail .inv_friend').attr('disabled', 'true');
            $('.thumbnail .inv_friend').text('Invited');
        } else {
            console.log('error');
        }
    })

})();
