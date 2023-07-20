const { Router } = require('express');
const { home, login, callback } = require('../controllers');

const api = Router();

api.get('/', home);
api.get('/login', login);
api.get('/callback', callback);

module.exports = { api };
