// https://github.com/gulpjs/gulp/tree/master/docs
// https://github.com/gulpjs/gulp/blob/master/docs/API.md
var gulp = require('gulp');

// https://www.npmjs.com/package/gulp-webpack/
var webpack = require("gulp-webpack");

// https://github.com/terinjokes/gulp-uglify
var uglify = require('gulp-uglify');

// https://www.npmjs.com/package/gulp-concat/
var concat = require('gulp-concat');


gulp.task('build', function() {
    gulp.src('')
        .pipe(webpack(require('./webpack.publish.js')))
        .pipe(gulp.dest('./dist'));

    gulp.src('./src/flash/bin/*.swf').pipe(gulp.dest('./dist'));

    console.info('build: done');
});

gulp.task('min', function () {
    gulp.src(['dist/uploader.js'])
        .pipe(concat('uploader.min.js', {newLine: ';'}))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
    console.info('concat and min: done');
});

gulp.task('default', ['build']);


