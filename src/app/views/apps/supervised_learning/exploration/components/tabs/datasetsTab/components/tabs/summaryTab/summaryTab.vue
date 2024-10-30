<template>
    <div class="summaryTab-container" v-loading="loading" element-loading-text="Processing...">
        <div v-if="!isTabDisabled">
            <el-row type="flex" align="top" :gutter="20">
                <el-col :span="24">
                    <el-row type="flex" align="top">
                        <el-col :span="24" style="text-align: center">
                            <span>Comparison of model performance measurements</span>
                            <el-button style="float: right" size="mini" round type="success" icon="el-icon-download" :disabled="summary.boxplot === false" @click="downloadPlotImage('boxplot')"></el-button>
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
            </el-row>
            <el-row type="flex" align="top" :gutter="20">
                <el-col :span="differencesColSpan" v-if="summary.info.differences">
                    <el-row type="flex" align="top">
                        <el-col :span="24" style="text-align: center">
                            <span>Performance measurements</span>
                            <el-button style="float: right" size="mini" round type="success" icon="el-icon-document-copy" @click="copyToClipboard(summary.info.differences, $event)"></el-button>
                        </el-col>
                    </el-row>
                    <div class="code-output">
                        <div class="highlight_code">
                            {{ summary.info.differences }}
                        </div>
                    </div>
                </el-col>
                <el-col :span="summaryColSpan" v-if="summary.info.summary">
                    <el-row type="flex" align="top">
                        <el-col :span="24" style="text-align: center">
                            <span>Model fitting result summaries</span>
                            <el-button style="float: right" size="mini" round type="success" icon="el-icon-document-copy" @click="copyToClipboard(summary.info.summary, $event)"></el-button>
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
            <el-alert title="Notification" description="Unfortionatly this function is currently disabled" type="warning" style="margin-top: 20px" show-icon :closable="false"></el-alert>
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
                info: {
                    summary: false,
                    differences: false,
                },
            },
        };
    },
    computed: {
        differencesColSpan() {
            // If there is no summary, expand to full width
            return this.summary.info.summary ? 12 : 24;
        },
        summaryColSpan() {
            // If there are no differences, expand to full width
            return this.summary.info.differences ? 12 : 24;
        },
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
    mounted() {
        console.log("mounted: summaryTab");
        if (this.isTabDisabled === false && this.selectedModelsIDs.length > 0) {
            this.handleFetchSummaryPlots();
        }
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
            const svgBlob = new Blob([window.atob(decodeURIComponent(svgImage.substring(26))) + "<!-- created by PANDORA: https://atomic-lab.org -->"], {
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

                    for (const [respIndex, respItem] of Object.entries(respData)) {
                        // Check if respItem is an object and not null
                        if (typeof respItem === "object" && respItem !== null) {
                            for (const [respSumIndex, encodedResult] of Object.entries(respItem)) {
                                try {
                                    // Safely decode base64 encoded results
                                    if (typeof encodedResult === 'string') {
                                        this.summary.info[respSumIndex] = window.atob(encodedResult);
                                    }
                                } catch (error) {
                                    console.error('Error decoding base64 string:', error);
                                    this.summary.info[respSumIndex] = false;
                                }
                            }
                        } else if (typeof respItem === 'string') {
                            // Check the length of the string response item
                            if (respItem.length < 15) {
                                this.summary[respIndex] = line_chart_404;
                            } else {
                                try {
                                    this.summary[respIndex] = encodeURIComponent(respItem);
                                } catch (error) {
                                    console.error('Error encoding URI component:', error);
                                    this.summary[respIndex] = false;
                                }
                            }
                        } else {
                            console.error('Unexpected data type in response:', typeof respItem);
                            console.log(respItem);
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
        },
    },
};

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.plot-placeholder {
    text-align: center;

    >i {
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
#summary-boxplot {}

#summary-rocplot {}

</style>
