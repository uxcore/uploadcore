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
    devtool: '#source-map', // 这个配置要和output.sourceMapFilename一起使用
    module: {
        loaders: require('./loaders.config')
    },
    externals: {
        'jquery': 'jQuery'
    },
    resolve: {
        extensions: ['', '.js']
    },
    plugins: [
        new webpack.IgnorePlugin(/vertx/)
    ],

    devServer: {    
        info: true,
        quiet: false,

        stats: {
            colors: true,
            progress: true
        }
    }
};
