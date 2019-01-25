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
        auth_token: estore.get("user-auth_token") || "",
        uuid: estore.get("user-uuid") || "",
        avatar: estore.get("user-avatar") || "https://www.gravatar.com/avatar/0bd7bb5ea784ed3975feac068c1e3c2a",
        roles: estore.get("user-roles") || [], // 1 - Global Administrator / 2 - User / 3 - Organization Administrator / 4 - Organization User
        settings: {
            server: {
                address: {
                    analysis: estore.get("user-settings-server-address-analysis") || "",
                    backend: estore.get("user-settings-server-address-backend") || "",
                    plots: estore.get("user-settings-server-address-plots") || ""
                }
            }
        }
    },

    mutations: {
        SET_USERNAME: (state, username) => {
            estore.set("user-username", username);
            state.username = username;
        },
        SET_AUTH_TOKEN: (state, auth_token) => {
            estore.set("user-auth_token", auth_token);
            state.auth_token = auth_token;
        },
        SET_UUID: (state, uuid) => {
            estore.set("user-uuid", uuid);
            state.uuid = uuid;
        },
        SET_AVATAR: (state, avatar) => {
            estore.set("user-avatar", avatar);
            state.avatar = avatar;
        },
        SET_ROLES: (state, roles) => {
            estore.set("user-roles", roles);
            state.roles = roles;
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
        }
    },

    actions: {
        setUserAvatar({ commit }, avatar) {
            commit("SET_AVATAR", avatar);
        },
        changeUUID({ commit }, uuid) {
            commit("SET_UUID", uuid);
        },
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
                        console.log(response);
                        let status = false;
                        if (response.data.success === true) {
                            console.log("logging in user");
                            commit("SET_USERNAME", user.username);
                            commit("SET_AUTH_TOKEN", response.data.auth_token);
                            // commit("SET_ROLES", response.data.account_roles);
                            // commit("SET_ROLES", ["admin"]
                            status = true;
                        } else {
                            status = false;
                        }
                        resolve(status);
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
                            commit("SET_ROLES", response.data.account_roles);
                        }
                        resolve({ account_roles: response.data.account_roles });
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
