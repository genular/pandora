/*
 * @Author: LogIN-
 * @Date:   2019-01-22 11:52:45
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2019-04-18 15:45:08
 */

"use strict";
const path = require("path");

const webpack = require("webpack");

const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const argv = require("minimist")(process.argv.slice(2));
const isWeb = argv && argv.target === "web";

const output = isWeb ? "compiled/web" : "compiled/other";

const _ = require("./utils");

const OUTPUT_DIR = path.resolve(__dirname, "../" + output);
const SRC_DIR = path.resolve(__dirname, "../src");

const packageInfo = require(path.resolve(__dirname, `../package.json`));

const prepareMessagesPlugin = require(path.resolve(__dirname, `../src/app/translations/plugins/prepareMessagesPlugin.js`));

module.exports = (environment) => {
    // Try to copy env template and add ENV variables to it
    const envTemplateFinal = _.configureEnviroment(environment, argv);

    const config = {
        resolve: {
            extensions: [".js", ".vue", ".css", ".json", ".scss", ".eot", ".ttf", ".woff", ".woff2", ".svg"],
            alias: {
                env_vars$: path.resolve(envTemplateFinal),
                scss_vars: SRC_DIR + "/app/styles/variables.scss",
                "@": SRC_DIR + "/app",
            },
            modules: [
                // places where to search for required modules
                _.cwd("node_modules"),
                _.cwd("src"),
            ],
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    loaders: ["style-loader", "css-loader", "resolve-url-loader"],
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: "style-loader",
                        },
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: false,
                            },
                        },
                        {
                            loader: "resolve-url-loader",
                            options: {
                                debug: false,
                            },
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.vue$/,
                    loader: "vue-loader",
                    options: {
                        hotReload: false,
                        extractCSS: environment === "production",
                        cssSourceMap: true,
                        loaders: {
                            scss: ["vue-style-loader", "css-loader", "resolve-url-loader", "sass-loader"],
                            sass: ["vue-style-loader", "css-loader", "resolve-url-loader", "sass-loader?indentedSyntax"],
                        },
                        transformToRequire: {
                            video: ["src", "poster"],
                            source: "src",
                            img: "src",
                            image: "xlink:href",
                        },
                        compilerOptions: { preserveWhitespace: false, whitespace: "condense" },
                    },
                },
                {
                    test: /\.(js|jsx)$/,
                    loader: "babel-loader",
                    include: [SRC_DIR, path.join(__dirname, "..", "node_modules/webpack-dev-server/client")],
                    //exclude: /node_modules/,
                },
                {
                    test: /\.(png|jpe?g|gif)(\?.*)?$/,
                    loader: "url-loader",
                    options: {
                        limit: 10000,
                        name: "images/[name].[hash:7].[ext]",
                    },
                },
                {
                    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                    loader: "url-loader",
                    options: {
                        limit: 10000,
                        name: "media/[name].[hash:7].[ext]",
                    },
                },
                {
                    test: /\.(woff2?|woff|eot|ttf|otf|svg)(\?.*)?$/,
                    loader: "url-loader",
                    options: {
                        limit: 10000,
                        name: "fonts/[name].[hash:7].[ext]",
                    },
                },
            ],
        },
        plugins: [
            new VueLoaderPlugin(),
            new webpack.DefinePlugin({
                packageInfo: {
                    environment: '"' + environment + '"',
                    version: JSON.stringify(packageInfo.version),
                    repository: JSON.stringify(packageInfo.repository),
                    homepage: JSON.stringify(packageInfo.homepage),
                    copyright: JSON.stringify(packageInfo.copyright),
                },
            }),
            new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
            new CleanWebpackPlugin([output], {
                root: SRC_DIR + "/../",
                verbose: true,
                dry: false,
            }),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            new FriendlyErrorsWebpackPlugin({
                clearConsole: environment === "development",
            }),
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: environment == "development" ? "[name].css" : "[name].[hash].css",
                chunkFilename: environment == "development" ? "[id].css" : "[id].[hash].css",
            }),
            // Prepare translations files
            new prepareMessagesPlugin(),
            new webpack.WatchIgnorePlugin([/\langs\.json$/]),
            new HtmlWebpackPlugin({
                title: "PANDORA",
                template: SRC_DIR + "/index.html",
                minify: {
                    collapseWhitespace: true,
                    removeAttributeQuotes: false,
                    removeComments: true,
                    caseSensitive: true,
                },
                filename: "index.html",
                inject: "body",
                cache: "false",
                chunks: ["main", "vendor"],
                excludeChunks: ["background"],
                chunksSortMode: "none",
            }),
            // https://stackoverflow.com/questions/34827956/webpack-gzip-compressed-bundle-not-being-served-the-uncompressed-bundle-is
            new CompressionWebpackPlugin({
                asset: "[path].gz[query]",
                algorithm: "gzip",
                test: new RegExp("\\.(js|css)$"),
                threshold: 10240,
                minRatio: 0.8,
            }),
            new CopyWebpackPlugin(
                [
                    {
                        from: SRC_DIR + "/../static",
                        to: SRC_DIR + "/../" + output + "/static",
                    },
                    {
                        from: SRC_DIR + "/humans.txt",
                        to: SRC_DIR + "/../" + output + "/humans.txt",
                    },
                    {
                        from: SRC_DIR + "/robots.txt",
                        to: SRC_DIR + "/../" + output + "/robots.txt",
                    },
                ],
                { ignore: [".*"] }
            ),
        ],
        stats: {
            colors: true,
            children: false,
            chunks: false,
            modules: false,
            reasons: true,
            errorDetails: true,
        },
    };
    if (isWeb === false) {
        config.target = "electron-renderer";
        config.node = {
            setImmediate: false,
            __dirname: false,
            __filename: false,
        };
        config.externals = [
            nodeExternals({
                whitelist: [
                    // "axios",
                    // "babel-polyfill",
                    // "clipboard",
                    // "echarts",
                    // "element-ui",
                    // "file-saver",
                    // "font-awesome",
                    // "gzip-js",
                    // "handsontable",
                    // "is-url",
                    // "jspdf",
                    // "lib-r-math.js",
                    // "lodash",f
                    // "material-design-icons",
                    // "moment",
                    // "normalize.css",
                    // "nprogress",
                    // "store",
                    // "tsne-js",
                    // "uuid",
                    // "vue",
                    // "vue-count-to",
                    // "vue-electron",
                    // "vue-form-wizard",
                    // "vue-i18n",
                    // "vue-introjs",
                    // "vue-router",
                    // "vuedraggable",
                    // "vuex",
                    // "whatwg-fetch",
                    // "xlsx",
                    "webpack/hot/poll?1000",
                    "webpack/hot/dev-server",
                    "webpack/hot/signal.js",
                ],
            }),
        ];
    } else {
        config.target = "web";
        config.optimization = {
            runtimeChunk: {
                name: "vendor",
            },
            splitChunks: {
                cacheGroups: {
                    default: false,
                    commons: {
                        test: /node_modules/,
                        name: "vendor",
                        chunks: "initial",
                        minSize: 1,
                    },
                },
            },
        };

        config.node = {
            // prevent webpack from injecting useless setImmediate polyfill because Vue
            // source contains it (although only uses it if it's native).
            setImmediate: false,
            // prevent webpack from injecting mocks to Node native modules
            // that does not make sense for the client
            dgram: "empty",
            fs: "empty",
            net: "empty",
            tls: "empty",
            child_process: "empty",
        };
    }

    if (environment == "development") {
        config.devtool = "source-map";
        config.devServer = {
            historyApiFallback: true,
            noInfo: false,
            clientLogLevel: "warning",
            https: false,
            hot: false,
            contentBase: path.join(__dirname, output),
            inline: false,
            port: 3020,
            quiet: true,
            disableHostCheck: true,
            watchOptions: {
                poll: false,
            },
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
            },
        };
        if (isWeb === true) {
            // config.plugins.push(new BundleAnalyzerPlugin());
            config.plugins.push(new webpack.HotModuleReplacementPlugin({ quiet: true }));
        }
    } else {
        config.optimization.minimize = true;
        config.optimization.minimizer = [
            new TerserPlugin({
                cache: true,
                parallel: true,
                extractComments: true,
                sourceMap: true,
                terserOptions: {
                    warnings: false,
                    ecma: 6,
                    output: {
                        comments: false,
                    },
                },
            }),
        ];
    }
    return config;
};
