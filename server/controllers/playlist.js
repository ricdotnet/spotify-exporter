const axios = require('axios');
const { constants, pagination, fmt } = require('../utils');
const SessionManager = require("../modules/session-manager");

async function getPlaylist (req, res) {
  const { playlist } = req.params;
  const { page } = req.query;
  let params = `?limit=${constants.PAGE_SIZE}`;

  if (page) {
    params += `&offset=${constants.PAGE_SIZE * (page - 1)}`;
  }

  const sessionManager = SessionManager.getInstance();
  const session = JSON.parse(await sessionManager.get(req.cookieKey));

  try {
    const endpoints = [];
    endpoints.push(
      axios.get(fmt('playlist', playlist), {
        headers: {
          'Authorization': `Bearer ${session.spotify.access_token}`,
        },
      })
    );

    endpoints.push(
      axios.get(fmt('tracks', playlist, params), {
        headers: {
          'Authorization': `Bearer ${session.spotify.access_token}`,
        },
      })
    );

    const [playlistDetails, playlistTracks] = await Promise.all(endpoints);

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
      ...pagination(+page || 1, playlistTracks.data.total, constants.PAGE_SIZE),
      totalSelected: session.playlist.selected.length,
      playlistTotal: playlistTracks.data.total,
      currentPage: page || 1,
      totalPages: Math.ceil(playlistTracks.data.total / constants.PAGE_SIZE),
    });
  } catch (err) {
    console.error(err.toString());

    return res.redirect('/playlists');
  }
}

async function selectSong (req, res) {
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

async function exportPlaylist (req, res) {
  const { playlist } = req.params;

  console.log('exporting playlist:', playlist);

  return res.status(200).send({ playlist });
}

module.exports = { getPlaylist, selectSong, exportPlaylist };
