/*
* @Author: LogIN-
* @Date:   2019-01-14 16:20:23
* @Last Modified by:   LogIN-
* @Last Modified time: 2019-02-06 14:03:55
*/
import "whatwg-fetch";

const isRenderer = require("is-electron-renderer");
const accounting = require("accounting");

import Vue from "vue";
import env_vars from "env_vars";

import Element from "element-ui";
import VueParticles from "vue-particles";
import VueHighlightJS from 'vue-highlightjs'

import Database from "./utils/storage/index";
Vue.prototype.$db = Database;

import App from "./App";
import router from "./router";
import store from "./store";

import locale from "element-ui/lib/locale/lang/en";

import i18n from "./translations"; // Internationalization

import "@/styles/main.scss"; // require styles using webpack alias

import "./errorLog"; // error log
import "./routeguard"; // permission control

env_vars.isDemoServer = (env_vars.name == 'production' && env_vars.isDemoServer == true);

Vue.prototype.$config = env_vars;
Vue.prototype.$accounting = accounting;

import * as filters from "./filters"; // global filters

Vue.use(Element, {
    size: "medium", // set element-ui default size
    i18n: (key, value) => i18n.t(key, value)
});

Vue.use(VueParticles);
Vue.use(VueHighlightJS);

Vue.config.productionTip = false;

if (isRenderer === true) {
    // bind electron in VUE
    Vue.use({
        install: function(Vue) {
            Vue.prototype.$electron = require("electron");
        }
    });
}

// Register global utility filters from  './filters'
Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key]);
});

const app = new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
});

app.$mount("#app");

if (module.hot) {
    module.hot.accept();
}
