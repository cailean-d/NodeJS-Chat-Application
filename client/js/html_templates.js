// html templates
function user_invite(id, logo, nickname){
    return `<div class="user" data-id=${id}>` +
                `<div class="userWrap">` +
                    `<div class="logo">` + 
                        `<a href='/id${id}' taget='_blank'>` +
                            `<img src='/img/core/user_avatar/${logo}' alt="">` +
                        `</a>` +
                    `</div>` +
                    `<div class="userBody">` + 
                        `<div class="top">` + 
                            `<a href="" class="nickname">${nickname}</a>` +
                            `<div class="id" data-id='${id}'>` +
                                `<i class="accept fa fa-check-circle-o" aria-hidden="true" title='add user to friends'></i>` +
                            `</div>` +
                        `</div>` + 
                        `<div class="bottom">` +
                            `<div class="msg">` +
                                `<a href="/dialogs?with=${id}" class="write-message">To white a message</a>` +
                            `</div>` +
                            `<div class="id" data-id=${id}>` +
                                `<i class="reject fa fa-ban" aria-hidden="true" title='delete invite'></i>` +
                            `</div>` +
                        `</div>` +
                    `</div>` +
                `</div>` +
            `</div>`;
}

function user_friend(id, logo, nickname){
    return `<div class="user" data-id=${id}>` +
                `<div class="userWrap">` +
                    `<div class="logo">` + 
                        `<a href='/id${id}' target='_blank'>` +
                            `<img src='/img/core/user_avatar/${logo}' alt="">` +
                        `</a>` +
                    `</div>` +
                    `<div class="userBody">` + 
                        `<div class="top">` + 
                            `<a href="" class="nickname">${nickname}</a>` +
                        `</div>` + 
                        `<div class="bottom">` +
                            `<div class="msg">` +
                                `<a href="/dialogs?with=${id}" class="write-message">To white a message</a>` +
                            `</div>` +
                            `<div class="id" data-id=${id}>` +
                                `<i class="delete_friend fa fa-trash-o" aria-hidden="true" title='delete user'></i>` +
                            `</div>` +
                        `</div>` +
                    `</div>` +
                `</div>` +
            `</div>`;
}