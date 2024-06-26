<template>
    <div class="rocAnalysisTab-container" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
        <el-row type="flex" align="top" v-if="isTabDisabled === true">
            <el-col :span="24">
                <el-alert :title="$t('views.apps.supervised_learning.editing.components.tabs.correlationTab.alert.function_disabled.title')" description="Tab is currently disabled. Please try to select another models to get overview." type="warning" style="margin-top: 20px" show-icon :closable="false"></el-alert>
            </el-col>
        </el-row>
        <el-row v-else type="flex" align="top">
            <el-col :span="4">
                <el-form ref="settingsForm" :model="settingsForm" size="large">
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
            <el-col :span="19" :offset="1" class="correlation-svg-container" style="text-align: center">
                <el-row>
                    <el-col :span="12" v-if="Object.keys(plot_data['training']).length > 0">
                        <el-row :span="24" style="padding-top: 20px">Training Evaluation: ROC Curve Analysis</el-row>
                        <!-- Dynamically generate tabs based on data -->
                        <el-tabs v-model="activeTabTraining">
                            <el-tab-pane v-for="(plotItem, respItemIndex) in plot_data['training']['auc_roc_png']" :key="respItemIndex" :label="respItemIndex" :name="respItemIndex">
                                <el-tabs v-model="trainingTabsInner" tab-position="right">
                                    <el-tab-pane :disabled="plot_data['training']['auc_roc_png'][respItemIndex] === false" name="single">
                                        <span slot="label" style="float: left;"><i class="el-icon-date"></i> One-vs-All</span>
                                        <!-- Iterate over each sub-item to display multiple images per tab if needed -->
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <template v-slot:content>
                                                <el-button type="success" round @click="downloadPlotImage('training', 'auc_roc', respItemIndex)">Download</el-button>
                                            </template>
                                            <img v-if="plot_data['training']['auc_roc_png'][respItemIndex]" class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plot_data['training']['auc_roc_png'][respItemIndex]" fit="scale-down" />
                                        </el-tooltip>
                                    </el-tab-pane>
                                    <el-tab-pane :disabled="selectedOutcomeOptions.length === 3 || plot_data['training']['auc_roc_multiclass_png'][respItemIndex] === false" name="multi">
                                        <span slot="label" style="float: left;"><i class="el-icon-date"></i> One-vs-One</span>
                                        <!-- Iterate over each sub-item to display multiple images per tab if needed -->
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <template v-slot:content>
                                                <el-button type="success" round @click="downloadPlotImage('training', 'auc_roc_multiclass', respItemIndex)">Download</el-button>
                                            </template>
                                            <img v-if="plot_data['training']['auc_roc_multiclass_png'][respItemIndex]" class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plot_data['training']['auc_roc_multiclass_png'][respItemIndex]" fit="scale-down" />
                                        </el-tooltip>
                                    </el-tab-pane>
                                    <el-tab-pane :disabled="plot_data['training']['comparison_png']['comparison'] === false" name="comparison">
                                        <span slot="label" style="float: left;"><i class="el-icon-date"></i> Comparison</span>
                                        <!-- Iterate over each sub-item to display multiple images per tab if needed -->
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <template v-slot:content>
                                                <el-button type="success" round @click="downloadPlotImage('training', 'comparison_png', 'comparison')">Download</el-button>
                                            </template>
                                            <img v-if="plot_data['training']['comparison_png']['comparison']" class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plot_data['training']['comparison_png']['comparison']" fit="scale-down" />
                                        </el-tooltip>
                                    </el-tab-pane>
                                </el-tabs>
                            </el-tab-pane>
                        </el-tabs>
                    </el-col>
                    <el-col v-else class="plot-placeholder" :span="12">
                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                    </el-col>
                    <el-col :span="12" v-if="Object.keys(plot_data['testing']).length > 0">
                        <el-row :span="24" style="padding-top: 20px">Testing Evaluation: ROC Curve Analysis</el-row>
                        <el-tabs v-model="activeTabTesting">
                            <el-tab-pane v-for="(plotItem, respItemIndex) in plot_data['testing']['auc_roc_png']" :key="respItemIndex" :label="respItemIndex" :name="respItemIndex">
                                <el-tabs v-model="testingTabsInner" tab-position="right">
                                    <el-tab-pane :disabled="plot_data['testing']['auc_roc_png'][respItemIndex] === false" name="single">
                                        <span slot="label" style="float: left;"><i class="el-icon-date"></i> One-vs-All</span>
                                        <!-- Iterate over each sub-item to display multiple images per tab if needed -->
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <template v-slot:content>
                                                <el-button type="success" round @click="downloadPlotImage('testing', 'auc_roc', respItemIndex)">Download</el-button>
                                            </template>
                                            <img v-if="plot_data['testing']['auc_roc_png'][respItemIndex]" class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plot_data['testing']['auc_roc_png'][respItemIndex]" fit="scale-down" />
                                        </el-tooltip>
                                    </el-tab-pane>
                                    <el-tab-pane :disabled="plot_data['testing']['auc_roc_multiclass_png'][respItemIndex] === false" name="multi">
                                        <span slot="label" style="float: left;"><i class="el-icon-date"></i> One-vs-One</span>
                                        <!-- Iterate over each sub-item to display multiple images per tab if needed -->
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <template v-slot:content>
                                                <el-button type="success" round @click="downloadPlotImage('testing', 'auc_roc_multiclass', respItemIndex)">Download</el-button>
                                            </template>
                                            <img v-if="plot_data['testing']['auc_roc_multiclass_png'][respItemIndex]" class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plot_data['testing']['auc_roc_multiclass_png'][respItemIndex]" fit="scale-down" />
                                        </el-tooltip>
                                    </el-tab-pane>
                                    <el-tab-pane :disabled="plot_data['testing']['comparison_png']['comparison'] === false" name="comparison">
                                        <span slot="label" style="float: left;"><i class="el-icon-date"></i> Comparison</span>
                                        <!-- Iterate over each sub-item to display multiple images per tab if needed -->
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <template v-slot:content>
                                                <el-button type="success" round @click="downloadPlotImage('testing', 'comparison_png', 'comparison')">Download</el-button>
                                            </template>
                                            <img v-if="plot_data['testing']['comparison'][respItemIndex] !== false" class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plot_data['testing']['comparison_png']['comparison']" fit="scale-down" />
                                        </el-tooltip>
                                    </el-tab-pane>
                                </el-tabs>
                            </el-tab-pane>
                        </el-tabs>
                    </el-col>
                    <el-col v-else class="plot-placeholder" :span="12">
                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                    </el-col>
                </el-row>
                <el-row style="text-align: left; font-size: 16px;">
                    <h2>Understanding ROC Curve Analysis in Model Training and Testing</h2>
                    <p>
                        Receiver Operating Characteristic (ROC) curves are pivotal in evaluating the performance of binary classification models. By graphically representing the trade-off between the true positive rate (TPR) and the false positive rate (FPR) across various thresholds, ROC curves provide a nuanced understanding of a model's diagnostic ability. This analysis is split into two critical phases: Training and Testing.
                    </p>
                    <p>
                        <strong>Training Phase:</strong> The ROC curve for the training phase highlights the model's ability to correctly classify outcomes within the dataset it was trained on. It's a reflection of how well the model has learned from the training data. A curve closer to the top-left corner indicates a model with a good balance of sensitivity and specificity, suggesting effective learning.
                    </p>
                    <p>
                        <strong>Testing Phase:</strong> Conversely, the ROC curve for the testing phase assesses the model's performance on unseen data. This phase is crucial for understanding the model's generalization capability. An ROC curve maintaining proximity to the top-left corner in this phase confirms that the model not only learned well but also can effectively predict outcomes on new data.
                    </p>
                    <p>
                        <strong>How to Use ROC Curves:</strong> To effectively utilize ROC curves, consider both the Area Under the Curve (AUC) metric and the shape of the curve. The AUC provides a single value summarizing the overall performance of the model, with values closer to 1 indicating higher model accuracy. When comparing models, those with higher AUC values are generally preferred. However, depending on the specific application, you might prioritize sensitivity (TPR) over specificity (1 - FPR), or vice versa, and choose the model whose ROC curve better aligns with your operational requirements.
                    </p>
                    <p>
                        In summary, ROC curve analysis in both training and testing phases offers comprehensive insights into the model's capabilities, guiding the selection of the most suitable model for your needs. By examining these curves, data scientists and analysts can make informed decisions about model adjustments, improvements, and selections for predictive tasks.
                    </p>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { fetchGraphModelSummaryTwoClass, fetchGraphModelSummaryMultiClass } from "@/api/plots";
