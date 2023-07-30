const { Router } = require('express');
const { home, login, callback, playlist, playlists } = require('../controllers');

const api = Router();

api.get('/', home);
api.get('/login', login);
api.get('/callback', callback);
api.get('/playlists', playlists);
api.get('/playlist/:id', playlist);

api.get('/logout', (req, res) => {
  req.session = null;
  
  return res.redirect('/');
});

module.exports = { api };
