<template>
    <section class="app-main">
        <div class="app-main-inner">
            <transition name="fade" mode="out-in">
                <keep-alive :include="cachedViews">
                    <router-view></router-view>
                </keep-alive>
            </transition>
        </div>
    </section>
</template>
<script>
import { mapGetters } from "vuex";

export default {
    name: "AppMain",
    data() {
        return {
            loadingSpinner: false
        };
    },
    computed: {
        ...mapGetters(["cachedViews", "is_online"])
    },
    mounted() {
        console.log("AppMain mounted, on-line: " + this.is_online);
    },
    methods: {
        serviceUnavaliable() {
            this.loadingSpinner = this.$loading({
                lock: true,
                target: ".app-main-inner",
                customClass: "lost-connectivity",
                text: this.$t('views.layout.components.AppMain.connection_lost'),
                spinner: "el-icon-loading",
                background: "rgba(255, 255, 255, 0)"
            });
        },
        toggleLoading() {
            if (this.is_online === true) {
                if (this.loadingSpinner !== false) {
                    this.loadingSpinner.close();
                }
            } else {
                this.serviceUnavaliable();
            }
        }
    },
    watch: {
        is_online: function(value) {
            this.toggleLoading();
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
@import "~scss_vars";
.app-main {
    width: 100%;
    height: 100%;

    .app-main-inner {
        width: 100%;
        min-width: 1000px;

        height: 100%;
        overflow: auto;
        padding-top: 10px;

        .app-container {

            padding-right: 10px;
            padding-left: 10px;
            padding-bottom: 120px;
        }

        .lost-connectivity {
            .el-icon-loading {
                font-size: 64px;
            }
            .el-loading-text {
                background-color: #35224a;
                color: #fff;
                font-weight: bold;
                padding: 10px;
                font-size: 18px;
            }
        }
    }
}
</style>
