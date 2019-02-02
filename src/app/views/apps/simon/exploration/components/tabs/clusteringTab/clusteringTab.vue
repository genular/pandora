<template>
    <div class="clusteringTab-container" v-loading.fullscreen.lock="loadingPlot" element-loading-text="Processing...">
        <el-row type="flex" align="top">
            <el-col :span="24" style="text-align: right;">
                <el-button type="primary" icon="el-icon-download" :disabled="renderedImage === '' || loadingPlot" @click="downloadPlotImage"></el-button>
            </el-col>
        </el-row>
        <el-row type="flex" align="top">
            <el-col :span="9">
                <el-form ref="settingsForm" :model="settingsForm" class="clustering_form" label-width="200px">
                    <el-form-item label="Columns">
                        <el-select
                            v-model="settingsForm.selectedColumns"
                            multiple
                            filterable
                            remote
                            default-first-option
                            placeholder="Type to search..."
                            :remote-method="
                                userInput => {
                                    filterAvaliableColumns(userInput, 'columns');
                                }
                            "
                            :loading="loading['columns']"
                            @focus="selectAvaliableFeaturesDisplay('columns')"
                        >
                            <el-option v-for="item in settingOptions.columns" :key="item.remapped" :label="item.original" :value="item.remapped"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Rows">
                        <el-select
                            v-model="settingsForm.selectedRows"
                            multiple
                            filterable
                            remote
                            default-first-option
                            placeholder="Type to search..."
                            :remote-method="
                                userInput => {
                                    filterAvaliableColumns(userInput, 'features');
                                }
                            "
                            :loading="loading['features']"
                            @focus="selectAvaliableFeaturesDisplay('features')"
                        >
                            <el-option v-for="item in settingOptions.features" :key="item.remapped" :label="item.original" :value="item.remapped"> </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="Remove NA?">
                        <el-checkbox v-model="settingsForm.removeNA"></el-checkbox>
                    </el-form-item>
                    <el-form-item label="Scale">
                        <el-select v-model="settingsForm.scale" placeholder="Select">
                            <el-option v-for="item in settingOptions.scale" :key="item.id" :label="item.id" :value="item.id"> </el-option>
                        </el-select>
                    </el-form-item>

                    <!-- ["numbers", "legend", "colnames", "rownames"] -->
                    <el-form-item label="Display">
                        <el-checkbox-group class="checkbox_group" v-model="settingsForm.displayOptions" size="mini">
                            <el-checkbox v-for="(item, index) in settingOptions.displayOptions" :style="index !== 0 && index % 2 === 0 ? 'clear: left;float: left;margin-left: 0;' : ''"
                            :key="item.id"
                            :label="item.id">{{item.label}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>

                    <el-form-item label="Numbers size" v-if="settingsForm.displayOptions.indexOf('numbers') !== -1">
                        <el-input-number
                            v-model="settingsForm.fontSizeNumbers"
                            :value="settingsForm.fontSizeNumbers"
                            :min="settingOptions.fontSizeNumbers.min"
                            :max="settingOptions.fontSizeNumbers.max"
                            :step="settingOptions.fontSizeNumbers.step"
                            controls-position="right"
                        >
                        </el-input-number>
                    </el-form-item>
                    <el-form-item label="Colnames size" v-if="settingsForm.displayOptions.indexOf('colnames') !== -1">
                        <el-input-number
                            v-model="settingsForm.fontSizeCol"
                            :value="settingsForm.fontSizeCol"
                            :min="settingOptions.fontSizeCol.min"
                            :max="settingOptions.fontSizeCol.max"
                            :step="settingOptions.fontSizeCol.step"
                            controls-position="right"
                        >
                        </el-input-number>
                    </el-form-item>
                    <el-form-item label="Rownames size" v-if="settingsForm.displayOptions.indexOf('rownames') !== -1">
                        <el-input-number
                            v-model="settingsForm.fontSizeRow"
                            :value="settingsForm.fontSizeRow"
                            :min="settingOptions.fontSizeRow.min"
                            :max="settingOptions.fontSizeRow.max"
                            :step="settingOptions.fontSizeRow.step"
                            controls-position="right"
                        >
                        </el-input-number>
                    </el-form-item>

                    <el-form-item label="Plot width">
                        <el-input-number
                            v-model="settingsForm.plotWidth"
                            :value="settingsForm.plotWidth"
                            :min="settingOptions.plotWidth.min"
                            :max="settingOptions.plotWidth.max"
                            :step="settingOptions.plotWidth.step"
                            controls-position="right"
                        >
                        </el-input-number>
                    </el-form-item>
                    <el-form-item label="Plot ratio (height / width)">
                        <el-input-number
                            v-model="settingsForm.plotRatio"
                            :value="settingsForm.plotRatio"
                            :min="settingOptions.plotRatio.min"
                            :max="settingOptions.plotRatio.max"
                            :step="settingOptions.plotRatio.step"
                            controls-position="right"
                        >
                        </el-input-number>
                    </el-form-item>

                    <el-form-item label="Clustering distance">
                        <el-select v-model="settingsForm.clustDistance" placeholder="Select">
                            <el-option v-for="item in settingOptions.clustDistance" :key="item.id" :label="item.id" :value="item.value"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Clustering method">
                        <el-select v-model="settingsForm.clustLinkage" placeholder="Select">
                            <el-option v-for="item in settingOptions.clustLinkage" :key="item.id" :label="item.id" :value="item.value"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Tree ordering">
                        <el-select v-model="settingsForm.clustOrdering" placeholder="Select">
                            <el-option v-for="item in settingOptions.clustOrdering" :key="item.id" :label="item.id" :value="item.value"> </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="Overall font-size">
                        <el-input-number
                            v-model="settingsForm.fontSizeGeneral"
                            :value="settingsForm.fontSizeGeneral"
                            :min="settingOptions.fontSizeGeneral.min"
                            :max="settingOptions.fontSizeGeneral.max"
                            :step="settingOptions.fontSizeGeneral.step"
                            controls-position="right"
                        >
                        </el-input-number>
                    </el-form-item>
                    <el-form-item label="">
                        <el-button type="primary" size="mini" icon="el-icon-picture-outline" @click="redrawImage" round>Plot image</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="15" class="correlation-svg-container" :disabled="loadingPlot" element-loading-text="Processing..." style="text-align: center;">
                <object id="correlation-svg" style="margin: 0 auto;" :data="renderedImage" type="image/svg+xml"></object>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { resamplesFeaturesSuggest as ApiGetResamplesFeaturesSuggest } from "@/api/backend";
import { fetchHeatmapImage } from "@/api/plots";

import { debounce } from "@/utils/helpers";

import line_chart_404 from "@/assets/404_images/charts/line_chart.svg";

export default {
    name: "clusteringTab",
    props: {
        jobDetailsData: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            loadingOptions: true,
            loadingPlot: false,
            loading: {
                features: false,
                outcome: false,
                columns: false
            },
            renderedImage: "",
            renderedImageData: "",

            resample: [],
            settingOptions: {
                columns: [],
                features: [],
                // removeNA: false,
                scale: [{ id: "row" }, { id: "column" }, { id: "none" }],
                displayOptions: [{ label: "Numbers", id: "numbers" }, { label: "Legend", id: "legend" }, { label: "Colnames", id: "colnames" }, { label: "Rownames", id: "rownames" }],
                
                plotWidth: {
                    min: 5,
                    max: 50,
                    step: 1
                },
                plotRatio: {
                    min: 0.1,
                    max: 3,
                    step: 0.01
                },
                clustDistance: [
                    { id: "correlation", value: "correlation" },
                    { id: "euclidean", value: "euclidean" },
                    { id: "maximum", value: "maximum" },
                    { id: "manhattan", value: "manhattan" },
                    { id: "canberra", value: "canberra" },
                    { id: "binary", value: "binary" },
                    { id: "minkowski", value: "minkowski" }
                ],
                clustLinkage: [
                    { id: "single", value: "single" },
                    { id: "complete", value: "complete" },
                    { id: "average", value: "average" },
                    { id: "mcquitty", value: "mcquitty" },
                    { id: "median", value: "median" },
                    { id: "centroid", value: "centroid" },
                    { id: "ward.D2", value: "ward.D2" },
                    { id: "ward.D", value: "ward.D" }
                ],
                clustOrdering: [
                    { id: 1, value: "tightest cluster first" },
                    { id: 2, value: "higher median value first" },
                    { id: 3, value: "higher mean value first" },
                    { id: 4, value: "lower median value first" },
                    { id: 5, value: "original" },
                    { id: 6, value: "reverse original" }
                ],

                fontSizeGeneral: {
                    min: 5,
                    max: 24,
                    step: 0.5
                },
                fontSizeRow: {
                    min: 5,
                    max: 24,
                    step: 0.5
                },
                fontSizeCol: {
                    min: 5,
                    max: 24,
                    step: 0.5
                },
                fontSizeNumbers: {
                    min: 5,
                    max: 24,
                    step: 0.5
                }
            },
            settingsForm: {
                selectedColumns: [],
                selectedRows: [],

                removeNA: false,
                scale: "column",

                displayOptions: ["legend", "colnames", "rownames"],

                plotWidth: 20,
                plotRatio: 0.8,

                clustDistance: "correlation",
                clustLinkage: "ward.D2",
                clustOrdering: 1,

                fontSizeGeneral: 10,
                fontSizeRow: 9,
                fontSizeCol: 9,
                fontSizeNumbers: 7
            }
        };
    },
    mounted() {
        console.log("mounted: clusteringTab");
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
        /** On user focus display first rand 50 Features in drop-down */
        selectAvaliableFeaturesDisplay(inputType) {
            if (this.settingOptions[inputType].length <= 1) {
                this.filterAvaliableColumns("", inputType);
            }
        },
        /** On user Input search available Features and suggest some results */
        filterAvaliableColumns: debounce(function(userInput, inputType) {
            this.loading[inputType] = true;
            ApiGetResamplesFeaturesSuggest({
                resampleID: this.selectedFeatureSetId,
                userInput: userInput,
                inputType: inputType
            })
                .then(response => {
                    if (response.data.success === true) {
                        this.settingOptions[inputType] = response.data.data;
                    }
                    this.loading[inputType] = false;
                })
                .catch(error => {
                    this.loading[inputType] = false;
                    console.log(error);
                });
        }, 500),
        redrawImage() {
            this.handleFetchHeatmapImage();
        },
        downloadPlotImage() {
            const svgBlob = new Blob([this.renderedImageData], { type: "image/svg+xml;charset=utf-8" });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = "clustering.svg";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        },
        handleFetchHeatmapImage() {
            this.loadingPlot = true;

            fetchHeatmapImage({
                resampleID: this.selectedFeatureSetId,
                settings: this.settingsForm
            })
                .then(response => {
                    // Decode base64 encoded results
                    this.renderedImageData = window.atob(response.data.image);

                    if (this.renderedImageData.length < 15) {
                        this.renderedImage = line_chart_404;
                    } else {
                        this.renderedImage = "data:image/svg+xml;base64," + encodeURIComponent(response.data.image);
                    }

                    this.loadingPlot = false;
                })
                .catch(error => {
                    console.log("Server error:");
                    this.renderedImage = line_chart_404;
                    this.loadingPlot = false;
                });
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
.clustering_form {
    .el-form-item {
        margin-bottom: 5px;
        .checkbox_group {
            .el-checkbox {
                float: left;
                min-width: 100px;
            }
        }
        label {
            color: #333333;
            font-weight: 500;
        }
    }
}
</style>
