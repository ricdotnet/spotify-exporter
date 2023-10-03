const axios = require('axios');
const { constants, pagination } = require('../utils');
const SessionManager = require("../modules/session-manager");

async function getPlaylist(req, res) {
  const { playlist } = req.params;
  const { page } = req.query;
  let params = `?limit=${constants.PAGE_SIZE}`;

  if (page) {
    params += `&offset=${constants.PAGE_SIZE * (page - 1)}`;
  }

  const sessionManager = SessionManager.getInstance();
  const session = JSON.parse(await sessionManager.get(req.cookieKey));

  try {
    const playlistDetails = await axios.get(`https://api.spotify.com/v1/playlists/${playlist}`, {
      headers: {
        'Authorization': `Bearer ${session.spotify.access_token}`,
      },
    });

    const playlistTracks = await axios.get(`https://api.spotify.com/v1/playlists/${playlist}/tracks${params}`, {
      headers: {
        'Authorization': `Bearer ${session.spotify.access_token}`,
      },
    });

    if (typeof session.playlist === 'undefined') {
      session.playlist = {
        id: playlist,
        selected: [],
      }
    }

    const tracks = playlistTracks.data.items.reduce((prev, track) => {
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
      id: playlist,
      ...pagination(+page || 1, playlistTracks.data.total, 50),
      totalSelected: session.playlist.selected.length,
    });
  } catch (err) {
    console.error(err.toString());

    return res.redirect('/playlists');
  }
}

async function selectSong(req, res) {
  const { song } = req.params;
  const { action } = req.query;

  const sessionManager = SessionManager.getInstance();
  const session = JSON.parse(await sessionManager.get(req.cookieKey));

  switch (action) {
    case 'select':
      session.playlist.selected.push(song);
      break;
    case 'deselect':
      const index = session.playlist.selected.indexOf(song);
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
    id: song,
    totalSelected: session.playlist.selected.length,
  });
}

async function exportPlaylist(req, res) {
  const { playlist } = req.params;

  console.log('exporting playlist:', playlist);

  return res.status(200).send({ playlist });
}

module.exports = { getPlaylist, selectSong, exportPlaylist };
