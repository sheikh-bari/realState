// This value will be changed when we deploy it to server if we need
var API_ENDPOINT = 'http://localhost:3000/';
//var API_ENDPOINT = 'https://sfsuse.com/fa17g19/';


function getListings(searchVal, accomodationType, bedrooms, sqft, adType, pageIndex){

    var _data = { searchText : searchVal, typeOfAccomodation : accomodationType, noOfBedRooms: bedrooms, squareFeet : sqft, adType : adType, pageIndex : pageIndex  };

    var deferred = new $.Deferred();
    $.ajax({
        url: API_ENDPOINT + 'api/listings',
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

function getListingDetails(id){
    console.log('details api called');

    var deferred = new $.Deferred();
    $.ajax({
        url: API_ENDPOINT + 'api/listing?listing_id=' + id,
        method: 'GET',
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

function changePassword(oldPass, newPass, cnewPass, userType, userId){

    var _data = { oldPassword : oldPass, newPassword : newPass, cpassword : cnewPass, userId : userId, usertype : userType};
    var deferred = new $.Deferred();
    $.ajax({
        url: API_ENDPOINT+'api/user/resetpassword',
        method: 'POST',
        data: JSON.stringify(_data),
        dataType: "json",
        contentType: 'application/json',
        success: function (response) {
            console.log('response after password change',response);
            deferred.resolve(response);

        },
        error: function (response){
            deferred.reject(response);
        }
    });
    return deferred.promise();  
};

function updateUserDetails(fname, lname, email, mnumber, userId){

    var _data = { fname : fname, lname : lname, email : email, userId : userId};
    var deferred = new $.Deferred();
    $.ajax({
        url: API_ENDPOINT+'api/user/update',
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
