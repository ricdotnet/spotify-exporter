const { Router } = require('express');
const { home, login, callback, getPlaylist, playlists, selectSong, exportPlaylist } = require('../controllers');
const SessionManager = require('../modules/session-manager');

const api = Router();

api.get('/', home);
api.get('/login', login);
api.get('/callback', callback);
api.get('/playlists', playlists);
api.get('/playlist/:playlist', getPlaylist);
api.post('/playlist/:playlist/song/:song/select', selectSong);
api.get('/playlist/:playlist/export', exportPlaylist);

api.get('/logout', (req, res) => {
  const sessionManager = SessionManager.getInstance();
  sessionManager.remove(req.cookieKey);

  res.clearCookie('spotify-exporter');

  return res.redirect('/');
});

module.exports = { api };
