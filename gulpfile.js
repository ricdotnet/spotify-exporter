const fs = require('fs');
const path = require('path');
const { task, series, src, dest, parallel } = require('gulp');
const nodemon = require('gulp-nodemon');
const { exec } = require('child_process');

function clean(env) {
  return (done) => {
    fs.rm(path.join(process.cwd(), env ? env : destination()), { recursive: true }, () => {
      done();
    });
  }
}

function server() {
  return src('./server/**/*.js')
    .pipe(dest(destination()));
}

function client() {
  return src(['./client/**', '!./client/assets/js/**'])
    .pipe(dest(path.join(destination(), 'client')));
}

function javascript() {
  const process = exec('rollup -c');

  process.stdout.on('data', (data) => console.log(data.toString()));
  process.stderr.on('data', (data) => console.log(data.toString()));
  process.on('exit', (code) => console.log('process finished with code', code));

  return process;
}

function destination() {
  return process.env.NODE_ENV === 'development' ? 'dev' : 'dist';
}

function runDev(done) {
  nodemon({
    script: path.join(destination(), 'index.js'),
    ext: 'js css njk',
    watch: ['./client', './server'],
    stdout: true,
    done: done,
  })
    .on('restart', series(clean(), server, parallel(client, javascript)));
}

task('dev', series(clean(), server, parallel(client, javascript), runDev));
task('default', series(clean(), server, parallel(client, javascript)));
task('clean', series(clean('dev'), clean('dist')));
