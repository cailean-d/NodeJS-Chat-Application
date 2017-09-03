$('#login_user').on("submit", function(event){
    event.preventDefault();
    var url = $(this).attr("action");
    $.ajax({
      url: url,
      type: 'post',
      data: new FormData(this),
      processData: false,
      contentType: false,
      success: function (data){
        if(data == 'OK'){
          window.location.pathname = '/';
        } else{
          alert(data);
        }
      }
    });
});
