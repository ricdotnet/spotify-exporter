const urls = {
  user: 'https://api.spotify.com/v1/me',
  playlists: 'https://api.spotify.com/v1/users/{}/playlists{}',
  playlist: 'https://api.spotify.com/v1/playlists/{}',
  tracks: 'https://api.spotify.com/v1/playlists/{}/tracks{}',
}

function fmt(key, ...strings) {
  let spotifyUrl = urls[key];
  strings.forEach(str => spotifyUrl = spotifyUrl.replace('{}', str));
  return spotifyUrl;
}

module.exports = fmt;