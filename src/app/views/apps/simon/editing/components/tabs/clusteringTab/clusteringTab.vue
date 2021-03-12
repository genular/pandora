<template>
    <div class="clusteringTab-container" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
        <el-row v-if="tabEnabled">
            <el-row type="flex" align="top">
                <el-col :span="24" style="text-align: right">
                    <el-button
                        :title="$t('views.apps.simon.exploration.components.tabs.clusteringTab.buttons.download')"
                        type="success"
                        icon="el-icon-download"
                        :disabled="plot_data.clustering_plot_png === false || loadingPlot"
                        @click="downloadPlotImage('clustering_plot')"
                    ></el-button>
                </el-col>
            </el-row>
            <el-row type="flex" align="top">
                <el-col :span="9">
                    <el-form ref="settingsForm" :model="settingsForm" class="clustering_form" label-width="200px">
                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.columns.title')">
                            <el-select
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
                                <el-option v-for="item in selectedFileDetailsDisplay" :key="item.remapped" :label="item.original" :value="item" :disabled="item.valid_10p !== 1">
                                    <span style="float: left">
                                        {{ item.original }}
                                    </span>
                                    <span style="float: right; color: #8492a6; font-size: 13px">
                                        {{ item.valid_10p === 1 ? "*" : "" }}
                                        {{ item.unique_count }}
                                    </span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.rows.title')">
                            <el-select
                                v-model="settingsForm.selectedRows"
                                multiple
                                filterable
                                remote
                                default-first-option
                                reserve-keyword
                                value-key="remapped"
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.rows.placeholder')"
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
                                    :disabled="item.valid_numeric !== 1"
                                >
                                    <span style="float: left">
                                        {{ item.original }}
                                    </span>
                                    <span style="float: right; color: #8492a6; font-size: 13px">
                                        {{ item.valid_10p === 1 ? "*" : "" }}
                                        {{ item.unique_count }}
                                    </span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.remove_na')">
                            <el-checkbox v-model="settingsForm.removeNA"></el-checkbox>
                        </el-form-item>

                        <el-form-item label="Preprocess">
                            <el-checkbox v-model="settingsForm.preProcessDataset"></el-checkbox>
                        </el-form-item>

                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.scale.label')">
                            <el-select v-model="settingsForm.scale" placeholder="Select">
                                <el-option
                                    v-for="item in settingOptions.scale"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.clusteringTab.form.scale.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.clusteringTab.form.scale.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <!-- ["numbers", "legend", "colnames", "rownames"] -->
                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.display.label')">
                            <el-checkbox-group class="checkbox_group" v-model="settingsForm.displayOptions" size="mini">
                                <el-checkbox
                                    v-for="(item, index) in settingOptions.displayOptions"
                                    :style="index !== 0 && index % 2 === 0 ? 'clear: left;float: left;margin-left: 0;' : ''"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.clusteringTab.form.display.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.clusteringTab.form.display.options." + item.id) }}</span>
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>

                        <el-form-item
                            v-if="settingsForm.displayOptions.indexOf('numbers') !== -1"
                            :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.numbers_size')"
                        >
                            <el-input-number
                                v-model="settingsForm.fontSizeNumbers"
                                :value="settingsForm.fontSizeNumbers"
                                :min="settingOptions.fontSizeNumbers.min"
                                :max="settingOptions.fontSizeNumbers.max"
                                :step="settingOptions.fontSizeNumbers.step"
                                controls-position="right"
                            ></el-input-number>
                        </el-form-item>
                        <el-form-item
                            v-if="settingsForm.displayOptions.indexOf('colnames') !== -1"
                            :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.colnames_size')"
                        >
                            <el-input-number
                                v-model="settingsForm.fontSizeCol"
                                :value="settingsForm.fontSizeCol"
                                :min="settingOptions.fontSizeCol.min"
                                :max="settingOptions.fontSizeCol.max"
                                :step="settingOptions.fontSizeCol.step"
                                controls-position="right"
                            ></el-input-number>
                        </el-form-item>
                        <el-form-item
                            v-if="settingsForm.displayOptions.indexOf('rownames') !== -1"
                            :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.rownames_size')"
                        >
                            <el-input-number
                                v-model="settingsForm.fontSizeRow"
                                :value="settingsForm.fontSizeRow"
                                :min="settingOptions.fontSizeRow.min"
                                :max="settingOptions.fontSizeRow.max"
                                :step="settingOptions.fontSizeRow.step"
                                controls-position="right"
                            ></el-input-number>
                        </el-form-item>

                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.plot_width')">
                            <el-input-number
                                v-model="settingsForm.plotWidth"
                                :value="settingsForm.plotWidth"
                                :min="settingOptions.plotWidth.min"
                                :max="settingOptions.plotWidth.max"
                                :step="settingOptions.plotWidth.step"
                                controls-position="right"
                            ></el-input-number>
                        </el-form-item>
                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.plot_ratio')">
                            <el-input-number
                                v-model="settingsForm.plotRatio"
                                :value="settingsForm.plotRatio"
                                :min="settingOptions.plotRatio.min"
                                :max="settingOptions.plotRatio.max"
                                :step="settingOptions.plotRatio.step"
                                controls-position="right"
                            ></el-input-number>
                        </el-form-item>

                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.clust_distance.label')">
                            <el-select
                                v-model="settingsForm.clustDistance"
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.clust_distance.placeholder')"
                            >
                                <el-option
                                    v-for="item in settingOptions.clustDistance"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.clusteringTab.form.clust_distance.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.clusteringTab.form.clust_distance.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.clust_method.label')">
                            <el-select
                                v-model="settingsForm.clustLinkage"
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.clust_method.placeholder')"
                            >
                                <el-option
                                    v-for="item in settingOptions.clustLinkage"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.clusteringTab.form.clust_method.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.clusteringTab.form.clust_method.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.tree_ordering.label')">
                            <el-select
                                v-model="settingsForm.clustOrdering"
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.tree_ordering.placeholder')"
                            >
                                <el-option
                                    v-for="item in settingOptions.clustOrdering"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.clusteringTab.form.tree_ordering.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.clusteringTab.form.tree_ordering.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.font_size')">
                            <el-input-number
                                v-model="settingsForm.fontSizeGeneral"
                                :value="settingsForm.fontSizeGeneral"
                                :min="settingOptions.fontSizeGeneral.min"
                                :max="settingOptions.fontSizeGeneral.max"
                                :step="settingOptions.fontSizeGeneral.step"
                                controls-position="right"
                            ></el-input-number>
                        </el-form-item>
                        <el-row>
                            <el-col :span="6" v-if="plot_data.saveObjectHash !== false">
                                <el-form-item>
                                    <el-button style="float: left" type="danger" round @click="downloadRawData">Download raw object</el-button>
                                </el-form-item>
                            </el-col>
                            <el-col :span="plot_data.saveObjectHash !== false ? 6 : 6">
                                <el-form-item>
                                    <el-button type="danger" round @click="redrawImage" style="float: left">
                                        {{ $t("views.apps.simon.exploration.components.tabs.clusteringTab.buttons.plot_image") }}
                                    </el-button>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </el-col>
                <el-col :span="15" class="correlation-svg-container" style="text-align: center">
                    <!-- Plot placeholder -->
                    <div v-if="plot_data.clustering_plot_png !== false" style="text-align: center">
                        <img
                            id="analysis_images_clustering_plot"
                            class="animated fadeIn analysis_images"
                            :src="'data:image/png;base64,' + plot_data.clustering_plot_png"
                            fit="scale-down"
                        />
                    </div>
                    <div v-else class="plot-placeholder">
                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                    </div>
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
import { fetchEditingClusteringPlotImage } from "@/api/plots";
import { md5String } from "@/utils";
import { debounce } from "@/utils/helpers";
import Fuse from "fuse.js";

