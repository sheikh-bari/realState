
$("#logout").click(function(){
    logOutUser();
});



function setNavLinks(){
    var userInfo = getUserInfo();
    if(userInfo != null){
        $("#login-link").css("display","none");
        $("#signup-link").css("display","none");
        $("#profile-anchor").css("display","inline-block");
        $("#messages-link").css("display","inline-block");
        $("#logout-link").css("display","inline-block");
        $("#profile-anchor").html("<a href="+BASE_URL+"profile.html><i class='glyphicon glyphicon-user'> </i>"+userInfo.UserName+"</a>");
    }
    else{
        $("#login-link").css("display","inline-block");
        $("#signup-link").css("display","inline-block");
        $("#profile-link").css("display","none");
        $("#messages-link").css("display","none");
        $("#logout-link").css("display","none");
    }
}

    function showToaster(data, flag){
        var toaster = document.getElementById("toaster");
        toaster.className = "show";
        if(flag == 'success')
        toaster.style.backgroundColor = "#28db93";
        document.getElementById("toaster").innerHTML = data;
        setTimeout(function(){
            toaster.className = toaster.className.replace("show", ""); 
        }, 3000);
    }

function authenticateUser(){
    $("#error-msg").text("");
    var userName = $("#username").val();
    var password = $("#password").val();

    if(userName == "" || userName === undefined){
        $("#error-msg").text("Please enter username");
        return;
    }

    if(password == "" || password === undefined){
        $("#error-msg").text("Please enter password");
        return;
    }

    checkUser(userName, password).then(function(data){
        console.log(data);
        var response = data;
        if(response.success){
            localStorage.setItem('userInfo', JSON.stringify(response.data));

            window.location.href = BASE_URL;
        }
        else{
            $("#error-msg").text(response.message);
        }
    });
}

function signUpUser(){
    $("#error-msg").text("");

    var firstName = $("#firstname").val();
    var lastName = $("#lastname").val();
    var email = $("#email").val();
    var mobile = $("#mobilenumber").val();
    var userName = $("#username").val();
    var password = $("#password").val();
    var confirmPass = $("#confirm-password").val();

    if(firstName == "" || firstName === undefined){
        $("#error-msg").text("Please enter First Name");
        return;
    }

    if(lastName == "" || lastName === undefined){
        $("#error-msg").text("Please enter Last Name");
        return;
    }

    if(email == "" || email === undefined){
        $("#error-msg").text("Please enter Email");
        return;
    }

    if(mobile == "" || mobile === undefined){
        $("#error-msg").text("Please enter Mobile Number");
        return;
    }

    if(userName == "" || userName === undefined){
        $("#error-msg").text("Please enter username");
        return;
    }

    if(password == "" || password === undefined){
        $("#error-msg").text("Please enter password");
        return;
    }

    if(confirmPass == "" || confirmPass === undefined){
        $("#error-msg").text("Please enter Confirm Password");
        return;
    }

    registerUser(firstName,lastName,email,mobile, userName, password, confirmPass).then(function(data){
        console.log(data);
        var response = data;
        if(response.success){
            localStorage.setItem('userInfo', JSON.stringify(response.data));
            showToaster('You have registered successfully', 'success');
            window.location.href = BASE_URL;
        }
        else{
            $("#error-msg").text(response.message);
        }
    });
}

function renderUserConversations(){
    var userInfo = getUserInfo();
    console.log('calling conversations');
    if(userInfo != null){
        getUserConversations(userInfo.UserId).then(function(data){
        console.log(data);
        var response = data;
        response.data.forEach(function(obj){
            obj.image = userInfo.UserId == obj.SenderID ? obj.ReceiverImage : obj.SenderImage;
            obj.Name = userInfo.UserId == obj.SenderID ? obj.ReceiverName : obj.SendererName;
            obj.UserId = userInfo.UserId == obj.SenderID ? obj.ReceiverID : obj.SenderID;
        });
        if(response.success){
            $("#conversation-container").loadTemplate($("#msg-template"), response.data, { append: true, elemPerPage: 10 });
        }
        else{
            $("#error-msg").text(response.message);
        }
    });
    }
}

function loadConversation(el){
    var conId = parseInt($(el).find("span.con-id").text());
    var userId = parseInt($(el).find("span.user-id").text());
    var senderName = $(el).find(".sender-name").text();
    $(".msg-list-heading").text(senderName);
    $("#msg-thread-container").empty();
    $("#txt-con-id").val(conId);
    $("#txt-user-id").val(userId);
    getMessagesByConId(conId).then(function(data){
        console.log(data);
        var userInfo = getUserInfo();
        var response = data;
        if(response.success){
            var msgs = response.data;
            msgs.forEach(function(msg){
                console.log(msg);
                var isReceiver = msg.ReceiverID == userInfo.UserId ? true : false;
                if(isReceiver){                    
                    $('<div/>').loadTemplate($("#msg-template-receiver"), msg, { append: true, elemPerPage: 10 }).appendTo("#msg-thread-container");
                }else{                    
                    $('<div/>').loadTemplate($("#msg-template-sender"), msg, { append: true, elemPerPage: 10 }).appendTo("#msg-thread-container");
                }   
            })            
        }
        else{
            $("#error-msg").text(response.message);
        }
    });
}

function postMessage(){    
    var userInfo = getUserInfo();
    if(userInfo != null){
        var msgText = $("#text-msg").val();
        var senderId = userInfo.UserId;
        var receiverId = parseInt($("#txt-user-id").val());
        //return;
        postMessageToUser(senderId, receiverId, msgText).then(function(data){
            console.log(data);
            var userInfo = getUserInfo();
            var response = data;
            if(response.success){
                var msg = {SenderImage : userInfo.UserImagePath , MessageText : msgText, MsgDate : "now"};
                $('<div/>').loadTemplate($("#msg-template-sender"), msg, { append: true, elemPerPage: 10 }).appendTo("#msg-thread-container");           
            }
            else{
                $("#error-msg").text(response.message);
            }
        });    
    }
    
}

function sendMsgToAgent(){
    var userInfo = getUserInfo();
    if(userInfo != null){
        var msgText = $("#msg-text").val();
        var senderId = userInfo.UserId;
        var receiverId = parseInt($("#agent-title").attr("data"));

        postMessageToUser(senderId, receiverId, msgText).then(function(data){
            console.log(data);
            var userInfo = getUserInfo();
            var response = data;
            if(response.success){
                $("#msg-text").val("")
                showToaster('Message sent successfully', 'success');
            }
            else{
                $("#error-msg").text(response.message);
            }
        });    
    }
    
}

