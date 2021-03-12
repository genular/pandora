<template>
    <div class="overviewTab-container" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
        <el-row type="flex" align="top">
            <el-col :span="4">
                <el-row>
                    <el-form class="overviewTab-form" ref="settingsForm" :model="settingsForm">
                        <el-form-item label="Columns">
                            <el-select
                                style="float: right"
                                v-model="settingsForm.selectedColumns"
                                multiple
                                filterable
                                remote
                                default-first-option
                                reserve-keyword
                                value-key="remapped"
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.columns.placeholder')"
                                :remote-method="
                                    (userInput) => {
                                        querySearch(userInput);
                                    }
                                "
                            >
                                <el-option v-for="item in selectedFileDetailsDisplay" :key="item.remapped" :label="item.original" :value="item">
                                    <el-row style="max-width: 250px">
                                        <el-col :span="13" style="float: left; text-overflow: ellipsis; overflow: hidden; width: 90%; white-space: nowrap" :title="item.original">
                                            {{ item.original }}
                                        </el-col>
                                        <el-col :span="1" style="float: right; color: #8492a6; font-size: 13px">
                                            {{ item.valid_10p === 1 ? "*" : "" }}
                                            {{ item.unique_count }}
                                        </el-col>
                                    </el-row>
                                </el-option>
                            </el-select>
                            <el-button size="mini" class="filter-item" type="success" style="padding: 0" v-waves icon="el-icon-download" @click="downloadTable" round></el-button>
                            <el-tooltip placement="top" style="padding-left: 5px">
                                <div slot="content">Please select columns you wish to plot</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-form-item>

                        <el-form-item label="Preprocess">
                            <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.preProcessedData"></el-switch>
                            <el-tooltip placement="top">
                                <div slot="content">Should we apply preprocessing ("medianImpute", "center", "scale") to dataset before drawing any plots?</div>
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
                                    <el-button style="float: left" type="danger" round @click="downloadRawData">Download raw object</el-button>
                                </el-form-item>
                            </el-col>
                            <el-col :span="plot_data.saveObjectHash !== false ? 12 : 24">
                                <el-form-item>
                                    <el-button style="float: right" type="danger" round @click="redrawImage">Plot selection</el-button>
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
                    <el-tab-pane label="Table Plot" name="table_plot" :disabled="isTabDisabled('table_plot')">
                        <el-row
                            v-bind:class="{
                                is_tab_active: isTabDisabled('table_plot'),
                            }"
                        >
                            <el-col :span="24" v-if="plot_data.table_plot_png !== false">
                                <span>The tableplot is a visualization method that is used to explore and analyse large datasets.</span>
                            </el-col>
                            <el-col :span="24" v-if="plot_data.table_plot_png !== false">
                                <div v-if="plot_data.table_plot_png !== false">
                                    <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                        <div slot="content">
                                            <el-button type="success" round @click="downloadPlotImage('table_plot')">Download (.svg)</el-button>
                                        </div>

                                        <img
                                            id="analysis_images_table_plot"
                                            class="animated fadeIn analysis_images"
                                            :src="'data:image/png;base64,' + plot_data.table_plot_png"
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
                    <el-tab-pane label="Distribution Plot" name="distribution_plot" :disabled="isTabDisabled('distribution_plot')">
                        <el-row
                            v-bind:class="{
                                is_tab_active: isTabDisabled('distribution_plot'),
                            }"
                        >
                            <el-col :span="24" v-if="plot_data.table_plot_png !== false">
                                <span>
                                    Scatterplots of each pair of numeric variable are drawn on the left part of the figure. Pearson correlation is displayed on the right. Variable
                                    distribution is available on the diagonal. We will take maximum 10 columns into consideration.
                                </span>
                            </el-col>
                            <el-col :span="24" v-if="plot_data.distribution_plot_png !== false">
                                <div v-if="plot_data.distribution_plot_png !== false" style="text-align: center">
                                    <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                        <div slot="content">
                                            <el-button type="success" round @click="downloadPlotImage('distribution_plot')">Download (.svg)</el-button>
                                        </div>
                                        <img
                                            id="analysis_images_distribution_plot"
                                            class="animated fadeIn analysis_images"
                                            :src="'data:image/png;base64,' + plot_data.distribution_plot_png"
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
                </el-tabs>
            </el-col>
        </el-row>
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
            console.log(exportData);

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
            if (this.plot_data[tabName] !== false) {
                return false;
            } else {
                return true;
            }
        },
        redrawImage() {
            if (this.tabEnabled === true) {
                this.handleFetchOverViewImage();
            }
        },
        downloadRawData() {
            console.log(this.plot_data.saveObjectHash);
        },
        handleFetchOverViewImage() {
            this.loadingPlot = true;
            // Clone objects as an simple object
            const settingsForm = JSON.parse(JSON.stringify(this.settingsForm));
            // If no columns are selected select all columns
            if (settingsForm.selectedColumns.length < 1) {
                // settingsForm.selectedColumns = this.selectedFileDetails.columns.map((x) => x.remapped);
                settingsForm.selectedColumns = this.selectedFileDetails.columns
                    .filter((x) => x.valid_numeric)
                    .map((x) => x.remapped)
                    .slice(0, 10);
            } else {
                settingsForm.selectedColumns = this.settingsForm.selectedColumns.map((x) => x.remapped);
            }

            // Remove any grouping variable from selected columns
            if (settingsForm.groupingVariable.length > 0) {
                settingsForm.selectedColumns = settingsForm.selectedColumns.filter((x) => !settingsForm.groupingVariable.includes(x));
            }
            fetchOverViewPlot({
                selectedFileID: this.selectedFiles[0].id,
                settings: settingsForm,
            })
                .then((response) => {
                    let respData = response.data.message;
                    // Update the image data.
                    for (let respIndex in respData) {
                        if (typeof this.plot_data[respIndex] !== "undefined") {
                            this.plot_data[respIndex] = false;
                            let respItem = respData[respIndex];
                            if (respItem.length < 15 || typeof respItem == "undefined") {
                                this.plot_data[respIndex] = "error";
                                this.$message({
                                    message: "There was error in generating plot: " + respIndex,
                                    type: "error",
                                });
                            } else {
                                this.plot_data[respIndex] = encodeURIComponent(respItem);
                            }
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
