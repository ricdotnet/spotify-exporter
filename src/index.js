const path = require('path');
const express = require('express');
const nunjucks = require('nunjucks');
require('dotenv').config();

const { api } = require('./api');

const app = express();

nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: true,
    express: app,
});

app.use('/assets', express.static(path.join(__dirname, 'views', 'assets')));
app.use(api);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Serving on port ${PORT}`));