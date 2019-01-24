<template>
    <div class="correlationTab-container">
        <el-row v-if="tabEnabled">
            <el-row type="flex" align="top">
                <el-col :span="24" style="text-align: right;">
                    <el-button type="primary" icon="el-icon-download" :disabled="renderedImage === '' || loadingPlot" @click="downloadPlotImage"></el-button>
                </el-col>
            </el-row>
            <el-row type="flex" align="top">
                <el-col :span="7">
                    <el-form ref="settingsForm" :model="settingsForm" label-width="200px">
                        <el-form-item :label="$t('views.exploratory.tabs.correlationTab.settings.correlation_method')">
                            <el-select v-model="settingsForm.correlation_method" placeholder="Select">
                                <el-option
                                    v-for="(item, index) in settingOptions.correlation_method"
                                    :key="index"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="$t('views.exploratory.tabs.correlationTab.settings.na_action')">
                            <el-select v-model="settingsForm.na_action" placeholder="Select">
                                <el-option
                                    v-for="(item, index) in settingOptions.na_action"
                                    :key="index"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>


                        <el-form-item v-if="settingsForm.confidence.enable === false" :label="$t('views.exploratory.tabs.correlationTab.settings.plot_method')">
                            <el-select v-model="settingsForm.plot_method" placeholder="Select">
                                <el-option
                                    v-for="(item, index) in settingOptions.plot_method"
                                    :key="index"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>


                        <el-form-item v-if="settingsForm.plot_method === 'mixed' && settingsForm.confidence.enable === false" :label="$t('views.exploratory.tabs.correlationTab.settings.plot_method_mixed.lower_method')">
                            <el-select v-model="settingsForm.plot_method_mixed.lower_method" placeholder="Select">
                                <el-option
                                    v-for="(item, index) in settingOptions.plot_method_mixed.lower_method"
                                    :key="index"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item v-if="settingsForm.plot_method === 'mixed' && settingsForm.confidence.enable === false" :label="$t('views.exploratory.tabs.correlationTab.settings.plot_method_mixed.upper_method')">
                            <el-select v-model="settingsForm.plot_method_mixed.upper_method" placeholder="Select">
                                <el-option
                                    v-for="(item, index) in settingOptions.plot_method_mixed.upper_method"
                                    :key="index"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item  v-if="settingsForm.plot_method !== 'mixed'" :label="$t('views.exploratory.tabs.correlationTab.settings.plot_type')">
                            <el-select v-model="settingsForm.plot_type" placeholder="Select">
                                <el-option
                                    v-for="(item, index) in settingOptions.plot_type"
                                    :key="index"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="$t('views.exploratory.tabs.correlationTab.settings.reorder_correlation')">
                            <el-select v-model="settingsForm.reorder_correlation" placeholder="Select">
                                <el-option
                                    v-for="(item, index) in settingOptions.reorder_correlation"
                                    :key="index"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item v-if="settingsForm.reorder_correlation === 'hclust'" :label="$t('views.exploratory.tabs.correlationTab.settings.reorder_correlation_hclust.method')">
                            <el-select v-model="settingsForm.reorder_correlation_hclust.method" placeholder="Select">
                                <el-option
                                    v-for="(item, index) in settingOptions.reorder_correlation_hclust.method"
                                    :key="index"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item v-if="settingsForm.reorder_correlation === 'hclust'" :label="$t('views.exploratory.tabs.correlationTab.settings.reorder_correlation_hclust.number_of_rectangles')">
                            <el-input-number v-model="settingsForm.reorder_correlation_hclust.number_of_rectangles" :min="1"></el-input-number>
                        </el-form-item>
                        <el-form-item :label="$t('views.exploratory.tabs.correlationTab.settings.text_size')">
                            <el-input-number v-model="settingsForm.text_size.value" :value="settingsForm.text_size.value" :min="settingOptions.text_size.min" :max="settingOptions.text_size.max" :step="settingOptions.text_size.step" controls-position="right"></el-input-number>
                        </el-form-item>
                        <el-form-item :label="$t('views.exploratory.tabs.correlationTab.settings.significance.enable')">
                            <el-checkbox v-model="settingsForm.significance.enable"></el-checkbox>
                        </el-form-item>
                        <el-form-item :label="$t('views.exploratory.tabs.correlationTab.settings.significance.level')" v-if="settingsForm.significance.enable === true">
                            <el-input-number v-model="settingsForm.significance.level.value" :value="settingsForm.significance.level.value" :min="settingOptions.significance.level.min" :max="settingOptions.significance.level.max" :step="settingOptions.significance.level.step" controls-position="right"></el-input-number>
                        </el-form-item>
                        <el-form-item :label="$t('views.exploratory.tabs.correlationTab.settings.significance.insignificant_action')" v-if="settingsForm.significance.enable === true">
                            <el-select v-model="settingsForm.significance.insignificant_action" placeholder="Select">
                                <el-option
                                    v-for="(item, index) in settingOptions.significance.insignificant_action"
                                    :key="index"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="$t('views.exploratory.tabs.correlationTab.settings.confidence.enable')">
                            <el-checkbox v-model="settingsForm.confidence.enable"></el-checkbox>
                        </el-form-item>
                        <el-form-item :label="$t('views.exploratory.tabs.correlationTab.settings.confidence.level')" v-if="settingsForm.confidence.enable === true">
                            <el-input-number v-model="settingsForm.confidence.level.value" :min="settingOptions.confidence.level.min" :max="settingOptions.confidence.level.max" :step="settingOptions.confidence.level.step" controls-position="right"></el-input-number>
                        </el-form-item>
                        <el-form-item :label="$t('views.exploratory.tabs.correlationTab.settings.confidence.ploting_method')" v-if="settingsForm.confidence.enable === true">
                            <el-select v-model="settingsForm.confidence.ploting_method" placeholder="Select">
                                <el-option
                                    v-for="(item, index) in settingOptions.confidence.ploting_method"
                                    :key="index"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" :loading="loadingPlot" round @click="redrawImage">Plot</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="17" class="correlation-svg-container" v-loading="loadingPlot" element-loading-text="Processing..." style="text-align: center;">
                    <object id="correlation-svg" style="margin: 0 auto;" :data="renderedImage" type="image/svg+xml"></object>
                </el-col>
            </el-row>
        </el-row>
        <!-- ELSE if Tab is DISABLED -->
        <el-row v-else>
            <el-col :span="24">
                <el-alert title="Notification:" description="This function is disabled for selected feature set since its still not supported to calculate correlation for sets that have more than 250 features." type="warning" style="margin-top: 20px;" show-icon :closable="false"> </el-alert>
            </el-col>
        </el-row>

    </div>
