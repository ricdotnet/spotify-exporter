const express = require('express');
const { api } = require('./api');
require('dotenv').config();

const app = express();
app.use(api);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Serving on port ${PORT}`));