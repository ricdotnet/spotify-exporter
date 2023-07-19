const filters = {

};

function loadFilters(nunjucks) {
    return new Promise((resolve) => {
        const filtersArray = Object.keys(filters);

        if (filtersArray.length === 0) resolve();

        filtersArray.forEach((key, i) => {
            nunjucks.addFilter(key, filters[key]);

            if (i === Object.keys(filters).length - 1) resolve();
        });
    });
}

module.exports = { loadFilters };