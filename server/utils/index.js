const loadFilters = require('./filters').loadFilters;
const constants = require('./constants');

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

module.exports = { loadFilters, pagination, constants };
