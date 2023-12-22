const urls = {
  user: '/me',
  playlists: '/users/{}/playlists{}',
  playlist: '/playlists/{}',
  tracks: '/playlists/{}/tracks{}',
  track: '/tracks/{}'
}

function fmt(key, ...strings) {
  let spotifyUrl = urls[key];
  strings.forEach(str => spotifyUrl = spotifyUrl.replace('{}', str));
  return spotifyUrl;
}

module.exports = fmt;