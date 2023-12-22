const loadFilters = require('./filters').loadFilters;
const constants = require('./constants');
const fmt = require('./spotify-api');
const axios = require('axios');

/**
 *
 * @param {number} cp The current page
 * @param {number} t The total amount of results before paginating
 * @param {number} pp The amount per page
 * @returns
 */
function pagination (cp, t, pp) {
  return {
    next: (t / pp < cp) ? null : !cp || cp <= 1 ? 2 : cp + 1,
    prev: cp >= 2 ? cp - 1 : null,
  }
}

/**
 *
 * @param ms The number of ms to sleep. Defaults to 1000ms or 1s
 * @returns {Promise<void>}
 */
async function sleep(ms = 1000) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function axiosInstance(method, token, ...params) {
  const client = axios.create({
    baseURL: 'https://api.spotify.com/v1',
    method: 'GET',
    timeout: 5000,
  });

  client.interceptors.request.use((context) => {
    if (token) {
      context.headers.set('Authorization', `Bearer ${token}`);
    }

    return context;
  });

  return client[method].apply(this, params);
}

/**
 *
 * @param {string[]} header
 * @param {object[]} content
 *
 * @return {string}
 */
function buildCsv(header, content) {
  const csv = [];
  csv.push(header.join(','));
  content.forEach((contentObj) => {
    csv.push(Object.values(contentObj).join(','));
  });
  return csv.join('\n');
}

module.exports = { loadFilters, pagination, constants, fmt, sleep, axiosInstance, buildCsv };
