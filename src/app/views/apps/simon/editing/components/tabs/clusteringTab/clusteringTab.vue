<template>
    <div class="clusteringTab-container" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
        <el-row v-if="tabEnabled">
            <el-row type="flex" align="top">
                <el-col :span="24" style="text-align: right">
                    <el-button
                        :title="$t('views.apps.simon.exploration.components.tabs.clusteringTab.buttons.download')"
                        type="success"
                        icon="el-icon-download"
                        :disabled="renderedImage === '' || loadingPlot"
                        @click="downloadPlotImage"
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
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.columns.placeholder')"
                                :remote-method="querySearch"
                            >
                                <el-option v-for="item in selectedFileDetailsDisplay" :key="item.remapped" :label="item.original" :value="item.remapped">
                                    <span style="float: left">{{ item.original }}</span>
                                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.unique_count }}</span>
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
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.rows.placeholder')"
                                :remote-method="querySearch"
                            >
                                <el-option v-for="item in selectedFileDetailsDisplay" :key="item.remapped" :label="item.original" :value="item.remapped">
                                    <span style="float: left">{{ item.original }}</span>
                                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.unique_count }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.remove_na')">
                            <el-checkbox v-model="settingsForm.removeNA"></el-checkbox>
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
                        <el-form-item label="">
                            <el-button type="danger" size="mini" icon="el-icon-picture-outline" @click="redrawImage" round>
                                {{ $t("views.apps.simon.exploration.components.tabs.clusteringTab.buttons.plot_image") }}
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="15" class="correlation-svg-container" style="text-align: center">
                    <!-- Plot placeholder -->
                    <div v-if="renderedImage !== false" style="text-align: center">
                        <img id="plot_output_image" class="animated fadeIn" :src="renderedImageDisplay" fit="scale-down" />
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
            tabEnabled: false,
            loadingOptions: true,

            loadingPlot: false,

            renderedImage: false,
            renderedImageDisplay: false,
            renderedImageData: "",

            selectedFileDetailsDisplay: [],

            resample: [],
            settingOptions: {
                columns: [],
                features: [],
                // removeNA: false,
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
                fontSizeNumbers: 7,
            },
        };
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
        this.redrawImage();
        this.initFuse(this.selectedFileDetails.items);
    },
    activated() {
        console.log("activated: " + this.$options.name);
        this.redrawImage();
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
            this.fuse = new Fuse(searchItems, {
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
            this.isTabEnabled();

            if (this.tabEnabled === true) {
                this.handleFetchEditingClusteringPlotImage();
            }
        },
        isTabEnabled() {
            if (this.selectedFileDetails.items.length >= 1 && this.selectedFileDetails.id === this.selectedFiles.map((x) => x.id)[0]) {
                this.tabEnabled = true;
            } else {
                this.tabEnabled = false;
            }

            if (this.tabEnabled === true && this.selectedFileDetailsDisplay.length === 0) {
                this.selectedFileDetailsDisplay = this.selectedFileDetails.items;
            }
        },
        downloadPlotImage() {
            const svgBlob = new Blob([window.atob(decodeURIComponent(this.renderedImage.substring(26))) + "<!-- created by SIMON: https://genular.org -->"], {
                type: "image/svg+xml;charset=utf-8",
            });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = "editing-correlation.svg";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        },
        handleFetchEditingClusteringPlotImage() {
            this.loadingPlot = true;

            fetchEditingClusteringPlotImage({ selectedFileID: this.selectedFiles[0].id, settings: this.settingsForm })
                .then((response) => {
                    if (response.data.status === true) {
                        this.renderedImage = "data:image/svg+xml;base64," + encodeURIComponent(response.data.image);
                        this.renderedImageDisplay = "data:image/png;base64," + encodeURIComponent(response.data.image_png);
                    } else {
                        this.$message({
                            message: response.data.error_message,
                            type: "error",
                        });
                        this.renderedImage = false;
                        this.renderedImageDisplay = false;
                        this.loadingPlot = false;
                    }

                    this.loadingPlot = false;
                })
                .catch((error) => {
                    this.$message({
                        message: this.$t("globals.errors.request_general"),
                        type: "error",
                    });
                    console.log(error);
                    this.renderedImage = false;
                    this.renderedImageDisplay = false;
                    this.loadingPlot = false;
                });
        },
    },
    watch: {
        selectedFileDetails: function (newVal, oldVal) {
            console.log("File selected change detected " + this.$options.name);
            if (newVal.items.length >= 1 && newVal.items.length < 5000) {
                this.tabEnabled = true;
                this.initFuse(newVal);
                this.selectedFileDetailsDisplay = newVal;
            } else {
                this.tabEnabled = false;
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
