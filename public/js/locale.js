
$('.locale .ru').on('click', function(){
    Cookies.set('lang', 'ru', { expires: 365 });
    window.location.reload();
});
$('.locale .en').on('click', function(){
    Cookies.set('lang', 'en', { expires: 365 });
    window.location.reload();    
});