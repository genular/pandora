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
        <!-- System update overlay and notification -->
        <div v-if="systemUpdate">
            <div class="system_update-overlay"></div>
            <div class="system_update">
                <span>System update in progress. Please wait!</span>
            </div>
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
        ...mapGetters(["sidebar", "systemUpdate"]),
    },
    watch: {
        systemUpdate(newValue, oldValue) {
            // Check if the update was in progress and now it's finished
            if (oldValue === true && newValue === false) {
                console.log('System update completed, refreshing page...');
                window.location.reload();
            }
        }
    },
    mounted() {
        
        console.log("mounted: " + this.$options.name);

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

.system_update {
    position: fixed;
    top: 50%; // Center vertically
    left: 50%; // Center horizontally
    transform: translate(-50%, -50%); // Adjust to exact center
    background-color: rgba(255, 165, 0, 0.9); // Deep orange with opacity
    color: white;
    padding: 20px 40px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    font-size: 16px;
    z-index: 1050; // High z-index to ensure it is above the overlay

    span {
        font-weight: bold;
    }
}

.system_update-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); // Semi-transparent black background
    z-index: 1040; // Just below the update notification
    display: flex;
    justify-content: center;
    align-items: center;
}

@media (max-width: 768px) {
    .system_update {
        padding: 15px 30px;
        font-size: 14px;
    }
}

</style>
