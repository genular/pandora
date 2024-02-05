import axios from "axios";
import { Notification } from "element-ui";

import { store } from "@/store";
import { IsJsonString } from "@/utils/helpers";

import * as dataReceiver from "crypto-js";

// Create new axios instance
const service = axios.create({
    crossDomain: true,
    // 7 days request timeout
    timeout: 604800000,
});

// Request interceptor
service.interceptors.request.use(
    function (config) {
        // TODO: add loading in Browser TAB
        if (store.getters.auth_token) {
            config.headers["X-Token"] = store.getters.auth_token;
        }

        if (store.getters.language) {
            config.headers["Accept-Language"] = store.getters.language;
        }

        if (config.url.startsWith("/analysis")) {
            config.baseURL = store.getters.user_settings_server_address_analysis;
        } else if (config.url.startsWith("/plots")) {
            config.baseURL = store.getters.user_settings_server_address_plots;
        } else if (config.url.startsWith("/backend")) {
            if (store.getters.user_settings_server_address_backend !== "") {
                config.baseURL = store.getters.user_settings_server_address_backend;
            }
        }
        // For all other requests keep original request URL
        //
        // else if (store.getters.user_settings_server_address_backend !== "") {
        //     config.baseURL = store.getters.user_settings_server_address_backend;
        // }

        return config;
    },
    function (error) {
        // Do something with request error
        console.log(error);
        Promise.reject(error);
    }
);

// Request response interceptor
service.interceptors.response.use(
    function (response) {
        // TODO: remove loading from Browser TAB

        /** Decrypt server return data */
        if (typeof response.data !== "undefined" && IsJsonString(response.data) === true) {
            const data = dataReceiver.AES.decrypt(response.data, "1337", {
                format: {
                    stringify(cipherParams) {
                        const j = { ct: cipherParams.ciphertext.toString(dataReceiver.enc.Base64) };
                        if (cipherParams.iv) j.iv = cipherParams.iv.toString();
                        if (cipherParams.salt) j.s = cipherParams.salt.toString();
                        return JSON.stringify(j).replace(/\s/g, "");
                    },
                    parse(jsonStr) {
                        const j = JSON.parse(jsonStr);
                        const cipherParams = dataReceiver.lib.CipherParams.create({
                            ciphertext: dataReceiver.enc.Base64.parse(j.ct),
                        });
                        if (j.iv) cipherParams.iv = dataReceiver.enc.Hex.parse(j.iv);
                        if (j.s) cipherParams.salt = dataReceiver.enc.Hex.parse(j.s);
                        return cipherParams;
                    },
                },
            }).toString(dataReceiver.enc.Utf8);
            if (data !== "") {
                response.data = JSON.parse(new Buffer(data, "base64").toString("utf8"));
            }
        }
        return response;
    },
    function (error) {
        // Error message displayed to user
        let errorMessage = "";

        // The request was made and the server responded with a status code
        if (typeof error.response !== "undefined") {
            if (error.response.status === 401) {
                errorMessage = "You are logged out. Please login again using Settings panel.";
                setTimeout(function () {
                    window.location.href = [location.protocol, "//", location.host, location.pathname].join("") + "#/authenticate/?action=login";
                }, 5000);
            }
            // The request was made but no response was received
        } else if (error.request) {
            errorMessage = "Request failed, cannot communicate with backend server. Make sure Docker container is running.";
        } else {
            // Something happened in setting up the request that triggered an Error
            errorMessage = "Request failed, cannot set up request. Please try again latter.";
        }

        if (errorMessage !== "") {
            Notification({
                title: "Remote request failed",
                message: errorMessage,
                type: "error",
                duration: 5000,
            });
        }

        return Promise.reject(error);
    }
);

export default service;
