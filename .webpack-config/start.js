const childProcess = require("child_process");
const webpack = require("webpack");
const env = process.env.NODE_ENV || "development";

const argv = require("minimist")(process.argv.slice(2));
const isWeb = argv && argv.target === "web";

const config = require("./webpack.app.config");
const compiler = webpack(config(env));

let appStarted = false;

const watching = compiler.watch({}, (err, stats) => {
    if (!err && !stats.hasErrors() && !appStarted) {
        appStarted = true;

        if (isWeb === false) {
            // childProcess.spawn(electron, ["."], { stdio: "inherit" }).on("close", () => {
            //     watching.close();
            // });
        }else{
            watching.close();
        }
    }
});
