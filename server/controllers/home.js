function home(req, res) {
  return res.render('index.njk', {
    name: 'Ricardo',
  });
}

module.exports = home;