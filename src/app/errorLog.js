import Vue from "vue";
import env_vars from "env_vars";
import { store } from "./store";

Vue.config.errorHandler = function (err, vm, info, a) {
    // detail see https://forum.vuejs.org/t/dispatch-in-vue-config-errorhandler-has-some-problem/23500
    Vue.nextTick(() => {
        if (env_vars.name === "development") {
            console.log("========================");
            console.log(err);
            console.log(info);
        } else {
            if (typeof store.dispatch !== "undefined") {
                store.dispatch("addLog", {
                    err,
                    vm,
                    info,
                    url: window.location.href,
                });
            } else {
                console.log("store.dispatch is undefined");
            }
        }
    });
};

// Save all console logs for the session
if (console.everything === undefined) {
    console.everything = [];

    console.defaultLog = console.log.bind(console);
    console.log = function () {
        const currentURI = location.pathname.substr(1);
        console.everything.push({ type: "log", datetime: Date().toLocaleString(), pathname: currentURI, value: Array.from(arguments) });
        console.defaultLog.apply(console, arguments);
    };

    console.defaultError = console.error.bind(console);
    console.error = function () {
        const currentURI = location.pathname.substr(1);
        console.everything.push({ type: "error", datetime: Date().toLocaleString(), pathname: currentURI, value: Array.from(arguments) });
        console.defaultError.apply(console, arguments);
    };

    console.defaultWarn = console.warn.bind(console);
    console.warn = function () {
        const currentURI = location.pathname.substr(1);
        console.everything.push({ type: "warn", datetime: Date().toLocaleString(), pathname: currentURI, value: Array.from(arguments) });
        console.defaultWarn.apply(console, arguments);
    };

    console.defaultDebug = console.debug.bind(console);
    console.debug = function () {
        const currentURI = location.pathname.substr(1);
        console.everything.push({ type: "debug", datetime: Date().toLocaleString(), pathname: currentURI, value: Array.from(arguments) });
        console.defaultDebug.apply(console, arguments);
    };
}
