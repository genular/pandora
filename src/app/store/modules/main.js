import estore from "@/utils/storage/settings";
import axios from "axios";

const main = {
    state: {
        sidebar: {
            opened: !+estore.get("main-sidebar-opened")
        },
        is_online: false,
        language: estore.get("main-language") || "en",
        is_configured: estore.get("main-is_configured") || false,
        selectedFiles: estore.get("main-selectedFiles") || [],
        packageVersion: packageInfo.version || "N/A",
        packageEnviroment: packageInfo.environment || "development"
    },
    mutations: {
        TOGGLE_SIDEBAR: state => {
            if (state.sidebar.opened) {
                estore.set("main-sidebar-opened", 1);
            } else {
                estore.set("main-sidebar-opened", 0);
            }
            state.sidebar.opened = !state.sidebar.opened;
        },
        SET_IS_ONLINE: (state, is_online) => {
            state.is_online = is_online;
        },
        SET_LANGUAGE: (state, language) => {
            state.language = language;
            estore.set("main-language", language);
        },
        SET_IS_CONFIGURED: (state, status) => {
            state.is_configured = status;
            estore.set("main-is_configured", status);
        },
        SET_SELECTED_FILES: (state, selectedFiles) => {
            state.selectedFiles = selectedFiles;
            estore.set("main-selectedFiles", selectedFiles);
        }
    },
    actions: {
        toggleSideBar({ commit }) {
            commit("TOGGLE_SIDEBAR");
        },
        setIsOnline({ commit }, is_online) {
            commit("SET_IS_ONLINE", is_online);
        },
        setLanguage({ commit }, language) {
            console.log("setting language: " + language);

            commit("SET_LANGUAGE", language);
        },
        setIsConfigured({ commit }, status) {
            commit("SET_IS_CONFIGURED", status);
        },
        setSelectedFiles({ commit }, selectedFiles) {
            commit("SET_SELECTED_FILES", selectedFiles);
        }
    }
};

export default main;
