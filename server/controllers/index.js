const home = require('./home');
const login = require('./login');
const callback = require('./callback');
const playlists = require('./playlists');
const { playlist, selectSong, exportPlaylist } = require('./playlist');

module.exports = { home, login, callback, playlists, playlist, selectSong, exportPlaylist };
