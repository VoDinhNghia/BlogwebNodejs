
function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

function function_logout() {
    alert("You are logout");
}

function messFuction() {
    var user = document.getElementById('user').value;
    var pass = document.getElementById('pass').value;
    if (parseInt(pass).lenght < 6) {
        alert('Not wrong.');
        return false;
    }
}
function ForgetPass() {
    alert('Chưa thực hiện');
}
//chức năng xem người like
var modal = document.getElementById("myModal");
// Get the button that opens the modal
var btn = document.getElementById("nuber_like");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function () {
    modal.style.display = "block";
}
// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}