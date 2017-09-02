
$('.locale .ru').on('click', function(){
    Cookies.set('lang', 'ru', { expires: 365 });
    window.location.reload();
});
$('.locale .en').on('click', function(){
    Cookies.set('lang', 'us', { expires: 365 });
    window.location.reload();    
});

$('.current').on("click", function(){
    $('.langList').slideToggle(200);
  });

  $('.langList').on("mouseleave", function(){
    $('.langList').slideUp(300);
});
