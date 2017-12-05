$(document).ready(function() {

    var userInfo = getUserInfo();

    if(userInfo){
        loadAgentListings();
        document.getElementById('profile-name').innerHTML = userInfo.FirstName+" "+userInfo.LastName;
    }
    else if(userInfo == undefined){
        window.location.href = BASE_URL;
    }


    var userType = userInfo.UserTypeId,
    userId = userInfo.UserId;

    if(userType == 1){
        $('.add-new-listing').css("display", "none");
    }

    function loadAgentListings(){
        getListings('', '', '', '', '', '').then(function(data){
            $('.myprofile-content').load("partials/_listingCard.html", function(){
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
                        if(userType == 2){
                            template.find(".actionBtns")[0].innerHTML = "<span id=editListing-"+i+" class='label label-primary edit-listing' data='" +response[i].Id+ "'>Edit</span>&nbsp;&nbsp;<span id=deleteListing-"+i+" class='label label-danger delete-listing' data='" +response[i].Id+ "'>Delete</span>";
                        }
                        
                        // after adding all details appending the template
                        template.appendTo(".appendHere");
                    }

                    if(userType == 2){

                        var deleteListingLinks = document.getElementsByClassName("delete-listing");
                        var editListingLinks = document.getElementsByClassName("edit-listing");

                        for(var i=0;i < deleteListingLinks.length;i++) {
                            deleteListingLinks[i].addEventListener("click", function() {
                                var element = document.getElementById(this.id);
                                var idx = element.getAttribute("data");
                                deleteListing(idx);
                            });
                        };

                        for(var i=0;i < editListingLinks.length;i++) {
                            editListingLinks[i].addEventListener("click", function() {
                                var element = document.getElementById(this.id);
                                var idx = element.getAttribute("data");
                                editListing(idx);
                            });
                        };

                    }

                    var listingDetailsLinks = document.getElementsByClassName("view-listing-details");                    
                    for(var i=0;i < listingDetailsLinks.length;i++) {
                        listingDetailsLinks[i].addEventListener("click", function() {
                            var element = document.getElementById(this.id);
                            var idx = element.getAttribute("data");
                            listingDetails(idx);
                        });
                    };
                    apiCalled = false;
                }

            });
        });
    }

    $('.myprofile-listings').click(function(){

        loadAgentListings();
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
            var createListingBtn = document.getElementsByClassName("listing-new-btn");
                $('.listing-update-btn').css("display", "none");
                for(var i=0;i < createListingBtn.length;i++) {
                    createListingBtn[i].addEventListener("click", function() {
                       
                        createListing();
                    });
                };
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
            else if(response.success){
                showToaster('Password changed successfully', 'success');
                loadAgentListings();
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
            else if(response.success){
                localStorage.setItem('userInfo', JSON.stringify(response));
                showToaster('Profile updated successfully', 'success');
                loadAgentListings();
            }
            
        });
    }

    function deleteListing(id){
        console.log(id);
        var deleteConfirm = confirm("Are you sure Do you want to delete ?");
        if (deleteConfirm) {
            console.log('deleted');
            deleteAdListing(id).then(function(data){
                if(response.success == false){
                    
                }
                else if(response){
                    showToaster('Profile updated successfully', 'success');
                }
            })
        }
        else {
            console.log('not deleted');
        }
    };

    function listingDetails(val){
         var userInfo = getUserInfo();
        console.log(val);
        getListingDetails(val).then(function(response){
            console.log(response);
            if(document.getElementById("search-content"))
            document.getElementById("search-content").style.display = "none";
            // $("#search-content").style.display = "none";
            $('.myprofile-content').load("partials/_listingDetails.html", function(){
                
                document.getElementsByClassName('listing-details-banner')[0].style.display = 'none';
                $("#listing-heading").html(response.data.Title);

                //document.getElementById('listing-heading').innerHTML = response.data.Title;
                $('#listing-description').html(response.data.AdDescription);
                $('#listing-beds').html(response.data.BedRooms);
                $('#listing-baths').html(response.data.BathRooms);
                $('#listing-area').html(response.data.SquareFeet);
                $('#listing-parking').html(response.data.Parking);
                $('#listing-price').html(response.data.Price);
                $('#listing-kitchen').html(response.data.Kitchen);
                $('#listing-type').html(response.data.AdType.AdTypeName);
                $('#listing-address-street').html(response.data.Address);
                $('#listing-address-city').html(response.data.City);
                $('#listing-address-state').html(response.data.State);
                $('#listing-address-zip').html(response.data.Zip);
                document.getElementById('listing-primary-image').src=response.data.AdMedia[0].ImagePath;
                $('#agent-title').innerHTML=response.data.AgentName;
                document.getElementById('agent-title').setAttribute("data", response.data.AgentId);
                document.getElementById('agent-picture').setAttribute("src", "images/te.jpg");
                
                // document.getElementById('listing-images').
                var carousel = document.getElementsByClassName('listing-carousel-images');
                console.log(carousel[0]);
                    for(var i=1; i< response.data.AdMedia.length; i++){
                    var newCarouselImage = document.createElement('div');
                    newCarouselImage.setAttribute("class", "item");
                    newCarouselImage.innerHTML = "<img src="+response.data.AdMedia[i].ImagePath+" alt='' style='width:100%;'>";
                    console.log(newCarouselImage);
                    
                    carousel[0].appendChild(newCarouselImage);
                };

                if(userInfo){
                     
                    if(userInfo.UserTypeId == 2){
                        $('.display-agent-info').hide();   
                        $('.mark-as-favourite').hide(); 
                        $('.login-message').hide();                    
                    }else{
                        $('.login-message').hide();
                        $('.mark-as-favourite').show();   
                    }
                } else{
                   
                    $('.display-agent-info').hide();
                    $('.login-message').show(); 
                    $('.mark-as-favourite').hide();                      
                }
            });
        })

    };

    function editListing(id){
        console.log(id);
       
        getListingDetails(id).then(function(response){
            console.log('details of listing =',response);
                
            $( ".myprofile-content" ).load( "partials/_addNewListing.html", function() {
                $('#listing-title').val(response.data.Title);
                $('#listing-description').val(response.data.AdDescription);
                $('#listing-noOfBeds').val(response.data.BedRooms);
                $('#listing-noOfBaths').val(response.data.BathRooms);
                $('#listing-kitchen').val(response.data.Kitchen);
                $('#listing-type').val(response.data.AdType.AdTypeName);
                $('#listing-area').val(response.data.SquareFeet);
                $('#listing-price').val(response.data.Price);
                $('#listing-door').val(response.data.Address);
                $('#listing-city').val(response.data.City);
                $('#listing-state').val(response.data.State);
                $('#listing-country').val(response.data.Country);
                $('#listing-zip').val(response.data.Zip);
                $('.listing-new-btn').css("display", "none");
                $('.listing-update-btn').attr("data", response.data.ID);
                $('.listing-update-btn').attr("id", 'listing-update-'+response.data.ID);
                var updateListingBtn = document.getElementsByClassName("listing-update-btn");

                for(var i=0;i < updateListingBtn.length;i++) {
                    updateListingBtn[i].addEventListener("click", function() {
                        var element = document.getElementById(this.id);
                        var idx = element.getAttribute("data");
                        updateListing(idx);
                    });
                };
            });
          
        })
    };

    function createListing(){
       
        var data = {};
        data.Titel = $('#listing-title').val();
        data.AdDescription = $('#listing-description').val();
        data.BedRooms = $('#listing-noOfBeds').val();
        data.BathRooms = $('#listing-noOfBaths').val();
        data.Kitchen = $('#listing-kitchen').val();
        data.AdTypeName = $('#listing-type').val();
        data.SquareFeet = $('#listing-area').val();
        data.Price = $('#listing-price').val();
        data.Address = $('#listing-door').val();
        data.City = $('#listing-city').val();
        data.State = $('#listing-state').val();
        data.Country = $('#listing-country').val();
        data.Zip = $('#listing-zip').val();
        data.Images = listingFiles;

        console.log( 'after creating =',data);
        saveLisitng(data).then(function(data){
           console.log('response after creating listing=', data);
            var response = data;
            if(response.success == false){
                $("#error-msg").text(response.message);
            }
            else if(response.success){
                showToaster('Listing created successfully', 'success');
                loadAgentListings();
            } 
        })
    }
        

    function updateListing(listingId){
        console.log('listing id in updating =', listingId);
        var data = {};
        data.Titel = $('#listing-title').val();
        data.AdDescription = $('#listing-description').val();
        data.BedRooms = $('#listing-noOfBeds').val();
        data.BathRooms = $('#listing-noOfBaths').val();
        data.Kitchen = $('#listing-kitchen').val();
        data.AdTypeName = $('#listing-type').val();
        data.SquareFeet = $('#listing-area').val();
        data.Price = $('#listing-price').val();
        data.Address = $('#listing-door').val();
        data.City = $('#listing-city').val();
        data.State = $('#listing-state').val();
        data.Country = $('#listing-country').val();
        data.Zip = $('#listing-zip').val();


        console.log( 'after editing =',data);
        saveEditedLisitng(data).then(function(data){
           console.log('response after updating listing=', data);
            var response = data;
            if(response.success == false){
                $("#error-msg").text(response.message);
            }
            else if(response){
                loadAgentListings();
                showToaster('Listing updated successfully', 'success');
            } 
        })
    }

});

var listingFiles = [];
function checkUploadedFile(){

        var x = document.getElementById("listing-fileUpload");
        var txt = "";
        if ('files' in x) {
            console.log(x.files);
            if (x.files.length == 0) {
                txt = "Select one or more files.";
            } else {
                for (var i = 0; i < x.files.length; i++) {
                    listingFiles.push(x.files[i]);
                    txt += "<br><strong>" + (i+1) + ". file</strong><br>";
                    var file = x.files[i];
                    if ('name' in file) {
                        txt += "name: " + file.name + "<br>";
                    }
                    if ('size' in file) {
                        txt += "size: " + file.size + " bytes <br>";
                    }
                }
            }
        } 
        document.getElementById("listing-images").innerHTML = txt;

    }

