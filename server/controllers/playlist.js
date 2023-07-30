const axios = require('axios');
const { pagination } = require('../utils');

async function playlist(req, res) {
  const { id } = req.params;
  const { page } = req.query;
  let params = '?limit=50';
  
  if (page) {
    params += `&offset=${50 * (page - 1)}`;
  }

  try {
    const playlistDetails = await axios.get(`https://api.spotify.com/v1/playlists/${id}`, {
      headers: {
        'Authorization': `Bearer ${req.session.spotify.access_token}`,
      },
    });
    
    const playlist = await axios.get(`https://api.spotify.com/v1/playlists/${id}/tracks${params}`, {
      headers: {
        'Authorization': `Bearer ${req.session.spotify.access_token}`,
      },
    });
    
    const tracks = playlist.data.items.reduce((prev, track) => {
      prev.push({ name: track.track.name, id: track.track.id });
      return prev;
    }, []);

    return res.render('playlist.njk', {
      tracks,
      name: playlistDetails.data.name,
      id: id,
      ...pagination(+page || 1, playlist.data.total, 50),
    });
  } catch (err) {
    return res.redirect('/playlists');
  }
}

module.exports = playlist;