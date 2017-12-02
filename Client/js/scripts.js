var BASE_URL = '/';
$(window).load(function() {
    var apiCalled = false;

//    if(location.pathname == '/index.html'){
//        window.location.href = location.origin+'/'
//    }
//    if(location.pathname == ''){
//        window.location.href = location.origin+'/'
//    }
    $( "#header-content" ).load( "partials/_header.html", function() {
        document.getElementById('homeLink').innerHTML = "<a href="+BASE_URL+"><i class='glyphicon glyphicon-home'> </i>Home</a>";
        document.getElementById('aboutLink').innerHTML = "<a href="+BASE_URL+"about><i class='glyphicon glyphicon-info-sign'> </i>About Us</a>";
        document.getElementById('contactLink').innerHTML = "<a href="+BASE_URL+"contact><i class='glyphicon glyphicon-earphone'> </i>Contact</a>";
        window.scrollTo(0, 0);
        setNavLinks();
    });

    $( "#footer-content" ).load( "partials/_footer.html", function() {

    });

    $(window).on('hashchange', function(){
        newLocation = window.location.href;

        if(location.hash){

            hash = location.hash.substring(2);

            // var params = hash.split('&');

            switch(true){
                case(hash.indexOf('search') == '0'):

                    if(!apiCalled){
                        searchListings('');
                    }
                    break;
                case(hash.indexOf('listing_id') == '0'):

                    if(!apiCalled){
                        console.log('details api is called');
                        listingDetails(hash.split('=')[1]);
                    }

                    break;
                default:
                    console.log('home');
                    $("#body-content").load("partials/_homeBody.html", function(){
                    });
            };
        }else if( location.pathname == BASE_URL ){
            loadHomePage();

        }
    }).trigger('hashchange');

    function loadHomePage(){
        $( "#header-content" ).load( "partials/_header.html", function() {
            document.getElementById('homeLink').innerHTML = "<a href="+BASE_URL+"><i class='glyphicon glyphicon-home'> </i>Home</a>";
        document.getElementById('aboutLink').innerHTML = "<a href="+BASE_URL+"about><i class='glyphicon glyphicon-info-sign'> </i>About Us</a>";
        document.getElementById('contactLink').innerHTML = "<a href="+BASE_URL+"contact><i class='glyphicon glyphicon-earphone'> </i>Contact</a>";
        window.scrollTo(0, 0);
            setNavLinks();
        });

        $("#search-content").load("partials/_search.html", function(){
            $('.search_button').click(function(){
                searchListings();
            });
        });

        $("#body-content").load("partials/_homeBody.html", function(){
            searchListings('');
        })

        $( "#footer-content" ).load( "partials/_footer.html", function() {

        });

    }

    function searchListings(){
        document.getElementById("search-content").style.display = "block";

        var searchVal = $("#txtSearch").val();
        var accomodationType = $("#ddType option:selected").val();
        var bedrooms = $("#ddBedroom option:selected").val();
        var sqft = $("#txtSqft").val();
        var adType = $("#ddAdType option:selected").val();
        var pageIndex = 0;
        if(localStorage.getItem("pageIndex") != null){
            pageIndex = parseInt(localStorage.getItem("pageIndex"));
        }

        getListings(searchVal, accomodationType, bedrooms, sqft, adType, pageIndex).then(function(data){
            $('#body-content').load("partials/_listings.html", function(){
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
                            listingDetails(idx);
                        });
                    };
                    apiCalled = false;
                }

            });
        });

    };
   
    function listingDetails(val){
         var userInfo = getUserInfo();
        console.log(val);
        apiCalled = true;
        var url = window.location.href;
        window.location.hash = '?listing_id='+val;

        getListingDetails(val).then(function(response){
            console.log(response);
            if(document.getElementById("search-content"))
            document.getElementById("search-content").style.display = "none";
            // $("#search-content").style.display = "none";
            $('#body-content').load("partials/_single.html", function(){
               
                document.getElementById('listing-heading').innerHTML = response.data.Title;
                document.getElementById('listing-description').innerHTML = response.data.AdDescription;
                document.getElementById('listing-beds').innerHTML = response.data.BedRooms;
                document.getElementById('listing-baths').innerHTML = response.data.BathRooms;
                document.getElementById('listing-area').innerHTML = response.data.SquareFeet;
                document.getElementById('listing-parking').innerHTML = response.data.Parking;
                document.getElementById('listing-price').innerHTML = response.data.Price;
                document.getElementById('listing-kitchen').innerHTML = response.data.Kitchen;
                document.getElementById('listing-type').innerHTML = response.data.AdType.AdTypeName;
                document.getElementById('listing-address-street').innerHTML = response.data.Address;
                document.getElementById('listing-address-city').innerHTML = response.data.City;
                document.getElementById('listing-address-state').innerHTML = response.data.State;
                document.getElementById('listing-address-zip').innerHTML = response.data.Zip;
                document.getElementById('listing-primary-image').src=response.data.AdMedia[0].ImagePath;
                document.getElementById('agent-title').innerHTML=response.data.AgentName;
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
                        $('.hide-agent-info').hide();
                        $('.display-agent-info').hide();                        
                    }
                } else{
                    $('.hide-agent-info').show();
                    $('.display-agent-info').hide();                    
                }
            });
        })

    };

});