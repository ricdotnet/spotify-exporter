const home = require('./home');
const login = require('./login');
const callback = require('./callback');
const playlists = require('./playlists');
const { getPlaylist, selectSong, exportPlaylist, exportSelectedSongs } = require('./playlist');

module.exports = { home, login, callback, playlists, getPlaylist, selectSong, exportPlaylist, exportSelectedSongs };
