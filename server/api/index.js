const { Router } = require('express');
const { home, login, callback, playlist, playlists, selectSong, exportPlaylist } = require('../controllers');
const SessionManager = require('../modules/session-manager');

const api = Router();

api.get('/', home);
api.get('/login', login);
api.get('/callback', callback);
api.get('/playlists', playlists);
api.get('/playlist/:id', playlist);
api.post('/playlist/:id/select', selectSong);
api.get('/playlist/:id/export', exportPlaylist);

api.get('/logout', (req, res) => {
  const sessionManager = SessionManager.getInstance();
  sessionManager.remove(req.cookieKey);

  res.clearCookie('spotify-exporter');

  return res.redirect('/');
});

module.exports = { api };
