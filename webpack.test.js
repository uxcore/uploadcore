var webpack = require('webpack');

module.exports = {
    entry: [
        './example/index.js'
    ],
    output: {
        publicPath: 'http://localhost:9090/assets'
    },
    module: {
        loaders: require('./loaders.config')
    },
    externals: {
        'jquery': 'jQuery',
        'uploader': 'UXUploader'
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
