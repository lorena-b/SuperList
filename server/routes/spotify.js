var express = require('express');
var router = express.Router();
const axios = require('axios');


var SpotifyWebApi = require('spotify-web-api-node');
const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-public', 'playlist-modify-private'];

require('dotenv').config();

var spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_API_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URL,
});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/login', (req, res) => {
    var html = spotifyApi.createAuthorizeURL(scopes);
    console.log(html);
    res.redirect(`${html}&show_dialog=true`);
});

router.get('/callback', async (req, res) => {
    const { code } = req.query;
    console.log(code);
    try {
        var data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token } = data.body;
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        res.redirect('http://127.0.0.1:5500/client/index.html');
    } catch (err) {
        res.redirect('/#/error/invalid token');
    }
});

// router.get('/userinfo', async (req, res) => {
//     try {
//         var result = await spotifyApi.getMe();
//         console.log(result.body);
//         res.status(200).send(result.body);
//     } catch (err) {
//         res.status(400).send(err);
//     }
// });

const perform = async (data) => {
    var tracks = data.body.tracks.items;
    var new_list = [];
    // console.log(tracks.length);
    for (i = 0; i < tracks.length; i++) {
        // console.log(tracks[i].track.uri);
        new_list.push(tracks[i].track.uri);
    }
    return new_list;
};

router.get('/tracks', async (req, res) => {
    try {
        var id = req.query.id;
        var id2 = req.query.id2;
        console.log(`Got it ${id} and ${id2}`);
        spotifyApi.getPlaylist(id)
            .then(function (data) {
                // console.log('Some information about this playlist', data.body.tracks.items);
                perform(data).then(list => {
                    spotifyApi.getPlaylist(id2)
                        .then(function (data2) {
                            // console.log('Some information about this playlist', data.body.tracks.items);
                            perform(data2).then(list2 => {
                                var big_list = list.concat(list2);
                                big_list = big_list.sort(() => Math.random() - 0.5);
                                spotifyApi.createPlaylist('SuperList!', { 'description': 'New playlist', 'public': true })
                                    .then(function (playlist) {
                                        console.log('Created playlist!');
                                        // console.log(big_list);
                                        const superlist_id = playlist.body.id;
                                        const superlist_url = playlist.body.external_urls.spotify;
                                        var cut_list = [];
                                        for (i = 0; i < 50; i++) {
                                            cut_list.push(big_list[i]);
                                        }
                                        spotifyApi.addTracksToPlaylist(superlist_id, cut_list)
                                            .then(function (data3) {
                                                console.log('Added tracks to playlist!');
                                                console.log(`Here is your playlist ~ ${superlist_url}`);
                                                res.send(`<script>alert("Playlist available at: ${superlist_url}")</script>`)
                                                axios.post(`http://localhost:5000/api/callback?url=${superlist_url}`);

                                            }, function (err) {
                                                console.log('Something went wrong!', err);
                                            });
                                    }, function (err) {
                                        console.log('Something went wrong!', err);
                                    });
                            });
                        }, function (err) {
                            console.log('Something went wrong!', err);
                        });
                });

            }, function (err) {
                console.log('Something went wrong!', err);
            });


    } catch (err) {
        res.status(400).send(err);
    }

});


module.exports = router;