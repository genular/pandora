<template>
    <div class="datasetsTab-container">
        <el-row align="top">
            <el-col :span="24">
                <el-card class="box-card animated fadeIn">
                    <div slot="header" class="clearfix">
                        <div class="card_intro">{{ $t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.title") }}</div>

                        <div v-if="selectedFeatureSetId > 0">
                            <div class="models_actions animated fadeIn" v-if="queueClassesDisplay.length > 0">
                                <el-select
                                    style="min-width: 350px"
                                    v-model="selectedClasses"
                                    multiple
                                    filterable
                                    remote
                                    default-first-option
                                    :placeholder="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.filters.exploration_classes.placeholder')"
                                    size="large"
                                    :remote-method="filterAvaliableClasses"
                                    @change="selectChangeClasses"
                                    @focus="selectSuggestClasses"
                                >
                                    <el-option
                                        v-for="(classItem, index) in queueClassesDisplay"
                                        :key="classItem.remapped"
                                        :label="classItem.original"
                                        :value="classItem.remapped"
                                        :disabled="classItem.unique < 2"
                                    ></el-option>
                                </el-select>
                            </div>
                        </div>
                    </div>
                    <!-- Main queue Resamples Table -->
                    <el-table
                        ref="resamplesTable"
                        v-loading="tableLoading.resamples"
                        :data="displayResamples"
                        :row-class-name="resamplesTableRowClass"
                        @select-all="selectResample"
                        @select="selectResample"
                        row-key="resampleID"
                        :border="true"
                        style="width: 100%"
                    >
 
                        <el-table-column type="selection" reserve-selection></el-table-column>

                        <el-table-column
                            fixed
                            :label="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.header.data_source.title')"
                            prop="dataSource"
                            :show-overflow-tooltip="true"
                        >
                            <template slot-scope="scope">
                                <span>
                                    <span v-if="scope.row.dataSource == 1">
                                        {{ $t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.header.data_source.initial") }}
                                    </span>
                                    <span v-else-if="scope.row.dataSource == 2">Original RFE</span>
                                    <span v-else>
                                        {{ $t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.header.data_source.predicted") }}
                                    </span>
                                </span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            fixed
                            :label="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.header.resample_id')"
                            prop="resampleID"
                            width="100"
                            :show-overflow-tooltip="true"
                            :render-header="
                                (h, { column, store }) => {
                                    return renderFilterHeader(h, { column, store }, 'resamplesTable');
                                }
                            "
                        >
                            <template slot-scope="scope">
                                <span>{{ scope.row.resampleID }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            :label="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.header.total_features')"
                            prop="featuresTotal"
                            :show-overflow-tooltip="true"
                            :render-header="
                                (h, { column, store }) => {
                                    return renderFilterHeader(h, { column, store }, 'resamplesTable');
                                }
                            "
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.featuresTotal">{{ scope.row.featuresTotal }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            v-for="(performanceItem, performanceIndex) in jobDetailsData.performance"
                            :prop="'performance|' + performanceItem"
                            :key="performanceItem + '_' + performanceIndex"
                            :label="$t(['globals.performanceVariables.options.', performanceItem, '.title'].join(''))"
                            :show-overflow-tooltip="true"
                            :render-header="
                                (h, { column, store }) => {
                                    return renderFilterHeader(h, { column, store }, 'resamplesTable');
                                }
                            "
                        >
                            <template slot-scope="scope">
                                <span v-if="typeof scope.row.performance !== 'undefined' && scope.row.performance[performanceItem]">
                                    {{ scope.row.performance[performanceItem] }}
                                </span>
                                <span v-else style="font-weight: bold; color: red;">N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            :label="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.header.samples_total')"
                            prop="samplesTotal"
                            :render-header="
                                (h, { column, store }) => {
                                    return renderFilterHeader(h, { column, store }, 'resamplesTable');
                                }
                            "
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTotal">{{ scope.row.samplesTotal }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.header.samples_training')"
                            prop="samplesTraining"
                            :render-header="
                                (h, { column, store }) => {
                                    return renderFilterHeader(h, { column, store }, 'resamplesTable');
                                }
                            "
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTraining">{{ scope.row.samplesTraining }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.header.samples_testing')"
                            prop="samplesTesting"
                            :render-header="
                                (h, { column, store }) => {
                                    return renderFilterHeader(h, { column, store }, 'resamplesTable');
                                }
                            "
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTesting">{{ scope.row.samplesTesting }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            :label="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.header.total_models')"
                            prop="modelsTotal"
                            :render-header="
                                (h, { column, store }) => {
                                    return renderFilterHeader(h, { column, store }, 'resamplesTable');
                                }
                            "
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.modelsTotal">{{ scope.row.modelsTotal }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            align="center"
                            class-name="settings"
                            fixed="right"
                            min-width="125"
                            :label="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.header.actions')"
                        >
                            <template slot="header" slot-scope="scope">
                                <el-popover placement="left" trigger="hover" v-show="tableFiltersOrder['resamplesTable'].length > 0">
                                    <el-card class="box-card">
                                        <div slot="header" class="clearfix">
                                            <el-button @click="clearTableFilter('resamplesTable')" type="text">Clear all filters</el-button>
                                        </div>

                                        <div
                                            v-if="tableFiltersOrder['resamplesTable'].length > 0"
                                            v-for="(item, index) in tableFiltersOrder['resamplesTable']"
                                            :key="item"
                                            class="text item"
                                        >
                                            {{ index + " - " + item }}
                                        </div>
                                        <div v-else>Nothing to display!</div>
                                    </el-card>
                                    <el-button slot="reference" type="primary" class="animated flipInY">User active filters</el-button>
                                </el-popover>
                            </template>
                            <template slot-scope="scope">
                                <el-button-group>
                                    <el-button
                                        size="mini"
                                        :title="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.operations.download.title')"
                                        style="float: left"
                                        type="success"
                                        icon="el-icon-download"
                                        @click="handleOperations('downloadResample', scope.row)"
                                    ></el-button>
                                    <el-button
                                        size="mini"
                                        :title="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.operations.delete.title')"
                                        style="float: right"
                                        type="danger"
                                        icon="el-icon-delete"
                                        @click="handleOperations('deleteResample', scope.row)"
                                    ></el-button>
                                </el-button-group>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination
                        background
                        @size-change="paginateResamplesSizeChange"
                        @current-change="paginateResamples"
                        :current-page.sync="paginateResamplesData.currentPage"
                        :page-sizes="[5, 10, 25, 50]"
                        :page-size="paginateResamplesData.page_size"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="paginateResamplesData.total_items"
                        :disabled="paginateResamplesData.total_items <= 5"
                    ></el-pagination>
                </el-card>
            </el-col>
        </el-row>
        <el-row align="top" style="margin-top: 15px">
            <el-col :span="24">
                <el-card class="box-card animated fadeIn">
                    <div slot="header" class="clearfix">
                        <div class="card_intro">{{ $t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.models_table.title") }}</div>
                        <div class="models_actions" v-if="selectedModelsIDs.length > 0">
                            <el-button-group>
                                <el-button
                                    size="small"
                                    :title="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.models_table.operations.download.title')"
                                    type="success"
                                    icon="el-icon-download"
                                    @click="handleOperations('downloadModels', null)"
                                ></el-button>
                                <!-- TODO
                                <el-button
                                    size="small"
                                    :title="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.models_table.operations.deploy.title')"
                                    type="success"
                                    icon="el-icon-share"
                                    @click="handleOperations('deployModels', null)"
                                ></el-button>
                                <el-button
                                    size="small"
                                    :title="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.models_table.operations.delete.title')"
                                    type="danger"
                                    icon="el-icon-delete"
                                    @click="handleOperations('deleteModels', null)"
                                ></el-button>
                                -->
                            </el-button-group>
                        </div>
                    </div>
                    <!-- Model Details data -->
                    <el-table
                        ref="modelDetailsTable"
                        v-loading="tableLoading.models"
                        :data="displayModels"
                        @select-all="handleModelsSelectionChange"
                        @select="handleModelsSelectionChange"
                        row-key="modelID"
                        :empty-text="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.models_table.no_data')"
                        :border="true"
                        style="width: 100%"
                    >
                        <el-table-column type="selection" reserve-selection @selectable="checkModelsSelectionChange"></el-table-column>

                        <el-table-column
                            fixed
                            align="center"
                            :label="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.header.resample_id')"
                            prop="modelID"
                            width="100"
                            :render-header="
                                (h, { column, store }) => {
                                    return renderFilterHeader(h, { column, store }, 'modelDetailsTable');
                                }
                            "
                        >
                            <template slot-scope="scope">
                                <span>{{ scope.row.modelID }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            fixed
                            prop="modelName"
                            :label="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.models_table.header.model_name')"
                            :show-overflow-tooltip="true"
                            :render-header="
                                (h, { column, store }) => {
                                    return renderFilterHeader(h, { column, store }, 'modelDetailsTable');
                                }
                            "
                        >
                            <template slot-scope="scope">
                                <div v-if="scope.row.status > 0" style="float: left">
                                    <span class="el-icon-success"></span>
                                </div>
                                <div v-else style="float: left">
                                    <el-tooltip class="item" effect="dark" placement="top-start">
                                        <div slot="content">
                                            {{ $t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.models_table.messages.failed_model") }}
                                        </div>
                                        <span class="el-icon-warning"></span>
                                    </el-tooltip>
                                </div>
                                <span v-if="scope.row.modelName" style="padding-left: 10px">{{ scope.row.modelName }}</span>
                                <span v-else style="padding-left: 10px">N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            v-for="(performanceItem, performanceIndex) in jobDetailsData.performance"
                            :prop="'performance|' + performanceItem"
                            :key="performanceItem + '_' + performanceIndex"
                            :label="$t(['globals.performanceVariables.options.', performanceItem, '.title'].join(''))"
                            :show-overflow-tooltip="true"
                            :render-header="
                                (h, { column, store }) => {
                                    return renderFilterHeader(h, { column, store }, 'modelDetailsTable');
                                }
                            "
                        >
                            <template slot-scope="scope">
                                <span v-if="typeof scope.row.performance !== 'undefined' && scope.row.performance[performanceItem]">
                                    {{ scope.row.performance[performanceItem] }}
                                </span>
                                <span v-else style="font-weight: bold; color: red;">N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            align="center"
                            prop="processing_time"
                            :label="$t('views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.models_table.header.processing_time')"
                            :show-overflow-tooltip="true"
                            :render-header="
                                (h, { column, store }) => {
                                    return renderFilterHeader(h, { column, store }, 'modelDetailsTable');
                                }
                            "
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.processing_time">{{ scope.row.processing_time | millisecondsToStr }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination
                        background
                        @current-change="paginateModels"
                        :current-page.sync="paginateModelsData.currentPage"
                        :page-size="paginateModelsData.page_size"
                        layout="total, prev, pager, next, jumper"
                        :total="paginateModelsData.total_items"
                        :disabled="paginateModelsData.total_items <= 5"
                    ></el-pagination>
                </el-card>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24" style="margin-top: 15px">
                <el-tabs v-model="activeDatasetSubTabName" v-if="selectedFeatureSetId > 0" :value="activeDatasetSubTabName" type="card">
                    <!-- Don't display Tab Pane if we have only one Tab to display and he doesn't satisfy display criteria -->
                    <el-tab-pane
                        v-for="item in datasetsTabMapOptions"
                        v-if="!isTabDisabled(item)"
                        :label="item.label"
                        :key="item.key"
                        :name="item.key"
                        :disabled="isTabDisabled(item)"
                    >
                        <span slot="label">
                            <i :class="item.icon"></i>
                            {{ item.label }}
                        </span>
                        <keep-alive>
                            <sub-tab-pane
                                v-if="activeDatasetSubTabName == item.key"
                                :currentView="item.view"
                                :columnName="item.key"
                                :isTabDisabled="isTabDisabled(item)"
                            ></sub-tab-pane>
                            <!-- inactive components will be cached! -->
                        </keep-alive>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { fetchJobDetails } from "@/api/analysis";
import { deleteDatasetResampleTask as ApiDeleteDatasetResampleTask, genarateFileDownloadLink as ApiGenarateFileDownloadLink } from "@/api/backend";

import clipboard from "@/utils/clipboard";
import { findMinMax, tableSorting } from "@/utils/helpers";

import subTabPane from "./components/subTabPane";
import { downloadItemsTemplate } from "@/utils/templates.js";

import * as excel from "@/vendor/Export2Excel";

import { firstBy, thenBy } from "thenby";

export default {
    name: "datasetsTab",
    props: {
        jobDetailsData: {
            type: Object,
            default: function () {
                return {};
            },
        },
    },
    components: { subTabPane },
    data() {
        return {
            datasetsTabLoading: false,
            tableLoading: {
                resamples: false,
                models: false,
            },

            tableFilters: {
                resamplesTable: [],
                modelDetailsTable: [],
            },
            tableFiltersOrder: {
                resamplesTable: [],
                modelDetailsTable: [],
            },
            tableFiltersLocked: {
                resamplesTable: [],
                modelDetailsTable: [],
            },
            activeDatasetSubTabName: "varImp",
            paginateResamplesData: {
                currentPage: 1,
                page_size: 5,
                total_items: null,
            },
            paginateModelsData: {
                currentPage: 1,
                page_size: 5,
                total_items: null,
            },
            // Copy of this.jobDetailsData.resamplesList
            activeResamplesList: [],
            // Holder for only columns on current table page
            displayResamples: [],
            // Copy of this.jobDetailsData.resamplesList
            activeModelsList: [],
            displayModels: [],

            selectedModels: [],
            datasetsTabMapOptionsTemplate: [
                {
                    label: this.$t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.tabs.variableImportanceTab.title"),
                    view: "variableImportanceTab",
                    key: "varImp",
                    icon: "fa fa-balance-scale",
                    restriction: "selectedModels",
                    restriction_details: -1,
                    // If restriction (selectedModels) is array this is more or eq.. >=1 it will pass
                },
                {
                    label: this.$t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.tabs.summaryTab.title"),
                    view: "summaryTab",
                    key: "summaryTab",
                    icon: "fa fa-balance-scale",
                    restriction: "selectedModels",
                    restriction_details: 2,
                },
                {
                    label: this.$t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.tabs.modelDetailsTab.title"),
                    view: "modelDetailsTab",
                    key: "modelDetailsTab",
                    icon: "fa fa-balance-scale",
                    restriction: "selectedModels",
                    // restriction_details: 1
                    // Temp disable tab,
                    restriction_details: 1,
                },
                // {
                //     label: this.$t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.tabs.modelInterpretationTab.title"),
                //     view: "modelInterpretationTab",
                //     key: "modelInterpretationTab",
                //     icon: "fa fa-balance-scale",
                //     restriction: "selectedModels",
                //     // restriction_details: 1
                //     // Temp disable tab,
                //     restriction_details: 1,
                // },
                {
                    label: this.$t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.tabs.samrAnalysisTab.title"),
                    view: "samrAnalysisTab",
                    key: "samrAnalysisTab",
                    icon: "fa fa-balance-scale",
                    restriction: "selectedFeatureSetId",
                },
                {
                    label: this.$t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.tabs.catBoostTab.title"),
                    view: "catBoostTab",
                    key: "catBoostTab",
                    icon: "fa fa-balance-scale",
                    // restriction: "selectedFeatureSetId"
                    // Temp disable tab
                    restriction: "selectedModels",
                    restriction_details: 10000,
                },
            ],
            queueClassesDisplay: [],
            selectedClasses: [],
        };
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
        datasetsTabMapOptions: {
            get() {
                return this.$store.getters.datasetsTabMapOptions;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationDatasetsTabMapOptions", value);
            },
        },
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
        console.log("selectedFeatureSetId (resampleID): " + this.selectedFeatureSetId);
    },
    activated() {
        console.log("activated: " + this.$options.name);
    },
    methods: {
        // Download and delete resample actions
        handleOperations(clickAction, rowInfo) {
            if (clickAction === "downloadResample") {
                this.tableLoading.resamples = true;
                ApiGenarateFileDownloadLink({ downloadType: "resample", recordID: rowInfo.resampleID })
                    .then((response) => {
                        if (response.data.success === true && response.data.message.length > 0) {
                            this.$alert(downloadItemsTemplate(response.data.message), "Download links (partitions are preprocessed)", {
                                dangerouslyUseHTMLString: true,
                                callback: (action) => {},
                            });
                        }
                        this.tableLoading.resamples = false;
                    })
                    .catch((error) => {
                        console.log(error);
                        this.tableLoading.resamples = false;
                    });
            } else if (clickAction === "deleteResample") {
                this.$confirm(
                    this.$t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.operations.delete.dialog.description"),
                    this.$t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.resamples_table.operations.delete.dialog.title"),
                    {
                        type: "warning",
                    }
                )
                    .then((_) => {
                        if (this.$config.isDemoServer) {
                            this.$message({
                                type: "warning",
                                message: this.$t("globals.demo_server.function_disabled"),
                            });
                            return;
                        }

                        this.tableLoading.resamples = true;
                        ApiDeleteDatasetResampleTask({ resampleID: rowInfo.resampleID })
                            .then((response) => {
                                if (response.data.success === true) {
                                    this.getDatasetQueueList();
                                    this.$message({
                                        type: "success",
                                        message: this.$t("globals.messages.success"),
                                    });
                                }
                                this.tableLoading.resamples = false;
                            })
                            .catch((error) => {
                                console.log(error);
                                this.tableLoading.resamples = false;
                            });
                    })
                    .catch((_) => {
                        this.$message({
                            type: "info",
                            message: this.$t("globals.messages.canceled"),
                        });
                    });
            } else if (clickAction === "deleteModels") {
                this.$confirm(
                    this.$t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.models_table.operations.delete.dialog.description"),
                    this.$t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.models_table.operations.delete.dialog.title"),
                    {
                        type: "warning",
                    }
                )
                    .then((_) => {
                        ApiDeleteDatasetResampleTask({ modelIDs: this.selectedModelsIDs })
                            .then((response) => {
                                if (response.data.success === true) {
                                    this.getDatasetQueueList();
                                    this.$message({
                                        type: "success",
                                        message: this.$t("globals.messages.success"),
                                    });
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    })
                    .catch((_) => {
                        this.$message({
                            type: "info",
                            message: this.$t("globals.messages.canceled"),
                        });
                    });
            } else if (clickAction === "downloadModels") {
                this.tableLoading.models = true;
                ApiGenarateFileDownloadLink({ downloadType: "models", recordID: this.selectedModelsIDs })
                    .then((response) => {
                        if (response.data.success === true && response.data.message.length > 0) {
                            this.$confirm(downloadItemsTemplate(response.data.message), "Download links", {
                                dangerouslyUseHTMLString: true,
                                distinguishCancelAndClose: true,
                                confirmButtonText: "Close",
                                cancelButtonText: "Export table",
                                callback: (action) => {
                                    // Export table is clicked, make the export!
                                    if (action == "cancel") {
                                        this.exportTableToCSV("models");
                                    }
                                },
                            });
                        }
                        this.tableLoading.models = false;
                    })
                    .catch((error) => {
                        console.log(error);
                        this.tableLoading.models = false;
                    });
            } else if (clickAction === "deployModels") {
                this.$message({
                    type: "info",
                    message: this.$t("globals.messages.not_implemented"),
                });
            }
        },
        // Filter and display classes on user typing!
        filterAvaliableClasses(userInput) {
            if (userInput.length >= 2) {
                this.queueClassesDisplay = this.jobDetailsData.queueDetails.selectedOptions.classes.filter((item) => {
                    return item.original.toLowerCase().indexOf(userInput.toLowerCase()) > -1;
                });
            } else {
                this.queueClassesDisplay = [];
            }
        },
        // Display random first five items (classes) on user click/focus
        selectSuggestClasses(event) {
            if (this.queueClassesDisplay.length === 0) {
                let sliceEnd = 5;
                if (this.jobDetailsData.queueDetails.selectedOptions.classes.length < 5) {
                    sliceEnd = this.jobDetailsData.queueDetails.selectedOptions.classes.length;
                }
                this.queueClassesDisplay = this.jobDetailsData.queueDetails.selectedOptions.classes.slice(0, sliceEnd);
            }
        },
        // When some class is selected lets make a Tab from it!
        selectChangeClasses(selected) {
            console.log(selected);

            let template = {
                // label: "",
                // view: "booleanDistributionTab",
                // key: "",
                // icon: "fas fa-chart-area",
                restriction: "selectedClasses",
            };
            // If there is no classes selected show only Variable Importance Tab
            if (selected.length > 0) {
                if (selected.length > 5) {
                    this.$message({
                        message: this.$t("views.apps.supervised_learning.exploration.components.tabs.datasetsTab.index.messages.max_classes"),
                        type: "warning",
                    });
                    return;
                }
                // STEP 1
                // Fetch details for specifically selected classes
                const selectedClassesDetails = this.jobDetailsData.queueDetails.selectedOptions.classes.filter((item) => {
                    return selected.indexOf(item.remapped) > -1;
                });

                for (let i = 0, lenI = selectedClassesDetails.length; i < lenI; i++) {
                    let selectedClass = selectedClassesDetails[i];
                    console.log("selectedClass: ", selectedClass);

                    let checkIfClassInSelectedTabs = this.datasetsTabMapOptions.filter(function (e) {
                        return e.key === selectedClass.remapped;
                    });

                    // If selected class have total number of unique values 2 activate corresponding Tab
                    if (checkIfClassInSelectedTabs.length === 0 && selectedClass.unique >= 2) {
                        let tabTitle = "Boolean: " + selectedClass.original;
                        let tabView = "booleanDistributionTab";
                        let icon = "fa fa-area-chart";

                        if (selectedClass.unique > 2) {
                            tabTitle = "Other: " + selectedClass.original;
                            tabView = "otherDistributionTab";
                            icon = "fa fa-bar-chart";
                        }
                        template.label = tabTitle;
                        template.view = tabView;
                        template.icon = icon;
                        template.key = selectedClass.remapped;

                        console.log("STEP 1 ====================");
                        // Add this Tab template only if it doesn't exist in Tabs already
                        console.log("adding: " + selectedClass.remapped);
                        this.datasetsTabMapOptions.push(template);
                        this.activeDatasetSubTabName = template.key;
                    } else {
                        console.log("skipping: " + selectedClass.remapped);
                    }
                }
                console.log("STEP 2 ====================: " + this.datasetsTabMapOptions.length, this.datasetsTabMapOptions);
                // STEP 2
                // Remove classes from TABS that are not selected anymore
                for (let k = 0, lenK = this.datasetsTabMapOptions.length; k < lenK; k++) {
                    let tabClass = this.datasetsTabMapOptions[k];
                    if (typeof tabClass === "undefined") {
                        continue;
                    }
                    console.log("Looping " + k + ": ", tabClass);
                    // If current tab is not in selected classes remove it!
                    if (tabClass.key !== "varImp" && selected.indexOf(tabClass.key) === -1) {
                        // Reset Active selected TAB to the initial varImp tab
                        if (tabClass.key === this.activeDatasetSubTabName) {
                            this.activeDatasetSubTabName = this.datasetsTabMapOptions[0].key;
                        }
                        this.datasetsTabMapOptions = this.datasetsTabMapOptions.filter(function (e) {
                            return e.key !== tabClass.key;
                        });
                    }
                }
            } else {
                // Nothing is selected init default values
                this.datasetsTabMapOptions = this.datasetsTabMapOptionsTemplate;
                this.activeDatasetSubTabName = this.datasetsTabMapOptions[0].key;
            }
        },
        // Restore user selection of models for specific feature set!
        initSelectedModels() {
            console.log("initPreSelectedModels: ", this.selectedModelsIDs);
            if (this.selectedModelsIDs.length > 0 && this.selectedModels.length === 0) {
                if (this.selectedFeatureSetId > 0) {
                    console.log(this.jobDetailsData.resampleModels);
                    if (this.jobDetailsData.resampleModels.length > 0 && typeof this.jobDetailsData.resampleModels[this.selectedFeatureSetId] !== "undefined") {
                        if (this.jobDetailsData.resampleModels[this.selectedFeatureSetId].length > 0) {
                            this.selectedModels = this.activeModelsList.filter((model) => this.selectedModelsIDs.includes(model.modelID));
                            this.selectedModels.forEach((row) => {
                                this.$refs.modelDetailsTable.toggleRowSelection(row, true);
                            });
                        }
                    }
                }
            }
        },
        /**
         * Check if Tab should be disabled based on restriction property in datasetsTabMapOptions
         * Returns true is tab is disabled and false if tab is enabled
         * @param  {[type]}  item [description]
         * @return {Boolean}      [description]
         */
        isTabDisabled(item) {
            let check = false;
            if (item.restriction !== undefined) {
                let restrictionVariable = false;
                // Restriction can be an array
                // Example: restriction: ["jobDetailsData", "resamplesList"]
                if (Array.isArray(item.restriction)) {
                    let varCount = 0;
                    item.restriction.forEach((element) => {
                        if (varCount === 0) {
                            if (this[item.restriction] !== undefined) {
                                restrictionVariable = this[item.restriction];
                            }
                        } else {
                            if (restrictionVariable[item.restriction] !== undefined) {
                                restrictionVariable = restrictionVariable[item.restriction];
                            }
                        }
                        varCount++;
                    });
                } else if (this[item.restriction] !== undefined) {
                    restrictionVariable = this[item.restriction];
                }

                if (restrictionVariable !== false) {
                    // If restriction variable is Integer disable tab if variable value is 0
                    if (Number.isInteger(restrictionVariable)) {
                        if (restrictionVariable < 1) {
                            check = true;
                        }
                        // If restriction variable is array
                    } else if (Array.isArray(restrictionVariable)) {
                        let more_or_eq = 0;
                        // If there is nothing in array disable tab
                        if (restrictionVariable.length < 1) {
                            check = true;
                            return check;
                        }
                        // Check for restriction details
                        if (item.restriction_details !== undefined) {
                            if (restrictionVariable.length < item.restriction_details) {
                                check = true;
                                return check;
                            }
                        }
                    } else {
                        check = restrictionVariable === 0;
                    }
                }
            }
            return check;
        },
        checkModelsSelectionChange(row, index) {
            if (row.status > 0) {
                return true;
            } else {
                return false;
            }
        },
        // Selects models on user check-box click
        handleModelsSelectionChange(selection) {
            const isPerformanceValid = (performance) => {
                // Check if any value is not undefined or 0
                return Object.values(performance).some(value => value !== undefined && value !== 0);
            };

            const isValidModel = (model) => {
                // Check if the model is visible and all performance metrics are defined
                return model.status > 0 && (model.performance && isPerformanceValid(model.performance));
            };

            const invalidModelDeselection = (model) => {
                // A model is considered invalid if its status is 0 or any performance metric is undefined
                return model.status === 0 || !(model.performance && isPerformanceValid(model.performance));
            };

            console.log(selection);

            // Filter valid selections based on visibility and performance validity
            const filteredSelection = selection.filter(isValidModel);
            this.selectedModels = filteredSelection;
            this.selectedModelsIDs = filteredSelection.map(model => model.modelID);

            // Deselect invalid models
            selection.filter(invalidModelDeselection).forEach(model => {
                this.$refs.modelDetailsTable.toggleRowSelection(model, false);
            });

            console.log("handleModelsSelectionChange: ", this.selectedModels);

            // Update active tab based on the number of selected models
            if (this.selectedModels.length === 0) {
                // Activate the first enabled tab if no models are selected
                const firstEnabledTab = this.datasetsTabMapOptions.find(tab => !this.isTabDisabled(tab));
                if (firstEnabledTab) this.activeDatasetSubTabName = firstEnabledTab.key;
            } else if (this.selectedModels.length === 1) {
                // Activate the Variable Importance tab if one model is selected
                this.activeDatasetSubTabName = "varImp";
            }
        },

        paginateResamplesSizeChange(val) {
            this.paginateResamplesData.page_size = val;
            this.paginateResamples(this.paginateResamplesData.currentPage);
        },
        // Initialize Pagination of Features
        paginateResamples(pageNumber) {
            if (this.selectedFeatureSetId <= 0) {
                this.$refs.resamplesTable.clearSelection();
            }
            this.paginateResamplesData.currentPage = pageNumber;
            // because pages logically start with 1, but technically with 0
            pageNumber = pageNumber - 1;
            this.paginateResamplesData.total_items = this.activeResamplesList.length;

            this.displayResamples = this.activeResamplesList.slice(pageNumber * this.paginateResamplesData.page_size, (pageNumber + 1) * this.paginateResamplesData.page_size);
        },
        // Initialize Pagination of Models
        paginateModels(pageNumber) {
            this.paginateModelsData.currentPage = pageNumber;
            // because pages logically start with 1, but technically with 0
            pageNumber = pageNumber - 1;
            this.paginateModelsData.total_items = this.activeModelsList.length;

            this.displayModels = this.activeModelsList.slice(pageNumber * this.paginateModelsData.page_size, (pageNumber + 1) * this.paginateModelsData.page_size);
        },
        selectResample(selection, row, init = false) {
            console.log(selection);
            console.log(row);
            // In-case "select all" check-box is pressed, row is than undefined
            if (typeof row === "undefined") {
                console.log("selectResample: reseting feature set!");
                this.selectedFeatureSetId = 0;
                this.displayModels = [];
                this.selectedModelsIDs = [];

                this.$refs.resamplesTable.setCurrentRow();
                this.$refs.resamplesTable.clearSelection();
                return;
            }

            console.log("Feature set change: " + row.resampleID + " " + this.selectedFeatureSetId);

            if (row.modelsTotal === 0) {
                this.$message({
                    message: this.$t("views.dashboard.admin.components.QueueTable.messages.missing_models"),
                    type: "warning",
                });
                return;
            }

            if (row.dataSource === 2) {
                this.$message({
                    message: "No models processed in this resample since it was used for Recursive Feature Elimination",
                    type: "warning",
                });
                return;
            }

            // If someone select multiple rows keep only last one
            if (selection.length > 1) {
                this.$refs.resamplesTable.clearSelection();
                row = selection.pop();
                this.$refs.resamplesTable.toggleRowSelection(row, true);
            } else if (selection.length === 1) {
                row = selection.pop();
                this.$refs.resamplesTable.toggleRowSelection(row, true);
            }

            if (row.resampleID !== this.selectedFeatureSetId || init === true) {
                console.log("Filtering models for new resample!");

                this.selectedFeatureSetId = row.resampleID;
                if (init === false) {
                    this.selectedModelsIDs = [];
                }

                // Select only models with that feature set ID
                this.activeModelsList = this.jobDetailsData.modelsList.filter((model) => model.resampleID === this.selectedFeatureSetId);

                this.$refs.resamplesTable.setCurrentRow(row);
                this.paginateModels(1);
                this.$nextTick(() => {
                    this.initSelectedModels();
                    this.$refs.modelDetailsTable.doLayout();
                });
            } else {
                // Nothing is selected
                this.selectedFeatureSetId = 0;
                this.displayModels = [];
                this.selectedModelsIDs = [];
                this.$refs.resamplesTable.setCurrentRow();
            }
        },
        resamplesTableRowClass({ row, rowIndex }) {
            const perfValues = ["Accuracy"];
            let cssClass = "";
            if (typeof row.performance === "undefined") {
                return cssClass;
            }

            perfValues.forEach(function (pref) {
                if (typeof row.performance[pref] !== "undefined") {
                    if (row.performance[pref] > 0.6) {
                        cssClass = "success-row";
                    } else if (row.performance[pref] <= 0.5) {
                        // cssClass = "warning-row";
                    }
                }
            });

            return cssClass;
        },
        /**
         * Used to render header filters on 1st main datasets table
         * @param  {[type]} h              [description]
         * @param  {[type]} options.column [description]
         * @param  {[type]} options.store  [description]
         * @param  {[type]} tableReference [description]
         * @return {[type]}                [description]
         */
        renderFilterHeader(h, { column, store }, tableReference) {
            let element = column.label;

            let exportData = null;

            if (tableReference === "resamplesTable") {
                exportData = JSON.parse(JSON.stringify(this.jobDetailsData.resamplesList));
            } else if (tableReference === "modelDetailsTable") {
                exportData = JSON.parse(JSON.stringify(this.jobDetailsData.modelsList.filter((model) => model.resampleID === this.selectedFeatureSetId)));
            }

            let flattenData = exportData;
            // If data is not jet loaded just return default element
            if (typeof flattenData === "undefined" || flattenData.length < 1) {
                return element;
            }

            if (typeof column.property !== "undefined") {
                let decimalPoint = 2;

                const prefValue = column.property.split("|");
                let prefValueSearch = prefValue;

                // Lets detect if its normal column or performance value!
                if (prefValue.length === 2) {
                    if (prefValue[0] === "performance") {
                        prefValueSearch = prefValue[1];

                        flattenData = exportData.map(function (item) {
                            let itemFlat = item;
                            if (typeof item.performance !== "undefined") {
                                itemFlat = Object.assign(itemFlat, item.performance);
                                delete itemFlat.performance;
                            }
                            return itemFlat;
                        });
                    }
                } else {
                    prefValueSearch = prefValue[0];
                    decimalPoint = 0;
                }
                const minMax = findMinMax(flattenData, prefValueSearch, decimalPoint);
                let rangeDisabled = false;
                if (minMax[0] === 0 && minMax[1] === 0 && minMax[2] === 0) {
                    rangeDisabled = true;
                }

                // Check if property filter is defined
                if (typeof this.tableFilters[tableReference][column.property] === "undefined") {
                    this.$set(this.tableFilters[tableReference], column.property, { range: [minMax[0], minMax[1]], sortby: "", locked: true });
                }

                element = h("span", { class: "custom-table-header-labels" }, [
                    h("span", { class: "custom-table-header-labels-text" }, [
                        h(
                            "el-tooltip",
                            {
                                props: { content: column.label, placement: "top" },
                            },
                            [h("span", { class: "custom-table-header-text-" + column.property }, column.label)]
                        ),
                    ]),
                    h(
                        "el-popover",
                        { props: { placement: "top-start", title: column.label + " filters", trigger: "click" } },

                        [
                            h("div", {}, [
                                h("el-slider", {
                                    props: {
                                        range: true,
                                        "show-stops": true,
                                        min: minMax[0],
                                        max: minMax[1],
                                        step: minMax[2],
                                        disabled: rangeDisabled,
                                    },
                                    style: "width: 90%;margin: 0 auto;",
                                    on: {
                                        /**
                                         * Called on range change
                                         * @param  {[type]} value 0.65,0.81_PredictAUC
                                         * @return {[type]}       [description]
                                         */
                                        change: (value) => {
                                            const index = this.tableFiltersOrder[tableReference].indexOf(column.property + "|" + "range");
                                            if (index !== -1) {
                                                this.tableFiltersOrder[tableReference].splice(index, 1);
                                            }
                                            this.$set(this.tableFilters[tableReference][column.property], "range", value);
                                            this.tableFiltersOrder[tableReference].push(column.property + "|" + "range");

                                            this.tableFilter(tableReference);
                                        },
                                    },
                                }),
                                h(
                                    "el-select",
                                    {
                                        props: {
                                            value: this.tableFilters[tableReference][column.property]["sortby"],
                                            placeholder: "Sort by",
                                            size: "mini",
                                            clearable: true,
                                        },
                                        style: "width: 100%;",
                                        on: {
                                            input: (value) => {
                                                const index = this.tableFiltersOrder[tableReference].indexOf(column.property + "|" + "sortby");
                                                if (index !== -1) {
                                                    this.tableFiltersOrder[tableReference].splice(index, 1);
                                                }

                                                if (value === null) {
                                                    this.$set(this.tableFilters[tableReference][column.property], "sortby", "");
                                                } else {
                                                    this.$set(this.tableFilters[tableReference][column.property], "sortby", value);
                                                    this.tableFiltersOrder[tableReference].push(column.property + "|" + "sortby");
                                                }
                                                this.tableFilter(tableReference);
                                            },
                                        },
                                    },
                                    [
                                        h("el-option", {
                                            props: {
                                                label: "Descending",
                                                value: "descending",
                                            },
                                        }),
                                        h("el-option", {
                                            props: {
                                                label: "Ascending",
                                                value: "ascending",
                                            },
                                        }),
                                    ]
                                ),
                                h(
                                    "el-checkbox",
                                    {
                                        props: {
                                            value: this.tableFilters[tableReference][column.property]["locked"],
                                            size: "mini",
                                            border: true,
                                        },
                                        style: "float: right; clear: left; margin-top: 10px;",
                                        on: {
                                            change: (value) => {
                                                const index = this.tableFiltersOrder[tableReference].indexOf(column.property + "|" + "locked");
                                                if (index !== -1) {
                                                    this.tableFiltersOrder[tableReference].splice(index, 1);
                                                }
                                                this.$set(this.tableFilters[tableReference][column.property], "locked", value);
                                                //if (value === true) {
                                                this.tableFiltersOrder[tableReference].push(column.property + "|" + "locked");
                                                //}
                                                this.tableFilter(tableReference);
                                            },
                                        },
                                    },
                                    [h("i", { class: "el-icon-lock" }, "")]
                                ),
                            ]),
                            h("i", { slot: "reference", class: "el-icon-s-operation", style: "margin-left: 5px;" }, ""),
                        ]
                    ),
                ]);

                element.fnScopeId = this.$options._scopeId;
                element.fnContext = this;
            }

            return element;
        },
        /**
         * [tableFilter description]
         * @return {[type]} [description]
         */
        tableFilter(tableReference) {
            let sort_stack = null;
            console.log(this.tableFiltersOrder[tableReference]);

            let sortData = null;
            if (tableReference === "resamplesTable") {
                sortData = this.jobDetailsData.resamplesList;
            } else if (tableReference === "modelDetailsTable") {
                sortData = this.jobDetailsData.modelsList.filter((model) => model.resampleID === this.selectedFeatureSetId);
            }

            let lockSorting = true;
            this.tableFiltersOrder[tableReference].forEach((value, index) => {
                const columnIds = value.split("|");
                const actionType = columnIds.pop();
                // Remove last array item since that only sorting identifier
                const columnIdentifier = columnIds.join("|");
                // console.log(index + " ========================");
                // console.log(actionType);
                // console.log(columnIdentifier);

                const action = this.tableFilters[tableReference][columnIdentifier][actionType];
                // console.log(action);

                let sortDirection = 1;
                let minMax = null;
                let sortType = "normal"; // subkey
                if (columnIds.length === 2) {
                    sortType = "subkey";
                }

                if (actionType === "sortby" && action === "descending") {
                    sortDirection = -1;
                } else if (actionType === "range") {
                } else if (actionType === "locked" && lockSorting === true) {
                    lockSorting = action;
                }
                // If filter is not locked reset any previously declared sorting stack
                if (lockSorting === false) {
                    sort_stack = null;
                }
                console.log("Sorting lock: " + lockSorting);

                if (actionType === "sortby") {
                    if (sortType === "normal") {
                        if (sort_stack === null) {
                            sort_stack = firstBy(columnIdentifier, { ignoreCase: false, direction: sortDirection });
                        } else {
                            sort_stack = sort_stack.thenBy(columnIdentifier, { ignoreCase: false, direction: sortDirection });
                        }
                    } else if (sortType === "subkey") {
                        if (sort_stack === null) {
                            sort_stack = firstBy(
                                (v1, v2) => {
                                    return tableSorting(v1, v2, columnIds);
                                },
                                { ignoreCase: false, direction: sortDirection }
                            );
                        } else {
                            sort_stack = sort_stack.thenBy(
                                (v1, v2) => {
                                    return tableSorting(v1, v2, columnIds);
                                },
                                { ignoreCase: false, direction: sortDirection }
                            );
                        }
                    }
                } else if (actionType === "range") {
                    console.log("removing items from data: " + sortType + " " + action[0] + "-" + action[1]);
                    // remove rows from array
                    if (sortType === "normal") {
                        sortData = sortData.filter((item) => item[columnIdentifier] >= action[0] && item[columnIdentifier] <= action[1]);
                    } else if (sortType === "subkey") {
                        sortData = sortData.filter(function (item) {
                            if (typeof item[columnIds[0]] === "undefined") {
                                item[columnIds[0]] = {};
                                item[columnIds[0]][columnIds[1]] = 0;
                            } else if (typeof item[columnIds[0]][columnIds[1]] === "undefined") {
                                item[columnIds[0]][columnIds[1]] = 0;
                            }

                            return item[columnIds[0]][columnIds[1]] >= action[0] && item[columnIds[0]][columnIds[1]] <= action[1];
                        });
                    }
                }
            });
            if (sort_stack !== null) {
                console.log("Sorting data:");
                console.log(sort_stack);
                sortData = sortData.sort(sort_stack);
            }
            if (tableReference === "resamplesTable") {
                this.activeResamplesList = sortData;
                this.paginateResamples(1);
                this.$refs.resamplesTable.doLayout();
            } else if (tableReference === "modelDetailsTable") {
                this.activeModelsList = sortData;
                this.paginateModels(1);
                this.$refs.modelDetailsTable.doLayout();
            }
        },
        /**
         * [clearTableFilter description]
         * @param  {[type]} tableReference [description]
         * @return {[type]}                [description]
         */
        clearTableFilter(tableReference) {
            let sortData = null;
            if (tableReference === "resamplesTable") {
                sortData = this.jobDetailsData.resamplesList;
            } else if (tableReference === "modelDetailsTable") {
                sortData = this.jobDetailsData.modelsList.filter((model) => model.resampleID === this.selectedFeatureSetId);
            }

            this.tableFiltersOrder[tableReference].forEach((value, index) => {
                const columnIds = value.split("|");
                const actionType = columnIds.pop();
                // Remove last array item since that only sorting identifier
                const columnIdentifier = columnIds.join("|");

                this.$set(this.tableFilters[tableReference], columnIdentifier, { range: [0, 0], sortby: "", locked: true });
            });

            this.tableFiltersOrder[tableReference] = [];

            if (tableReference === "resamplesTable") {
                this.activeResamplesList = sortData;
                this.paginateResamples(1);
                this.$refs.resamplesTable.doLayout();
            } else if (tableReference === "modelDetailsTable") {
                this.activeModelsList = sortData;
                this.paginateModels(1);
                this.$refs.modelDetailsTable.doLayout();
            }
        },
        /**
         * [exportTableToCSV description]
         * @param  {[type]} tableType models or resamples
         * @return {[type]}           [description]
         */
        exportTableToCSV(tableType) {
            this.tableLoading[tableType] = true;

            let downloadFilename = "";
            let exportData = [];

            if (tableType === "models") {
                exportData = JSON.parse(JSON.stringify(this.jobDetailsData.modelsList.filter((model) => model.resampleID === this.selectedFeatureSetId)));
                downloadFilename = tableType + "_resampleID_" + this.selectedFeatureSetId;
            } else if (tableType === "resamples") {
                exportData = JSON.parse(JSON.stringify(this.jobDetailsData.resamplesList));
                downloadFilename = tableType + "_" + this.jobDetailsData.queueDetails.id;
            }

            if (exportData.length > 0) {
                console.log(exportData);

                // Map performance and packageDetails variables to root column node
                const flattenData = exportData.map(function (item) {
                    let itemFlat = item;
                    if (typeof item.performance !== "undefined") {
                        itemFlat = Object.assign(itemFlat, item.performance);
                        delete itemFlat.performance;
                    }

                    if (typeof item.packageDetails !== "undefined") {
                        itemFlat = Object.assign(itemFlat, item.packageDetails);
                        delete itemFlat.packageDetails;
                    }

                    return itemFlat;
                });
                let filterVal = Object.keys(flattenData[0]);
                let tHeader = filterVal;
                const formattedData = this.formatJson(filterVal, flattenData);

                excel.export_json_to_excel(tHeader, formattedData, downloadFilename);
            }

            this.tableLoading[tableType] = false;
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
        fetchJobDetails(pqid) {
            this.datasetsTabLoading = true;
            fetchJobDetails(pqid)
                .then((response) => {
                    this.datasets = response.data.data;
                    this.datasetsTabLoading = false;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        copyToClipboard(content, event) {
            clipboard(content, event);
        },
    },
    watch: {
        "jobDetailsData.queueDetails": function (newVal, oldVal) {
            console.log("Updating queueClassesDisplay");
            // And new selected queue classes
            if (typeof newVal.selectedOptions !== "undefined") {
                this.queueClassesDisplay = newVal.selectedOptions.classes;
                // Paginate Resample
                this.paginateResamples(1);

                this.$nextTick(() => {
                    this.datasetsTabMapOptions = this.datasetsTabMapOptionsTemplate;
                    if (this.selectedModelsIDs.length === 0) {
                        this.displayModels = [];
                        this.$refs.resamplesTable.setCurrentRow();
                        this.$refs.resamplesTable.clearSelection();
                        false;
                    }
                });
            }
        },
        "jobDetailsData.resamplesList": function (newVal, oldVal) {
            this.activeResamplesList = newVal;

            this.paginateResamples(1);
            this.$refs.resamplesTable.doLayout();
            this.$refs.modelDetailsTable.doLayout();

            this.$nextTick(() => {
                // If no resamples are selected but we have selectedFeatureSetId preselect one
                if (this.selectedFeatureSetId > 0) {
                    const selectedRow = this.jobDetailsData.resamplesList.filter((item) => item.resampleID === this.selectedFeatureSetId);
                    if (selectedRow.length === 1) {
                        console.log(selectedRow[0]);

                        this.$nextTick(() => {
                            console.log("Preselecting resample");
                            this.$refs.resamplesTable.toggleRowSelection(selectedRow[0]);
                            this.selectResample([], selectedRow[0], true);
                        });
                    }
                }
            });
        },
    },
};
</script>

<style rel="stylesheet/scss" lang="scss">
/* Mark active tab in bold */
.el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
    font-weight: bold;
}

.card_intro {
    float: left;
    height: 40px;
    line-height: 40px;
}
.models_actions {
    float: right;
    height: 40px;
    line-height: 40px;
}
.el-table__expanded-cell[class*="cell"] {
    padding: 5px 0;
}
.el-table .warning-row {
    background: oldlace;
}
.el-table .success-row {
    background: #f0f9eb;
}
.flud-selects {
    width: 100%;
}

.el-table-header-resource {
    .el-table-header-resource-title {
    }
    .el-table-header-resource-actions {
    }
}
</style>
