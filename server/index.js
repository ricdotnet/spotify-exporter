const path = require('path');
const express = require('express');
require('dotenv').config();

const {api} = require('./api');
const auth = require('./middlewares/auth');
const {Nunjucks} = require('./modules/nunjucks');
const SessionManager = require('./modules/session-manager');

const app = express();
const development = process.env.NODE_ENV === 'development';

new Nunjucks(app).loadFilters();
new SessionManager({storage: 'file'});

app.use((req, _res, next) => {
  console.log(req.method, ':', req.url);
  next();
});

// app.use(auth);

app.use((req, res, next) => {
  const cookie = req.headers.cookie;

  if (cookie) {
    const sessionManager = SessionManager.getInstance();

    const [_, cookieKey] = cookie.split('=');
    req.session = sessionManager.get(cookieKey);
    req.cookieKey = cookieKey;

    res.locals.authed = true;

    res.cookie('spotify-exporter', cookieKey, {
      expires: new Date(Date.now() + (1000 * 60 * 60 * 24)),
      httpOnly: true,
    });
  }

  next();
});

const assetsDir = development
  ? path.join(process.cwd(), 'dev', 'client', 'assets')
  : path.join(process.cwd(), 'client', 'assets');

app.use('/assets', express.static(assetsDir));
app.use(api);

// TODO: refactor
app.use((_req, res, next) => {
  const listener = (error) => {
    console.log('---------- UNHANDLED PROMISE REJECTION -----------');
    console.log(error);
    res.status(500).send({code: 500, message: 'something went wrong'});
  };

  process.once('UncaughtExceptionListener', listener);

  res.on('finish', () => {
    process.removeListener('UncaughtExceptionListener', listener);
  });

  next();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Serving on port ${PORT}`));
