const axios = require('axios');
const { pagination } = require('../utils');

module.exports = async function playlists(req, res) {
  const { page } = req.query;
  let params = '?limit=25';
  
  if (page && page > 1) {
    params += `&offset=${25 * (page - 1)}`;
  }
  
  try {
    const user = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${req.session.spotify.access_token}`,
      },
    });

    const playlists = await axios.get(`https://api.spotify.com/v1/users/${user.data.id}/playlists${params}`, {
      headers: {
        'Authorization': `Bearer ${req.session.spotify.access_token}`,
      },
    });
     
    return res.render('playlists.njk', {
      playlists: playlists.data.items,
      username: user.data.id,
      ...pagination(+page || 1, playlists.data.total, 25),
    });
  } catch (err) {
    return res.redirect('/logout');
  }
}
