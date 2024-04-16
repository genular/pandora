<template>
    <div class="modelInterpretationTab-container" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
        <el-row type="flex" align="top" v-if="isTabDisabled === true">
            <el-col :span="24">
                <el-alert :title="$t('views.apps.supervised_learning.editing.components.tabs.correlationTab.alert.function_disabled.title')" description="Tab is currently disabled. Please try to select another models to get overview." type="warning" style="margin-top: 20px" show-icon :closable="false"></el-alert>
            </el-col>
        </el-row>
        <el-row v-else type="flex" align="top">
            <el-col :span="4">
                <el-form ref="settingsForm" :model="settingsForm" size="large">
                    <el-form-item label="Vars">
                        <el-select v-model="settingsForm.displayVariableImportance" collapse-tags multiple style="float: right">
                            <el-option v-for="item in uniqueDisplayVariableImportance" :key="item.id" :label="item.original" :value="item.feature_name">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Class">
                        <el-select v-model="settingsForm.selectedOutcomeOptionsIDs" collapse-tags multiple placeholder="Outcome class" style="float: right">
                            <el-option v-for="item in selectedOutcomeOptions" :key="item.id" :label="'Outcome: ' + item.class_original" :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Theme">
                        <el-select v-model="settingsForm.theme" placeholder="Select" style="float: right">
                            <el-option v-for="item in selectedOptions.theme" :key="item.id" :label="item.name" :value="item.id">
                                <span style="float: left">{{ item.name }}</span>
                                <span style="float: right; color: #8492a6; font-size: 13px">
                                    <el-tooltip placement="top">
                                        <div slot="content" style="text-align: center">
                                            <img :src="'static/images/plot_styles/' + item.id + '_' + settingsForm.colorPalette + '.svg'" style="height: 125px" />
                                            <br />
                                            <span style="max-width: 125px; width: 150px; display: block">{{ item.description }}</span>
                                        </div>
                                        <span class="el-icon-info"></span>
                                    </el-tooltip>
                                </span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Color">
                        <el-select v-model="settingsForm.colorPalette" placeholder="Select" style="float: right">
                            <el-option v-for="item in selectedOptions.colorPalette" :key="item.id" :label="item.value" :value="item.id">
                                <span style="float: left">{{ item.value }}</span>
                                <span style="float: right; color: #8492a6; font-size: 13px">
                                    <el-tooltip placement="top">
                                        <div slot="content" style="text-align: center">
                                            <img :src="'static/images/plot_styles/' + settingsForm.theme + '_' + item.id + '.svg'" style="height: 125px" />
                                            <br />
                                            <span style="max-width: 125px; width: 150px; display: block">colorblind: {{ item.colorblind }}</span>
                                        </div>
                                        <span class="el-icon-info"></span>
                                    </el-tooltip>
                                </span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Font size">
                        <el-input-number style="float: right" v-model="settingsForm.fontSize" :step="1" :min="8" :max="124"></el-input-number>
                    </el-form-item>
                    <el-form-item label="Point size">
                        <el-input-number style="float: right" v-model="settingsForm.pointSize" :step="0.5" :min="0.1" :max="12"></el-input-number>
                    </el-form-item>
                    <el-form-item label="Label size">
                        <el-input-number style="float: right" v-model="settingsForm.labelSize" :step="1" :min="0.1" :max="124"></el-input-number>
                    </el-form-item>
                    <el-form-item label="Ratio">
                        <el-input-number style="float: right" v-model="settingsForm.aspect_ratio" :step="0.1" :max="4" :min="1"></el-input-number>
                    </el-form-item>
                    <el-form-item label="Plot size">
                        <el-input-number style="float: right" v-model="settingsForm.plot_size" :step="1" :max="48" :min="1"></el-input-number>
                    </el-form-item>
                    <el-row>
                        <el-col :span="12" v-if="plot_data.saveObjectHash !== false">
                            <el-form-item>
                                <el-tooltip placement="top">
                                    <div slot="content">
                                        {{ $t("views.apps.unsupervised_learning.editing.index.button.download_r_data.description") }}
                                    </div>
                                    <el-button style="float: left" type="primary" size="large" round @click="downloadRawData">
                                        {{ $t("views.apps.unsupervised_learning.editing.index.button.download_r_data.title") }}
                                        <i class="el-icon-download el-icon-right"></i>
                                    </el-button>
                                </el-tooltip>
                            </el-form-item>
                        </el-col>
                        <el-col :span="plot_data.saveObjectHash !== false ? 12 : 24">
                            <el-form-item>
                                <el-button type="primary" size="large" round @click="redrawImage" style="float: right">
                                    {{ $t("views.apps.supervised_learning.exploration.components.tabs.correlationTab.buttons.plot_image") }}
                                </el-button>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </el-col>
            <el-col :span="19" :offset="1" style="text-align: center">
                <el-row>
                    Test
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { fetchGraphModelSummary } from "@/api/plots";
import { md5String } from "@/utils";
import clipboard from "@/utils/clipboard";

