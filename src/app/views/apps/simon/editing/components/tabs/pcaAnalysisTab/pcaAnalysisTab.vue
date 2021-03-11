<template>
    <div class="pcaAnalysisTab-container" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
        <el-row v-if="tabEnabled">
            <el-row type="flex" align="top">
                <el-col :span="4">
                    <el-form class="corrolation-form" ref="settingsForm" :model="settingsForm">
                        <el-form-item label="Columns:">
                            <el-select
                                style="float: right"
                                v-model="settingsForm.selectedColumns"
                                multiple
                                filterable
                                remote
                                default-first-option
                                reserve-keyword
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.columns.placeholder')"
                                :remote-method="
                                    (userInput) => {
                                        querySearch(userInput, 'columns_all');
                                    }
                                "
                            >
                                <el-option v-for="item in selectedOptions.columns_all" :key="item.remapped" :label="item.original" :value="item.remapped">
                                    <span style="float: left">
                                        {{ item.original }}
                                    </span>
                                    <span style="float: right; color: #8492a6; font-size: 13px">
                                        {{ item.unique_count }}
                                    </span>
                                </el-option>
                            </el-select>
                            <el-tooltip placement="top">
                                <div slot="content">
                                    Rows that contain one or more NAs will be excluded from the PCA. Variables with zero variance have been automatically removed because they're
                                    not useful in a PCA.
                                </div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-form-item>

                        <el-form-item label="Grouping variable:">
                            <el-select
                                style="float: right"
                                v-model="settingsForm.groupingVariable"
                                filterable
                                default-first-option
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.columns.placeholder')"
                                :remote-method="
                                    (userInput) => {
                                        querySearch(userInput, 'columns_grouping');
                                    }
                                "
                            >
                                <el-option v-for="item in selectedOptions.columns_grouping" :key="item.remapped" :label="item.original" :value="item.remapped">
                                    <span style="float: left">
                                        {{ item.original }}
                                    </span>
                                    <span style="float: right; color: #8492a6; font-size: 13px">
                                        {{ item.unique_count }}
                                    </span>
                                </el-option>
                            </el-select>
                            <el-tooltip placement="top">
                                <div slot="content">
                                    Only variables where the number of unique values is less than 10% of the total number of observations are shown here (because seeing groups with
                                    1-2 observations is usually not very useful).
                                </div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-form-item>

                        <el-form-item label="X axis:">
                            <el-select
                                style="float: right"
                                v-model="settingsForm.selectedComponentsX"
                                filterable
                                default-first-option
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.columns.placeholder')"
                                :remote-method="
                                    (userInput) => {
                                        querySearch(userInput, 'pca_components');
                                    }
                                "
                            >
                                <el-option v-for="item in selectedOptions.pca_components_x" :key="item" :label="item" :value="item">
                                    <span style="float: left">{{ item }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Y axis:">
                            <el-select
                                style="float: right"
                                v-model="settingsForm.selectedComponentsY"
                                filterable
                                default-first-option
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.columns.placeholder')"
                                :remote-method="
                                    (userInput) => {
                                        querySearch(userInput, 'pca_components');
                                    }
                                "
                            >
                                <el-option v-for="item in selectedOptions.pca_components_y" :key="item" :label="item" :value="item">
                                    <span style="float: left">{{ item }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-divider></el-divider>

                        <el-form-item label="Display Loadings">
                            <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.displayLoadings"></el-switch>
                        </el-form-item>

                        <el-form-item>
                            <el-button style="float: right" type="danger" round @click="redrawImage">Compute</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="19" :offset="1" class="correlation-svg-container" style="text-align: center">
                    <el-row>
                        <el-tabs v-model="activePCATabName" @tab-click="handleTabClick">
                            <el-tab-pane label="Bartlett's sphericity" name="summary_bartlett" :disabled="isTabDisabled('plot_pca')">
                                <el-row
                                    v-bind:class="{
                                        is_tab_active: isTabDisabled('plot_pca'),
                                    }"
                                >
                                    <el-col :span="24" v-if="data_summary.summary_bartlett !== false">
                                        <div class="code-output">
                                            <div class="code-header">
                                                Among SPSS users, these tests are considered to provide some guidelines on the suitability of the data for a principal components
                                                analysis. However, they may be safely ignored in favor of common sense. Variables with zero variance are excluded.
                                                <br />
                                                Here is the output of Bartlett's sphericity test. Bartlett's test of sphericity tests whether the data comes from multivariate
                                                normal distribution with zero covariances. If p > 0.05 then PCA may not be very informative
                                            </div>
                                            <div class="highlight_code">
                                                {{ data_summary.summary_bartlett }}
                                            </div>
                                        </div>

                                        <div class="code-output">
                                            <div class="code-header">
                                                Here is the output of the Kaiser-Meyer-Olkin (KMO) index test. The overall measure varies between 0 and 1, and values closer to 1
                                                are better. A value of 0.6 is a suggested minimum.
                                            </div>
                                            <div class="highlight_code">
                                                {{ data_summary.summary_kmo }}
                                            </div>
                                        </div>
                                    </el-col>
                                </el-row>
                            </el-tab-pane>
                            <el-tab-pane label="Plot Scree" name="plot_scree" :disabled="isTabDisabled('plot_pca')">
                                <el-row
                                    v-bind:class="{
                                        is_tab_active: isTabDisabled('plot_pca'),
                                    }"
                                >
                                    <el-col :span="24" v-if="plot_data.plot_scree_png !== false">
                                        <span>
                                            A Scree Plot is a simple line segment plot that shows the eigenvalues for each individual PC. When the eigenvalues drop dramatically in
                                            size, an additional factor would add relatively little to the information already extracted. Cumulative variance is explained by each PC
                                            (in %)
                                        </span>
                                    </el-col>
                                    <el-col :span="24" v-if="plot_data.plot_scree_png !== false">
                                        <div v-if="plot_data.plot_scree_png !== false">
                                            <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                <div slot="content">
                                                    <el-button type="success" round @click="downloadPlotImage('plot_scree')">Download (.svg)</el-button>
                                                </div>
                                                <img
                                                    id="analysis_images_scree"
                                                    class="animated fadeIn"
                                                    :src="'data:image/png;base64,' + plot_data.plot_scree_png"
                                                    fit="scale-down"
                                                />
                                            </el-tooltip>
                                        </div>
                                        <div class="plot-placeholder" v-else>
                                            <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                        </div>
                                    </el-col>
                                </el-row>
                            </el-tab-pane>
                            <el-tab-pane label="PCA Components" name="plot_pca" :disabled="isTabDisabled('plot_pca')">
                                <el-row
                                    v-bind:class="{
                                        is_tab_active: isTabDisabled('plot_pca'),
                                    }"
                                >
                                    <el-col :span="24" v-if="plot_data.plot_pca_png !== false">
                                        <div v-if="plot_data.plot_pca_png !== false" style="text-align: center">
                                            <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                <div slot="content">
                                                    <el-button type="success" round @click="downloadPlotImage('plot_pca')">Download (.svg)</el-button>
                                                </div>
                                                <img
                                                    id="analysis_images_pca"
                                                    class="animated fadeIn analysis_images"
                                                    :src="'data:image/png;base64,' + plot_data.plot_pca_png"
                                                    fit="scale-down"
                                                />
                                            </el-tooltip>
                                        </div>
                                        <div class="plot-placeholder" v-else>
                                            <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                        </div>
                                    </el-col>
                                    <!--
                                    <el-col :span="12" v-if="plot_data.plot_pca_zoomed_png !== false">
                                        <div v-if="plot_data.plot_pca_zoomed_png !== false" style="text-align: center">
                                            <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                <div slot="content">
                                                    <el-button type="success" round @click="downloadPlotImage('plot_pca_zoomed')">Download (.svg)</el-button>
                                                </div>
                                                <img
                                                    id="analysis_images_pca_zoomed"
                                                    class="animated fadeIn analysis_images"
                                                    :src="'data:image/png;base64,' + plot_data.plot_pca_zoomed_png"
                                                    fit="scale-down"
                                                />
                                            </el-tooltip>
                                        </div>
                                        <div class="plot-placeholder" v-else>
                                            <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                        </div>
                                    </el-col>
                                    -->
                                </el-row>
                            </el-tab-pane>
                            <el-tab-pane label="PCA Output" name="plot_output" :disabled="isTabDisabled('plot_pca')">
                                <el-row
                                    v-bind:class="{
                                        is_tab_active: isTabDisabled('plot_pca'),
                                    }"
                                >
                                    <el-col :span="24" v-if="data_summary.pca_summary !== false">
                                        <div class="code-output">
                                            <div class="highlight_code">
                                                {{ data_summary.pca_summary }}
                                            </div>
                                        </div>
                                        <!--
                                        <el-table
                                              :data="data_summary.pca_dataframe"
                                              style="width: 100%">
                                            <el-table-column v-for="column in data_summary.pca_dataframe_columns" 
                                                             :key="column"
                                                             :prop="column"
                                                             :label="column">
                                            </el-table-column>
                                        </el-table>
                                        -->
                                    </el-col>
                                </el-row>
                            </el-tab-pane>
                        </el-tabs>
                    </el-row>
                </el-col>
            </el-row>
        </el-row>
        <!-- ELSE if Tab is DISABLED -->
        <el-row v-else>
            <el-col :span="24">
                <el-alert
                    :title="$t('views.apps.simon.exploration.components.tabs.correlationTab.alert.function_disabled.title')"
                    description="Tab is currently disabled! Total columns in selected: selectedFileDetails"
                    type="warning"
                    style="margin-top: 20px"
                    show-icon
                    :closable="false"
                ></el-alert>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { fetchEditingPcaAnalysisPlot, fetchEditingPcaAnalysisPlotZoomed, getPCAavailableColumns } from "@/api/plots";
