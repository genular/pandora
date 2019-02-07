import { asyncRouterMap, constantRouterMap } from "@/router";

/**
 * @param roles
 * @param route
 */
function hasPermission(account_role, route) {
    if (route.meta && route.meta.roles) {
        return route.meta.roles.includes(account_role);
    } else {
        return true;
    }
}

/**
 * @param asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(asyncRouterMap, account_role) {
    const accessedRouters = asyncRouterMap.filter(route => {
        if (hasPermission(account_role, route)) {
            if (route.children && route.children.length) {
                route.children = filterAsyncRouter(route.children, account_role);
            }
            return true;
        }
        return false;
    });
    return accessedRouters;
}

const permission = {
    state: {
        routers: constantRouterMap,
        addRouters: []
    },
    mutations: {
        SET_ROUTERS: (state, routers) => {
            state.addRouters = routers;
            state.routers = constantRouterMap.concat(routers);
        }
    },
    actions: {
        generateUserSpecificRoutes({ commit }, account_role) {
            return new Promise(resolve => {
                let accessedRouters;
                // Check if Global Administrator
                if (account_role === 1) {
                    accessedRouters = asyncRouterMap;
                } else {
                    accessedRouters = filterAsyncRouter(asyncRouterMap, account_role);
                }
                commit("SET_ROUTERS", accessedRouters);
                resolve();
            });
        }
    }
};

export default permission;
