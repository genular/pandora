<template>
    <scroll-bar>
        <el-menu class="sidebar-container" 
            mode="vertical" 
            :default-active="$route.path" 
            :collapse="isCollapse" 
            background-color="#35224a">
            <sidebar-item :routes="permission_routers"></sidebar-item>
        </el-menu>
        <genular-bottom></genular-bottom>
    </scroll-bar>
</template>
<script>
import { mapGetters } from "vuex";

import ScrollBar from "@/components/ScrollBar";
import SidebarItem from "./SidebarItem";

import GenularBottom from "@/components/GenularBottom";

export default {
    components: {
        SidebarItem,
        ScrollBar,
        GenularBottom
    },
    computed: {
        ...mapGetters(["permission_routers", "sidebar"]),
        isCollapse() {
            return !this.sidebar.opened;
        }
    }
};
</script>
