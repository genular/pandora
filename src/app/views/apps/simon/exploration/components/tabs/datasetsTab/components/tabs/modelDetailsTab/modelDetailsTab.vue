<template>
    <div class="modelDetailsTab-container" v-loading="loading" element-loading-text="Processing...">

        <el-row type="flex" align="top">
            <el-col :span="24">
                <el-tabs tab-position="left">
                    <el-tab-pane label="AUC/ROC">AUC/ROC</el-tab-pane>
                    <el-tab-pane label="Feature importance">Feature importance</el-tab-pane>
                    <el-tab-pane label="Partial Dependence & ICE">Partial Dependence & ICE</el-tab-pane>
                    <el-tab-pane label="Feature interaction">Feature interaction</el-tab-pane>
                    <el-tab-pane label="breakDown">breakDown</el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { fetchGraphModelSummary } from "@/api/plots";
import { md5String } from "@/utils";
import clipboard from "@/utils/clipboard";

import line_chart_404 from "@/assets/404_images/charts/line_chart.svg";

export default {
    name: "summaryTab",
    props: {
        columnName: {
            type: String,
            default: ""
        },
        isTabDisabled: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            loading: false,
            summary: {
                boxplot: false,
                rocplot: false,
                info: {
                    summary: false,
                    differences: false
                }
            }
        };
    },
    mounted() {
        console.log("mounted: summaryTab");
        if (this.isTabDisabled === false) {
            this.handleFetchSummaryPlots();
        }
    },
    computed: {
        selectedFeatureSetId: {
            get() {
                return this.$store.getters.simonExplorationSelectedFeatureSetId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedFeatureSetId", value);
            }
        },
        selectedModelsIDs: {
            get() {
                return this.$store.getters.simonExplorationSelectedModelId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedModelId", value);
            }
        }
    },
    methods: {
        handleFetchSummaryPlots() {
            this.loading = true;

            fetchGraphModelSummary({
                resampleID: this.selectedFeatureSetId,
                modelsIDs: JSON.stringify(this.selectedModelsIDs)
            })
                .then(response => {
                    let respData = response.data.message;
                    // Update the image data.
                    // list( boxplot = NULL, rocplot = NULL, info = list(summary = NULL, differences = NULL))
                    for (let respIndex in respData) {
                        let respItem = respData[respIndex];

                        // This is true if no plot is in question
                        if (typeof respItem === "object") {
                            for (let respsumIndex in respItem) {
                                 // Decode base64 encoded results
                                this.summary.info[respsumIndex] = window.atob(respItem[respsumIndex]);
                            }
                        } else {
                            if (respItem.length < 15) {
                                this.summary[respIndex] = line_chart_404;
                            } else {
                               this.summary[respIndex] = "data:image/svg+xml;base64," + encodeURIComponent(respItem);
                            }
                        }
                    }
                    this.loading = false;
                })
                .catch(error => {
                    this.$message({
                        message: this.$t("globals.errors.request_general"),
                        type: "error"
                    });
                    console.log(error);
                    this.loading = false;
                });
        }
    },
    watch: {
        /**
         * Watch for model selection change
         * @param  {[type]} newVal [description]
         * @param  {[type]} oldVal [description]
         * @return {[type]}        [description]
         */
        selectedModelsIDs: function(newVal, oldVal) {
            console.log("summaryTab getting new handleFetchSummaryPlots based on model change");
            if (this.isTabDisabled === false) {
                // Remove any previously selected variables
                this.handleFetchSummaryPlots();
            }
        },
        /**
         * Once tab is enabled lets load the data
         * @param  boolean  newVal New item value
         * @param  boolean  oldVal Old item value
         * @return null
         */
        isTabDisabled: function(newVal, oldVal) {
            if (newVal === false) {
                this.handleFetchSummaryPlots();
            }
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>

</style>
