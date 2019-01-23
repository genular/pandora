import Vue from "vue";
import Router from "vue-router";

// Views loader
import _import from "./_import.js";

Vue.use(Router);

/* Layout */
import Layout from "../views/layout/Layout";

/** note: submenu only apppear when children.length>=1
 *   detail see  https://panjiachen.github.io/vue-element-admin-site/#/router-and-nav?id=sidebar
 **/

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    roles: ['admin','editor']     will control the page roles (you can set multiple roles)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    noCache: true                if fasle ,the page will no be cached(default is false)
  }
**/

export const constantRouterMap = [
    // { path: "/login", component: _import("login/index"), hidden: true },
    // { path: "/register", component: _import("register/index"), hidden: true },
    {
        path: "/authenticate",
        name: "authenticate",
        component: _import("authenticate/index"),
        hidden: true,
        props: (route) => ({
            action: route.query.action || "login", // login  or register
            usertype: route.query.usertype, // private or organization
            step: parseInt(route.query.step) || 0 // current step number
        })
    },
    { path: "/404", component: _import("errorPage/404"), hidden: true },
    { path: "/401", component: _import("errorPage/401"), hidden: true },
    {
        path: "",
        component: Layout,
        redirect: "dashboard",
        children: [
            {
                path: "dashboard",
                component: _import("dashboard/index"),
                name: "dashboard",
                meta: {
                    title: "dashboard",
                    icon: "fa fa-icon fa-tachometer",
                    noCache: true
                }
            }
        ]
    },
    {
        path: "/settings",
        component: Layout,
        redirect: "/settings/index",
        hidden: true,
        props: (route) => ({ startIndex: parseInt(route.query.startIndex) || 0 }),
        children: [
            {
                path: "index",
                component: _import("settings/index"),
                name: "settings",
                meta: {
                    title: "settings",
                    icon: "fa fa-icon fa-plus",
                    noCache: true
                }
            }
        ]
    },
    {
        path: "/workspace",
        component: Layout,
        redirect: "/workspace/index",
        children: [
            {
                path: "index",
                component: _import("workspace/index"),
                name: "workspace",
                meta: {
                    title: "workspace",
                    icon: "fa fa-icon fa-sitemap",
                    noCache: true
                }
            }
        ]
    },

    {
        path: "/apps/simon",
        component: Layout,
        redirect: "noredirect",
        name: "simon",
        meta: {
            title: "simon",
            icon: "fa fa-icon fa-plus"
        },
        children: [
            {
                path: "start-editing",
                component: _import("apps/simon/editing/index"),
                name: "editing",
                meta: {
                    title: "editing",
                    icon: "fa fa-icon fa-play",
                    restrictions: { file: true, extension: ["csv"] }
                },
                hidden: true
            },
            {
                path: "start-analysis",
                component: _import("apps/simon/analysis/index"),
                name: "analysis",
                meta: {
                    title: "analysis",
                    icon: "fa fa-icon fa-play",
                    restrictions: { file: true, extension: ["csv"] }
                }
            },
            {
                path: "start-exploration",
                component: _import("apps/simon/exploration/index"),
                name: "exploration",
                meta: {
                    title: "exploratory-analysis",
                    icon: "fa fa-icon fa-area-chart",
                    // simonAnalysisJobId is store getter
                    restrictions: { action: true, actionType: "simonExplorationJobId" }
                }
            }
        ]
    }
    // {
    //     path: "/apps/heatmap",
    //     component: Layout,
    //     redirect: "/apps/heatmap",
    //     children: [
    //         {
    //             path: "index",
    //             component: _import("apps/heatmap/index"),
    //             name: "other",
    //             meta: {
    //                 title: "other",
    //                 icon: "fa fa-icon fa-plus",
    //                 restrictions: { file: true, extension: ["csv", "fcs"] }
    //             }
    //         }
    //     ]
    // }
];

export default new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRouterMap
});

export const asyncRouterMap = [{ path: "*", redirect: "/404", hidden: true }];
