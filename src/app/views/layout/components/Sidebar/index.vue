<template>
    <scroll-bar>
        <el-menu class="sidebar-container" mode="vertical" :default-active="$route.path" :collapse="isCollapse" background-color="#35224a">
            <sidebar-item :routes="permission_routers"></sidebar-item>
        </el-menu>
        <server-load :currentServerLoad="currentServerLoad"></server-load>
        <genular-bottom></genular-bottom>
    </scroll-bar>
</template>
<script>
import { mapGetters } from "vuex";

import ScrollBar from "@/components/ScrollBar";
import SidebarItem from "./SidebarItem";

import GenularBottom from "@/components/GenularBottom";
import ServerLoad from "@/components/ServerLoad";

// Import fetchServerLoad from api/backend
// import { fetchServerLoad } from "@/api/backend";


export default {
    name: "Sidebar",
    components: {
        SidebarItem,
        ScrollBar,
        GenularBottom,
        ServerLoad,
    },
    data() {
        return {
            currentServerLoad: 0,
            serverLoadUpdate: false,
            serverLoadUpdateInterval: 5000
        };
    },
    computed: {
        ...mapGetters(["permission_routers", "sidebar", "backendServerLoad"]),
        isCollapse() {
            return !this.sidebar.opened;
        },
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
        this.updateServerLoad();
        this.setUpdateInterval();
    },
    methods: {
        setUpdateInterval(){
            this.serverLoadUpdate = setInterval(() => {
                this.updateServerLoad();
            }, this.serverLoadUpdateInterval);
        },
        updateServerLoad() {
            this.$store
                .dispatch("setBackendServerLoad")
                .then(status => {
                    if (status === true && "cpu" in this.backendServerLoad) {
                        this.currentServerLoad = this.backendServerLoad.cpu;
                        if(this.currentServerLoad > 75 && this.serverLoadUpdateInterval === 5000){
                            this.serverLoadUpdateInterval = 60000;
                            clearInterval(this.serverLoadUpdate);
                            this.setUpdateInterval();
                        }else if(this.currentServerLoad < 75 && this.serverLoadUpdateInterval === 60000){
                            this.serverLoadUpdateInterval = 5000;
                            clearInterval(this.serverLoadUpdate);
                            this.setUpdateInterval();
                        }
                    }
                })
                .catch(error => {
                    console.log("==> setBackendServerLoad: ")
                    console.log(error);
                });
        }
    },
    beforeDestroy() {
        clearInterval(this.serverLoadUpdate)
    }
};

</script>
