import Vue from "vue";
import env_vars from "env_vars";
import { store } from "./store";

Vue.config.errorHandler = function(err, vm, info, a) {
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
                    url: window.location.href
                });
            } else {
                console.log("store.dispatch is undefined");
            }
        }
    });
};
