<template>
    <div class="menu-wrapper">
        <template v-for="item in routes" v-if="!item.hidden && item.children">
            <router-link
                v-if="item.children.length === 1 && !item.children[0].children"
                :to="item.path + '/' + item.children[0].path"
                :key="item.children[0].name"
                :event="''"
                @click.native.prevent="checkRouteAction($event, { meta: item.children[0].meta, path: item.path + '/' + item.children[0].path })"
            >
                <el-menu-item :index="item.path + '/' + item.children[0].path" :class="{ 'submenu-title-noDropdown': !isNest }">
                    <i v-if="item.children[0].meta && item.children[0].meta.icon" :class="item.children[0].meta.icon" aria-hidden="true"></i>
                    <span slot="title" v-if="item.children[0].meta && item.children[0].meta.title">{{ generateRouteTitle(item.children[0].meta.title) }}</span>
                </el-menu-item>
            </router-link>

            <el-submenu v-else :index="item.name || item.path" :key="item.name">
                <template slot="title">
                    <i v-if="item.meta && item.meta.icon" :class="item.meta.icon" aria-hidden="true"></i>
                    <span v-if="item.meta && item.meta.title" :title="generateRouteTitle(item.meta.title)">{{ generateRouteTitle(item.meta.title) }}</span>
                </template>
                <template v-for="child in item.children" v-if="!child.hidden">
                    <sidebar-item :is-nest="true" class="nest-menu" v-if="child.children && child.children.length > 0" :routes="[child]" :key="child.path"></sidebar-item>
                    <router-link
                        v-else
                        :to="item.path + '/' + child.path"
                        :key="child.name"
                        :event="''"
                        @click.native.prevent="checkRouteAction($event, { meta: child.meta, path: item.path + '/' + child.path })"
                    >
                        <el-menu-item :index="item.path + '/' + child.path" :class="generateMenuClass(child)">
                            <i v-if="child.meta && child.meta.icon" :class="child.meta.icon" aria-hidden="true"></i>
                            <span slot="title" v-if="child.meta && child.meta.title">{{ generateRouteTitle(child.meta.title) }}</span>
                        </el-menu-item>
                    </router-link>
                </template>
            </el-submenu>
        </template>
    </div>
</template>
<script>
import { generateRouteTitle } from "@/utils/i18n";

export default {
    name: "SidebarItem",

    computed: {
        selectedFiles: {
            get() {
                return this.$store.getters.selectedFiles;
            },
            set(value) {
                this.$store.dispatch("setSelectedFiles", value);
            }
        }
    },
    props: {
        routes: {
            type: Array
        },
        isNest: {
            type: Boolean,
            default: false
        }
    },

    methods: {
        generateRouteTitle,
        // Some menu Items must have disabled class because they can only be used if some specific file is selected
        generateMenuClass: function(childItem) {
            let cssClass = "ready";

            // Check if there is any meta set for given route
            if (childItem.hasOwnProperty("meta") && childItem.meta.hasOwnProperty("restrictions")) {
                // Check if given meta contains any specific file restrictions
                if (childItem.meta.restrictions.hasOwnProperty("file") && childItem.meta.restrictions.file === true) {
                    cssClass = "notready";

                    for (const selectedFile of this.selectedFiles) {
                        if (childItem.meta.restrictions.extension.includes(selectedFile.extension)) {
                            cssClass = "ready";
                        }
                    }
                }

                // Check if given meta contains any specific file restrictions
                if (childItem.meta.restrictions.hasOwnProperty("action") && childItem.meta.restrictions.action === true) {
                    cssClass = "notready";
                    if (this.$store.getters.hasOwnProperty(childItem.meta.restrictions.actionType) && this.$store.getters[childItem.meta.restrictions.actionType] !== "") {
                        cssClass = "ready";
                    }
                }
            }
            // If we are browsing current path but that path is not valid anymore lets redirect user to main page
            if (cssClass === "notready" && this.$router.currentRoute.name === childItem.name) {
                this.$router.push({
                    path: "/"
                });
            }

            return cssClass;
        },
        checkRouteAction: function(event, data) {
            event.preventDefault();
            let pass = false;

            if (this.generateMenuClass(data) === "ready") {
                pass = true;
            }
            if (pass === true) {
                this.$router.push({
                    path: data.path
                });
            } else {
                this.$message({
                    message: this.$t('views.layout.components.Sidebar.action_not_allowed'),
                    type: "warning"
                });
            }
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~scss_vars";
.menu-wrapper {
    .notready {
        background: repeating-linear-gradient(-55deg, #222, #222 10px, #333 10px, #333 29px);
        opacity: 0.5;
        cursor: default;
        pointer-events: none;
    }
    .el-menu-item {
        color: #FFFFFF;
        height: 50px;
        line-height: 50px;
    }
    .is-active {
        background-color: #2A1B3B !important;
        &:before {
            content: "";
            display: block;
            position: absolute;
            width: 5px;
            background-color: #e3006e;
            height: 50px;
            left: 0;
        }
    }
}
</style>
