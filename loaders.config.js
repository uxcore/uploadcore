module.exports = [
    {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
            'babel-loader'
        ]
    }
];