export default {
    name: "clusteringTab",
    data() {
        return {
            // This tab is disabled and we will enable it on initialization if there is no too much data
            fuseIndex: null,
            // This tab is disabled and we will enable it on initialization if there is no too much data
            tabEnabled: false,
            loadingOptions: true,

            loadingPlot: false,

            plot_data: {
                clustering_plot: false,
                clustering_plot_png: false,

                saveObjectHash: false,
            },
            selectedFileDetailsDisplay: [],

            settingOptions: {
                scale: [{ id: "row" }, { id: "column" }, { id: "none" }],
                displayOptions: [{ id: "numbers" }, { id: "legend" }, { id: "colnames" }, { id: "rownames" }],

                plotWidth: {
                    min: 5,
                    max: 50,
                    step: 1,
                },
                plotRatio: {
                    min: 0.1,
                    max: 3,
                    step: 0.01,
                },
                clustDistance: [{ id: "correlation" }, { id: "euclidean" }, { id: "maximum" }, { id: "manhattan" }, { id: "canberra" }, { id: "binary" }, { id: "minkowski" }],
                clustLinkage: [
                    { id: "single" },
                    { id: "complete" },
                    { id: "average" },
                    { id: "mcquitty" },
                    { id: "median" },
                    { id: "centroid" },
                    { id: "ward.D2" },
                    { id: "ward.D" },
                ],
                clustOrdering: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],

                fontSizeGeneral: {
                    min: 5,
                    max: 24,
                    step: 0.5,
                },
                fontSizeRow: {
                    min: 5,
                    max: 24,
                    step: 0.5,
                },
                fontSizeCol: {
                    min: 5,
                    max: 24,
                    step: 0.5,
                },
                fontSizeNumbers: {
                    min: 5,
                    max: 24,
                    step: 0.5,
                },
            },
            settingsForm: {
                selectedColumns: [],
                selectedRows: [],

                removeNA: true,
                preProcessDataset: true,
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
                fontSizeNumbers: 7,
            },
        };
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
        this.isTabEnabled();
    },
    activated() {
        console.log("activated: " + this.$options.name);
        this.isTabEnabled();
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
    methods: {
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
            const items_found = this.fuse.search(query);
            this.selectedFileDetailsDisplay = items_found.map((x) => x.item);
        },
        redrawImage() {
            if (this.tabEnabled === true) {
                this.handleFetchEditingClusteringPlotImage();
            }
        },
        downloadRawData() {
            console.log(this.plot_data.saveObjectHash);
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
        handleFetchEditingClusteringPlotImage() {
            this.loadingPlot = true;
            // Clone objects as an simple object
            const settingsForm = JSON.parse(JSON.stringify(this.settingsForm));
            const availableColumns = this.selectedFileDetails.columns;
            availableColumns.sort((a, b) => (a.na_percentage < b.na_percentage ? -1 : 1));

            // If no columns are selected
            if (settingsForm.selectedColumns.length < 1) {
                settingsForm.selectedColumns = availableColumns
                    .filter((x) => x.valid_10p)
                    .map((x) => x.remapped)
                    .slice(0, 2);
            } else {
                settingsForm.selectedColumns = settingsForm.selectedColumns.map((x) => x.remapped);
            }
            // If no columns are selected
            if (settingsForm.selectedRows.length < 1) {
                settingsForm.selectedRows = availableColumns
                    .filter((x) => x.valid_numeric)
                    .map((x) => x.remapped)
                    .slice(0, 25);
            } else {
                settingsForm.selectedRows = settingsForm.selectedRows.map((x) => x.remapped);
            }

            settingsForm.selectedRows = settingsForm.selectedRows.filter((x) => !settingsForm.selectedColumns.includes(x));

            fetchEditingClusteringPlotImage({ selectedFileID: this.selectedFiles[0].id, settings: settingsForm })
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
        resetVariables() {},
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
#plot_output_image {
    width: 100%;
}
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
