import router from "./router";
import { store } from "@/store";
import estore from "@/utils/storage/settings";

import { Message } from "element-ui";
import NProgress from "nprogress"; // progress bar

NProgress.configure({ showSpinner: false }); // NProgress Configuration

// Permission judge function
function hasInAppPermission(role, permissionRoles) {
    if (role === 1) {
        return true;
    } // admin permission passed directly
    if (!permissionRoles) {
        return true;
    }
    return permissionRoles.indexOf(role) >= 0;
}
// Check if URL is publicly accessible
function hasOutAppPermission(whiteListURLs, currentURL) {
    return whiteListURLs.some((url) => currentURL.startsWith(url));
}

const whiteList = ["/authenticate/?action=login", "/authenticate/?action=register", "/authenticate/?action=reset"];

router.beforeEach((to, from, next) => {
    NProgress.start();

    const isConfigured = estore.get("main-is_configured");
    const userAuthToken = estore.get("user-auth_token");

    // 1st check if Settings are configured if not always redirect to login page where they will be configured
    if (typeof isConfigured === "undefined" || isConfigured === false) {
        if (to.path.startsWith("/authenticate")) {
            console.log("Allow authentication");
            next();
            return;
        }
    }

    // 2nd check if user is logged in
    if (typeof userAuthToken !== "undefined") {
        if (store.getters.user_role === 0) {
            store
                .dispatch("getUserDetails")
                .then((response) => {
                    if (response !== false) {
                        // Not used all routes are already defined in Router
                        store.dispatch("generateUserSpecificRoutes", response.account_type).then((response) => {
                            console.log("Adding user / application routes");
                            next({ ...to, replace: true });
                        });
                    }
                })
                .catch((error) => {
                    console.log("Auth error: store.getters.user_role 1:");
                    console.log(error);

                    store
                        .dispatch("userLogout")
                        .then((response) => {
                            Message.error("Verification failed, please authenticate again");
                            next({ path: "/authenticate/?action=login" });
                        })
                        .catch((error) => {
                            console.log("Auth error: store.getters.user_role 2:");
                            console.log(error);
                        });
                });
        } else {
            // 3rd check some app specific restrictions
            if (hasInAppPermission(store.getters.user_role, to.meta.roles) === true) {
                next(); //
            } else {
                next({
                    path: "/401",
                    replace: true,
                    query: { noGoBack: true },
                });
            }
        }
    } else {
        /* has no token*/
        if (hasOutAppPermission(whiteList, to.fullPath) === true) {
            next();
        } else {
            next("/authenticate/?action=login");
            NProgress.done();
        }
    }
});

router.afterEach((to, from) => {
    NProgress.done();
});