import line_chart_404 from "@/assets/404_images/charts/line_chart.svg";

import plotColorPalettes from "@/assets/plots/color_palettes.json";
import plotThemes from "@/assets/plots/themes.json";

export default {
    name: "modelInterpretationTab",
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
            loadingPlot: false,

            plot_data: {
                training: {},
                testing: {},

                saveObjectHash: false,
            },
            selectedOptions: {
                theme: plotThemes,
                colorPalette: plotColorPalettes,
            },
            settingsForm: {
                theme: "theme_bw",
                colorPalette: "Set1",
                aspect_ratio: 1,
                plot_size: 12,
                fontSize: 12,
                pointSize: 0.5,
                labelSize: 3.88,
                selectedOutcomeOptionsIDs: false,
                displayVariableImportance: false,
            },
        };
    },
    mounted() {
        console.log("mounted: modelInterpretationTab");
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
            },
        },
        displayVariableImportance: {
            get() {
                return this.$store.getters.pandoraExplorationDisplayVariableImportance;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationDisplayVariableImportance", value);
            }
        },
        uniqueDisplayVariableImportance() {
            const unique = {};
            this.displayVariableImportance.forEach(item => {
                unique[item.feature_name] = item; // Keep the last item encountered for each unique feature_name
            });
            const uniqueArray = Object.values(unique);

            // Sort the unique array by score_no (assumed to be numeric)
            uniqueArray.sort((a, b) => {
                return a.score_no - b.score_no;
            });

            return uniqueArray;
        }

    },
    methods: {
        redrawImage() {
            if (this.isTabDisabled === false) {
                this.handleFetchSummaryPlots();
            }
        },
        handleFetchSummaryPlots() {
            this.loadingPlot = true;

            fetchGraphModelSummary({
                    resampleID: this.selectedFeatureSetId,
                    modelsIDs: JSON.stringify(this.selectedModelsIDs),
                    settings: this.settingsForm,
                })
                .then((response) => {
                    const respData = response.data.message;
                    const details = response.data.details;
                    console.log("1");
                    // Update the image data.
                    for (let respIndex in respData) {
                        console.log("2");
                        if (typeof this.plot_data[respIndex] !== "undefined") {
                            console.log("3");
                            let respItem = respData[respIndex];
                            if (typeof respItem === "object" && Object.keys(respItem).length === 0) {
                                console.log("4");
                                this.plot_data[respIndex] = false;
                            } else if (typeof respItem === "object") {
                                console.log("5");
                                for (let respItemIndex in respItem) {
                                    this.plot_data[respIndex][respItemIndex] = respItem[respItemIndex];
                                }
                            } else {
                                console.log("6");
                                this.plot_data[respIndex] = encodeURIComponent(respItem);
                            }
                        }
                    }
                    // Update the details data.
                    for (let respIndex in details) {
                        if (typeof this.details[respIndex] !== "undefined") {
                            console.log("7");
                            this.details[respIndex] = false;
                            let respItem = details[respIndex];
                            if (typeof respItem === "object" || respItem.length < 15) {
                                this.details[respIndex] = false;
                            } else {
                                console.log("8");
                                this.details[respIndex] = window.atob(respItem);
                            }
                        }
                    }
                    this.loadingPlot = false;
                })
                .catch((error) => {
                    this.$message({
                        message: this.$t("globals.errors.request_general"),
                        type: "error",
                    });
                    console.log(error);
                    this.loadingPlot = false;
                });
        }
    },
    watch: {
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
.analysis_images {
    width: 100%;
    float: left;
}

.plot-placeholder {
    font-size: 248px;
    text-align: center;
    margin: 0 auto;

    padding-top: 25px;
    opacity: 0.1;
}

</style>
