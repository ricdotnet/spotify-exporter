const fs = require('fs');
const path = require('path');
const { task, series, src, dest } = require('gulp');
const nodemon = require('gulp-nodemon');

function clean(done) {
    fs.rm(path.join(process.cwd(), destination()), { recursive: true }, () => {
        done();
    });
}

function server() {
    return src('./server/**/*.js')
    .pipe(dest(destination()));
}

function client() {
    return src('./client/**')
    .pipe(dest(path.join(destination(), 'client')));
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
    .on('restart', series(clean, server, client));
}

task('dev', series(clean, server, client, runDev));
task('default', series(clean, server, client));