import { asyncRouterMap, constantRouterMap } from "@/router";

/**
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
    if (route.meta && route.meta.roles) {
        return roles.some(account_role => route.meta.roles.includes(account_role));
    } else {
        return true;
    }
}

/**
 * @param asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(asyncRouterMap, roles) {
    const accessedRouters = asyncRouterMap.filter(route => {
        if (hasPermission(roles, route)) {
            if (route.children && route.children.length) {
                route.children = filterAsyncRouter(route.children, roles);
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
        generateUserSpecificRoutes({ commit }, account_roles) {
            return new Promise(resolve => {
                let accessedRouters;
                // Check if Global Administrator
                if (account_roles.includes(1)) {
                    accessedRouters = asyncRouterMap;
                } else {
                    accessedRouters = filterAsyncRouter(asyncRouterMap, account_roles);
                }
                commit("SET_ROUTERS", accessedRouters);
                resolve();
            });
        }
    }
};

export default permission;
