const axios = require('axios');
const { constants, pagination } = require('../utils');
const SessionManager = require("../modules/session-manager");

async function playlist(req, res) {
  const { id } = req.params;
  const { page } = req.query;
  let params = `?limit=${constants.PAGE_SIZE}`;

  if (page) {
    params += `&offset=${constants.PAGE_SIZE * (page - 1)}`;
  }

  const sessionManager = SessionManager.getInstance();
  const session = JSON.parse(await sessionManager.get(req.cookieKey));

  try {
    const playlistDetails = await axios.get(`https://api.spotify.com/v1/playlists/${id}`, {
      headers: {
        'Authorization': `Bearer ${session.spotify.access_token}`,
      },
    });

    const playlist = await axios.get(`https://api.spotify.com/v1/playlists/${id}/tracks${params}`, {
      headers: {
        'Authorization': `Bearer ${session.spotify.access_token}`,
      },
    });

    if (typeof session.playlist === 'undefined') {
      session.playlist = {
        id: id,
        selected: [],
      }
    }

    const tracks = playlist.data.items.reduce((prev, track) => {
      prev.push({
        name: track.track.name,
        id: track.track.id,
        checked: session.playlist.selected.includes(track.track.id),
      });
      return prev;
    }, []);

    await sessionManager.update(req.cookieKey, session);

    return res.render('playlist.njk', {
      tracks,
      name: playlistDetails.data.name,
      id: id,
      ...pagination(+page || 1, playlist.data.total, 50),
      totalSelected: session.playlist.selected.length,
    });
  } catch (err) {
    console.error(err.toString());

    return res.redirect('/playlists');
  }
}

async function selectSong(req, res) {
  const { id } = req.params;
  const { action } = req.query;

  const sessionManager = SessionManager.getInstance();
  const session = JSON.parse(await sessionManager.get(req.cookieKey));

  switch (action) {
    case 'select':
      session.playlist.selected.push(id);
      break;
    case 'deselect':
      const index = session.playlist.selected.indexOf(id);
      if (index === -1) return;

      session.playlist.selected.splice(index, 1);
      break;
    default:
      // send an error
      break;
  }

  await sessionManager.update(req.cookieKey, session);

  return res.status(200).send({
    action: 'selected',
    id: req.params['id'],
    totalSelected: session.playlist.selected.length,
  });
}

async function exportPlaylist(req, res) {
  const { id } = req.params;

  console.log('exporting playlist:', id);

  return res.status(200).send({ playlist: id });
}

module.exports = { playlist, selectSong, exportPlaylist };
