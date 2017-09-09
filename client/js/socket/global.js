(function(){

    // cookie
    let myName =  Cookies.get('nickname');
    let myID = Cookies.get('userID');
    let avatar = Cookies.get('userAvatar');

    // audio files
    let notification = document.getElementById('notif');
    let message = document.getElementById('mes');
    

    const socket = io({ query: { id: myID, nickname: myName, avatar: avatar } });

    socket.on('added_to_friends', function(data){
        if(!isPlaying(notification)){
            notification.play();
        }
        console.log('you are added to friend by ' + data);
        if(location.pathname == '/friends'){

            let friendsCount =  $('.tabs-buttons .all-friends .count').text();
    
            if(friendsCount == 0){
                $('.tabs-body .all-friends').html(`<div class='friendList'></div>`);
                $('.tabs-body .friendList').append(user_friend(data.user.id, data.user.avatar, data.user.nickname));
            } else{
                $('.tabs-body .friendList').append(user_friend(data.user.id, data.user.avatar, data.user.nickname));
            }
            $('.tabs-buttons .all-friends .count').text(+friendsCount + 1);
        }

        if(location.pathname.includes('/id')){
            $('.thumbnail .inv_friend').attr('disabled', 'true');
            $('.thumbnail .inv_friend').text('Friend');
        }

        
    })
    socket.on('deleted_from_friends', function(data){
        if(!isPlaying(notification)){
            notification.play();
        }
        let friendsCount =  $('.tabs-buttons .all-friends .count').text();
        
        console.log('you are deleted from friends by ' + data.username)
        if(location.pathname == '/friends'){
            $(`.friendList .user[data-id=${data.id}]`).remove();  // remove userObject
            $('.tabs-buttons .all-friends .count').text(+friendsCount - 1); // decrease count    
            
            if($('.tabs-buttons .all-friends .count').text() == 0){
                $('.tabs-body .all-friends').html(`<h3>You have no friends</h3>`);
            }     
        }
        if(location.pathname.includes('/id')){
            $('.thumbnail .inv_friend').attr('disabled', false);
            $('.thumbnail .inv_friend').text('Invite to friends');
        }
    })
    socket.on('friendship_rejected', function(data){
        if(!isPlaying(notification)){
            notification.play();
        }
        console.log('friendship rejected by ' + data)
    })
    socket.on('invited_to_friend', function(data){
        if(!isPlaying(notification)){
            notification.play();
        }
        console.log('invited to friend by ' + data.username);
        if(location.pathname == '/friends'){

          let invitesCount =  $('.tabs-buttons .invites .count').text();
            
            if(invitesCount == 0){
                $('.tabs-body .invites').html(`<div class='inviteList'></div>`);
                $('.tabs-body .inviteList').append(user_invite(data.id, data.avatar, data.username));
            } else{
                $('.tabs-body .inviteList').append(user_invite(data.id, data.avatar, data.username));
            }
            $('.tabs-buttons .invites .count').text(+invitesCount + 1);
        }
    })

})();

function isPlaying(audio) { return !audio.paused; }
