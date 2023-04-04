<template>
    <div class="editing-umap-tab" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
        <el-row type="flex" align="top" v-if="tabEnabled === false">
            <el-col :span="24">
                <el-alert
                    :title="$t('views.apps.unsupervised_learning.editing.components.tabs.correlationTab.alert.function_disabled.title')"
                    description="Tab is currently disabled. Please try to refresh or choose another file from Workspace."
                    type="warning"
                    style="margin-top: 20px"
                    show-icon
                    :closable="false"
                ></el-alert>
            </el-col>
        </el-row>
        <el-row v-else type="flex" align="top">
            <el-col :span="4">
                <el-row>
                    <el-form ref="settingsForm" :model="settingsForm">
                        <el-form-item label="Columns">

                            <el-button size="mini" class="filter-item" type="success" style="padding: 0" v-waves icon="el-icon-download" @click="downloadTable" round></el-button>
                            <el-tooltip placement="top" style="padding-left: 5px">
                                <div slot="content">Please select columns you wish to analyze and plot. Leaving this empty will take all columns except excluded ones.</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            <br />
                            <el-select
                                style="float: left;width: 100%;"
                                v-model="settingsForm.selectedColumns"
                                multiple
                                filterable
                                remote
                                default-first-option
                                reserve-keyword
                                value-key="remapped"
                                clearable
                                :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.columns.placeholder')"
                                :remote-method="
                                    (userInput) => {
                                        querySearch(userInput);
                                    }
                                "
                            >
                                <el-option
                                    v-for="item in selectedFileDetailsDisplay"
                                    :key="item.remapped"
                                    :label="item.original"
                                    :value="item"
                                    v-bind:class="{
                                        item_danger: item.valid_numeric !== 1,
                                    }"
                                >
                                    <el-row>
                                        <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                            {{ item.original }}
                                        </el-col>
                                        <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right;">
                                            {{ item.valid_10p === 1 ? "*" : "" }}
                                            {{ item.unique_count }}
                                            {{ item.na_percentage > 0 ? "NA" : "" }}
                                        </el-col>
                                    </el-row>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="First (n) columns">
                            <el-tooltip placement="top" style="padding-left: 5px">
                                <div slot="content">If you have not selected any columns we will take first n columns from your dataset, based on this value.</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            <br />
                            <el-input-number style="float: left; width: 100%;" v-model="settingsForm.cutOffColumnSize" :step="10" :min="2" :max="50000"></el-input-number>
                        </el-form-item>

                        <el-form-item label="Exclude Columns">
                            <el-tooltip placement="top" style="padding-left: 5px">
                                <div slot="content">Please select any columns you wish to exclude from analysis.</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            <br />
                            <el-select
                                style="float: left;width: 100%;"
                                v-model="settingsForm.excludedColumns"
                                multiple
                                filterable
                                remote
                                default-first-option
                                reserve-keyword
                                value-key="remapped"
                                clearable
                                :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.columns.placeholder')"
                                :remote-method="
                                    (userInput) => {
                                        querySearch(userInput);
                                    }
                                "
                            >
                                <el-option v-for="item in selectedFileDetailsDisplay" :key="item.remapped" :label="item.original" :value="item">
                                    <el-row>
                                        <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                            {{ item.original }}
                                        </el-col>
                                        <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right;">
                                            {{ item.valid_10p === 1 ? "*" : "" }}
                                            {{ item.unique_count }}
                                            {{ item.na_percentage > 0 ? "NA" : "" }}
                                        </el-col>
                                    </el-row>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Grouping variable">
                            <el-tooltip placement="top" style="padding-left: 5px">
                                <div slot="content">Please select categorical column to "group by" UMAP plot. Grouping variable(s) will be excluded from UMAP analysis.</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            <br />
                            <el-select
                                style="float: left;width: 100%;"
                                v-model="settingsForm.groupingVariables"
                                multiple
                                filterable
                                remote
                                default-first-option
                                reserve-keyword
                                value-key="remapped"
                                clearable
                                :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.columns.placeholder')"
                                :remote-method="
                                    (userInput) => {
                                        querySearch(userInput);
                                    }
                                "
                            >
                                <el-option
                                    v-for="item in selectedFileDetailsDisplay"
                                    :key="item.remapped"
                                    :label="item.original"
                                    :value="item"
                                    :disabled="item.valid_10p !== 1 || item.unique_count < 2"
                                >
                                    <el-row>
                                        <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                            {{ item.original }}
                                        </el-col>
                                        <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right;">
                                            {{ item.valid_10p === 1 ? "*" : "" }}
                                            {{ item.unique_count }}
                                            {{ item.na_percentage > 0 ? "NA" : "" }}
                                        </el-col>
                                    </el-row>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <!--
                        <el-form-item label="Keep groups?">
                            <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.includeOtherGroups"></el-switch>
                            <el-tooltip placement="top">
                                <div slot="content">
                                    When we process each umap computation for each group selected should we drop other group columns if any selected or keep them in analysis?
                                </div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-form-item>
                        -->

                        <el-form-item label="Preprocess">
                            <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.preProcessDataset"></el-switch>
                            <el-tooltip placement="top">
                                <div slot="content">Should we apply preprocessing ("medianImpute", "center", "scale") and remove zero-variance, near-zero-variance and highly correlated features before any calculation?</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-form-item>

                        <el-form-item label="Remove NA">
                            <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.removeNA"></el-switch>
                            <el-tooltip placement="top">
                                <div slot="content">Should we drop rows with NA values in dataset before any calculation?</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-form-item>

                        <el-form-item label="Partition split">
                            <el-slider
                                style="clear: both; width: 100%; float: right"
                                v-model="settingsForm.selectedPartitionSplit"
                                :step="5"
                                :min="50"
                                :max="100"
                                show-input
                                :format-tooltip="formatPartitionSplitTooltip"
                                show-stops
                            ></el-slider>
                            <el-tooltip placement="top">
                                <div slot="content">
                                    If you wish to compute Supervised Learning on umap please mark what percentage should we use for Train and Test dataset. They will be split
                                    based on distribution of grouping variables.
                                </div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-form-item>

                        <el-divider></el-divider>

                        <el-form-item label="Theme">
                            <el-select v-model="settingsForm.theme" size="mini" placeholder="Select" style="float: right">
                                <el-option v-for="item in settingsOptions.theme" :key="item.id" :label="item.name" :value="item.id">
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
                                <el-option v-for="item in settingsOptions.colorPalette" :key="item.id" :label="item.value" :value="item.id">
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
                            <el-input-number style="float: right" v-model="settingsForm.fontSize" :step="1" :min="8" :max="24"></el-input-number>
                        </el-form-item>

                        <el-form-item label="Ratio">
                            <el-input-number style="float: right" size="mini" v-model="settingsForm.aspect_ratio" :step="0.1" :max="4" :min="1"></el-input-number>
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
                                    <el-button type="primary" round @click="redrawImage" style="float: right">
                                        {{ $t("views.apps.unsupervised_learning.editing.components.tabs.correlationTab.buttons.plot_image") }}
                                    </el-button>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </el-row>
                <el-row v-for="(item, index) in reverseSelectedColumns" :key="item.remapped">
                    <el-card class="box-card box-column-item animated fadeIn">
                        <div slot="header" class="clearfix">
                            <span>{{ item.original }}</span>
                        </div>
                        <div class="box-column-item-text">
                            <el-tooltip placement="top">
                                <div slot="content">Total number of unique/distinct values in the column</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            Number of unique values:
                            <div class="box-column-item-details">{{ item.unique_count }}</div>
                        </div>
                        <div class="box-column-item-text">
                            <el-tooltip placement="top">
                                <div slot="content">
                                    Checks if selected column valid numeric one. If it contains anything else than numeric values this check will not pass. Such columns will be
                                    excluded from PCA and other types of analysis.
                                </div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            Valid numeric:
                            <div class="box-column-item-details">{{ item.valid_numeric === 1 ? "Yes" : "No" }}</div>
                        </div>
                        <div class="box-column-item-text">
                            <el-tooltip placement="top">
                                <div slot="content">Checks if selected column is zero variance. Such columns will be excluded from PCA and other types of analysis.</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            Zero variance:
                            <div class="box-column-item-details">{{ item.valid_zv === 1 ? "Yes" : "No" }}</div>
                        </div>
                        <div class="box-column-item-text">
                            <el-tooltip placement="top">
                                <div slot="content">
                                    Checks if number of unique values in the column are less than 10% the number of observations. We would use such columns as Grouping variables in
                                    PCA and other types of analysis.
                                </div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            Unique 10%:
                            <div class="box-column-item-details">{{ item.valid_10p === 1 ? "Yes" : "No" }}</div>
                        </div>
                        <div class="box-column-item-text">
                            <el-tooltip placement="top">
                                <div slot="content">Total percentage of NA values found in selected column.</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            Percentage of NA values:
                            <div class="box-column-item-details">{{ item.na_percentage }}</div>
                        </div>
                    </el-card>
                </el-row>
            </el-col>
            <el-col :span="19" :offset="1" class="correlation-svg-container" style="text-align: center">
                <el-tabs v-model="activeTab">
                    <el-tab-pane label="UMAP Plot" name="umap_plot" :disabled="isTabDisabled('umap_plot')">
                        <el-tabs :value="plot_data.umap_plot.length > 0 ? 'tab_umap_grouped_0' : null" :tab-position="'right'">
                            <el-tab-pane
                                v-for="(plotData, plotIndex) in plot_data.umap_plot"
                                :key="'tab_umap_grouped_' + plotIndex"
                                :label="plotData.name"
                                :name="'tab_umap_grouped_' + plotIndex"
                            >
                                <el-row>
                                    <el-col :span="24">
                                        <span class="tab_intro_text" v-if="plotData.name === 'Main Plot'">
                                            UMAP Display of Supervised Learning embedding, where numeric values are leveraged so that similar points are closer together.
                                        </span>
                                        <span class="tab_intro_text" v-else>
                                            UMAP Display of Metric Learning embedding, where numeric values are leveraged so that similar points are closer together.
                                            <br />
                                            <div v-if="typeof plotData.text !== 'undefined' && plotData.text.length > 0">
                                                {{ plotData.text }}
                                            </div>
                                        </span>
                                    </el-col>

                                    <el-col
                                        :span="typeof plotData.test !== 'undefined' && typeof plotData.test.png !== 'undefined' ? 12 : 24"
                                        v-if="plotData.train"
                                        class="umap_training"
                                    >
                                        Training
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <div slot="content">
                                                <el-button type="success" round @click="downloadPlotImage('umap_plot', plotIndex)">
                                                    {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                </el-button>
                                            </div>
                                            <img
                                                id="analysis_images_pca"
                                                class="animated fadeIn analysis_images"
                                                :src="'data:image/png;base64,' + plotData.train.png"
                                                fit="scale-down"
                                            />
                                        </el-tooltip>
                                    </el-col>

                                    <el-col :span="12" v-if="typeof plotData.test !== 'undefined' && typeof plotData.test.png !== 'undefined'" class="umap_testing">
                                        Testing
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <div slot="content">
                                                <el-button type="success" round @click="downloadPlotImage('umap_plot', plotIndex)">
                                                    {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                </el-button>
                                            </div>
                                            <img
                                                id="analysis_images_pca"
                                                class="animated fadeIn analysis_images"
                                                :src="'data:image/png;base64,' + plotData.test.png"
                                                fit="scale-down"
                                            />
                                        </el-tooltip>
                                    </el-col>
                                </el-row>
                            </el-tab-pane>
                        </el-tabs>
                    </el-tab-pane>
                    <el-tab-pane label="SVM" name="umap_svm" :disabled="true">
                        <el-row>
                            <el-col :span="24"></el-col>
                        </el-row>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { getOverViewAavailableColumns, fetchUmapPlot } from "@/api/plots";
import Fuse from "fuse.js";

import plotColorPalettes from "@/assets/plots/color_palettes.json";
import plotThemes from "@/assets/plots/themes.json";

import waves from "@/directive/waves";

export default {
    name: "umapTab",
    directives: {
        waves,
    },
    data() {
        return {
            // This tab is disabled and we will enable it on initialization if there is no too much data
            tabEnabled: false,
            fuseIndex: null,
            loadingPlot: false,
            activeTab: "umap_plot",

            selectedFileDetailsDisplay: [],

            settingsOptions: {
                availableColumns: [],
                theme: plotThemes,
                colorPalette: plotColorPalettes,
            },

            settingsForm: {
                selectedColumns: [],
                excludedColumns: [],
                groupingVariables: [],
                preProcessDataset: true,
                fontSize: 12,
                theme: "theme_bw",
                colorPalette: "Set1",
                aspect_ratio: 1,

                cutOffColumnSize: 50000,
                removeNA: true,

                selectedPartitionSplit: 100,
                includeOtherGroups: false,
                anyNAValues: false,
                categoricalVariables: false
            },
            plot_data: {
                umap_plot: [],

                saveObjectHash: false,
            },
        };
    },
    computed: {
        activeTabName: {
            get() {
                return this.$store.getters.pandoraExplorationActiveTabName;
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
        reverseSelectedColumns() {
            return this.settingsForm.selectedColumns.slice().reverse();
        },
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
        this.isTabEnabled();
    },
    activated() {
        console.log("activated: " + this.$options.name);
        this.isTabEnabled();
    },
    methods: {
        formatPartitionSplitTooltip(val) {
            const training = Math.round(val);
            const testing = Math.round(100 - training);
            const message =
                this.$t("views.apps.pandora.analysis.components.FileDetails.other.training") +
                ": " +
                training +
                "% - " +
                this.$t("views.apps.pandora.analysis.components.FileDetails.other.testing") +
                ": " +
                testing +
                "%";

            return message;
        },
        downloadTable() {
            const exportData = this.selectedFileDetails.columns;
            import("@/vendor/Export2Excel").then((excel) => {
                const tHeader = ["Feature", "Remapped", "Unique values", "Numeric", "Zero variance", "10% Unique", "NA percentage"];
                const filterVal = ["original", "remapped", "unique_count", "valid_numeric", "valid_zv", "valid_10p", "na_percentage"];

                console.log(tHeader);

                excel.export_json_to_excel(tHeader, this.formatJson(filterVal, exportData), "column_info");
            });
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map((v) =>
                filterVal.map((j) => {
                    if (j === "submitted") {
                        return parseTime(v[j]);
                    } else {
                        return v[j];
                    }
                })
            );
        },
        isTabEnabled() {
            if (this.selectedFileDetails.columns.length >= 1 && this.selectedFileDetails.id === this.selectedFiles.map((x) => x.id)[0]) {
                this.tabEnabled = true;
            } else {
                this.tabEnabled = false;
            }

            if (this.tabEnabled === true && this.fuseIndex === null) {
                this.initFuse(this.selectedFileDetails.columns);
            }
        },
        isTabDisabled(tabName) {
            let isDisabled = true;
            if (Array.isArray(this.plot_data[tabName]) === false && this.plot_data[tabName] !== false) {
                isDisabled = false;
            } else if (Array.isArray(this.plot_data[tabName]) === true && this.plot_data[tabName].length === 0) {
                isDisabled = true;
            } else if (typeof this.plot_data[tabName] === "undefined") {
                isDisabled = true;
            } else if (this.plot_data[tabName].length > 0) {
                isDisabled = false;
            } else {
                isDisabled = true;
            }
            return isDisabled;
        },
        redrawImage() {
            if (this.tabEnabled === true) {
                this.fetchRemoteAnalysis();
            }
        },
        downloadRawData() {
            const downloadLink = this.$store.getters.user_settings_server_address_plots + "/plots/general/download-saved-object?objectHash=" + this.plot_data.saveObjectHash;
            window.open(downloadLink, "_blank");
        },
        fetchRemoteAnalysis() {
            this.loadingPlot = true;
            // Clone objects as an simple object
            const settingsForm = JSON.parse(JSON.stringify(this.settingsForm));

            // If any columns are selected get their names
            if (settingsForm.selectedColumns.length > 0) {
                settingsForm.selectedColumns = this.settingsForm.selectedColumns.map((x) => x.remapped);
            }

            // Remove any excluded columns from selected columns
            if (settingsForm.excludedColumns !== null && typeof settingsForm.excludedColumns === "object") {
                settingsForm.excludedColumns = this.settingsForm.excludedColumns.map((x) => x.remapped);
                settingsForm.selectedColumns = settingsForm.selectedColumns.filter((x) => !settingsForm.excludedColumns.includes(x));
            }

            // Remove any grouping variable from selected columns
            if (settingsForm.groupingVariables.length > 0) {
                settingsForm.groupingVariables = settingsForm.groupingVariables.map((x) => x.remapped);
                // Remove Grouping variable from selected columns
                settingsForm.selectedColumns = settingsForm.selectedColumns.filter((x) => !settingsForm.groupingVariables.includes(x));
                // Remove Grouping variable from excluded columns
                settingsForm.excludedColumns = settingsForm.excludedColumns.filter((x) => !settingsForm.groupingVariables.includes(x));
            }

            if (settingsForm.selectedPartitionSplit !== 100 && settingsForm.groupingVariables.length === 0) {
                settingsForm.selectedPartitionSplit = 100;
                this.settingsForm.selectedPartitionSplit = 100;
            }

            this.settingsForm.anyNAValues = false;
            this.settingsForm.categoricalVariables = false;
            // Loop selectedColumns and groupingVariables to check if any are NA
            settingsForm.groupingVariables.forEach((x) => {
                let item = this.settingsForm.groupingVariables.find(o => o.remapped === x);

                if (item && item.na_percentage > 0) {
                    this.settingsForm.anyNAValues = true;
                }
            });

            // If the are any NA Values in grouping variables we need to have removeNA option enabled
            if(this.settingsForm.anyNAValues === true){
                if(this.settingsForm.removeNA === false){
                    this.$message({
                        message: "NA Values detected in 'grouping variables'. Please enable 'Remove NA' option.",
                        type: "error",
                    });
                    this.loadingPlot = false;
                    return;
                }
            }
            // If the are any NA Values in selectedColumns we need to have removeNA or preProcessDataset option enabled
            settingsForm.selectedColumns.forEach((x) => {
                let item = this.settingsForm.selectedColumns.find(o => o.remapped === x);
                if (item && item.na_percentage > 0) {
                    this.settingsForm.anyNAValues = true;
                }
                if (item.unique_count <= 2) {
                    this.settingsForm.categoricalVariables = true;
                }
            });

            if(this.settingsForm.anyNAValues === true){
                if(this.settingsForm.removeNA === false && this.settingsForm.preProcessDataset === false){
                    this.$message({
                        message: "NA Values detected in 'selected columns'. Please enable 'Remove NA' or 'Pre-process dataset' option.",
                        type: "error",
                    });
                    this.loadingPlot = false;
                    return;
                }
            }

            fetchUmapPlot({
                selectedFileID: this.selectedFiles[0].id,
                settings: settingsForm,
            })
                .then((response) => {
                    let respData = response.data.message;
                    this.plot_data["umap_plot"] = [];
                    // Update the image data.
                    for (let respIndex in respData) {
                        if (typeof this.plot_data[respIndex] !== "undefined") {
                            let respItem = respData[respIndex];
                            if (typeof respItem === "object" && Object.keys(respItem).length === 0) {
                                this.plot_data[respIndex] = false;
                            } else if (typeof respItem === "object") {
                                for (let respItemIndex in respItem) {
                                    let respItemSub = respItem[respItemIndex];
                                    this.plot_data[respIndex].push(respItemSub);
                                }
                            } else {
                                this.plot_data[respIndex] = encodeURIComponent(respItem);
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

                    // Loop this.plot_data and set all keys to false
                    for (let plotIndex in this.plot_data) {
                        this.plot_data[plotIndex] = false;
                    }
                });
        },
        initFuse(searchItems) {
            this.selectedFileDetailsDisplay = searchItems;

            this.fuseIndex = new Fuse(searchItems, {
                shouldSort: true,
                threshold: 0.4,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 0,
                includeScore: false,
                includeMatches: true,
                keys: [
                    {
                        name: "original",
                        weight: 0.7,
                    },
                    {
                        name: "remapped",
                        weight: 0.3,
                    },
                ],
            });
        },
        querySearch(query) {
            const items_found = this.fuseIndex.search(query);
            this.selectedFileDetailsDisplay = items_found.map((x) => x.item);
        },
        downloadPlotImage(imageType, itemIndex = null) {
            if (typeof this.plot_data[imageType] === "undefined") {
                return;
            }
            let svgString = "";
            let downloadName = this.$options.name + "_" + imageType;
            if (itemIndex !== null) {
                if (typeof this.plot_data[imageType][itemIndex] !== "undefined") {
                    svgString = this.plot_data[imageType][itemIndex].svg;
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
            const svgBlob = new Blob([window.atob(decodeURIComponent(svgImage.substring(26))) + "<!-- created by PANDORA: https://genular.org -->"], {
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
        resetVariables() {
            this.fuseIndex = null;
            this.plot_data = {
                umap_plot: false,

                saveObjectHash: false,
            };
        },
    },

    watch: {
        selectedFileDetails: function (newVal, oldVal) {
            console.log("File selected change detected " + this.$options.name);
            if (newVal.columns.length >= 1) {
                this.tabEnabled = true;
            } else {
                this.tabEnabled = false;
            }
            this.resetVariables();

            if (this.tabEnabled === true) {
                this.initFuse(newVal.columns);
            }
        },
        deep: true,
    },
};
</script>
<style rel="stylesheet/scss" lang="scss">
.box-column-item {
    margin-top: 10px;

    .box-column-item-text {
        font-size: 14px;
        padding-top: 5px;

        .box-column-item-details {
            float: right;
        }
    }
}
.analysis_images {
    max-width: 100%;
}
</style>
