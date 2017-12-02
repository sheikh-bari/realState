$(document).ready(function() {

var userInfo = getUserInfo();

document.getElementById('profile-name').innerHTML = userInfo.FirstName+" "+userInfo.LastName;

var userType = userInfo.UserTypeId,
    userId = userInfo.UserId;


    function loadListings(){
        getListings('', '', '', '', '', '').then(function(data){
            $('.myprofile-content').load("partials/_listings.html", function(){
                if(data.success){
                    var response = data.data;

                    for(var i=0; i < response.length; i++){
                        var template = $('#listingCard').clone();
                        template.attr('style',"display:block;");

                        template.find(".listing-title")[0].innerHTML = "<div id=listing-"+i+" class='view-listing-details' data='" +response[i].Id+ "'>" + response[i].Title + "</div>";
                        template.find(".realEstatePrice")[0].innerHTML =  response[i].Price;


                        template.find(".realEstateCity")[0].innerHTML = response[i].City;
                        template.find(".realEstateState")[0].innerHTML = response[i].State;


                        template.find(".adImage")[0].innerHTML = "<img id=listing-image-"+i+" class='listing-image view-listing-details' src='" + response[i].AdMedia[0].ImagePath + "' data="+response[i].Id+" alt=''>";// <span class='four listing-price'>$"+response[i].Price+"</span>";
                        var exe = template.find(".adImage")[0];

                        // after adding all details appending the template
                        template.appendTo(".appendHere");
                    }

                    var listingDetailsLinks = document.getElementsByClassName("view-listing-details");

                    for(var i=0;i < listingDetailsLinks.length;i++) {
                        listingDetailsLinks[i].addEventListener("click", function() {
                            var element = document.getElementById(this.id);
                            var idx = element.getAttribute("data");
                            //listingDetails(idx);
                        });
                    };
                    apiCalled = false;
                }

            });
        });
    }
    
    if(userInfo){
        
        loadListings();
    }
    else if(userInfo == undefined){
        window.location.href = BASE_URL;
    }


    $('.myprofile-listings').click(function(){

        loadListings();
    })

    $('.myprofile-change-password').click(function(){
       
        $( ".myprofile-content" ).load( "partials/_changePassword.html", function() {
             $('.change-password-btn').click(function(){
                updatePassword();
            });
        });
    })

    $('.myprofile-edit').click(function(){
       
        $( ".myprofile-content" ).load( "partials/_editProfile.html", function() {
            
            var userInfo = JSON.parse(localStorage.getItem("userInfo"));

            $("#firstname").val(userInfo.FirstName);
            $("#lastname").val(userInfo.LastName);
            $("#email").val(userInfo.Email);
            $("#mobilenumber").val(userInfo.MobileNumber);

            $('.edit-profile-btn').click(function(){
                updateProfile();
            });
        });
    })

    $('.add-new-listing').click(function(){
       
        $( ".myprofile-content" ).load( "partials/_addNewListing.html", function() {
            
        });
    })    
    
    function updatePassword(){

        var oldPass = $("#current-password").val(),
        newPass = $("#new-password").val(),
        cnewPass = $("#confirm-new-password").val();

        if(oldPass == "" || oldPass === undefined){
            $("#error-msg").text("Please enter old password");
            return;
        }
        if(newPass == "" || newPass === undefined){
            $("#error-msg").text("Please enter password");
            return;
        }
        if(cnewPass == "" || cnewPass === undefined){
            $("#error-msg").text("Please confirm password");
            return;
        }
        if(newPass != cnewPass){
            $("#error-msg").text("Passwords mismatch please re enter passwords");
            return;
        }

        changePassword(oldPass, newPass, cnewPass, userType, userId).then(function(data){
            console.log('response after change password =',data);
            var response = data;
            if(response.success == false){
                $("#error-msg").text(response.message);
            }
            else if(response){
                
                $( ".myprofile-content" ).load( "partials/_myListings.html", function() {
                    showToaster('Password changed successfully', 'success');
                });
            }
            
        });
    }

    function updateProfile(){

        var fname = $("#firstname").val(),
        lname = $("#lastname").val(),
        email = $("#email").val(),
        mnumber = $("#mobilenumber").val();

        if(fname == "" || fname === undefined){
            $("#error-msg").text("Please enter first name");
            return;
        }
        if(lname == "" || lname === undefined){
            $("#error-msg").text("Please enter last name");
            return;
        }
        if(email == "" || email === undefined){
            $("#error-msg").text("Please confirm email ");
            return;
        }
        if(mnumber != mnumber){
            $("#error-msg").text("Please enter mobile number");
            return;
        }

        updateUserDetails(fname, lname, email, mnumber, userType, userId).then(function(data){
            console.log('response after updating profile=', data);
            var response = data;
            
            if(response.success == false){
                $("#error-msg").text(response.message);
            }

            else if(response){
                localStorage.setItem('userInfo', JSON.stringify(response));

                $( ".myprofile-content" ).load( "partials/_myListings.html", function() {
                    showToaster('Profile updated successfully', 'success');
                });
            }
           
        });
    }

    

});

    
    

    
