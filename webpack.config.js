var path = require("path");
var webpack = require('webpack');
var packageInfo = require("./package.json");

module.exports = {
    entry: {
        'uploadcore': './src/index.js'
    },
    output: {
        path: path.join(__dirname, "dist"),
        libraryTarget: "umd",
        filename: "[name].js",
        library: "UploadCore",
        sourceMapFilename: "[file].map"
    },
    devtool: '#source-map',
    module: {
        loaders: [
            {test: /\.js$/, loader: 'babel-loader', query: {
                presets: ['es2015', 'react']
            }}
        ]
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(packageInfo.version)
        })
    ],
    resolve: {
        extensions: ['', '.js']
    }
};
