import Vue from "vue";
import Vuex from "vuex";

/** Import available Store modules **/
import main from "./modules/main";
import errorLog from "./modules/errorLog";
import permission from "./modules/permission";
import tagsView from "./modules/tagsView";
import user from "./modules/user";
import apps from "./modules/apps";
import getters from "./getters";

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        main,
        errorLog,
        permission,
        tagsView,
        user,
        apps
    },
    getters
});

const createStore = () => {
    return store;
};

export { store };
export default createStore;
