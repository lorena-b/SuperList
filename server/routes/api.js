var express = require('express');
var router = express.Router();
const axios = require('axios');
var injectCode = require('inject-html');
var http = require("http");

require('dotenv').config();

const process = async (req) => {
    var playlist_id = await req.query.purl.replace("spotify:playlist:", "");
    var playlist_id2 = await req.query.purl2.replace("spotify:playlist:", "");
    return [playlist_id, playlist_id2];
};

// GET http://localhost:8080/playlist
// GET request needs to receive playlist uris
router.get('/', async function (req, res) {
    process(req).then(ids => {
        axios
            .get(`http://localhost:5000/spotify/tracks?id=${ids[0]}&id2=${ids[1]}`)
            .then(data => {
                // console.log(`statusCode: ${res.statusCode}`);
                // console.log(res);
            })
            .catch(error => {
                console.error(error);
            });
    });
});

router.post('/callback', function (req, res) {
    console.log(req.query.url);
    res.sendFile('results.html', { root: './../client/' });
});

module.exports = router;