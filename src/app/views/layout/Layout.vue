<template>
    <div>
        <div class="app-wrapper" :class="{ showSidebar: sidebar.opened, hideSidebar: !sidebar.opened }">
            <sidebar class="sidebar-container"></sidebar>
            <div class="main-container">
                <navbar></navbar>
                <tags-view></tags-view>
                <app-main></app-main>
            </div>
        </div>
        <div class="unsupported_device">
            <span>{{ $t("globals.errors.unsupported_device") }}</span>
        </div>
    </div>
</template>
<script>
import { mapGetters } from "vuex";
import { Navbar, Sidebar, AppMain, TagsView } from "./components";

export default {
    name: "layout",
    components: {
        Navbar,
        Sidebar,
        AppMain,
        TagsView,
    },
    computed: {
        ...mapGetters(["sidebar"]),
    },
    mounted() {
        this.$nextTick(function () {
            window.addEventListener("online", this.changeOnlineStatus);
            window.addEventListener("offline", this.changeOnlineStatus);
            // Init
            this.changeOnlineStatus();
        });
    },
    methods: {
        changeOnlineStatus() {
            this.$store.dispatch("setIsOnline", navigator.onLine);
        },
    },
    beforeDestroy() {
        window.removeEventListener("online", this.changeOnlineStatus);
        window.removeEventListener("offline", this.changeOnlineStatus);
    },
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.app-wrapper {
    height: 100%;
    display: flex;
    width: 100%;
    float: left;
}
</style>
