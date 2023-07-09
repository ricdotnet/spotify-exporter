const { Router } = require('express');
const axios = require('axios');
const crypto = require('crypto');

const api = Router();

api.get('/hello', (req, res) => {
    res.send({ hello: 'world' });
});

api.get('/login', (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');
    const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';

    const queryParams = new URLSearchParams();
    queryParams.append('response_type', 'code');
    queryParams.append('client_id', process.env.SPOTIFY_CLIENT_ID);
    queryParams.append('scope', scope);
    queryParams.append('redirect_uri', process.env.SPOTIFY_REDIRECT_URI);
    queryParams.append('state', state);

    res.redirect('https://accounts.spotify.com/authorize?' + queryParams);
});

api.get('/callback', async (req, res) => {
    const { code } = req.query;

    const credentials = await axios.post('https://accounts.spotify.com/api/token', {
            code,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            grant_type: 'authorization_code',
        }, {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')}`,
        },
    });

    const user = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${credentials.data.access_token}`,
        },
    });

    const playlists = await axios.get(`https://api.spotify.com/v1/users/${user.data.id}/playlists`, {
        headers: {
            'Authorization': `Bearer ${credentials.data.access_token}`,
        },
    });

    const playlist = await axios.get(`https://api.spotify.com/v1/playlists/some-id`, {
        headers: {
            'Authorization': `Bearer ${credentials.data.access_token}`,
        },
    });

    const tracks = playlist.data.tracks.items.reduce((items, item) => {
        items.push({
            name: item.track.name,
            artist: item.track.artists[0].name,
        });
        return items;
    }, []).map(t => Object.values(t));

    res
    .set({
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="tracks.csv"`,
    }).send([['name', 'artist'].join(','), ...tracks].join('\n'));
});

module.exports = { api };
