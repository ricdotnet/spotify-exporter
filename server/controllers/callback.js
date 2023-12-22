const axios = require('axios');
const SessionManager = require('../modules/session-manager');

async function callback (req, res) {
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

  const key = SessionManager.generateKey();
  res.cookie('spotify-exporter', key, { expires: new Date(Date.now() + (1000 * 60 * 60 * 24)), httpOnly: true });

  const sessionManager = SessionManager.getInstance();
  await sessionManager.create(key);

  // const session = sessionManager.get(key);
  // session.spotify = credentials.data;
  const spotify = credentials.data;
  await sessionManager.add(key, { spotify });

  return res.redirect('/playlists');
}

module.exports = callback;
