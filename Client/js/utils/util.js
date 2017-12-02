function getUserInfo(){
    var retrievedObject = localStorage.getItem('userInfo');
    return  retrievedObject != null ? JSON.parse(retrievedObject) : null;
}

function logOutUser(){
    localStorage.clear();
    window.location.href = BASE_URL;
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