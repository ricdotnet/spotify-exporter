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
    queryParams.append('redirect_uri', 'http://localhost:4000/callback');
    queryParams.append('state', state);

    res.redirect('https://accounts.spotify.com/authorize?' + queryParams);
});

api.get('/callback', async (req, res) => {
    const { code } = req.query;

    const credentials = await axios.post('https://accounts.spotify.com/api/token', {
            code,
            redirect_uri: 'http://localhost:4000/callback',
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

    console.log(playlists.data);
    return res.send(playlists.data);
});

api.get('/user', (req, res) => {
    res.send({ foo: 'bar' });
});

module.exports = { api };
