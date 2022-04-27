$( window ).on( "load", function() {
var win = $(this);
if (win.width() >= 600) {
  $("#signup").click(function() {
    $(".message").css("transform", "translateX(100%)");
    if ($(".message").hasClass("login")) {
      $(".message").removeClass("login");
    }
    $(".message").addClass("signup");
  });

  $("#login").click(function() {
    $(".message").css("transform", "translateX(0)");
    if ($(".message").hasClass("login")) {
      $(".message").removeClass("signup");
    }
    $(".message").addClass("login");
  });
}
else if (winTwo.width() <= 600){
  $("#signup").click(function() {
    $("html, body").scrollTop($("#sigupPage"). $("body").offset().top);
  });
  $("#login").click(function() {
    $("html, body").scrollTop($("#loginPage"). $("body").offset().top);
  });
}
$( window ).on( "resize", function() {
  var winTwo = $(this);
    if (winTwo.width() >= 600) {
    $("#signup").click(function() {
      $(".message").css("transform", "translateX(100%)");
      if ($(".message").hasClass("login")) {
        $(".message").removeClass("login");
      }
      $(".message").addClass("signup");
    });
  
    $("#login").click(function() {
      $(".message").css("transform", "translateX(0)");
      if ($(".message").hasClass("login")) {
        $(".message").removeClass("signup");
      }
      $(".message").addClass("login");
    });
  }
  else if (winTwo.width() <= 600){
    $("#signup").click(function() {
      $("html, body").scrollTop($("#sigupPage"). $("body").offset().top);
    });
    $("#login").click(function() {
      $("html, body").scrollTop($("#loginPage"). $("body").offset().top);
    });
  }
});
});




  