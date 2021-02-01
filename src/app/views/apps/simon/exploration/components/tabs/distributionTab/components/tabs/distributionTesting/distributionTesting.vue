<template>
    <div class="distributionTesting-container">
        <div v-if="!isTabDisabled">
            <el-row>
                <el-col :span="8" v-loading="listLoading" element-loading-text="Processing...">
                    <div v-if="plot_data.histogram_png !== false" style="text-align: center;">
                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                            <div slot="content">
                                <el-button type="success" round @click="downloadPlotImage('histogram')">Download (.svg)</el-button>
                            </div>
                            <img id="distribution_training_histogram" class="animated fadeIn distribution_images" :src="'data:image/png;base64,' + plot_data.histogram_png" fit="scale-down">
                        </el-tooltip>
                    </div>
                    <div class="plot-placeholder" v-else>
                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                    </div>
                </el-col>
                <el-col :span="8" v-loading="listLoading" element-loading-text="Processing...">
                    <div v-if="plot_data.density_png !== false" style="text-align: center;">
                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                            <div slot="content">
                                <el-button type="success" round @click="downloadPlotImage('density')">Download (.svg)</el-button>
                            </div>
                            <img id="distribution_training_density" class="animated fadeIn distribution_images" :src="'data:image/png;base64,' + plot_data.density_png" fit="scale-down">
                        </el-tooltip>
                    </div>
                    <div class="plot-placeholder" v-else>
                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                    </div>
                </el-col>
                <el-col :span="8" v-loading="listLoading" element-loading-text="Processing...">
                    <div v-if="plot_data.boxplot_png !== false" style="text-align: center;">
                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                            <div slot="content">
                                <el-button type="success" round @click="downloadPlotImage('boxplot')">Download (.svg)</el-button>
                            </div>
                            <img id="distribution_training_boxplot" class="animated fadeIn distribution_images" :src="'data:image/png;base64,' + plot_data.boxplot_png" fit="scale-down">
                        </el-tooltip>
                    </div>
                    <div class="plot-placeholder" v-else>
                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                    </div>
                </el-col>
            </el-row>
        </div>
        <div v-else>
            <el-alert title="Notification" description="Unfortionatly this function is currently disabled" type="warning" style="margin-top: 20px;" show-icon :closable="false">
            </el-alert>
        </div>
    </div>
</template>
<script>

import { fetchGraphDistribution } from "@/api/plots";
import line_chart_404 from "@/assets/404_images/charts/line_chart.svg";

export default {
    name: "distributionTesting",

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
            listLoading: false,
            plot_data: {
                histogram: false,
                histogram_png: false,
                density: false,
                density_png: false,
                boxplot: false,
                boxplot_png: false,
            }
        };
    },
    mounted() {
        console.log("mounted: " + this.$options.name);

        if (this.isTabDisabled === false) {
            this.handleFetchDistributionPlot();
        }

        if (this.isTabDisabled === false && this.listLoading === false && this.plot_data.histogram === false) {
            this.handleFetchVariableImp();
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
        }
    },
    methods: {
        downloadPlotImage(imageType) {
            if(typeof this.plot_data[imageType] === "undefined"){
                return;
            }

            const svgImage = "data:image/svg+xml;base64," + this.plot_data[imageType];

            const svgBlob = new Blob([window.atob(decodeURIComponent(svgImage.substring(26))) + "<!-- created by SIMON: https://genular.org -->"], {
                type: "image/svg+xml;charset=utf-8"
            });

            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = this.$options.name + "_"+ imageType +".svg";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        },
        handleFetchDistributionPlot() {
            this.listLoading = true;

            fetchGraphDistribution({
                resampleID: this.selectedFeatureSetId,
                remoteDataset: this.$options.name
            })
                .then(response => {
                    let respData = response.data.message;
                    // Update the image data.
                    // list( boxplot = NULL, rocplot = NULL, info = list(summary = NULL, differences = NULL))
                    for (let respIndex in respData) {
                        let respItem = respData[respIndex];
                        if (respItem.length < 15) {
                            this.plot_data[respIndex] = line_chart_404;
                        } else {
                           this.plot_data[respIndex] = encodeURIComponent(respItem);
                        }
                    }
                    this.listLoading = false;
                })
                .catch(error => {
                    this.$message({
                        message: this.$t("globals.errors.request_general"),
                        type: "error"
                    });
                    console.log(error);
                    this.listLoading = false;
                });
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
    .el-tooltip__popper.is-light[x-placement^=top] .popper__arrow{
        border-top-color: transparent !important;
        border: 0 !important;
    }

    .el-tooltip__popper.is-light[x-placement^=top] .popper__arrow:after {
        border-top-color: transparent !important;
        border: 0 !important;
    }

    .download_tooltip {
      background: none !important;
      border: none !important;
      border-top-color:  transparent !important;
    }
</style>
