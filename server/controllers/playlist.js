const axios = require('axios');
const { constants, pagination } = require('../utils');

async function playlist(req, res) {
  const { id } = req.params;
  const { page } = req.query;
  let params = `?limit=${constants.PAGE_SIZE}`;

  if (page) {
    params += `&offset=${constants.PAGE_SIZE * (page - 1)}`;
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

    if (typeof req.session.playlist === 'undefined') {
      req.session.playlist = {
        id: id,
        selected: [],
      }
    }

    const tracks = playlist.data.items.reduce((prev, track) => {
      prev.push({
        name: track.track.name,
        id: track.track.id,
        checked: req.session.playlist.selected.includes(track.track.id),
      });
      return prev;
    }, []);

    console.log(req.session.spotify);

    return res.render('playlist.njk', {
      tracks,
      name: playlistDetails.data.name,
      id: id,
      ...pagination(+page || 1, playlist.data.total, 50),
      totalSelected: req.session.playlist.selected.length,
    });
  } catch (err) {
    console.error(err.toString());

    return res.redirect('/playlists');
  }
}

async function selectSong(req, res) {
  const { id } = req.params;
  const { action } = req.query;

  switch (action) {
    case 'select':
      req.session.playlist.selected.push(id);
      break;
    case 'deselect':
      const index = req.session.playlist.selected.indexOf(id);
      if (index === -1) return;

      req.session.playlist.selected.splice(index, 1);
    default:
      // send an error
      break;
  }

  return res.status(200).send({
    action: 'selected',
    id: req.params['id'],
    totalSelected: req.session.playlist.selected.length,
  });
}

async function exportPlaylist(req, res) {
  const { id } = req.params;

  console.log('exporting playlist:', id);

  return res.status(200).send({ playlist: id });
}

module.exports = { playlist, selectSong, exportPlaylist };
