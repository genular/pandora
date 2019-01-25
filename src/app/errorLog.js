import Vue from "vue";
import { store } from "./store";


// you can set only in production env show the error-log

Vue.config.errorHandler = function(err, vm, info, a) {
    // Don't ask me why I use Vue.nextTick, it just a hack.
    // detail see https://forum.vuejs.org/t/dispatch-in-vue-config-errorhandler-has-some-problem/23500
    Vue.nextTick(() => {
        if (process.env.NODE_ENV === 'production') {
            console.log("========================");
            console.log(err);
            console.log(info);
        } else {
            if (typeof store.dispatch !== "undefined") {
                store.dispatch('addLog', {
                    err,
                    vm,
                    info,
                    url: window.location.href
                })
            } else {
                console.log("store.dispatch is undefined");
            }
        }
    })
}
