
var playlists = document.getElementById("playlist-id")
var ids = document.getElementsByClassName('form-control')

playlists.addEventListener('submit', function (e) {
    e.preventDefault();
    location.href = "http://localhost:8080/api?purl=" + ids[0].value + "&purl2=" + ids[1].value;
})