const { default: commonjs } = require("@rollup/plugin-commonjs");

module.exports = () => {
  const development = process.env.NODE_ENV === 'development';
  const outDir = development ? './dev/client/assets/app.js' : './dist/client/assets/app.js';

  return {
    input: './client/assets/js/index.js',
    output: {
      file: outDir,
      format: 'iife',
      sourcemap: true,
    },
    plugins: [commonjs()],
  };
};