import { md5String } from "@/utils";
import { debounce } from "@/utils/helpers";

import Fuse from "fuse.js";

import { createLasso } from "@/vendor/lasso.js";

export default {
    name: "pcaAnalysisTab",
    data() {
        return {
            // This tab is disabled and we will enable it on initialization if there is no too much data
            tabEnabled: false,
            loadingOptions: true,
            loadingPlot: false,

            activePCATabName: "summary_bartlett",

            plot_data: {
                plot_scree: false,
                plot_scree_png: false,

                plot_pca: false,
                plot_pca_png: false,

                plot_pca_zoomed: false,
                plot_pca_zoomed_png: false,
            },
            data_summary: {
                pca_summary: false,
                summary_bartlett: false,
                summary_kmo: false,
                panel_scales_y: false,
                panel_scales_x: false,
                pca_dataframe: false,
                pca_dataframe_columns: [],
            },
            // Placeholder for dropdown columns - not used in this case
            selectedFileDetailsDisplay: [],

            selectedOptions: {
                columns_all: [],
                columns_grouping: [],
                columns_excluded_all: [],
                columns_excluded_grouping: [],
                pca_components_x: [],
                pca_components_y: [],
            },
            settingsForm: {
                selectedColumns: [],
                pcaComponentsDisplayX: [],
                pcaComponentsDisplayY: [],
                groupingVariable: [],
                displayLoadings: true,
            },
            fuseIndex: {
                columns_all: null,
                columns_grouping: null,
                pca_components: null,
            },
            lasso: null,
            selected_cordinates: null,
        };
    },
    computed: {
        activeTabName: {
            get() {
                return this.$store.getters.simonExplorationActiveTabName;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationnActiveTabName", value);
            },
        },
        // Array of selected files from Workspace
        selectedFiles: {
            get() {
                return this.$store.getters.selectedFiles;
            },
            set(value) {
                this.$store.dispatch("setSelectedFiles", value);
            },
        },
        selectedFileDetails: {
            get() {
                return this.$store.getters.selectedFileDetails;
            },
            set(value) {
                this.$store.dispatch("setSelectedFileDetails", value);
            },
        },
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
        this.isTabEnabled();
    },
    activated() {
        console.log("activated: " + this.$options.name);
        this.isTabEnabled();
        this.getAvailableColumns();
    },
    methods: {
        getAvailableColumns() {
            this.loadingPlot = true;
            getPCAavailableColumns({
                selectedFileID: this.selectedFiles[0].id,
                settings: this.settingsForm,
            })
                .then((response) => {
                    let respData = response.data.message;
                    for (let respIndex in respData) {
                        let respItem = respData[respIndex];
                        this.selectedOptions[respIndex] = respItem;
                        // Initialize new FUSE index
                        if (respIndex !== "columns_excluded_all" || respIndex !== "columns_excluded_grouping") {
                            this.initFuse(respItem, respIndex);
                        }
                    }

                    this.loadingPlot = false;
                })
                .catch((error) => {
                    console.log("Server error occurred");
                    console.log(error);
                    this.loadingPlot = false;
                });
        },
        initFuse(searchItems, indexType) {
            let mapping_keys = null;

            if (indexType !== "pca_components") {
                mapping_keys = [
                    {
                        name: "original",
                        weight: 0.7,
                    },
                    {
                        name: "remapped",
                        weight: 0.3,
                    },
                ];
            }
            if (typeof this.fuseIndex[indexType] !== "undefined") {
                console.log("Initializing FUSE index: " + indexType);
                console.log(searchItems);
                this.fuseIndex[indexType] = new Fuse(searchItems, {
                    keys: mapping_keys,
                });
            } else {
                console.log("Unknown FUSE index: " + indexType);
            }
        },
        querySearch(query, indexType) {
            if (this.fuseIndex[indexType] !== null) {
                console.log("Searching FUSE index: " + indexType);
                console.log(query);
                let items_found = [];
                if (query.length > 1) {
                    items_found = this.fuseIndex[indexType].search(query);
                }
                console.log(items_found);
                if (items_found.length > 0) {
                    this.selectedOptions[indexType] = items_found.map((x) => x.item);
                } else {
                    this.selectedOptions[indexType] = [];
                }
            } else {
                console.log("FUSE index is null: " + indexType);
            }
        },
        redrawImage() {
            if (this.tabEnabled === true) {
                this.handleFetchCorrPlotImage();
            }
        },
        isTabEnabled() {
            if (this.selectedFileDetails.items.length >= 1 && this.selectedFileDetails.id === this.selectedFiles.map((x) => x.id)[0]) {
                this.tabEnabled = true;
            } else {
                this.tabEnabled = false;
            }
        },
        isTabDisabled(tabName) {
            if (this.plot_data[tabName] !== false) {
                return false;
            } else {
                return true;
            }
        },
        downloadPlotImage(imageType) {
            if (typeof this.plot_data[imageType] === "undefined") {
                return;
            }

            const svgImage = "data:image/svg+xml;base64," + this.plot_data[imageType];

            const svgBlob = new Blob([window.atob(decodeURIComponent(svgImage.substring(26))) + "<!-- created by SIMON: https://genular.org -->"], {
                type: "image/svg+xml;charset=utf-8",
            });

            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = this.$options.name + "_" + imageType + ".svg";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        },
        handleFetchCorrPlotImage() {
            this.loadingPlot = true;
            // Clone objects as an simple object
            const settingsForm = JSON.parse(JSON.stringify(this.settingsForm));
            // If no columns are selected select all columns
            if (settingsForm.selectedColumns.length < 1) {
                settingsForm.selectedColumns = this.selectedOptions.columns_all.map((x) => x.remapped);
            }

            // Remove any grouping variable from selected columns
            if (settingsForm.groupingVariable.length > 0) {
                settingsForm.selectedColumns = settingsForm.selectedColumns.filter((x) => !settingsForm.groupingVariable.includes(x));
            }

            if (this.lasso !== null) {
                this.lasso.destroy();
                this.lasso = null;
            }

            fetchEditingPcaAnalysisPlot({
                selectedFileID: this.selectedFiles[0].id,
                settings: settingsForm,
            })
                .then((response) => {
                    let respData = response.data.message;
                    let respDataDetails = response.data.details;

                    this.data_summary.pca_dataframe = respDataDetails.pca_dataframe;
                    this.data_summary.pca_dataframe_columns = Object.keys(respDataDetails.pca_dataframe[0]);

                    console.log(this.data_summary.pca_dataframe_columns);

                    this.data_summary.pca_summary = window.atob(respDataDetails.pca_summary);
                    this.data_summary.summary_bartlett = window.atob(respDataDetails.summary_bartlett);
                    this.data_summary.summary_kmo = window.atob(respDataDetails.summary_kmo);

                    this.data_summary.panel_scales_y = respDataDetails.panel_scales_y;
                    this.data_summary.panel_scales_x = respDataDetails.panel_scales_x;

                    this.selectedOptions.pca_components_x = respDataDetails.pca_components;
                    this.selectedOptions.pca_components_y = respDataDetails.pca_components;

                    // Update the image data.
                    for (let respIndex in respData) {
                        this.plot_data[respIndex] = false;
                        let respItem = respData[respIndex];
                        if (respItem.length < 15) {
                            this.plot_data[respIndex] = line_chart_404;
                        } else {
                            this.plot_data[respIndex] = encodeURIComponent(respItem);
                        }
                    }
                    this.loadingPlot = false;
                })
                .catch((error) => {
                    console.log("Server error occurred");
                    console.log(error);
                    this.loadingPlot = false;
                });
        },
        processCordinates(details) {
            console.log("processing coordinates");
            console.log(details);

            let x_cord = details.cord.map((item) => item.x);
            let y_cord = details.cord.map((item) => item.y);

            let x_width = this.data_summary.panel_scales_x.reduce((a, b) => Math.abs(a) + Math.abs(b));
            let y_width = this.data_summary.panel_scales_y.reduce((a, b) => Math.abs(a) + Math.abs(b));

            console.log(x_cord);
            console.log(y_cord);

            // Original plot width
            console.log(x_width);
            console.log(y_width);

            // Displayed plot width
            console.log(details.display.width);
            console.log(details.display.height);

            // x_cord = x_cord.map(x => x * scale_factor)
            // y_cord = y_cord.map(x => x * scale_factor)

            //const display_width_x = Math.max(...nums) - Math.min(...nums);

            return;
        },
        handleFetchCorrPlotImageZoomed() {
            this.loadingPlot = true;

            const cordinates = this.selected_cordinates.cord.map(({ x, y }) => x + "," + y).join(" ");
            console.log(cordinates);
            return;

            fetchEditingPcaAnalysisPlotZoomed({
                selectedFileID: this.selectedFiles[0].id,
                settings: this.settingsForm,
                selected_cordinates: cordinates,
            })
                .then((response) => {
                    let respData = response.data.message;
                    for (let respIndex in respData) {
                        let respItem = respData[respIndex];
                        if (respItem.length < 15) {
                            this.plot_data[respIndex] = line_chart_404;
                        } else {
                            this.plot_data[respIndex] = encodeURIComponent(respItem);
                        }
                    }

                    this.loadingPlot = false;
                })
                .catch((error) => {
                    console.log("Server error occurred");
                    console.log(error);
                    this.loadingPlot = false;
                });
        },
        handleTabClick(tab, event) {
            console.log("Initializing new canvas object; ");
            console.log(this.activePCATabName);
            console.log(this.lasso);
            if (this.activePCATabName === "plot_pca" && this.lasso === null) {
                this.$nextTick(() => {
                    // setTimeout(() => this.initCanvas("analysis_images_pca"), 1000);
                });
            }
        },
        initCanvas(imageID) {
            this.lasso = createLasso({
                element: document.getElementById(imageID),
                radius: 10,
                onComplete: (path) => {
                    this.selected_cordinates = path;
                },
            });
        },
    },
    watch: {
        selectedFileDetails: function (newVal, oldVal) {
            console.log("File selected change detected " + this.$options.name);

            if (newVal.items.length >= 1) {
                this.tabEnabled = true;
            } else {
                this.tabEnabled = false;
            }
            // Refresh column choices
            if (this.tabEnabled === true) {
                this.getAvailableColumns();
            }
        },
        selected_cordinates: function (newVal, oldVal) {
            this.processCordinates(newVal);
        },
        deep: true,
    },
};
</script>
<style rel="stylesheet/scss" lang="scss">
.el-tooltip__popper.is-light[x-placement^="top"] .popper__arrow {
    border-top-color: transparent !important;
    border: 0 !important;
}

.el-tooltip__popper.is-light[x-placement^="top"] .popper__arrow:after {
    border-top-color: transparent !important;
    border: 0 !important;
}

.download_tooltip {
    background: none !important;
    border: none !important;
    border-top-color: transparent !important;
}
.is_tab_active {
    opacity: 0.1;
}
.code-output {
    max-height: 1000px;
    font-size: 12px;
    overflow: auto;
    margin-top: 15px;
    text-align: left;

    .highlight_code {
        font-family: monospace;
        white-space: pre;
        background-color: #20262e;
        color: #afff00;
        border-radius: 15px;
        padding: 10px;
        font-size: 14px;
    }

    .code-header {
        font-size: 16px;
        padding-bottom: 15px;
    }
}
.analysis_images {
    // width: 700px;
    // max-height: 700px;
    // float: left;
}
</style>
