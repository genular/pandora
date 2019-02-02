<template>
    <div class="summaryTab-container" v-loading.fullscreen.lock="loading" element-loading-text="Processing...">
        <el-row type="flex" align="top">
            <el-col :span="12">
                <el-row type="flex" align="top">
                    <el-col :span="12" style="text-align: right;">
                        <span>Model comparison</span>
                    </el-col>
                    <el-col :span="12" style="text-align: right;">
                        <el-button
                            size="mini"
                            round
                            type="primary"
                            icon="el-icon-download"
                            :disabled="summary.boxplot === false"
                            @click="downloadPlotImage('boxplot')"
                        >
                        </el-button>
                    </el-col>
                </el-row>
                <object
                    id="summary-boxplot" 
                    style="margin: 0 auto;" 
                    :data="summary.boxplot" 
                    type="image/svg+xml">
                </object>
            </el-col>
            <el-col :span="12">
                <el-row type="flex" align="top">
                    <el-col :span="12" style="text-align: right;">
                        <span>ROC summary</span>
                    </el-col>
                    <el-col :span="12" style="text-align: right;">
                        <el-button
                            size="mini"
                            round
                            type="primary"
                            icon="el-icon-download"
                            :disabled="summary.rocplot === false"
                            @click="downloadPlotImage('rocplot')"
                        >
                        </el-button>
                    </el-col>
                </el-row>
                <object id="summary-rocplot" style="margin: 0 auto;" :data="summary.rocplot" type="image/svg+xml"></object>
            </el-col>
        </el-row>

        <el-row type="flex" align="top" v-if="summary.info.differences || summary.info.summary">
            <el-col :span="12" v-if="summary.info.differences">
                <el-row type="flex" align="top">
                    <el-col :span="12" style="text-align: left;">
                        <span>Statistics</span>
                    </el-col>
                    <el-col :span="12" style="text-align: right;">
                        <el-button size="mini" round type="primary" icon="el-icon-download" @click="copyToClipboard(summary.info.differences, $event)"></el-button>
                    </el-col>
                </el-row>
                <pre class="code-output" v-highlightjs="summary.info.differences"><code class="bash"></code></pre>
            </el-col>
            <el-col :span="12" v-if="summary.info.summary">
                <el-row type="flex" align="top">
                    <el-col :span="12" style="text-align: left;">
                        <span>Raw data</span>
                    </el-col>
                    <el-col :span="12" style="text-align: right;">
                        <el-button size="mini" round type="primary" icon="el-icon-download" @click="copyToClipboard(summary.info.summary, $event)"></el-button>
                    </el-col>
                </el-row>
                <pre class="code-output" v-highlightjs="summary.info.summary"><code class="bash"></code></pre>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { fetchGraphSummary } from "@/api/plots";
import { md5String } from "@/utils";
import clipboard from "@/utils/clipboard";

import line_chart_404 from "@/assets/404_images/charts/line_chart.svg";

export default {
    name: "summaryTab",

    data() {
        return {
            loading: true,
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
        this.handleFetchSummaryPlots();
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
        copyToClipboard(content, event) {
            clipboard(content, event);
        },
        downloadPlotImage(summaryID) {
            const svgBlob = new Blob([decodeURIComponent(this.summary[summaryID].substring(24))], { type: "image/svg+xml;charset=utf-8" });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = "summary-" + summaryID + ".svg";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        },
        handleFetchSummaryPlots() {
            this.loading = true;

            fetchGraphSummary({
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
                    console.log(error);
                    this.loading = false;
                });
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.code-output {
    max-width: 90%;
    height: 300px;
    overflow: auto;
    font-size: 11px;
}
</style>
