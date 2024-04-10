<template>
    <div class="summaryTab-container" v-loading="loading" element-loading-text="Processing...">
        <div v-if="!isTabDisabled">
            <el-row type="flex" align="top" :gutter="20">
                <el-col :span="12">
                    <el-row type="flex" align="top">
                        <el-col :span="24" style="text-align: center">
                            <span>Comparison of model performance measurements</span>
                            <el-button
                                style="float: right"
                                size="mini"
                                round
                                type="success"
                                icon="el-icon-download"
                                :disabled="summary.boxplot === false"
                                @click="downloadPlotImage('boxplot')"
                            ></el-button>
                        </el-col>
                    </el-row>
                    <!-- SVG Plot placeholder -->
                    <div v-if="summary.boxplot !== false" style="text-align: center">
                        <img id="summary-boxplot" style="margin: 0 auto" class="animated fadeIn" :src="'data:image/png;base64,' + summary.boxplot_png" fit="scale-down" />
                    </div>
                    <div class="plot-placeholder" v-else>
                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                    </div>
                </el-col>
                <el-col :span="12">
                    <el-row type="flex" align="top">
                        <el-col :span="24" style="text-align: center">
                            <span>ROC curve charts comparison</span>
                            <el-button
                                style="float: right"
                                size="mini"
                                round
                                type="success"
                                icon="el-icon-download"
                                :disabled="summary.rocplot === false"
                                @click="downloadPlotImage('rocplot')"
                            ></el-button>
                        </el-col>
                    </el-row>
                    <!-- SVG Plot placeholder -->
                    <div v-if="summary.rocplot !== false" style="text-align: center">
                        <img id="summary-rocplot" style="margin: 0 auto" class="animated fadeIn" :src="'data:image/png;base64,' + summary.rocplot_png" fit="scale-down" />
                    </div>
                    <div class="plot-placeholder" v-else>
                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                    </div>
                </el-col>
            </el-row>

            <el-row type="flex" align="top" :gutter="20">
                <el-col :span="12" v-if="summary.info.differences">
                    <el-row type="flex" align="top">
                        <el-col :span="24" style="text-align: center">
                            <span>Performance measurements</span>
                            <el-button
                                style="float: right"
                                size="mini"
                                round
                                type="success"
                                icon="el-icon-document-copy"
                                @click="copyToClipboard(summary.info.differences, $event)"
                            ></el-button>
                        </el-col>
                    </el-row>
                    <div class="code-output">
                        <div class="highlight_code">
                            {{ summary.info.differences }}
                        </div>
                    </div>
                </el-col>
                <el-col :span="12" v-if="summary.info.summary">
                    <el-row type="flex" align="top">
                        <el-col :span="24" style="text-align: center">
                            <span>Model fitting result summaries</span>
                            <el-button
                                style="float: right"
                                size="mini"
                                round
                                type="success"
                                icon="el-icon-document-copy"
                                @click="copyToClipboard(summary.info.summary, $event)"
                            ></el-button>
                        </el-col>
                    </el-row>
                    <div class="code-output">
                        <div class="highlight_code">
                            {{ summary.info.summary }}
                        </div>
                    </div>
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
import { fetchGraphSummary } from "@/api/plots";
import { md5String } from "@/utils";
import clipboard from "@/utils/clipboard";

import line_chart_404 from "@/assets/404_images/charts/line_chart.svg";

export default {
    name: "summaryTab",
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
    data() {
        return {
            loading: false,
            summary: {
                boxplot: false,
                boxplot_png: false,
                rocplot: false,
                rocplot_png: false,
                info: {
                    summary: false,
                    differences: false,
                },
            },
        };
    },
    computed: {
        selectedOutcomeOptions: {
            get() {
                return this.$store.getters.pandoraExplorationSelectedOutcomeOptions;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedOutcomeOptions", value);
            },
        },
        selectedOutcomeOptionsIDs: {
            get() {
                return this.$store.getters.pandoraExplorationSelectedOutcomeOptionsIDs;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedOutcomeOptionsIDs", value);
            }
        },
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
                return this.$store.getters.pandoraExplorationSelectedFeatureSetId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedFeatureSetId", value);
            },
        },
        selectedModelsIDs: {
            get() {
                return this.$store.getters.pandoraExplorationSelectedModelId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedModelId", value);
            },
        },
    },
    methods: {
        copyToClipboard(content, event) {
            clipboard(content, event);
        },

        downloadPlotImage(imageType, itemIndex = null) {
            if (typeof this.summary[imageType] === "undefined") {
                return;
            }
            let svgString = "";
            let downloadName = this.$options.name + "_" + imageType;
            if (itemIndex !== null) {
                if (typeof this.summary[imageType][itemIndex] !== "undefined") {
                    svgString = this.summary[imageType][itemIndex].svg;
                    downloadName = downloadName + "_" + itemIndex;
                }
            } else {
                svgString = this.summary[imageType];
            }
            if (svgString === "") {
                return;
            }

            downloadName = downloadName + ".svg";

            const svgImage = "data:image/svg+xml;base64," + svgString;
            const svgBlob = new Blob([window.atob(decodeURIComponent(svgImage.substring(26))) + "<!-- created by PANDORA: https://genular.org -->"], {
                type: "image/svg+xml;charset=utf-8",
            });

            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = downloadName;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        },

        handleFetchSummaryPlots() {
            this.loading = true;

            fetchGraphSummary({
                resampleID: this.selectedFeatureSetId,
                modelsIDs: JSON.stringify(this.selectedModelsIDs),
            })
                .then((response) => {
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
                                this.summary[respIndex] = encodeURIComponent(respItem);
                            }
                        }
                    }
                    this.loading = false;
                })
                .catch((error) => {
                    this.$message({
                        message: this.$t("globals.errors.request_general"),
                        type: "error",
                    });
                    console.log(error);
                    this.loading = false;
                });
        },
    },
    watch: {
        /**
         * Watch for model selection change
         * @param  {[type]} newVal [description]
         * @param  {[type]} oldVal [description]
         * @return {[type]}        [description]
         */
        selectedModelsIDs: function (newVal, oldVal) {
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
        isTabDisabled: function (newVal, oldVal) {
            if (newVal === false) {
                this.handleFetchSummaryPlots();
            }
        },
    },
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.plot-placeholder {
    text-align: center;
    > i {
        font-size: 256px;
        color: #333333;
    }
}

.code-output {
    max-height: 350px;
    font-size: 12px;
    overflow: auto;
    margin-top: 15px;
    pre {
        margin: 0;
        code {
            max-height: 300px;
        }
    }
}
/* Graphs */
#summary-boxplot {
}
#summary-rocplot {
}
</style>
