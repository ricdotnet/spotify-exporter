const axios = require('axios');

async function callback(req, res) {
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

  // const playlist = await axios.get(`https://api.spotify.com/v1/playlists/some-id`, {
  //     headers: {
  //         'Authorization': `Bearer ${credentials.data.access_token}`,
  //     },
  // });

  // const tracks = playlist.data.tracks.items.reduce((items, item) => {
  //     items.push({
  //         name: item.track.name,
  //         artist: item.track.artists[0].name,
  //     });
  //     return items;
  // }, []).map(t => Object.values(t));

  // res
  // .set({
  //   "Content-Type": "text/csv",
  //   "Content-Disposition": `attachment; filename="tracks.csv"`,
  // }).send([['name', 'artist'].join(','), ...tracks].join('\n'));

  return res.render('playlists.njk', {
    playlists: playlists.data.items,
  });
}

module.exports = callback;