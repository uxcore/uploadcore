var path = require("path");
var webpack = require('webpack');

module.exports = {
    entry: {
        'uploadcore': './src/index.js'
    },
    output: {
        path: path.join(__dirname, "dist"),
        libraryTarget: "var",
        filename: "[name].js",
        library: "UploadCore",
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
        'uploadcore': 'var UploadCore'
    },
    plugins:[],
    resolve: {
        extensions: ['', '.js']
    }
};
