const path = require('path');
const express = require('express');
const nunjucks = require('nunjucks');
require('dotenv').config();

const { api } = require('./api');
const { loadFilters } = require('./utils');

const app = express();

const njkEnv = nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: true,
    express: app,
});

app.use('/assets', express.static(path.join(__dirname, 'views', 'assets')));
app.use(api);

const PORT = process.env.PORT || 4000;

(async () => {
    await loadFilters(njkEnv);
    
    app.listen(PORT, () => console.log(`Serving on port ${PORT}`));
})();