<template>
    <div class="editing-clustering-tab" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
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
                <el-form ref="settingsForm" :model="settingsForm">
                    <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.columns.title')">
                        <el-button size="mini" class="filter-item" type="success" style="padding: 0" v-waves icon="el-icon-download" @click="downloadTable" round></el-button>
                        <el-tooltip placement="top" style="padding-left: 5px">
                            <div slot="content">
                                {{ $t("views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.columns.description") }}
                            </div>
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
                            collapse-tags
                            :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.columns.placeholder')"
                            :remote-method="
                                (userInput) => {
                                    querySearch(userInput);
                                }
                            "
                        >
                            <el-option v-for="item in selectedFileDetailsDisplay" :key="item.remapped" :label="item.original" :value="item" :disabled="item.valid_10p !== 1">
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

                    <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.first_n_columns.title')">
                        <el-tooltip placement="top" style="padding-left: 5px">
                            <div slot="content">
                                {{ $t("views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.first_n_columns.description") }}
                            </div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                        <br />
                        <el-input-number style="float: left;width: 100%;" v-model="settingsForm.cutOffColumnSize" :step="1" :min="1" :max="15"></el-input-number>
                    </el-form-item>

                    <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.rows.title')">
                        <br />
                        <el-select
                            style="float: left;width: 100%;"
                            v-model="settingsForm.selectedRows"
                            multiple
                            filterable
                            remote
                            default-first-option
                            reserve-keyword
                            value-key="remapped"
                            clearable
                            collapse-tags
                            :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.rows.placeholder')"
                            :remote-method="
                                (userInput) => {
                                    querySearch(userInput);
                                }
                            "
                        >
                            <el-option v-for="item in selectedFileDetailsDisplay" :key="item.remapped" :label="item.original" :value="item" :disabled="item.valid_numeric !== 1">
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

                    <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.first_n_rows.title')">
                        <el-tooltip placement="top" style="padding-left: 5px">
                            <div slot="content">
                                {{ $t("views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.first_n_rows.description") }}
                            </div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                        <br />
                        <el-input-number style="float: left;width: 100%;" v-model="settingsForm.cutOffRowSize" :step="10" :min="10" :max="10000"></el-input-number>
                    </el-form-item>

                    <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.preprocess.title')">
                        <el-tooltip placement="top">
                            <div slot="content">
                                Should we apply preprocessing ("medianImpute", "center", "scale") and remove zero-variance, near-zero-variance and highly correlated features
                                before any calculation?
                            </div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                        <el-select
                            style="float: left; width: 100%"
                            v-model="selectedPreProcess"
                            clearable
                            :placeholder="$t('views.apps.supervised_learning.analysis.components.FileDetails.body.preprocessing.placeholder')"
                            multiple
                        >
                            <el-option v-for="item in selectedPreProcessOptions" :key="item.value" :value="item.value" :disabled="item.disabled">
                                <span style="float: left; margin-right: 10px; color: #8492a6; font-size: 13px">{{ item.value }}</span>
                                <span style="float: right">
                                    {{ $t("views.apps.supervised_learning.analysis.components.FileDetails.body.preprocessing.dropdown." + item.value) }}
                                </span>
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.remove_na.title')">
                        <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.removeNA"></el-switch>
                        <el-tooltip placement="top">
                            <div slot="content">{{ $t("views.apps.unsupervised_learning.editing.components.tabs.overviewTab.form.remove_na.description") }}</div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                    </el-form-item>

                    <el-form-item label="Grouped display">
                        <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.datasetAnalysisGrouped"></el-switch>
                        <el-tooltip placement="top">
                            <div slot="content">
                               Should we display mean values of clusters on a heatmap, scale by row, when enabled or column?
                            </div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                    </el-form-item>

                    <el-form-item label="Groupped column">
                        <el-select style="float: left; width: 100%" v-model="settingsForm.datasetAnalysisGroupedColumn" 
                            filterable remote default-first-option 
                            reserve-keyword value-key="remapped" 
                            clearable collapse-tags
                            :disabled="settingsForm.datasetAnalysisGrouped == false" 
                            :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.columns.placeholder')" :remote-method="
                                (userInput) => {
                                    querySearch(userInput);
                                }
                            ">
                            <el-option v-for="item in selectedFileDetailsDisplay" :key="item.remapped" :label="item.original" :value="item">
                                <el-row>
                                    <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                        {{ item.original }}
                                    </el-col>
                                    <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right">
                                        {{ item.valid_10p === 1 ? "*" : "" }}
                                        {{ item.unique_count }}
                                        {{ item.na_percentage > 0 ? "NA" : "" }}
                                    </el-col>
                                </el-row>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.scale.label')">
                        <br />
                        <el-select 
                        v-model="settingsForm.scale" 
                        style="float: left;width: 100%;" 
                        placeholder="Select">
                            <el-option
                                v-for="item in settingOptions.scale"
                                :key="item.id"
                                :label="$t(['views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.scale.options.', item.id].join(''))"
                                :value="item.id"
                            >
                                <span>{{ $t("views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.scale.options." + item.id) }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <!-- ["numbers", "legend", "colnames", "rownames"] -->
                    <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.display.label')">
                        <el-checkbox-group style="float: right" class="checkbox_group" v-model="settingsForm.displayOptions" size="mini">
                            <el-checkbox
                                v-for="(item, index) in settingOptions.displayOptions"
                                :style="index !== 0 && index % 2 === 0 ? 'width: 50%; margin-right: 0; clear: left;float: left;margin-left: 0;' : 'width: 50%; margin-right: 0;'"
                                :key="item.id"
                                :label="$t(['views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.display.options.', item.id].join(''))"
                                :value="item.id"
                            >
                                <span>{{ $t("views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.display.options." + item.id) }}</span>
                            </el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>

                    <el-form-item
                        v-if="settingsForm.displayOptions.indexOf('numbers') !== -1"
                        :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.numbers_size')"
                    >
                        <el-input-number
                            style="float: right"
                            v-model="settingsForm.fontSizeNumbers"
                            :value="settingsForm.fontSizeNumbers"
                            :min="settingOptions.fontSizeNumbers.min"
                            :max="settingOptions.fontSizeNumbers.max"
                            :step="settingOptions.fontSizeNumbers.step"
                        ></el-input-number>
                    </el-form-item>
                    <el-form-item
                        v-if="settingsForm.displayOptions.indexOf('colnames') !== -1"
                        :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.colnames_size')"
                    >
                        <el-input-number
                            style="float: right"
                            v-model="settingsForm.fontSizeCol"
                            :value="settingsForm.fontSizeCol"
                            :min="settingOptions.fontSizeCol.min"
                            :max="settingOptions.fontSizeCol.max"
                            :step="settingOptions.fontSizeCol.step"
                        ></el-input-number>
                    </el-form-item>
                    <el-form-item
                        v-if="settingsForm.displayOptions.indexOf('rownames') !== -1"
                        :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.rownames_size')"
                    >
                        <el-input-number
                            style="float: right"
                            v-model="settingsForm.fontSizeRow"
                            :value="settingsForm.fontSizeRow"
                            :min="settingOptions.fontSizeRow.min"
                            :max="settingOptions.fontSizeRow.max"
                            :step="settingOptions.fontSizeRow.step"
                        ></el-input-number>
                    </el-form-item>

                    <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.plot_width')">
                        <el-input-number
                            style="float: right"
                            v-model="settingsForm.plotWidth"
                            :value="settingsForm.plotWidth"
                            :min="settingOptions.plotWidth.min"
                            :max="settingOptions.plotWidth.max"
                            :step="settingOptions.plotWidth.step"
                        ></el-input-number>
                    </el-form-item>
                    <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.plot_ratio')">
                        <el-input-number
                            style="float: right"
                            v-model="settingsForm.plotRatio"
                            :value="settingsForm.plotRatio"
                            :min="settingOptions.plotRatio.min"
                            :max="settingOptions.plotRatio.max"
                            :step="settingOptions.plotRatio.step"
                        ></el-input-number>
                    </el-form-item>

                    <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.clust_distance.label')">
                        <br />
                        <el-select
                            style="float: left;width: 100%;" 
                            v-model="settingsForm.clustDistance"
                            :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.clust_distance.placeholder')"
                        >
                            <el-option
                                v-for="item in settingOptions.clustDistance"
                                :key="item.id"
                                :label="$t(['views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.clust_distance.options.', item.id].join(''))"
                                :value="item.id"
                            >
                                <span>{{ $t("views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.clust_distance.options." + item.id) }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.clust_method.label')">
                        <br />
                        <el-select
                            style="float: left;width: 100%;" 
                            v-model="settingsForm.clustLinkage"
                            :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.clust_method.placeholder')"
                        >
                            <el-option
                                v-for="item in settingOptions.clustLinkage"
                                :key="item.id"
                                :label="$t(['views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.clust_method.options.', item.id].join(''))"
                                :value="item.id"
                            >
                                <span>{{ $t("views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.clust_method.options." + item.id) }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.tree_ordering.label')">
                        <br />
                        <el-select
                            style="float: left;width: 100%;" 
                            v-model="settingsForm.clustOrdering"
                            :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.tree_ordering.placeholder')"
                        >
                            <el-option
                                v-for="item in settingOptions.clustOrdering"
                                :key="item.id"
                                :label="$t(['views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.tree_ordering.options.', item.id].join(''))"
                                :value="item.id"
                            >
                                <span>{{ $t("views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.tree_ordering.options." + item.id) }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.font_size')">
                        <el-input-number
                            style="float: right"
                            v-model="settingsForm.fontSizeGeneral"
                            :value="settingsForm.fontSizeGeneral"
                            :min="settingOptions.fontSizeGeneral.min"
                            :max="settingOptions.fontSizeGeneral.max"
                            :step="settingOptions.fontSizeGeneral.step"
                        ></el-input-number>
                    </el-form-item>

                    <el-row>
                        <el-col :span="12" v-if="plot_data.saveObjectHash !== false">
                            <el-form-item>
                                <el-tooltip placement="top">
                                    <div slot="content">
                                        {{ $t("views.apps.unsupervised_learning.editing.index.button.download_r_data.description") }}
                                    </div>
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
            </el-col>

            <el-col :span="19" :offset="1">
                <el-row v-if="plot_data.clustering_plot !== false" style="text-align: center">
                    <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                        <div slot="content">
                            <el-button type="success" round @click="downloadPlotImage('clustering_plot')">
                                {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                            </el-button>
                        </div>
                        <img
                            id="analysis_images_clustering_plot"
                            class="animated fadeIn analysis_images"
                            :src="'data:image/png;base64,' + plot_data.clustering_plot_png"
                            fit="scale-down"
                        />
                    </el-tooltip>
                </el-row>
                <el-row v-else class="plot-placeholder">
                    <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { fetchEditingClusteringPlotImage } from "@/api/plots";
import { md5String } from "@/utils";
import { debounce } from "@/utils/helpers";
import Fuse from 'fuse.js'

import waves from "@/directive/waves";

export default {
    name: "clusteringTab",
    directives: {
        waves,
    },
    data() {
        return {
            // This tab is disabled and we will enable it on initialization if there is no too much data
            fuseIndex: null,
            // This tab is disabled and we will enable it on initialization if there is no too much data
            tabEnabled: false,
            loadingOptions: true,

            loadingPlot: false,

            selectedPreProcessOptions: [
                {
                    value: "center",
                    incompatible: [],
                    disabled: false,
                },
                {
                    value: "scale",
                    incompatible: [],
                    disabled: false,
                },
                {
                    value: "knnImpute",
                    incompatible: ["scale", "center"],
                    disabled: false,
                },
                {
                    value: "bagImpute",
                    incompatible: ["medianImpute"],
                    disabled: false,
                },
                {
                    value: "medianImpute",
                    incompatible: ["bagImpute"],
                    disabled: false,
                },
                {
                    value: "corr",
                    incompatible: [],
                    disabled: false,
                },
                {
                    value: "zv",
                    incompatible: [],
                    disabled: false,
                },
                {
                    value: "nzv",
                    incompatible: [],
                    disabled: false,
                }
            ],
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

                cutOffColumnSize: 5,
                cutOffRowSize: 25,

                removeNA: true,
                preProcessDataset: [],
                scale: "column",
                datasetAnalysisGrouped: false,
                datasetAnalysisGroupedColumn: [],

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
        selectedPreProcess: {
            get() {
                return this.$store.getters.pandoraEditingSelectedPreProcess;
            },
            set(value) {
                this.$store.dispatch("setSimonEditingSelectedPreProcess", value);
            },
        },
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
            if (!this.fuseIndex) {
                // Prevent running the function if fuse is not initialized
                console.error("Fuse is not initialized.");
                return;
            }
            
            const items_found = this.fuseIndex.search(query);
            this.selectedFileDetailsDisplay = items_found.map((x) => x.item);
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
            const svgBlob = new Blob([window.atob(decodeURIComponent(svgImage.substring(26))) + "<!-- created by PANDORA: https://genular.org -->"], {
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
        fetchRemoteAnalysis() {

            this.loadingPlot = true;
            this.settingsForm.preProcessDataset = this.selectedPreProcess;

            // Clone objects as an simple object
            const settingsForm = JSON.parse(JSON.stringify(this.settingsForm));
            const availableColumns = this.selectedFileDetails.columns;
            availableColumns.sort((a, b) => (a.na_percentage < b.na_percentage ? -1 : 1));

            // If no columns are selected
            if (settingsForm.selectedColumns.length < 1) {
                settingsForm.selectedColumns = availableColumns
                    .filter((x) => x.valid_10p)
                    .map((x) => x.remapped)
                    .slice(0, settingsForm.cutOffColumnSize);
            } else {
                settingsForm.selectedColumns = settingsForm.selectedColumns.map((x) => x.remapped);
            }

            if(settingsForm.datasetAnalysisGroupedColumn && settingsForm.datasetAnalysisGrouped === true){
                settingsForm.datasetAnalysisGroupedColumn = settingsForm.datasetAnalysisGroupedColumn.remapped;
                // add it to selectedColumns
                settingsForm.selectedColumns.push(settingsForm.datasetAnalysisGroupedColumn);

                // Change the scale to row
                settingsForm.scale = "row";
            }


            // If no columns are selected
            if (settingsForm.selectedRows.length < 1) {
                settingsForm.selectedRows = availableColumns
                    .filter((x) => x.valid_numeric)
                    .map((x) => x.remapped)
                    .slice(0, settingsForm.cutOffRowSize);
            } else {
                settingsForm.selectedRows = settingsForm.selectedRows.map((x) => x.remapped);
            }

            settingsForm.selectedRows = settingsForm.selectedRows.filter((x) => !settingsForm.selectedColumns.includes(x));


            if (settingsForm.selectedColumns.length < 1) {
                this.$message({
                    message: "Cannot generate plot with current selection of columns. Not enough columns were found that have valid categorical values or no columns are selected.",
                    type: "error",
                });
                return;
            }
            if (settingsForm.selectedRows < 1) {
                this.$message({
                    message: "Cannot generate plot with current selection of rows. Not enough rows were found that have valid numerical values or no row/columns where selected.",
                    type: "error",
                });
                return;
            }
            fetchEditingClusteringPlotImage({ selectedFileID: this.selectedFiles[0].id, settings: settingsForm })
                .then((response) => {
                    let respData = response.data.message;
                    // Update the image data.
                    for (let respIndex in respData) {
                        if (typeof this.plot_data[respIndex] !== "undefined") {
                            this.plot_data[respIndex] = false;
                            let respItem = respData[respIndex];
                            if (respItem.length < 15 || typeof respItem == "undefined") {
                                this.plot_data[respIndex] = false;
                                this.$message({
                                    message: this.$t("views.apps.unsupervised_learning.editing.index.errors.plot_response.title"),
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
        resetVariables() {
            this.fuseIndex = null;
            this.plot_data = {
                clustering_plot: false,
                clustering_plot_png: false,
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
<style rel="stylesheet/scss" lang="scss"></style>
