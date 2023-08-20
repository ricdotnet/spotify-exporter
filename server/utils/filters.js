const filters = {
  console: (value) => {
    if (typeof value === 'object') { 
      return JSON.stringify(value);
    }
    
    return value;
  },
};

module.exports = { filters };
