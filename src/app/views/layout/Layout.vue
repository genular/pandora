<template>
    <div>
        <!-- <traybar></traybar> -->
        <div class="app-wrapper" :class="{ showSidebar: sidebar.opened, 'hideSidebar': !sidebar.opened }">
            <sidebar class="sidebar-container"></sidebar>
            <div class="main-container">
                <navbar></navbar>
                <tags-view></tags-view>
                <app-main></app-main>
            </div>
        </div>
    </div>
</template>
<script>
import { mapGetters } from "vuex";
import { Traybar, Navbar, Sidebar, AppMain, TagsView } from "./components";

export default {
    name: "layout",
    components: {
        Traybar,
        Navbar,
        Sidebar,
        AppMain,
        TagsView
    },
    computed: {
        ...mapGetters(["sidebar"])
    },
    mounted() {
        this.$nextTick(function() {
            window.addEventListener("online", this.changeOnlineStatus);
            window.addEventListener("offline", this.changeOnlineStatus);
            // Init
            this.changeOnlineStatus();
        });
    },
    methods: {
        changeOnlineStatus() {
            this.$store.dispatch("setIsOnline", navigator.onLine);
        }
    },
    beforeDestroy() {
        window.removeEventListener("online", this.changeOnlineStatus);
        window.removeEventListener("offline", this.changeOnlineStatus);
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~scss_vars";
.app-wrapper {
    height: 100%;
    display: flex;
    width: 100%;
    float: left;
}
</style>
