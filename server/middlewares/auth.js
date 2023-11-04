const axios = require('axios');

async function auth (req, res, next) {
  if (!req.session.spotify) {
    return next();
  }

  try {
    await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${req.session.spotify.access_token}`,
      },
    });

    next();
  } catch (err) {
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

    req.session.spotify = credentials.data;

    next();
  }
}

module.exports = auth;