import { md5String } from "@/utils";
import clipboard from "@/utils/clipboard";

import line_chart_404 from "@/assets/404_images/charts/line_chart.svg";

import plotColorPalettes from "@/assets/plots/color_palettes.json";
import plotThemes from "@/assets/plots/themes.json";

export default {
    name: "rocAnalysisTab",
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

            activeTabTraining: null,
            activeTabTesting: null,

            testingTabsInner: "single",
            trainingTabsInner: "single",

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
        }
    },
    mounted() {
        console.log("mounted: rocAnalysisTab");
        if (this.isTabDisabled === false) {

            if (this.settingsForm.selectedOutcomeOptionsIDs.length === 0 && this.selectedOutcomeOptionsIDs.length > 0) {
                this.settingsForm.selectedOutcomeOptionsIDs = this.selectedOutcomeOptionsIDs;
            }

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
    },
    methods: {
        redrawImage() {
            if (this.isTabDisabled === false) {
                this.handleFetchSummaryPlots();
            }
        },
        downloadRawData() {
            const downloadLink = this.$store.getters.user_settings_server_address_plots + "/plots/general/download-saved-object?objectHash=" + this.plot_data.saveObjectHash;
            window.open(downloadLink, "_blank");
        },
        handleFetchSummaryPlots() {

            this.loadingPlot = true;

            let remotePlotCall;

            if (this.selectedOutcomeOptions.length > 3) {
                remotePlotCall = fetchGraphModelSummaryMultiClass;
            } else {
                remotePlotCall = fetchGraphModelSummaryMultiClass; //fetchGraphModelSummaryTwoClass;
            }

            remotePlotCall({
                    resampleID: this.selectedFeatureSetId,
                    modelsIDs: JSON.stringify(this.selectedModelsIDs),
                    settings: this.settingsForm,
                })
                .then((response) => {
                    const respData = response.data.message;
                    const details = response.data.details;

                    let activeTab = false;

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
                                            activeTab = index2;
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

                    this.activeTabTraining = activeTab;
                    this.activeTabTesting = activeTab;

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
         * Watch for model selection change
         * @param  {[type]} newVal [description]
         * @param  {[type]} oldVal [description]
         * @return {[type]}        [description]
         */
        selectedModelsIDs: function(newVal, oldVal) {
            console.log("rocAnalysisTab getting new handleFetchSummaryPlots based on model change");
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
