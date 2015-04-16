$(window).scroll(function() {
  if ($(window).scrollTop() >= 1) {
    $('nav').addClass('fixed-header');
  } else {
    $('nav').removeClass('fixed-header');
  }
});

//Variables
var $deletebuttons = $("button.delete");
$tweee_form = $('form#newtweee');
var currentuser = $('nav').attr("user");
if (currentuser === "") {
  currentuser = "None";
}
var currentuserid = $('nav').attr("uid");
var $gift_form = $("#gift_form");

//Event Callback Funtions
var shownewtweet = function(data, status) {
  $('div#newcomment').after(data);
  $tweee_form.find('#in_tweee').val('');
  hidedeletebuttons(currentuserid);
};

var hideoldtweet = function(data, status) {
  $('div.tweee#' + String(data._id)).hide(1000);
};

var homepage = function(data, status) {
  window.location.replace('/');
};

var onError = function(data, status) {
  console.error(data);
};

var deletehandler = function(event) {
  event.preventDefault();
  orderid = $(this).attr('id'); //get order id to cancel
  $.ajax("/tweee/delete/", {
      type: "DELETE",
      data: {
        orderid: orderid
      }
    })
    .done(hideoldtweet)
    .error(onError);
};

var highlight = function(event) {
  event.preventDefault();
  // unhighlight other users
  $("div#users div").css('background-color', 'transparent');
  // highlight clicked user
  $(this).css('background-color', 'orange');
  // unhighlight all tweees
  $("div.tweee").css('background-color', '#aaa');
  // highlight user's tweees
  $("div.tweee[uid=" + $(this).attr('uid') + "]").css('background-color', 'orange');
};

var unhighlight = function(event) {
  event.preventDefault();
  // unhighlight all users & tweees
  $("div#users div").css('background-color', 'transparent');
  $("div.tweee").css('background-color', '#aaa');
};

var logouthandler = function(event) {
  event.preventDefault();
  $.post('/logout').done(homepage).error(onError);
};

var newtweee = function() {
  words = $tweee_form.find('#in_tweee').val();
  $.post('/tweee/new/', {
    'username': currentuser,
    'words': words
  }).done(shownewtweet).error(onError);
};

var gift_submit = function() {
  var money = $gift_form.find('#money').val();
  var sent_user = document.getElementById("sent_user").innerHTML;
  var rec_user = document.getElementById("rec_user").value;
  console.log(rec_user);
  $.post('/gift/'+sent_user, {
    'money': money,
    'sent_user': sent_user,
    'rec_user': rec_user
    //add information about sent_user and rec_user
  })
  .done(function(data, status) {
    $("#gift_form").hide(1000);
    $("#random_gift").append(data.sent_user + ", you spend $" + data.money + " on " + data.rec_user + ", below is the random gift's information~")
  .error(
    function(data, status) {
      console.log("status", status);
      console.log("error", data);
    });
  });
}

// Page Functions
if (currentuser === "") {
  $tweee_form.hide();
}

$tweee_form.submit(function(event) {
  event.preventDefault();
  newtweee();
});

$gift_form.submit(function(event) {
  event.preventDefault();
  gift_submit();
  //go get Amazon working

});

$('textarea').keypress(function(event) {

  if (event.keyCode == 13) {
    event.preventDefault();
    newtweee();
  }
});

$("div#feed").on("click", "button.delete", deletehandler);

$("div#users").on("click", "div.usernamedisp", highlight);

$("div#users").on("click", "div#clearuserhl", unhighlight);

$("nav li#signout").on("click", logouthandler);

// User Functions

// hide delete buttons
var hidedeletebuttons = function(uid) {
  var searchstring = "button.delete:not([uid=" + uid + "])";
  $(searchstring).hide();
};

// hide entry
var hidetweee = function(username) {
  if (username === "None") {
    $("div.newtweee").remove();
  }
};

// hide sign out button if no user
var hidesign = function(username) {
  if (username === "None") {
    $('nav li#signout').remove();
  } else {
    $('nav li#signin').remove();
  }
};

hidedeletebuttons(currentuserid);
hidetweee(currentuser);
hidesign(currentuser);
