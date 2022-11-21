<template>
    <div class="modelDetailsTab-container" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
        <el-row type="flex" align="top" v-if="isTabDisabled === true">
            <el-col :span="24">
                <el-alert
                    :title="$t('views.apps.simon.editing.components.tabs.correlationTab.alert.function_disabled.title')"
                    description="Tab is currently disabled. Please try to select another models to get overview."
                    type="warning"
                    style="margin-top: 20px"
                    show-icon
                    :closable="false"
                ></el-alert>
            </el-col>
        </el-row>
        <el-row v-else type="flex" align="top">
            <el-col :span="4">
                <el-form ref="settingsForm" :model="settingsForm">
                    <el-form-item label="Theme">
                        <el-select v-model="settingsForm.theme" size="mini" placeholder="Select" style="float: right">
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
                        <el-select v-model="settingsForm.colorPalette" size="mini" placeholder="Select" style="float: right">
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
                        <el-input-number style="float: right" size="mini" v-model="settingsForm.aspect_ratio" :step="0.1" :max="4" :min="1"></el-input-number>
                    </el-form-item>

                    <el-form-item label="Plot size">
                        <el-input-number style="float: right" size="mini" v-model="settingsForm.plot_size" :step="1" :max="48" :min="1"></el-input-number>
                    </el-form-item>

                    <el-row>
                        <el-col :span="12" v-if="plot_data.saveObjectHash !== false">
                            <el-form-item>
                                <el-tooltip placement="top">
                                    <div slot="content">
                                        {{ $t("views.apps.unsupervised_learning.editing.index.button.download_r_data.description") }}
                                    </div>
                                    <el-button style="float: left" type="danger" round @click="downloadRawData">
                                        {{ $t("views.apps.unsupervised_learning.editing.index.button.download_r_data.title") }}
                                        <i class="el-icon-download el-icon-right"></i>
                                    </el-button>
                                </el-tooltip>
                            </el-form-item>
                        </el-col>

                        <el-col :span="plot_data.saveObjectHash !== false ? 12 : 24">
                            <el-form-item>
                                <el-button type="danger" round @click="redrawImage" style="float: right">
                                    {{ $t("views.apps.simon.exploration.components.tabs.correlationTab.buttons.plot_image") }}
                                </el-button>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </el-col>

            <el-col :span="19" :offset="1" class="correlation-svg-container" style="text-align: center">
                <el-row>
                    <el-col :span="24">
                        A
                        <a href="https://en.wikipedia.org/wiki/Receiver_operating_characteristic" target="_blank">receiver operating characteristic curve</a>
                        , or ROC curve, is a graphical plot that illustrates the diagnostic ability of a binary classifier system as its discrimination threshold is varied.
                    </el-col>
                    <el-col :span="12" v-if="plot_data.training.auc_roc !== false">
                        <el-col :span="24" style="padding-top: 20px">Training model data ROC:</el-col>
                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                            <div slot="content">
                                <el-button type="success" round @click="downloadPlotImage('training', 'auc_roc')">Download</el-button>
                            </div>
                            <img class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plot_data.training.auc_roc_png" fit="scale-down" />
                        </el-tooltip>
                    </el-col>
                    <el-col v-else class="plot-placeholder" :span="12">
                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                    </el-col>
                    <el-col :span="12" v-if="plot_data.testing.auc_roc !== false">
                        <el-col :span="24" style="padding-top: 20px">Testing (predictions) ROC:</el-col>
                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                            <div slot="content">
                                <el-button type="success" round @click="downloadPlotImage('testing', 'auc_roc')">Download</el-button>
                            </div>
                            <img class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plot_data.testing.auc_roc_png" fit="scale-down" />
                        </el-tooltip>
                    </el-col>
                    <el-col v-else class="plot-placeholder" :span="12">
                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                    </el-col>
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
    name: "modelDetailsTab",
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
            partial_dependence_supported_models: [
                "C5.0",
                "BinaryTree",
                "party",
                "rpart",
                "bagging",
                "classbagg",
                "regbagg",
                "boosting",
                "gbm",
                "xgb.Booster",
                "cubist",
                "lda",
                "qda",
                "glm",
                "lm",
                "lm",
                "nls",
                "earth",
                "ppr",
                "randomForest",
                "ranger",
                "RandomForest",
                "cforest",
                "svm",
                "ksvm",
            ],
            plot_data: {
                training: {
                    auc_roc: false,
                    auc_roc_png: false,
                },
                testing: {
                    auc_roc: false,
                    auc_roc_png: false,

                    auc_roc_full: false,
                    auc_roc_full_png: false,
                },

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
            },
        };
    },
    mounted() {
        console.log("mounted: modelDetailsTab");
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
            },
        },
        selectedModelsIDs: {
            get() {
                return this.$store.getters.simonExplorationSelectedModelId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedModelId", value);
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
        },
        downloadPlotImage(imageType, itemIndex = null) {
            if (typeof this.plot_data[imageType] === "undefined") {
                return;
            }
            let svgString = "";
            let downloadName = this.$options.name + "_" + imageType;
            if (itemIndex !== null) {
                if (typeof this.plot_data[imageType][itemIndex] !== "undefined") {
                    svgString = this.plot_data[imageType][itemIndex];
                    downloadName = downloadName + "_" + itemIndex;
                }
            } else {
                svgString = this.plot_data[imageType];
            }
            if (svgString === "") {
                return;
            }

            downloadName = downloadName + ".svg";

            const svgImage = "data:image/svg+xml;base64," + svgString;
            const svgBlob = new Blob([window.atob(decodeURIComponent(svgImage.substring(26))) + "<!-- created by SIMON: https://genular.org -->"], {
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
    },
    watch: {
        /**
         * Watch for model selection change
         * @param  {[type]} newVal [description]
         * @param  {[type]} oldVal [description]
         * @return {[type]}        [description]
         */
        selectedModelsIDs: function (newVal, oldVal) {
            console.log("modelDetailsTab getting new handleFetchSummaryPlots based on model change");
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
