const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
require('dotenv').config();

const { api } = require('./api');
const auth = require('./middlewares/auth');
const { Nunjucks } = require('./modules/nunjucks');
const Sessions = require('./modules/sessions');

const app = express();
const development = process.env.NODE_ENV === 'development';

new Nunjucks(app).loadFilters();
app.sessions = new Sessions();

app.use((req, _res, next) => {
  console.log(req.method, ':', req.url);
  next();
});

// app.use(cookieSession({
//   name: 'spotify-exporter',
//   keys: [process.env.SIGN_KEY, process.env.VERIFY_KEY],
//   sameSite: true,
// }));

// app.use(auth);

app.use((req, res, next) => {
  const cookie = req.headers.cookie;

  const key = app.sessions.generateKey();

  if (cookie) {
    const [_, cookieKey] = cookie.split('=');
    let session = app.sessions.get(cookieKey);

    if (!session) {
      app.sessions.add(cookieKey);
      session = app.sessions.get(cookieKey);
    }

    req.session = session;
    req.cookieKey = cookieKey;
    req.sessionClear = app.sessions;

    res.cookie('spotify-exporter', cookieKey, {
      expires: new Date(Date.now() + (1000 * 60 * 60 * 24)),
      httpOnly: true,
    });
  } else {
    app.sessions.add(key);
    const session = app.sessions.get(key);

    req.session = session;

    console.log(req.session);
    res.cookie('spotify-exporter', key, {
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

app.use((_req, res, next) => {
  const listener = (error) => {
    console.log('---------- UNHANDLED PROMISE REJECTION -----------');
    console.log(error);
    res.status(500).send({ code: 500, message: 'something went wrong' });
  };

  process.once('UncaughtExceptionListener', listener);

  res.on('finish', () => {
    process.removeListener('UncaughtExceptionListener', listener);
  });

  next();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Serving on port ${PORT}`));
