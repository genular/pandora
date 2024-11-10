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
        systemUpdate: estore.get("main-systemUpdate") || false,
        language: estore.get("main-language") || "en",
        is_configured: estore.get("main-is_configured") || false,

        registration_check_counter: estore.get("main-registration_check_counter") || 0,

        selectedFiles: estore.get("main-selectedFiles") || [],
        selectedFileDetails: estore.get("main-selectedFileDetails") || { id: null, columns: [], summary: [] },

        packageVersion: packageInfo.version || "N/A",
        packageEnviroment: packageInfo.environment || "development",

        workspace: {
            currentDirectory: estore.get("main-workspace-currentDirectory") || "uploads",
        },

        terminal: {
            isTerminalOpen: estore.get("main-terminal-isTerminalOpen") || false,
            mainTab: estore.get("main-terminal-mainTab") || 'logs',
            activeTab: estore.get("main-terminal-activeTab") || null,
            llmActiveTab: estore.get("main-terminal-llmActiveTab") || 'output',
            terminalHeight: estore.get("main-terminal-terminalHeight") || 300,
            isMaximized: estore.get("main-terminal-isMaximized") || false
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
        SET_BACKEND_SYSTEM_UPDATE: (state, systemUpdate) => {
            state.systemUpdate = systemUpdate;
        },
        SET_LANGUAGE: (state, language) => {
            state.language = language;
            estore.set("main-language", language);
        },
        SET_IS_CONFIGURED: (state, status) => {
            state.is_configured = status;
            estore.set("main-is_configured", status);
        },
        SET_REGISTRATION_CHECK_COUNTER: (state, registration_check_counter) => {
            state.registration_check_counter = registration_check_counter;
            estore.set("main-registration_check_counter", registration_check_counter);
        },
        SET_SELECTED_FILES: (state, selectedFiles) => {
            state.selectedFiles = selectedFiles;
            estore.set("main-selectedFiles", selectedFiles);
        },
        SET_SELECTED_FILE_DETAILS: (state, selectedFileDetails) => {
            state.selectedFileDetails = selectedFileDetails;
            estore.set("main-selectedFileDetails", selectedFileDetails);
        },
        SET_TERMINAL_OPEN: (state, isTerminalOpen) => {
            state.terminal.isTerminalOpen = isTerminalOpen;
            estore.set("main-terminal-isTerminalOpen", isTerminalOpen);
        },
        SET_TERMINAL_MAIN_TAB: (state, mainTab) => {
            state.terminal.mainTab = mainTab;
            estore.set("main-terminal-mainTab", mainTab);
        },
        SET_TERMINAL_ACTIVE_TAB: (state, activeTab) => {
            state.terminal.activeTab = activeTab;
            estore.set("main-terminal-activeTab", activeTab);
        },
        SET_TERMINAL_LLM_ACTIVE_TAB: (state, llmActiveTab) => {
            state.terminal.llmActiveTab = llmActiveTab;
            estore.set("main-terminal-llmActiveTab", llmActiveTab);
        },
        SET_TERMINAL_HEIGHT: (state, terminalHeight) => {
            state.terminal.terminalHeight = terminalHeight;
            estore.set("main-terminal-terminalHeight", terminalHeight);
        },
        SET_TERMINAL_MAXIMIZED: (state, isMaximized) => {
            state.terminal.isMaximized = isMaximized;
            estore.set("main-terminal-isMaximized", isMaximized);
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
        setRegistrationCheckCounter({ commit }, registration_check_counter) {
            commit("SET_REGISTRATION_CHECK_COUNTER", registration_check_counter);
        },
        setIsConfigured({ commit }, status) {
            commit("SET_IS_CONFIGURED", status);
        },
        setSystemUpdate({ commit }, systemUpdate) {
            commit("SET_BACKEND_SYSTEM_UPDATE", systemUpdate);
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

                            if ("system_update" in response.data.message) {
                                commit("SET_BACKEND_SYSTEM_UPDATE", response.data.message.system_update);
                            }

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
        },
        setTerminalOpen({ commit }, isTerminalOpen) {
            commit("SET_TERMINAL_OPEN", isTerminalOpen);
        },
        setTerminalMainTab({ commit }, mainTab) {
            commit("SET_TERMINAL_MAIN_TAB", mainTab);
        },
        setTerminalActiveTab({ commit }, activeTab) {
            commit("SET_TERMINAL_ACTIVE_TAB", activeTab);
        },
        setTerminalLlmActiveTab({ commit }, llmActiveTab) {
            commit("SET_TERMINAL_LLM_ACTIVE_TAB", llmActiveTab);
        },
        setTerminalHeight({ commit }, terminalHeight) {
            commit("SET_TERMINAL_HEIGHT", terminalHeight);
        },
        setTerminalMaximized({ commit }, isMaximized) {
            commit("SET_TERMINAL_MAXIMIZED", isMaximized);
        }
    },
};

export default main;
