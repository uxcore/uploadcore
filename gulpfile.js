var path = require("path");
var fs = require("fs");

// https://github.com/gulpjs/gulp/tree/master/docs
// https://github.com/gulpjs/gulp/blob/master/docs/API.md
var gulp = require('gulp');

var webpack = require("webpack");

// https://github.com/terinjokes/gulp-uglify
var uglify = require('gulp-uglify');

var rename = require('gulp-rename');

var sourcemaps = require('gulp-sourcemaps');

var gutil = require("gulp-util");

var cmdNice = require("gulp-cmd-nice");

// https://www.npmjs.com/package/gulp-wrap/
var wrap = require('gulp-wrap');

// http://browsersync.io/
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var webpackConfig = require("./webpack.config");

var packageJson = require("./package.json");

var publicPath = '/assets';

var spm2Path = path.normalize(path.join(__dirname, 'spm2'));

var transportConfig = {
    debug: false,
    useCache: false,
    rootPath: spm2Path,
    idRule: function (name) {
        return packageJson.family + "/uxuploader/" + packageJson.version + "/" + name;
    }
};

gulp.task("default", ["server"]);
gulp.task("watch", ["server"]);
gulp.task("start", ["server"]);
gulp.task("server", ["demo"], function (callback) {
    browserSync({
        server: {
            baseDir: './',
            middleware: function (req, res, next) {
                if (req.url !== '/') return next();

                res.setHeader("Content-Type", "text/html");
                res.write('<!DOCTYPE html><html><head><meta charset="utf-8"/>');
                res.write('<title>DEMOs</title>');
                res.write('</head><body>');
                function writeDirectory(baseUrl, basePath) {
                    var content = fs.readdirSync(basePath);
                    res.write("<ul>");
                    content.forEach(function(item) {
                        var p = basePath + "/" + item;
                        if(fs.statSync(p).isFile() && /\.html$/.test(item)) {
                            res.write('<li><a href="');
                            res.write(baseUrl + '/' + item);
                            res.write('">');
                            res.write(item);
                            res.write('</a></li>');
                        }
                    });
                    res.write("</ul>");
                }
                writeDirectory("/demo", './demo');
                res.end('</body></html>');
            }
        },
        open: 'external'
    });

    gulp.watch(['src/**/*.js', 'demo/**/*.js'], ['reload_demo']);

    callback();
});

gulp.task("webpack-dev-server", function (callback) {
    // modify some webpack config options
    var config = Object.create(webpackConfig);
    config.debug = true;
    config.entry.demo = './demo/index.js';
    config.output.publicPath = publicPath;

    // Start a webpack-dev-server
    new WebpackDevServer(webpack(config), {
        publicPath: publicPath,
        info: true,
        quiet: false,
        stats: {
            colors: true,
            progress: true
        }
    }).listen(8080, "0.0.0.0", function (err) {
        if (err) {
            throw new gutil.PluginError("webpack-dev-server", err);
        }
        gutil.log("webpack-dev-server at 8080");
    });
});

gulp.task("demo", function (callback) {
    // modify some webpack config options
    var config = Object.create(webpackConfig);
    config.debug = true;
    config.entry.demo = './demo/index.js';

    config.output.path = path.join(__dirname, "cache");

    webpack(config, function (err, stats) {
        if (err) {
            throw new gutil.PluginError("webpack", err);
        }

        gulp.src(['cache/uploader.js'])
            .pipe(wrap({src:'./src/spm2.tpl'}))
            .pipe(rename('uploader.spm2.js'))
            .pipe(gulp.dest('./cache'));

        callback();
    });
});

gulp.task('reload_demo', ['demo'], function () {
    reload();
});

gulp.task("build", function (callback) {
    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);

    myConfig.plugins = myConfig.plugins.concat(
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    );

    // run webpack
    webpack(myConfig, function (err, stats) {
        if (err) {
            throw new gutil.PluginError("webpack", err);
        }

        gutil.log("[webpack]", stats.toString({
            colors: true
        }));

        callback();
    });
});


gulp.task('spm2', function (callback) {
    var myConfig = Object.create(webpackConfig);

    myConfig.output.path = spm2Path;
    myConfig.output.filename = "[name].src.js";
    myConfig.devtool = '';

    webpack(myConfig, function (err, stats) {
        if (err) {
            throw new gutil.PluginError("webpack", err);
        }

        gutil.log("[webpack]", stats.toString({
            colors: true
        }));

        setTimeout(function () {
            gulp.src(['spm2/uploader.src.js'])
                .pipe(wrap({src:'./src/spm2.tpl'}))
                .pipe(gulp.dest('./spm2'))
                .pipe(rename('uploader.js'))
                .pipe(cmdNice.cmdTransport(transportConfig))
                .pipe(sourcemaps.init())
                .pipe(uglify({
                    mangle: false,
                    compress: {
                        warnings: false,
                        drop_console: true
                    }
                }))
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest('./spm2'));
            callback();
        }, 10);
    });
});

gulp.task('flash', function (callback) {
    gulp.src('src/flash/bin/FlashPicker.swf')
        .pipe(rename('flashpicker.swf'))
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest('spm2'));

    callback();
});



