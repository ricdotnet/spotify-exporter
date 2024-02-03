const path = require('path');
const express = require('express');
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';

require('dotenv').config({ path: envFile });
const { api } = require('./api');
const auth = require('./middlewares/auth');
const { Nunjucks } = require('./modules/nunjucks');
const SessionManager = require('./modules/session-manager');
const { Logger } = require('@ricdotnet/logger/dist');
const { Constants: Colors } = require('@ricdotnet/logger/dist/src/Constants');

const app = express();
const development = process.env.NODE_ENV === 'development';

new Nunjucks(app).loadFilters();
new SessionManager({ storage: 'file' });
new Logger({ directory: 'logs', logToFile: true, });

// app.use(auth);

app.use(async (req, res, next) => {
  const cookie = req.headers.cookie;
  
  req.on('end', () => {
    console.log(req.session);
  });

  if (cookie) {
    const sessionManager = SessionManager.getInstance();

    const [_, cookieKey] = cookie.split('=');
    req.session = await sessionManager.get(cookieKey);
    req.cookieKey = cookieKey;

    res.locals.authed = true;

    res.cookie('spotify-exporter', cookieKey, {
      expires: new Date(Date.now() + (1000 * 60 * 60 * 24)),
      httpOnly: true,
    });
  }

  next();
});

app.use(async (req, _res, next) => {
  let logMessage = `${req.method}: ${req.url}`;
  if (req.headers.cookie) {
    logMessage += `\n${Colors.TEXT_GREEN}[COOKIE]:${Colors.RESET} ${req.headers.cookie}`;
  }
  Logger.get().info(logMessage);
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
    res.status(500).send({ code: 500, message: 'something went wrong' });
  };

  process.once('UncaughtExceptionListener', listener);

  res.on('finish', () => {
    process.removeListener('UncaughtExceptionListener', listener);
  });

  next();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  Logger.get().info(`Serving on: ${process.env.BASE_DOMAIN}`)
});
