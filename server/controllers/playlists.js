const { constants, pagination, fmt, axiosInstance } = require('../utils');
const SessionManager = require('../modules/session-manager');

module.exports = async function playlists (req, res) {
  const { page } = req.query;
  let params = `?limit=${constants.PAGE_SIZE}`;

  if (page && page > 1) {
    params += `&offset=${constants.PAGE_SIZE * (page - 1)}`;
  }

  const sessionManager = SessionManager.getInstance();
  const session = JSON.parse(await sessionManager.get(req.cookieKey));

  try {
    const user = await axiosInstance('get', session.spotify.access_token, fmt('user'));
    const playlists = await axiosInstance('get', session.spotify.access_token, fmt('playlists', user.data.id, params));

    delete session.playlist;
    await sessionManager.update(req.cookieKey, session);

    return res.render('playlists.njk', {
      playlists: playlists.data.items,
      username: user.data.id,
      ...pagination(+page || 1, playlists.data.total, 25),
      currentPage: page || 1,
    });
  } catch (err) {
    console.error(err.toString());

    return res.redirect('/logout');
  }
}
