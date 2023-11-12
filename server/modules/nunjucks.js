const nunjucks = require('nunjucks');
const path = require('path');
const { filters } = require('../utils/filters');

exports.Nunjucks = class Nunjucks {

  constructor (app) {
    this.njkEnv = nunjucks.configure(path.join(process.cwd(), 'client', 'views'), {
      autoescape: true,
      express: app,
    });
  }

  loadFilters () {
    console.time('Filters loaded in');
    Object.keys(filters).forEach((key) => {
      console.debug('Loading nunjucks filter:', key);
      this.njkEnv.addFilter(key, filters[key]);
      console.debug('Loaded nunjucks filter:', key);
    });
    console.timeEnd('Filters loaded in');
  }

}

