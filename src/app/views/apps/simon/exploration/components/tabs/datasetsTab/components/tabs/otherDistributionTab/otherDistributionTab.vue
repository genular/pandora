<template>
    <div class="otherDistributionTab-container">
        <div v-if="!isTabDisabled">
            <el-row v-if="statisticalData.length > 0">
                <el-col :span="24" style="text-align: center; padding: 25px; font-size: 24px">
                    This tab is not functional in this version and it's only a placeholder for future work.
                </el-col>
                <el-col :span="12">
                    <pie-chart className="chart3" :statisticalData="statisticalData"></pie-chart>
                </el-col>
                <el-col :span="12">
                    <bar-chart className="chart4" :statisticalData="statisticalData"></bar-chart>
                </el-col>
            </el-row>
        </div>
        <!-- ELSE if Tab is DISABLED -->
        <div v-else>
            <el-alert
                title="Notification"
                description="Unfortionatly this function is currently disabled"
                type="warning"
                style="margin-top: 20px"
                show-icon
                :closable="false"
            ></el-alert>
        </div>
    </div>
</template>
<script>
import pieChart from "./charts/pieChart";
import barChart from "./charts/barChart";

import { fetchDatasetStatisticsOther } from "@/api/plots";

export default {
    name: "otherDistributionTab",
    props: {
        columnName: {
            type: String,
            default: "",
        },
        isTabDisabled: {
            type: Boolean,
            default: true,
        },
    },
    components: { pieChart, barChart },
    data() {
        return {
            statisticalData: [],
        };
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
        if (!this.isTabDisabled) {
            if (this.statisticalData.length === 0) {
                this.handleFetchDatasetStatisticsOther();
            }
        }
    },
    computed: {
        selectedFeatureSetId: {
            get() {
                return this.$store.getters.simonExplorationSelectedFeatureSetId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedFeatureSetId", value);
            },
        },
    },
    methods: {
        handleFetchDatasetStatisticsOther() {
            fetchDatasetStatisticsOther({ resampleID: this.selectedFeatureSetId, column_name: this.columnName })
                .then((response) => {
                    console.log(response);
                    this.statisticalData = [1, 2, 3, 4, 5];
                    if (response.data.status === "success") {
                        this.statisticalData = [1, 2, 3, 4, 5];
                        console.log("==> TYPES: Boolean DONE!");
                    } else {
                        console.log(response.data);
                    }
                    this.loading = false;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
    },
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped></style>
