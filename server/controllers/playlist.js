const { constants, pagination, fmt, sleep, axiosInstance, buildCsv } = require('../utils');
const SessionManager = require("../modules/session-manager");
const { errors } = require('../utils/constants');

async function getPlaylist(req, res) {
  const { playlist } = req.params;
  const { page, error } = req.query;
  let params = `?limit=${constants.PAGE_SIZE}`;

  if (page) {
    params += `&offset=${constants.PAGE_SIZE * (page - 1)}`;
  }

  const sessionManager = SessionManager.getInstance();
  const session = JSON.parse(await sessionManager.get(req.cookieKey));
  
  if (error === errors.NONE_SELECTED) {
    console.log('show an error');
  }

  try {
    const endpoints = [];
    endpoints.push(
      axiosInstance('get', session.spotify.access_token, fmt('playlist', playlist)),
      axiosInstance('get', session.spotify.access_token, fmt('tracks', playlist, params)),
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
  const sessionManager = SessionManager.getInstance();
  const session = JSON.parse(await sessionManager.get(req.cookieKey));

  try {
    const response = await recursiveFetch(playlist, session.spotify.access_token, { tracks: [] });
    response.count = response.tracks.length;

    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
  }
}

async function exportSelectedSongs(req, res) {
  const sessionManager = SessionManager.getInstance();
  const session = JSON.parse(await sessionManager.get(req.cookieKey));
  const { id: playlistId } = session.playlist;

  const trackRequests = [];
  session.playlist.selected.forEach((songId) => {
    trackRequests.push(axiosInstance('get', session.spotify.access_token, fmt('track', songId)));
  });
  const response = await Promise.all(trackRequests);
  const tracks = response.reduce((prev, curr) => {
    const artists = curr.data.artists.reduce((prev, curr) => {
      prev.push(curr.name.replace(',', ' '));
      return prev;
    }, []).join('; ')
    const track = {
      name: curr.data.name.replace(',', ' '),
      album: curr.data.album.name.replace(',', ' '),
      artists,
      cover: curr.data.album.images[0].url,
    };
    prev.push(track);
    return prev;
  }, []);

  const header = ['name', 'album', 'artists', 'cover'];
  
  if (!tracks.length) {
    
    return res.redirect(`/playlist/${playlistId}`);
  }

  res.attachment(`${playlistId}.csv`).send(buildCsv(header, tracks));
}

async function recursiveFetch(playlist, token, response, next) {
  const _next = response.tracks.length && next
    ? next
    : fmt('tracks', playlist, '?offset=0');

  if (!next && response.tracks.length) return response;
  const tracks = await axiosInstance('get', token, _next);
  response.tracks.push(...tracks.data.items);
  await sleep();
  return await recursiveFetch(playlist, token, response, tracks.data.next);
}

module.exports = { getPlaylist, selectSong, exportPlaylist, exportSelectedSongs };
