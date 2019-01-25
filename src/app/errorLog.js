import Vue from "vue";
import { store } from "./store";


Vue.config.errorHandler = function(err, vm, info, a) {
    // detail see https://forum.vuejs.org/t/dispatch-in-vue-config-errorhandler-has-some-problem/23500
    Vue.nextTick(() => {
        if (process.env.NODE_ENV === 'development') {
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
