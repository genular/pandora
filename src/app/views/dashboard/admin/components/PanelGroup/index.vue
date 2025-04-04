<template>
    <el-row class="dashboard-inner-panel-group" :gutter="15" justify="center" v-loading="listLoading" :element-loading-text="$t('globals.page_loading')">
        <el-col :xs="6" :sm="6" :lg="6" class="card-panel-col">
            <div class="card-panel">
                <div class="card-panel-icon-wrapper icon-1">
                    <i class="fa fa-icon fa-database card-panel-icon"></i>
                </div>
                <div class="card-panel-description">
                    <div class="card-panel-text">{{ $t("views.dashboard.admin.components.PanelGroup.tasks.title") }}</div>
                    <count-to class="card-panel-num" :startVal="0" :endVal="parseInt(statistics.total_queue || 0)" :duration="1500"></count-to>
                </div>
            </div>
        </el-col>
        <el-col :xs="6" :sm="6" :lg="6" class="card-panel-col">
            <div class="card-panel">
                <div class="card-panel-icon-wrapper icon-2">
                    <i class="fa fa-icon fa-filter card-panel-icon"></i>
                </div>
                <div class="card-panel-description">
                    <div class="card-panel-text">{{ $t("views.dashboard.admin.components.PanelGroup.datasets.title") }}</div>
                    <count-to class="card-panel-num" :startVal="0" :endVal="parseInt(statistics.total_resamples || 0)" :duration="2000"></count-to>
                </div>
            </div>
        </el-col>
        <el-col :xs="6" :sm="6" :lg="6" class="card-panel-col">
            <div class="card-panel">
                <div class="card-panel-icon-wrapper icon-3">
                    <i class="fa fa-icon fa-area-chart card-panel-icon"></i>
                </div>
                <div class="card-panel-description">
                    <div class="card-panel-text">{{ $t("views.dashboard.admin.components.PanelGroup.models.title") }}</div>
                    <count-to class="card-panel-num" :startVal="0" :endVal="parseInt(statistics.total_models || 0)" :duration="2500"></count-to>
                </div>
            </div>
        </el-col>
        <el-col :xs="6" :sm="6" :lg="6" class="card-panel-col">
            <div class="card-panel">
                <div class="card-panel-icon-wrapper icon-4">
                    <i class="fa fa-icon fa-cog card-panel-icon"></i>
                </div>
                <div class="card-panel-description">
                    <div class="card-panel-text">{{ $t("views.dashboard.admin.components.PanelGroup.features.title") }}</div>
                    <count-to class="card-panel-num" :startVal="0" :endVal="parseInt(statistics.total_features)" :duration="3000"></count-to>
                </div>
            </div>
        </el-col>
    </el-row>
</template>
<script>
import CountTo from "vue-count-to";
import { fetchServerStats } from "@/api/backend";

import { md5String } from "@/utils";

export default {
    components: {
        CountTo
    },
    data() {
        return {
            listLoading: true,
            updateInterval: null,
            statistics: {
                total_queue: 0,
                total_resamples: 0,
                total_models: 0,
                total_features: 0
            },
            statsHash: ""
        };
    },
    mounted() {
        // Initial Items request
        if (this.statsHash === "") {
            this.getServerStats();
        }
        // Set the timer to get new data each 60 seconds
        if (this.updateInterval === null) {
            this.updateInterval = setInterval(
                function() {
                    this.getServerStats();
                }.bind(this),
                30000
            );
        }
    },
    beforeDestroy: function() {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
    },
    methods: {
        getServerStats() {
            // Display loading only for initial request
            if (this.statsHash === "") {
                this.listLoading = true;
            }
            fetchServerStats()
                .then(response => {
                    const statistics = response.data.message;
                    const statsHash = md5String(JSON.stringify(statistics));
                    if (this.statsHash !== statsHash) {
                        this.statsHash = statsHash;
                        this.statistics = statistics;
                    }
                    if (this.listLoading === true) {
                        this.listLoading = false;
                    }
                })
                .catch(error => {
                    console.log("==> Cannot get server stats: " + error);
                });
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~scss_vars";
    
.dashboard-inner-panel-group {
    margin-bottom: 20px;
    .card-panel {
        height: 108px;
        cursor: pointer;
        font-size: 12px;
        position: relative;
        overflow: hidden;

        .card-panel-icon-wrapper {
            float: left;
            margin: 14px 0 0 14px;
            padding: 16px;
            transition: all 0.38s ease-out;
            border-radius: 6px;
        }
        .card-panel-icon {
            float: left;
            font-size: 48px;
        }
        .card-panel-description {
            float: right;
            font-weight: bold;
            margin: 26px;
            margin-left: 0px;

            .card-panel-text {
                line-height: 18px;
                font-size: 16px;
                margin-bottom: 12px;
                text-align: right;
            }

            .card-panel-num {
                font-size: 20px;
                text-align: right;
                width: 100%;
                display: block;
                color: $ui-background-secondary;
            }
        }
    }
}
</style>
