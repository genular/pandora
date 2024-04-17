<template>
    <div class="modelInterpretationTab-container" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
        <el-row type="flex" align="top" v-if="isTabDisabled === true">
            <el-col :span="24">
                <el-alert :title="$t('views.apps.supervised_learning.editing.components.tabs.correlationTab.alert.function_disabled.title')" description="Tab is currently disabled. Please try to select another models to get overview." type="warning" style="margin-top: 20px" show-icon :closable="false"></el-alert>
            </el-col>
        </el-row>
        <el-row v-else type="flex" align="top">
            <el-col :span="5">
                <el-form ref="settingsForm" :model="settingsForm" size="large">
                    <el-form-item label="Vars">
                        <el-select v-model="settingsForm.displayVariableImportance" collapse-tags multiple style="float: right">
                            <el-option v-for="item in uniqueDisplayVariableImportance" :key="item.id" :label="item.original" :value="item.feature_name">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Analysis">
                        <el-select v-model="settingsForm.selectedPlots" collapse-tags multiple style="float: right">
                            <el-option v-for="(itemData, itemIndex) in plotDescriptions" :key="itemIndex" :label="itemData.title" 
                                :value="itemIndex">
                                <el-row>
                                    <el-col :span="24" :title="itemData.title">
                                        <span >
                                            {{ itemData.title }}
                                        </span>
                                        <el-tooltip placement="top" style="padding-left: 5px">
                                            <div slot="content">
                                                <strong>{{ itemData.title }}</strong>
                                                <p>{{ itemData.description }}</p>
                                            </div>
                                            <i class="el-icon-question"></i>
                                        </el-tooltip>
                                    </el-col>
                                </el-row>
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
            <el-col :span="19" style="padding-left: 15px;">
                <el-row v-if="Object.keys(plot_data).length > 0 && settingsForm.selectedPlots.length > 0">
                    <el-tabs v-model="activeModelTab">
                        <el-tab-pane
                            v-for="methodName in responseMethods"
                            :key="methodName"
                            :name="methodName"
                            >
                            <span slot="label"> {{ methodName }}</span>
                            
                            <!-- Vertical Tabs for each plot item -->
                            <el-tabs tab-position="right" class="inner-tabs" v-model="activeModelTabPlots[methodName]">
                                <el-tab-pane
                                    v-for="(item, imageType) in plot_data"
                                    v-if="imageType !== 'saveObjectHash' && !imageType.endsWith('_png') && typeof item === 'object' && item !== null"
                                    :key="imageType + '_' + methodName"
                                    :name="imageType + '_' + methodName">
                                    
                                    <span slot="label" style="float: left;">
                                        <span v-if="plotDescriptions[imageType]">
                                            {{ plotDescriptions[imageType].title }}
                                        </span>
                                        <span v-else>{{ imageType }}</span>
                                        <el-tooltip placement="top" style="padding-left: 5px" v-if="plotDescriptions[imageType]">
                                            <div slot="content">
                                                <strong>{{ plotDescriptions[imageType].title }}</strong>
                                                <p>{{ plotDescriptions[imageType].description }}</p>
                                            </div>
                                            <i class="el-icon-question"></i>
                                        </el-tooltip>
                                    </span>

                                    <el-tabs tab-position="left" v-model="activeModelTabPlotsFeature[imageType + '_png' + '_' + methodName]">
                                        <el-tab-pane
                                            v-if="plot_data[imageType + '_png'] && plot_data[imageType + '_png'][methodName]"
                                            v-for="(plotItems, featureName) in plot_data[imageType + '_png'][methodName]"
                                            :key="imageType + '_png' + '_' + methodName + '_' + featureName"
                                            :name="imageType + '_png' + '_' + methodName + '_' + featureName">
                                            <span slot="label" style="float: left;">{{ featureName }}</span>
                                          <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                <template v-slot:content>
                                                    <el-button type="success" round @click="downloadPlotImage('testing', 'comparison_png', 'comparison')">Download</el-button>
                                                </template>

                                                <img v-if="plot_data[imageType + '_png'][methodName][featureName]" 
                                                class="animated fadeIn" style="max-width: 100%;" 
                                                :src="'data:image/png;base64,' + plot_data[imageType + '_png'][methodName][featureName]" 
                                                fit="scale-down" />
                                            </el-tooltip>
                                        </el-tab-pane>
                                    </el-tabs>
                                </el-tab-pane>
                            </el-tabs>
                        </el-tab-pane>
                    </el-tabs>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { fetchModelInterpretationPlot } from "@/api/plots";
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

            activeModelTab: "",
            activeModelTabPlots: {},
            activeModelTabPlotsFeature: {},
            responseMethods: [],

            plotDescriptions: {
                scatter: {
                    title: "Scatter Plot",
                    description: "Scatter plots visualize the relationship between two variables by displaying them as points distributed across a Cartesian plane. They help illustrate how changes in feature values could affect the model's output."
                },
                heatmap: {
                    title: "Heatmap",
                    description: "Heatmaps depict the interactions between two features by coloring cells according to the model’s output for combinations of feature values, showing how joint variations influence the prediction."
                },
                ice: {
                    title: "ICE Plot",
                    description: "ICE plots (Individual Conditional Expectation) visualize the change in the prediction outcome as a feature varies while all other features are held constant, highlighting the marginal effect of each feature."
                },
                lime: {
                    title: "LIME Plot",
                    description: "LIME plots (Local Interpretable Model-agnostic Explanations) explain individual predictions by showing which features were most influential, helping to demystify the model’s behavior on a case-by-case basis."
                },
                iml_featureimp: {
                    title: "Feature Importance",
                    description: "This plot illustrates the importance of each feature in the predictive model, showing which features have the most significant impact on the model's predictions."
                },
                iml_interaction: {
                    title: "Interaction Effects",
                    description: "This plot shows the interaction effects between features, highlighting how the combination of different features affects the model's output."
                },
                iml_featureeffect_ale: {
                    title: "ALE Plot",
                    description: "ALE plots (Accumulated Local Effects) visualize how features impact the prediction on average, focusing on how the model’s output changes when a feature varies over its distribution."
                },
                iml_featureeffect_pdp_ice: {
                    title: "PDP and ICE Plot",
                    description: "This combined plot uses Partial Dependence Plots (PDP) and Individual Conditional Expectation (ICE) plots to show both average and individual feature effects on the model's prediction."
                }
            },

            plot_data: {
                scatter: {},
                heatmap: {},
                ice: {},
                lime: {},
                iml_featureimp: {},
                iml_interaction: {},
                iml_featureeffect_ale: {},
                iml_featureeffect_pdp_ice: {},
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
                fontSize: 24,
                pointSize: 0.5,
                labelSize: 4,
                displayVariableImportance: false,
                selectedPlots: ["scatter", "iml_featureimp", "iml_interaction", "iml_featureeffect_ale", "iml_featureeffect_pdp_ice"]
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
                
                if(this.settingsForm.selectedPlots.length === 0) {
                    this.$message({
                        type: 'warning',
                        message: 'Please select at least one plot type.'
                    });
                    return;
                }

                this.$confirm('Are you sure you want to continue? This can take some time.', 'Confirm Action', {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No',
                    type: 'warning'
                }).then(() => {
                    // User confirmed the action
                    this.handleFetchModelInterpretationPlot();
                }).catch(() => {
                    // User cancelled the action
                    this.$message({
                        type: 'info',
                        message: 'Redraw cancelled'
                    });
                });
            }
        },
        downloadRawData() {
            const downloadLink = this.$store.getters.user_settings_server_address_plots + "/plots/general/download-saved-object?objectHash=" + this.plot_data.saveObjectHash;
            window.open(downloadLink, "_blank");
        },
        handleFetchModelInterpretationPlot() {
            this.loadingPlot = true;

            this.activeModelTab = "";
            this.activeModelTabPlots = {};
            this.activeModelTabPlotsFeature = {};
            this.responseMethods = [];

            this.plot_data = {
                scatter: {},
                heatmap: {},
                ice: {},
                lime: {},
                iml_featureimp: {},
                iml_interaction: {},
                iml_featureeffect_ale: {},
                iml_featureeffect_pdp_ice: {},
                saveObjectHash: false
            };

            fetchModelInterpretationPlot({
                    resampleID: this.selectedFeatureSetId,
                    modelsIDs: JSON.stringify(this.selectedModelsIDs),
                    settings: this.settingsForm,
                })
                .then((response) => {
                    const respData = response.data.message;
                    const details = response.data.details;

                    let activeTab = false;
                    // Update the image data.
                    for (const [respIndex, respItem] of Object.entries(respData)) {
                        if (!this.plot_data.hasOwnProperty(respIndex)) {
                            this.$set(this.plot_data, respIndex, {});
                        }

                        if (typeof respItem === 'object' && Object.keys(respItem).length !== 0) {
                            let resetPlotData = false; // Flag to determine if plot_data needs to be reset

                            for (const [respItemIndex, item] of Object.entries(respItem)) {
                                if (item === false) {
                                    resetPlotData = true; // Set flag if any item is false
                                    break; // No need to process further if we're going to reset this entry
                                }

                                if (typeof this.plot_data[respIndex][respItemIndex] !== 'object' || this.plot_data[respIndex][respItemIndex] === null) {
                                    this.$set(this.plot_data[respIndex], respItemIndex, {});
                                }

                                if (typeof item === 'object') {
                                    for (const [index2, value] of Object.entries(item)) {


                                        if (activeTab === false) {
                                            activeTab = respItemIndex;
                                        }

                                        if(!this.activeModelTabPlots[respItemIndex]) {
                                            this.activeModelTabPlots[respItemIndex] = respIndex + '_' + respItemIndex;
                                        }

                                        if(!this.activeModelTabPlotsFeature[respIndex + '_' + respItemIndex]) {
                                            if(respIndex !== "saveObjectHash" && respIndex.endsWith('_png') === true) {
                                                this.activeModelTabPlotsFeature[respIndex + '_' + respItemIndex] = respIndex + '_' + respItemIndex + '_' + index2;
                                            }
                                        }

                                        if (!this.responseMethods.includes(respItemIndex)) {
                                            this.responseMethods.push(respItemIndex);
                                        }

                                        this.$set(this.plot_data[respIndex][respItemIndex], index2, value);
                                    }
                                } else {
                                    this.plot_data[respIndex][respItemIndex] = item;
                                }
                            }

                            if (resetPlotData) {
                                this.plot_data[respIndex] = false; // Reset the entire plot_data index if the flag is true
                            }
                        } else {
                            this.plot_data[respIndex] = Object.keys(respItem).length === 0 ? false : encodeURIComponent(respItem);
                        }
                    }

                    this.activeModelTab = activeTab;

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
        },
        downloadPlotImage(imageType, itemIndex = null, modelIndex = null) {
            // Check if imageType exists in plot_data
            if (!this.plot_data[imageType]) {
                console.error("Image type is undefined.");
                return;
            }

            let svgString = "";
            let downloadName = `${this.$options.name}_${imageType}`;

            // Process download based on itemIndex and modelIndex
            if (itemIndex !== null) {
                const itemData = this.plot_data[imageType][itemIndex];
                if (!itemData) {
                    console.error("Item index data is undefined.");
                    return;
                }

                if (modelIndex !== null && itemData[modelIndex]) {
                    svgString = itemData[modelIndex];
                    downloadName += `_${itemIndex}_${modelIndex}`;
                } else {
                    console.error("Model index data is undefined.");
                    return;
                }
            } else {
                svgString = this.plot_data[imageType];
            }

            // Check if svgString is empty
            if (!svgString) {
                console.error("SVG data is empty.");
                return;
            }

            downloadName += ".svg";

            // Create and download the SVG file
            this.createAndDownloadBlob(svgString, downloadName);
        },

        createAndDownloadBlob(svgData, fileName) {
            const svgBlob = new Blob([atob(svgData)], { type: "image/svg+xml;charset=utf-8" });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement("a");

            downloadLink.href = svgUrl;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        },
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
