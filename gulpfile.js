const fs = require('fs');
const exec = require('child_process').exec;
const path = require('path');
const { task, series, src, dest } = require('gulp');

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

task('default', series(clean, server, client));