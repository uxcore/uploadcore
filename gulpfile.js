var path = require("path");

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

var WebpackDevServer = require("webpack-dev-server");

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

gulp.task("default", ["webpack-dev-server"]);
gulp.task("watch", ["webpack-dev-server"]);
gulp.task("start", ["webpack-dev-server"]);
gulp.task("server", ["webpack-dev-server"]);

gulp.task("webpack-dev-server", function (callback) {
    // modify some webpack config options
    var config = Object.create(webpackConfig);
    config.debug = true;
    config.entry.example = './example/index.js';
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
    myConfig.output.filename = "[name].spm2.js";
    myConfig.devtool = '';

    webpack(myConfig, function (err, stats) {
        if (err) {
            throw new gutil.PluginError("webpack", err);
        }

        gutil.log("[webpack]", stats.toString({
            colors: true
        }));

        setTimeout(function () {
            gulp.src(['spm2/uploader.spm2.js'])
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



