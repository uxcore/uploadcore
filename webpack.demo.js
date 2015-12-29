var path = require("path");
var webpack = require('webpack');

module.exports = {
    debug: true,
    entry: {'demo': './demo/index.js'},
    output: {
        path: path.join(__dirname, "cache"),
        filename: "[name].js",
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
        new webpack.DefinePlugin({
            VERSION: JSON.stringify("dev")
        })
    ],
    resolve: {
        extensions: ['', '.js'],
        alias: {
            'uploadcore': path.join(__dirname, "src/index")
        }
    }
};