</template>
<script>
import { fetchCorrPlotOptions, fetchCorrPlotImage } from "@/api/plots";
import { md5String } from "@/utils";

import line_chart_404 from "@/assets/404_images/charts/line_chart.svg";

export default {
    name: "correlationTab",
    props: {
        jobDetailsData: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            // This tab is disabled and we will enable it on initialization if there is no too much data
            tabEnabled: false,
            loadingOptions: true,
            loadingPlot: true,
            renderedImage: "",
            renderedImageData: "",
            settingOptions: {
                correlation_method: [],
                na_action: [],
                // Only if confidence.enable is false
                plot_method: [],
                plot_method_mixed: {
                    lower_method: [],
                    upper_method: []
                },
                // Only if plot_method is not mixed
                plot_type: [],
                reorder_correlation: [],
                reorder_correlation_hclust: {
                    method: [],
                    number_of_rectangles: 3
                },
                text_size: {
                    value: 0.4,
                    min: 0.2,
                    max: 3,
                    step: 0.2
                },
                significance: {
                    enable: false,
                    level: {
                        value: 0.05,
                        min: 0,
                        max: 1,
                        step: 0.05
                    },
                    insignificant_action: []
                },
                confidence: {
                    enable: false,
                    ploting_method: [],
                    level: {
                        value: 0.95,
                        min: 0,
                        max: 1,
                        step: 0.05
                    }
                }
            },
            settingsForm: {
                correlation_method: "pearson",
                na_action: "everything",
                // Only if confidence.enable is false
                plot_method: "circle",
                plot_method_mixed: {
                    lower_method: "circle",
                    upper_method: "circle"
                },
                // Only if plot_method is not mixed
                plot_type: "full",
                reorder_correlation: "original",
                reorder_correlation_hclust: {
                    method: "complete",
                    number_of_rectangles: 3
                },
                text_size: {
                    value: 0.4,
                    min: 0.2,
                    max: 3,
                    step: 0.2
                },
                significance: {
                    enable: false,
                    level: {
                        value: 0.05,
                        min: 0,
                        max: 1,
                        step: 0.05
                    },
                    insignificant_action: "pch"
                },
                confidence: {
                    enable: false,
                    ploting_method: "square",
                    level: {
                        value: 0.95,
                        min: 0,
                        max: 1,
                        step: 0.05
                    }
                }
            }
        };
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
    mounted() {
        console.log("mounted: correlationTab");

        const featureSet = this.jobDetailsData.resamplesList.filter(resample => resample.resampleID === this.selectedFeatureSetId)[0];

        if(featureSet.featuresTotal < 250){
            this.tabEnabled = true;
            if(this.settingOptions.correlation_method.length < 1){
                this.handleFetchCorrPlotOptions();
            }
            if(this.renderedImage === ""){
                this.handleFetchCorrPlotImage();
            }
        }else{

        }

    },
    methods:  {
        redrawImage(){
            this.handleFetchCorrPlotImage();
        },
        downloadPlotImage() {
            const svgBlob = new Blob([this.renderedImageData], { type: "image/svg+xml;charset=utf-8" });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = "correlation-plot.svg";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        },
        handleFetchCorrPlotOptions() {
            this.loadingOptions = true;
            fetchCorrPlotOptions()
                .then((response) => {
                    if (response.data.status === "success") {
                        this.settingOptions = response.data.data;
                    } else {
                        console.log(response.data);
                    }
                    this.loadingOptions = false;
                })
                .catch((error) => {
                    console.log(error);
                    this.loadingOptions = false;
                });
        },
        handleFetchCorrPlotImage() {
            this.loadingPlot = true;

            fetchCorrPlotImage({ resampleID: this.selectedFeatureSetId, settings: this.settingsForm })
                .then((response) => {
                    // Update the image data.
                    this.renderedImageData = new Buffer(response.data, "base64")
                        .toString("ascii")
                        .replace(/(\r\n|\n|\r)/gm, "")
                        .trim();

                    this.renderedImage = "data:image/svg+xml;utf8," + encodeURIComponent(this.renderedImageData);
                    this.loadingPlot = false;
                })
                .catch((error) => {
                    console.log("Server error:");
                    this.renderedImage = line_chart_404;
                    this.loadingPlot = false;
                });

        }
    }
};
</script>
<style rel='stylesheet/scss' lang='scss'>

</style>
