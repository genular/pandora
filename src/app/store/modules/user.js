import {
    userLogin as ApiBackendUserLogin,
    userDetials as ApiBackendUserDetails,
    systemConfigure as ApiBackendSystemConfigure,
    userLogout as ApiBackendUserLogout
} from "@/api/backend";

import estore from "@/utils/storage/settings";

const user = {
    state: {
        username: estore.get("user-username") || "",
        user_id: estore.get("user-user_id") || 0,
        auth_token: estore.get("user-auth_token") || "",
        role: estore.get("user-role") || 0, // 1 - Global Administrator / 2 - User / 3 - Organization Administrator / 4 - Organization User
        settings: {
            server: {
                address: {
                    analysis: estore.get("user-settings-server-address-analysis") || "",
                    backend: estore.get("user-settings-server-address-backend") || "",
                    plots: estore.get("user-settings-server-address-plots") || "",
                    frontend: estore.get("user-settings-server-address-frontend") || ""
                }
            }
        }
    },

    mutations: {
        SET_USERNAME: (state, username) => {
            estore.set("user-username", username);
            state.username = username;
        },
        SET_USERID: (state, user_id) => {
            estore.set("user-user_id", user_id);
            state.user_id = user_id;
        },
        SET_AUTH_TOKEN: (state, auth_token) => {
            estore.set("user-auth_token", auth_token);
            state.auth_token = auth_token;
        },
        SET_ROLE: (state, role) => {
            estore.set("user-role", role);
            state.role = role;
        },
        SET_SETTING_SERVER_ADDRESS_ANALYSIS: (state, analysisServer) => {
            estore.set("user-settings-server-address-analysis", analysisServer);
            state.settings.server.address.analysis = analysisServer;
        },
        SET_SETTING_SERVER_ADDRESS_BACKEND: (state, backendServer) => {
            estore.set("user-settings-server-address-backend", backendServer);
            state.settings.server.address.backend = backendServer;
        },
        SET_SETTING_SERVER_ADDRESS_PLOTS: (state, plotsServer) => {
            estore.set("user-settings-server-address-plots", plotsServer);
            state.settings.server.address.plots = plotsServer;
        },
        SET_SETTING_SERVER_ADDRESS_FRONTEND: (state, frontendServer) => {
            estore.set("user-settings-server-address-frontend", frontendServer);
            state.settings.server.address.frontend = frontendServer;
        }
    },

    actions: {
        configureBackendServers({ commit }, backendServerUrl) {
            return new Promise((resolve, reject) => {
                ApiBackendSystemConfigure(backendServerUrl)
                    .then(response => {
                        let status = false;
                        if (typeof response.data.success !== "undefined" && response.data.success === true) {
                            /** Populate servers in data-store */
                            response.data.servers.forEach(item => {
                                commit("SET_SETTING_SERVER_ADDRESS_" + item.type.toUpperCase(), item.url);
                            });
                            status = true;
                        } else {
                            status = false;
                        }
                        resolve(status);
                    })
                    .catch(error => {
                        console.log(error);
                        reject(true);
                    });
            });
        },

        userLogin({ commit }, user) {
            return new Promise((resolve, reject) => {
                ApiBackendUserLogin(user.username, user.password)
                    .then(response => {
                        if (response.data.success === true) {
                            commit("SET_USERNAME", user.username);
                            commit("SET_AUTH_TOKEN", response.data.auth_token);
                            resolve(true);
                        } else {
                            reject(false);
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        reject(error);
                    });
            });
        },
        getUserDetails({ commit, state }) {
            return new Promise((resolve, reject) => {
                ApiBackendUserDetails()
                    .then(response => {
                        if (response.data.success === true) {
                            commit("SET_ROLE", response.data.message.account_type);
                            commit("SET_USERID", response.data.message.id);
                            resolve(response.data.message);
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
        userLogout({ commit, state }) {
            return new Promise((resolve, reject) => {
                ApiBackendUserLogout(state.auth_token)
                    .then(response => {
                        // Clear all keys in store
                        estore.clearAll();
                        resolve(true);
                    })
                    .catch(error => {
                        console.log(error);

                        estore.clearAll();
                        resolve(true);
                    });
            });
        }
    }
};

export default user;
