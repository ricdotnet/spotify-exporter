const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
const nunjucks = require('nunjucks');
require('dotenv').config();

const { api } = require('./api');
const { loadFilters } = require('./utils');
const auth = require('./middlewares/auth');

const app = express();

const njkEnv = nunjucks.configure(path.join(process.cwd(), 'client', 'views'), {
  autoescape: true,
  express: app,
});

app.use((req, _res, next) => {
  console.log(req.method, ':', req.url);
  next();
});

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SIGN_KEY, process.env.VERIFY_KEY],
  sameSite: true,
}));

// app.use(auth);

app.use((req, res, next) => {
  if (req.session.spotify) {
    res.locals.authed = true;
  }
  
  next();
});

app.use('/assets', express.static(path.join(process.cwd(), 'client', 'assets')));
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

(async () => {
  await loadFilters(njkEnv);

  app.listen(PORT, () => console.log(`Serving on port ${PORT}`));
})();
