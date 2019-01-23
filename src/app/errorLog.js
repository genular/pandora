import Vue from "vue";
import store from "./store";

// if (process.env.ENV === 'production') {
Vue.config.errorHandler = function(err, vm, info, a) {
    Vue.nextTick(() => {
        console.log("========================");
        console.log(err);
        console.log(info);

        // store.dispatch("addErrorLog", {
        //     err,
        //     vm,
        //     info,
        //     url: window.location.href
        // });
    });
};
