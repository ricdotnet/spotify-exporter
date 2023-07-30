function home(req, res) {
  
  if (req.session.spotify) {
    return res.redirect('/playlists');
  }
  
  return res.render('home.njk');
}

module.exports = home;