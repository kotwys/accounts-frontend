/* eslint-env node */

var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var cssnano = require('cssnano');

const API_HOST = 'http://account.l';

// TODO: https://babeljs.io/docs/plugins/
// TODO: отдельные конфиги для env (аля https://github.com/davezuko/react-redux-starter-kit)
// https://github.com/glenjamin/ultimate-hot-reloading-example ( обратить внимание на плагины babel )
// https://github.com/gajus/react-css-modules ( + BrowserSync)

var isProduction = process.argv.some(function(arg) {
    return arg === '-p';
});

var isTest = process.argv.some(function(arg) {
    return arg.indexOf('karma') !== -1;
});

const CSS_LOADER = 'style!css?modules&importLoaders=1&localIdentName=[path][name]-[local]!postcss';

var webpackConfig = {
    entry: {
        app: path.join(__dirname, 'src'),
        vendor: [
            'history',
            'react',
            'react-redux',
            'react-router',
            'redux-simple-router',
            'redux',

            // I18n
            'intl-format-cache',
            'intl-messageformat'
        ]
    },

    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },

    resolve: {
        root: path.resolve('./src'),
        extensions: ['', '.js', '.jsx']
    },

    devServer: {
        host: 'localhost',
        port: 8080,
        proxy: {
            '/api*': {
                target: API_HOST
            }
        },
        hot: true,
        inline: true,
        historyApiFallback: true
    },

    devtool: isTest ? 'inline-source-map' : 'eval',

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(isProduction ? 'production' : 'dev')
            },
            __DEV__: !isProduction,
            __TEST__: isTest,
            __PROD__: isProduction
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            hash: isProduction,
            filename: 'index.html',
            inject: 'body',
            minify: {
                collapseWhitespace: isProduction
            }
        })
    ].concat(isTest ? [] : [
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js')
    ]).concat(isProduction ? [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ] : []),

    module: {
        loaders: [
            {
                test: /\.scss$/,
                extractInProduction: true,
                loader: CSS_LOADER + '!sass'
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015', 'stage-0'],
                    plugins: ['transform-runtime', ['react-intl', {messagesDir: './dist/messages/'}]]
                }
            },
            { // DEPRECATED
                test: /i18n\/.*\.less$/,
                loader: CSS_LOADER + '!less'
            },
            { // DEPRECATED
                test: /\.less$/,
                extractInProduction: true,
                exclude: /i18n\/.*\.less$/,
                loader: CSS_LOADER + '!less'
            }
        ]
    },

    postcss: [
        cssnano({
            sourcemap: !isProduction,
            autoprefixer: {
                add: true,
                remove: true,
                browsers: ['last 2 versions']
            },
            safe: true,
            discardComments: {
                removeAll: true
            }
        })
    ]
};


if (isProduction) {
    webpackConfig.module.loaders.forEach(function(loader) {
        if (loader.extractInProduction) {
            var parts = loader.loader.split('!');
            loader.loader = ExtractTextPlugin.extract(parts[0], parts.slice(1).join('!'));
        }
    });

    webpackConfig.plugins.push(new ExtractTextPlugin('styles.css', {
        allChunks: true
    }));

    webpackConfig.devtool = false;
}

module.exports = webpackConfig;
