<template>
    <div class="editing-overview-tab" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
        <el-row type="flex" align="top" v-if="tabEnabled === false">
            <el-col :span="24">
                <el-alert
                    :title="$t('views.apps.unsupervised_learning.editing.components.tabs.correlationTab.alert.function_disabled.title')"
                    description="Tab is currently disabled. Please try to refresh or choose another file from Workspace."
                    type="danger"
                    style="margin-top: 20px"
                    show-icon
                    :closable="false"
                ></el-alert>

                <!-- <pre>{{ JSON.stringify(selectedFileDetails, null, "\t") }}</pre> -->
            </el-col>
        </el-row>
        <el-row v-else type="flex" align="top">
            <el-col :span="4">
                <el-row>
                    <el-form ref="settingsForm" :model="settingsForm">
                        <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.overviewTab.form.columns.title')">

                            <el-button size="mini" class="filter-item" type="success" style="padding: 0" v-waves icon="el-icon-download" @click="downloadTable" round></el-button>
                            <el-tooltip placement="top" style="padding-left: 5px">
                                <div slot="content">{{ $t("views.apps.unsupervised_learning.editing.components.tabs.overviewTab.form.columns.description") }}</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            <el-button 
                                v-if="reverseSelectedColumns.length > 0" 
                                :title="bottomBarOpen ? 'Hide Details' : 'Show Details'" 
                                size="mini" 
                                class="filter-item" 
                                type="info" 
                                style="padding: 0; float: right" 
                                v-waves 
                                :icon="bottomBarOpen ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" 
                                @click="bottomBarOpen = !bottomBarOpen">
                            </el-button>
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
                                collapse-tags
                                :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.overviewTab.form.columns.placeholder')"
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

                        <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.overviewTab.form.first_n_columns.title')">
                            <el-input-number style="float: right" v-model="settingsForm.cutOffColumnSize" :step="10" :min="10" :max="50000"></el-input-number>
                            <el-tooltip placement="top" style="padding-left: 5px">
                                <div slot="content">
                                    {{ $t("views.apps.unsupervised_learning.editing.components.tabs.overviewTab.form.first_n_columns.description") }}
                                </div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-form-item>

                        <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.overviewTab.form.preprocess.title')">
                            <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.preProcessedData"></el-switch>
                            <el-tooltip placement="top">
                                <div slot="content">{{ $t("views.apps.unsupervised_learning.editing.components.tabs.overviewTab.form.preprocess.description") }}</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-form-item>

                        <el-divider></el-divider>

                        <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.overviewTab.form.theme.title')">
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

                        <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.overviewTab.form.color.title')">
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

                        <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.overviewTab.form.font_size.title')">
                            <el-input-number style="float: right" v-model="settingsForm.fontSize" :step="1" :min="8" :max="24"></el-input-number>
                        </el-form-item>

                        <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.overviewTab.form.ratio.title')">
                            <el-input-number style="float: right" size="mini" v-model="settingsForm.aspect_ratio" :step="0.1" :max="4" :min="1"></el-input-number>
                        </el-form-item>
                        <el-row>
                            <el-col :span="12" v-if="plot_data.saveObjectHash !== false">
                                <el-form-item>
                                    <el-tooltip placement="top">
                                        <div slot="content" v-html="$t('views.apps.unsupervised_learning.editing.index.button.download_r_data.description')"></div>
                                        <el-button style="float: left" type="danger" size="large" round @click="downloadRawData">
                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_r_data.title") }}
                                            <i class="el-icon-download el-icon-right"></i>
                                        </el-button>
                                    </el-tooltip>
                                </el-form-item>
                            </el-col>

                            <el-col :span="plot_data.saveObjectHash !== false ? 12 : 24">
                                <el-form-item>
                                    <el-button type="primary" size="large" round @click="redrawImage" style="float: right">
                                        {{ $t("views.apps.unsupervised_learning.editing.components.tabs.correlationTab.buttons.plot_image") }}
                                    </el-button>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </el-row>
            </el-col>
            <el-col :span="19" :offset="1" class="data-overview-container" style="text-align: center">
                <el-tabs v-model="activeTab" type="border-card" class="tab-container-second">
                    <el-tab-pane
                        :label="$t('views.apps.unsupervised_learning.editing.components.tabs.overviewTab.tabs.TablePlotTab.title')"
                        name="table_plot"
                        :disabled="isTabDisabled('table_plot')"
                    >
                        <el-row
                            v-bind:class="{
                                is_tab_active: isTabDisabled('table_plot'),
                            }"
                        >
                            <el-col v-if="plot_data.table_plot_png !== false">
                                <el-row>
                                    <el-col :span="24">
                                        <span>
                                            {{ $t("views.apps.unsupervised_learning.editing.components.tabs.overviewTab.tabs.TablePlotTab.description") }}
                                        </span>
                                    </el-col>
                                    <el-col :span="24">
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <div slot="content">
                                                <el-button type="success" round @click="downloadPlotImage('table_plot')">
                                                    {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                </el-button>
                                            </div>

                                            <img
                                                id="analysis_images_table_plot"
                                                class="animated fadeIn analysis_images"
                                                :src="'data:image/png;base64,' + plot_data.table_plot_png"
                                                fit="scale-down"
                                            />
                                        </el-tooltip>
                                    </el-col>
                                </el-row>
                            </el-col>
                            <el-col v-else class="plot-placeholder">
                                <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                    <el-tab-pane
                        :label="$t('views.apps.unsupervised_learning.editing.components.tabs.overviewTab.tabs.DistributionPlotTab.title')"
                        name="distribution_plot"
                        :disabled="isTabDisabled('distribution_plot')"
                    >
                        <el-row
                            v-bind:class="{
                                is_tab_active: isTabDisabled('distribution_plot'),
                            }"
                        >
                            <el-col v-if="plot_data.distribution_plot_png !== false">
                                <el-row>
                                    <el-col :span="24">
                                        <span>
                                            {{ $t("views.apps.unsupervised_learning.editing.components.tabs.overviewTab.tabs.TablePlotTab.description") }}
                                        </span>
                                    </el-col>
                                    <el-col :span="24">
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <div slot="content">
                                                <el-button type="success" round @click="downloadPlotImage('distribution_plot')">
                                                    {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                </el-button>
                                            </div>
                                            <img
                                                id="analysis_images_distribution_plot"
                                                class="animated fadeIn analysis_images"
                                                :src="'data:image/png;base64,' + plot_data.distribution_plot_png"
                                                fit="scale-down"
                                            />
                                        </el-tooltip>
                                    </el-col>
                                </el-row>
                            </el-col>
                            <el-col v-else class="plot-placeholder">
                                <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>

        <el-aside class="bottom-column-details-bar" :class="{ open: bottomBarOpen }">
            <el-row v-for="(item, index) in reverseSelectedColumns" :key="item.remapped">
                <el-card class="box-card box-column-item animated fadeIn" shadow="never">
                    <div slot="header" class="clearfix">
                        <span>{{ item.original }}</span>
                    </div>
                    <div class="box-column-item-text">
                        <el-tooltip placement="top">
                            <div slot="content">Total unique/distinct values in this column.</div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                        Unique values:
                        <div class="box-column-item-details">{{ item.unique_count }}</div>
                    </div>
                    <div class="box-column-item-text">
                        <el-tooltip placement="top">
                            <div slot="content">
                                Indicates whether the column contains only numeric values. Non-numeric columns will be excluded from PCA and other analyses.
                            </div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                        Valid numeric:
                        <div class="box-column-item-details">{{ item.valid_numeric === 1 ? "Yes" : "No" }}</div>
                    </div>
                    <div class="box-column-item-text">
                        <el-tooltip placement="top">
                            <div slot="content">Indicates if the column has zero variance. Columns with zero variance will be excluded from analyses.</div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                        Zero variance:
                        <div class="box-column-item-details">{{ item.valid_zv === 1 ? "Yes" : "No" }}</div>
                    </div>
                    <div class="box-column-item-text">
                        <el-tooltip placement="top">
                            <div slot="content">
                                Indicates if the column has fewer unique values than 10% of the total observations. Such columns are suitable as grouping variables in PCA and other analyses.
                            </div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                        Unique < 10%: <div class="box-column-item-details">{{ item.valid_10p === 1 ? "Yes" : "No" }}
                    </div>
                    </div>
                    <div class="box-column-item-text">
                        <el-tooltip placement="top">
                            <div slot="content">Percentage of missing (NA) values in this column.</div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                        NA values (%):
                        <div class="box-column-item-details">{{ item.na_percentage }}</div>
                    </div>
                </el-card>
            </el-row>
        </el-aside>
    </div>
</template>
<script>
import { fetchOverViewPlot } from "@/api/plots";
import Fuse from "fuse.js";

import plotColorPalettes from "@/assets/plots/color_palettes.json";
import plotThemes from "@/assets/plots/themes.json";

import waves from "@/directive/waves";

export default {
    name: "overviewTab",
    directives: {
        waves,
    },
    data() {
        return {
            bottomBarOpen: false,
            // This tab is disabled and we will enable it on initialization if there is no too much data
            tabEnabled: false,
            fuseIndex: null,

            loadingPlot: false,
            activeTab: "table_plot",

            selectedFileDetailsDisplay: [],

            settingsOptions: {
                theme: plotThemes,
                colorPalette: plotColorPalettes,
            },

            settingsForm: {
                selectedColumns: [],
                cutOffColumnSize: 10,
                groupingVariable: [],
                preProcessedData: true,
                fontSize: 12,
                theme: "theme_bw",
                colorPalette: "Set1",
                aspect_ratio: 1,
            },
            plot_data: {
                table_plot: false,
                table_plot_png: false,

                distribution_plot: false,
                distribution_plot_png: false,

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
        downloadTable() {
            const exportData = this.selectedFileDetails.columns;
            import("@/vendor/Export2Excel").then((excel) => {
                const tHeader = [
                    "Feature",
                    "Remapped",
                    this.$t("views.apps.unsupervised_learning.editing.index.validation.unique_count.title"),
                    this.$t("views.apps.unsupervised_learning.editing.index.validation.valid_numeric.title"),
                    this.$t("views.apps.unsupervised_learning.editing.index.validation.valid_zv.title"),
                    this.$t("views.apps.unsupervised_learning.editing.index.validation.valid_10p.title"),
                    this.$t("views.apps.unsupervised_learning.editing.index.validation.na_percentage.title"),
                ];

                const filterVal = ["original", "remapped", "unique_count", "valid_numeric", "valid_zv", "valid_10p", "na_percentage"];
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
            if (this.plot_data[tabName] !== false) {
                return false;
            } else {
                return true;
            }
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

            // If any columns are selected make remapping
            if (settingsForm.selectedColumns.length > 0) {
                settingsForm.selectedColumns = this.settingsForm.selectedColumns.map((x) => x.remapped);
            }

            // Remove any grouping variable from selected columns
            if (settingsForm.groupingVariable.length > 0) {
                settingsForm.selectedColumns = settingsForm.selectedColumns.filter((x) => !settingsForm.groupingVariable.includes(x));
            }

            // Check if selected columns are more than 0 but less than 2
            if (settingsForm.selectedColumns.length > 0 && settingsForm.selectedColumns.length < 2) {
                this.$message({
                    message: "Please select at least two columns for analysis.",
                    type: "error",
                });
                this.loadingPlot = false; // Stop loading spinner
                return; // Abort further execution
            }

            fetchOverViewPlot({
                selectedFileID: this.selectedFiles[0].id,
                settings: settingsForm,
            })
                .then((response) => {
                    let respData = response.data.message;
                    // Update the image data.
                    let lastValid = false;

                    for (let respIndex in respData) {
                        if (typeof this.plot_data[respIndex] !== "undefined") {
                            this.plot_data[respIndex] = false;
                            let respItem = respData[respIndex];

                            if (respItem.length < 15 || typeof respItem == "undefined" || (typeof respItem === "object" && Object.keys(respItem).length === 0 && respItem.constructor === Object)) {

                                if (!respIndex.endsWith("_png")) {
                                    this.$message({
                                        message: this.$t("views.apps.unsupervised_learning.editing.index.errors.plot_response.title"),
                                        type: "error",
                                    });
                                }
                            } else {
                                this.plot_data[respIndex] = encodeURIComponent(respItem);

                                if(!respIndex.endsWith("_png") && respIndex !== "saveObjectHash" && lastValid === false){
                                    lastValid = respIndex;
                                }
                            }
                        }
                    }
                    this.loadingPlot = false;
                    
                    this.$nextTick(() => {
                        console.log("Setting active tab: " + lastValid);
                        this.activeTab = lastValid;
                    });
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
        downloadPlotImage(imageType) {
            if (typeof this.plot_data[imageType] === "undefined") {
                return;
            }

            const svgImage = "data:image/svg+xml;base64," + this.plot_data[imageType];

            const svgBlob = new Blob([window.atob(decodeURIComponent(svgImage.substring(26))) + "<!-- created by PANDORA: https://atomic-lab.org -->"], {
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
        resetVariables() {
            this.fuseIndex = null;
            this.activeTab = "table_plot";
            this.selectedFileDetailsDisplay = [];

            this.settingsForm = {
                selectedColumns: [],
                groupingVariable: [],
                preProcessedData: true,
                fontSize: 12,
                theme: "theme_bw",
                colorPalette: "Set1",
                aspect_ratio: 1,
            };

            this.plot_data = {
                table_plot: false,
                table_plot_png: false,

                distribution_plot: false,
                distribution_plot_png: false,
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
    .data-overview-container {
        .el-tabs__header {
            padding-left: 20px;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
        }
    }

</style>
