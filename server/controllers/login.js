const crypto = require('crypto');

function login(req, res) {
    const state = crypto.randomBytes(16).toString('hex');
    const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';

    const queryParams = new URLSearchParams();
    queryParams.append('response_type', 'code');
    queryParams.append('client_id', process.env.SPOTIFY_CLIENT_ID);
    queryParams.append('scope', scope);
    queryParams.append('redirect_uri', process.env.SPOTIFY_REDIRECT_URI);
    queryParams.append('state', state);

    res.redirect('https://accounts.spotify.com/authorize?' + queryParams);
}

module.exports = login;