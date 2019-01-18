const path = require("path");
const merge = require("webpack-merge");

const base = require("./webpack.base.config");

const argv = require("minimist")(process.argv.slice(2));
const isWeb = argv && argv.target === "web";

// Config directories
const output = isWeb ? "compiled/web" : "compiled/electron";
const OUTPUT_DIR = path.resolve(__dirname, "../" + output);

module.exports = env => {
    const config = {
        mode: env,
        entry: {
            main: "./src/app/index.js"
        },
        output: {
            devtoolLineToLine: true,
            libraryTarget: "umd",
            chunkFilename: "[name].[chunkhash].js",
            filename: env === "production" ? "[name].bundle.[hash].js" : "[name].bundle.[hash].js",
            publicPath: "/",
            path: OUTPUT_DIR
        }
    };
    if (isWeb === false) {
        config.entry.background = "./src/window/index.js";
        config.output.libraryTarget = "commonjs2";
    }
    return merge(base(env), config);
};
