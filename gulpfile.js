// https://github.com/gulpjs/gulp/blob/master/docs/API.md
var gulp = require('gulp');

// https://github.com/gulpjs/gulp/blob/master/docs/recipes/server-with-livereload-and-css-injection.md
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// watch files for changes and reload
gulp.task('watch', function() {
    browserSync({
        server: {
            baseDir: './'
        }
    });

    gulp.watch(['stylesheets/*.css','index.js','index.html'], function () {
        reload();
    });
});

gulp.task('default', ['watch']);
