var webpack = require('webpack');

module.exports = {
    entry: {
        uploader: './index.js'
    },
    output: {
        libraryTarget: "umd",
        library: "UXUploader",
        filename: '[name].js',
        sourceMapFilename: "[name].js.map"
    },
    devtool: '#source-map',
    module: {
        loaders: {
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: [
                'babel-loader'
            ]
        }
    },
    externals: {
        'jquery': 'jQuery',
        'spark-md5': 'SparkMD5'
    },
    resolve: {
        extensions: ['', '.js']
    }
};
