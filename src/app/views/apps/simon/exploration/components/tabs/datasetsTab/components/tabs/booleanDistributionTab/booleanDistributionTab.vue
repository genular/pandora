<template>
    <div class="booleanDistributionTab-container" v-loading="isLoading">
        <el-row v-if="isLoading === false && statisticalData.types.length === 2">
            <el-col :span="12">
                <pie-chart className="chart1" :statisticalData="statisticalData"></pie-chart>
            </el-col>
            <el-col :span="12">
                <bar-chart className="chart2" :statisticalData="statisticalData"></bar-chart>
            </el-col>
        </el-row>
    </div>
</template>
<script>

import pieChart from "./charts/pieChart";
import barChart from "./charts/barChart";

import { fetchDatasetStatisticsBoolean } from "@/api/plots";

export default {
    name: "booleanDistributionTab",
    props: {
        columnName: {
            type: String,
            default: ""
        }
    },
    components: { pieChart, barChart },
    data() {
        return {
            isLoading: true,
            statisticalData: {
                types: []
            }
        };
    },
    mounted() {
        console.log("mounted: booleanDistributionTab");
        this.handleFetchDatasetStatisticsBoolean();
    },
    computed: {
        selectedFeatureSetId: {
            get() {
                return this.$store.getters.simonExplorationSelectedFeatureSetId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedFeatureSetId", value);
            }
        }
    },
    methods:  {
        handleFetchDatasetStatisticsBoolean() {
            this.isLoading = true;
            this.statisticalData.types = [];

            fetchDatasetStatisticsBoolean({resampleID: this.selectedFeatureSetId, column_name: this.columnName})
                .then((response) => {
                    console.log(response);
                    if (response.data.status === "success") {
                        this.statisticalData = response.data.data;
                    } else {
                        console.log(response.data);
                    }
                    this.isLoading = false;
                })
                .catch((error) => {
                    console.log(error);
                    this.isLoading = false;
                });
        }
    }
};
</script>
<style rel='stylesheet/scss' lang='scss'>

</style>
