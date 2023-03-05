import estore from "@/utils/storage/settings";
import axios from "axios";

import {
    fetchServerLoad as APIFetchServerLoad
} from "@/api/backend";

const main = {
    state: {
        sidebar: {
            opened: !+estore.get("main-sidebar-opened"),
        },
        is_online: false,
        backendServerLoad: {},
        language: estore.get("main-language") || "en",
        is_configured: estore.get("main-is_configured") || false,

        selectedFiles: estore.get("main-selectedFiles") || [],
        selectedFileDetails: estore.get("main-selectedFileDetails") || { id: null, columns: [], summary: [] },

        packageVersion: packageInfo.version || "N/A",
        packageEnviroment: packageInfo.environment || "development",

        workspace: {
            currentDirectory: estore.get("main-workspace-currentDirectory") || "uploads",
        }
    },
    mutations: {

        SET_WORKSPACE_CURRENT_DIRECTORY: (state, currentDirectory) => {
            state.workspace.currentDirectory = currentDirectory;
            estore.set("main-workspace-currentDirectory", currentDirectory);
        },

        TOGGLE_SIDEBAR: (state) => {
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
        SET_BACKEND_SERVER_LOAD: (state, backendServerLoad) => {
            state.backendServerLoad = backendServerLoad;
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
        },
        SET_SELECTED_FILE_DETAILS: (state, selectedFileDetails) => {
            state.selectedFileDetails = selectedFileDetails;
            estore.set("main-selectedFileDetails", selectedFileDetails);
        },
    },
    actions: {
        setWorkspaceDirectory({ commit }, currentDirectory) {
            commit("SET_WORKSPACE_CURRENT_DIRECTORY", currentDirectory);
        },
        resetPandoraSelectedFiles({ commit, state }) {
            commit("SET_SELECTED_FILES", []);
            commit("SET_SELECTED_FILE_DETAILS", { id: null, columns: [], summary: [] });
        },
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
        },
        setSelectedFileDetails({ commit }, selectedFileDetails) {
            commit("SET_SELECTED_FILE_DETAILS", selectedFileDetails);
        },
        setBackendServerLoad({ commit, state }) {
            return new Promise((resolve, reject) => {
                APIFetchServerLoad()
                    .then(response => {
                        if (response.data.success === true) {
                            commit("SET_BACKEND_SERVER_LOAD", response.data.message);
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        reject(error);
                    });
            });
        }
    },
};

export default main;
