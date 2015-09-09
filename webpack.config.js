var path = require("path");
var webpack = require('webpack');

module.exports = {
    entry: {
        'uploader': './index.js'
    },
    output: {
        path: path.join(__dirname, "dist"),
        libraryTarget: "var",
        filename: "[name].js",
        library: "UXUploader",
        sourceMapFilename: "[file].map"
    },
    devtool: '#source-map',
    module: {
        loaders: [
            {test: /\.js$/, loader: 'babel-loader'}
        ]
    },
    externals: {
        'jquery': 'var jQuery',
        'spark-md5': 'var SparkMD5',
        'uxuploader': 'var UXUploader'
    },
    plugins:[],
    resolve: {
        extensions: ['', '.js']
    }
};
