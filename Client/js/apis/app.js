// This value will be changed when we deploy it to server if we need
var API_ENDPOINT = 'http://localhost:3000/';

function checkUser(userName,password){
    var _data = { username : userName, password : password };
    var deferred = new $.Deferred();
    $.ajax({
        url: API_ENDPOINT+'api/login',
        method: 'POST',
        data: JSON.stringify(_data),
        dataType: "json",
        contentType: 'application/json',
        success: function (response) {
            deferred.resolve(response);
        },
        error: function (response){
            deferred.reject(response);
        }
    });
    return deferred.promise();  
};

function registerUser(firstName,lastName,email,mobile, userName, password, confirmPass){
    var _data = { username : userName, password : password, fname : firstName, lname: lastName, email : email, phone : mobile, cpassword : confirmPass };
    var deferred = new $.Deferred();
    $.ajax({
        url: API_ENDPOINT+'api/signup',
        method: 'POST',
        data: JSON.stringify(_data),
        dataType: "json",
        contentType: 'application/json',
        success: function (response) {
            deferred.resolve(response);
        },
        error: function (response){
            deferred.reject(response);
        }
    });
    return deferred.promise();
};

function getUserConversations(userId){
    
    var deferred = new $.Deferred();
    $.ajax({
        url: API_ENDPOINT+'api/GetAllConversations?receiverID=' + userId,
        method: 'GET',
        dataType: "json",
        contentType: 'application/json',
        success: function (response) {
            deferred.resolve(response);
        },
        error: function (response){
            deferred.reject(response);
        }
    });
    return deferred.promise();
};

function getMessagesByConId(conId){
    
    var deferred = new $.Deferred();
    $.ajax({
        url: API_ENDPOINT+'api/GetAllMessages?conversationID=' + conId,
        method: 'GET',
        dataType: "json",
        contentType: 'application/json',
        success: function (response) {
            deferred.resolve(response);
        },
        error: function (response){
            deferred.reject(response);
        }
    });
    return deferred.promise();
};

function postMessageToUser(senderId, receiverId, msgTxt){
    var _data = { senderId : senderId, receiverId : receiverId, msgTxt : msgTxt};
    var deferred = new $.Deferred();
    $.ajax({
        url: API_ENDPOINT+'api/PostMessage',
        method: 'POST',
        data: JSON.stringify(_data),
        dataType: "json",
        contentType: 'application/json',
        success: function (response) {
            deferred.resolve(response);
        },
        error: function (response){
            deferred.reject(response);
        }
    });
    return deferred.promise();
};