function select_tab(tab){
    $('.' + tab).on('click', function(){
        $('.tabs-buttons').children().removeClass('active');       
        $(this).addClass('active');        
        $('.tabs-body').children().hide();
        $('.tabs-body .' + tab).show();
    })

}

var tabs = $('.tabs-buttons').children();

for(var i=0; i < tabs.length; i++){
    var tab = $(tabs[i]).attr('class').split(' ')[0];
    select_tab(tab);
}
