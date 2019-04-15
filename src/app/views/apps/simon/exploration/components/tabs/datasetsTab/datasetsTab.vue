<template>
    <div class="datasetsTab-container">
        <el-row align="top">
            <el-col :span="24">
                <el-card class="box-card animated fadeIn">
                    <div slot="header" class="clearfix">
                        <div class="card_intro">{{ $t("views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.title") }}</div>
                        <div v-if="selectedFeatureSetId > 0">
                            <div class="models_actions animated fadeIn" v-if="jobClassesDisaply.length > 0">
                                <el-select
                                    style="min-width: 350px;"
                                    v-model="selectedClasses"
                                    multiple
                                    filterable
                                    remote
                                    default-first-option
                                    :placeholder="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.filters.exploration_classes.placeholder')"
                                    size="large"
                                    :remote-method="filterAvaliableClasses"
                                    @change="selectChangeClasses"
                                    @focus="selectSuggestClasses"
                                >
                                    <el-option
                                        v-for="(classItem, index) in jobClassesDisaply"
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
                        v-loading="resamplesTableLoading"
                        @sort-change="
                            ({ column, prop, order }) => {
                                deepSort({ column, prop, order }, 'jobDetailsData', null, 'resamplesList', null, 'paginateResamples');
                            }
                        "
                        :data="displayResamples"
                        :row-class-name="resamplesTableRowClass"
                        @select-all="selectResample"
                        @select="selectResample"
                        row-key="resampleID"
                        height="300"
                        max-height="300"
                        style="width: 100%"
                    >
                        <el-table-column fixed type="expand" style="padding: 0;">
                            <template slot-scope="props">
                                <span>TODO!</span>
                            </template>
                        </el-table-column>
                        <el-table-column type="selection" reserve-selection width="40" fixed> </el-table-column>

                        <el-table-column
                            fixed
                            align="center"
                            :label="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.header.data_source.title')"
                            prop="dataSource"
                            sortable="custom"
                            min-width="100"
                        >
                            <template slot-scope="scope">
                                <span>
                                    <span v-if="scope.row.dataSource == 1">
                                        {{ $t("views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.header.data_source.initial") }}
                                    </span>
                                    <span v-else>
                                        {{ $t("views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.header.data_source.predicted") }}
                                    </span>
                                </span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            fixed
                            align="center"
                            :label="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.header.resample_id')"
                            prop="resampleID"
                            sortable="custom"
                            min-width="75"
                        >
                            <template slot-scope="scope">
                                <span>{{ scope.row.resampleID }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            align="center"
                            :label="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.header.total_features')"
                            sortable="custom"
                            min-width="115"
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
                            sortable="custom"
                            @sort-orders="['ascending', 'descending']"
                            align="center"
                            min-width="150"
                        >
                            <template slot-scope="scope">
                                <span v-if="typeof scope.row.performance !== 'undefined' && scope.row.performance[performanceItem]">{{
                                    scope.row.performance[performanceItem]
                                }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            align="center"
                            :label="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.header.samples_total')"
                            prop="samplesTotal"
                            sortable="custom"
                            min-width="175"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTotal">{{ scope.row.samplesTotal }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            :label="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.header.samples_training')"
                            prop="samplesTraining"
                            sortable="custom"
                            min-width="175"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTraining">{{ scope.row.samplesTraining }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            :label="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.header.samples_testing')"
                            prop="samplesTesting"
                            sortable="custom"
                            min-width="175"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTesting">{{ scope.row.samplesTesting }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            align="center"
                            :label="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.header.total_models')"
                            prop="modelsTotal"
                            sortable="custom"
                            min-width="175"
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
                            :label="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.header.actions')"
                        >
                            <template slot-scope="scope">
                                <el-button-group>
                                    <el-button
                                        size="mini"
                                        :title="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.operations.download.title')"
                                        style="float: left;"
                                        type="success"
                                        icon="el-icon-download"
                                        @click="handleOperations('downloadResample', scope.row)"
                                    ></el-button>
                                    <el-button
                                        size="mini"
                                        :title="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.operations.delete.title')"
                                        style="float: right;"
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
                        @current-change="paginateResamples"
                        :current-page.sync="paginateResamplesData.currentPage"
                        :page-size="paginateResamplesData.page_size"
                        layout="total, prev, pager, next, jumper"
                        :total="paginateResamplesData.total_items"
                        :disabled="paginateResamplesData.total_items <= 5"
                    >
                    </el-pagination>
                </el-card>
            </el-col>
        </el-row>
        <el-row align="top" v-if="displayModels.length > 0" style="margin-top: 15px;">
            <el-col :span="24">
                <el-card class="box-card animated fadeIn">
                    <div slot="header" class="clearfix">
                        <div class="card_intro">{{ $t("views.apps.simon.exploration.components.tabs.datasetsTab.index.models_table.title") }}</div>
                        <div class="models_actions" v-if="selectedModelsIDs.length > 0">
                            <el-button-group>
                                <el-button
                                    size="small"
                                    :title="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.models_table.operations.download.title')"
                                    type="success"
                                    icon="el-icon-download"
                                    @click="handleOperations('downloadModels', null)"
                                ></el-button>
                                <!-- TODO
                                <el-button
                                    size="small"
                                    :title="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.models_table.operations.deploy.title')"
                                    type="success"
                                    icon="el-icon-share"
                                    @click="handleOperations('deployModels', null)"
                                ></el-button>
                                <el-button
                                    size="small"
                                    :title="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.models_table.operations.delete.title')"
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
                        v-loading="modelDetailsTableLoading"
                        :data="displayModels"
                        @select-all="handleModelsSelectionChange"
                        @select="handleModelsSelectionChange"
                        @sort-change="
                            ({ column, prop, order }) => {
                                deepSort({ column, prop, order }, 'jobDetailsData', null, 'resampleModels', 'selectedFeatureSetId', 'paginateModels');
                            }
                        "
                        row-key="modelID"
                        :empty-text="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.models_table.no_data')"
                        height="300"
                        max-height="300"
                    >
                        <el-table-column type="selection" reserve-selection @selectable="checkModelsSelectionChange" width="40" fixed> </el-table-column>

                        <el-table-column
                            fixed
                            align="center"
                            :label="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.header.resample_id')"
                            prop="modelID"
                            sortable="custom"
                            min-width="75"
                        >
                            <template slot-scope="scope">
                                <span>{{ scope.row.modelID }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            fixed
                            prop="modelName"
                            sortable
                            min-width="125"
                            :label="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.models_table.header.model_name')"
                        >
                            <template slot-scope="scope">
                                <div v-if="scope.row.status > 0" style="float: left;">
                                    <span class="el-icon-success"></span>
                                </div>
                                <div v-else style="float: left;">
                                    <el-tooltip class="item" effect="dark" placement="top-start">
                                        <div slot="content">
                                            {{ $t("views.apps.simon.exploration.components.tabs.datasetsTab.index.models_table.messages.failed_model") }}
                                        </div>
                                        <span class="el-icon-warning"></span>
                                    </el-tooltip>
                                </div>
                                <span v-if="scope.row.modelName" style="padding-left: 10px;">{{ scope.row.modelName }}</span>
                                <span v-else style="padding-left: 10px;">N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            v-for="(performanceItem, performanceIndex) in jobDetailsData.performance"
                            :prop="'performance|' + performanceItem"
                            :key="performanceItem + '_' + performanceIndex"
                            :label="$t(['globals.performanceVariables.options.', performanceItem, '.title'].join(''))"
                            sortable="custom"
                            @sort-orders="['ascending', 'descending']"
                            align="center"
                            min-width="150"
                        >
                            <template slot-scope="scope">
                                <span v-if="typeof scope.row.performance !== 'undefined' && scope.row.performance[performanceItem]">{{
                                    scope.row.performance[performanceItem]
                                }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            align="center"
                            min-width="125"
                            prop="processing_time"
                            show-overflow-tooltip
                            :label="$t('views.apps.simon.exploration.components.tabs.datasetsTab.index.models_table.header.processing_time')"
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
                    >
                    </el-pagination>
                </el-card>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24" style="margin-top: 15px;">
                <el-tabs v-model="activeDatasetSubTabName" v-if="selectedFeatureSetId > 0" type="card">
                    <!-- Don't display Tab Pane if we have only one Tab to display and he doesn't satisfy display criteria -->
                    <el-tab-pane v-for="item in datasetsTabMapOptions" :label="item.label" :key="item.key" :name="item.key" :disabled="isTabDisabled(item)">
                        <span slot="label"><i :class="item.icon"></i> {{ item.label }}</span>
                        <keep-alive>
                            <sub-tab-pane v-if="activeDatasetSubTabName == item.key" :currentView="item.view" :columnName="item.key" :isTabDisabled="isTabDisabled(item)">
                            </sub-tab-pane>
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

import subTabPane from "./components/subTabPane";
import { downloadItemsTemplate } from "@/utils/templates.js";

export default {
    name: "datasetsTab",
    props: {
        jobDetailsData: {
            type: Object,
            default: function() {
                return {};
            }
        }
    },
    components: { subTabPane },
    data() {
        return {
            datasetsTabLoading: false,
            resamplesTableLoading: false,
            modelDetailsTableLoading: false,
            activeDatasetSubTabName: "varImp",
            paginateResamplesData: {
                currentPage: 1,
                page_size: 5,
                total_items: null
            },
            paginateModelsData: {
                currentPage: 1,
                page_size: 5,
                total_items: null
            },
            displayResamples: [],
            displayModels: [],
            selectedModels: [],
            datasetsTabMapOptionsTemplate: [
                {
                    label: this.$t("views.apps.simon.exploration.components.tabs.datasetsTab.index.tabs.variableImportanceTab.title"),
                    view: "variableImportanceTab",
                    key: "varImp",
                    icon: "fa fa-balance-scale",
                    restriction: "selectedModels",
                    restriction_details: "1"
                    // If restriction (selectedModels) is array this is more or eq.. >=1 it will pass
                },
                {
                    label: this.$t("views.apps.simon.exploration.components.tabs.datasetsTab.index.tabs.summaryTab.title"),
                    view: "summaryTab",
                    key: "summaryTab",
                    icon: "fa fa-balance-scale",
                    restriction: "selectedModels",
                    restriction_details: "2"
                },
                {
                    label: this.$t("views.apps.simon.exploration.components.tabs.datasetsTab.index.tabs.samrAnalysisTab.title"),
                    view: "samrAnalysisTab",
                    key: "samrAnalysisTab",
                    icon: "fa fa-balance-scale",
                    restriction: "selectedFeatureSetId"
                }
                /*,{
                    label: this.$t("views.apps.simon.exploration.components.tabs.datasetsTab.index.tabs.catBoostTab.title"),
                    view: "catBoostTab",
                    key: "catBoostTab",
                    icon: "fa fa-balance-scale",
                    restriction: "selectedFeatureSetId"
                }*/
            ],
            jobClassesDisaply: [],
            selectedClasses: []
        };
    },
    computed: {
        selectedFeatureSetId: {
            get() {
                return this.$store.getters.simonExplorationSelectedFeatureSetId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedFeatureSetId", value);
            }
        },
        selectedModelsIDs: {
            get() {
                return this.$store.getters.simonExplorationSelectedModelId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedModelId", value);
            }
        },
        datasetsTabMapOptions: {
            get() {
                return this.$store.getters.datasetsTabMapOptions;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationDatasetsTabMapOptions", value);
            }
        }
    },
    mounted() {
        console.log("datasetsTab: mounted");
    },
    methods: {
        deepSort({ column, prop, order }, dataArray, dataArrayID, dataProp, dataPropID, additionalAction) {
            if (prop !== null && prop.startsWith("performance")) {
                const pref = prop.split("|")[1];
                let arrayData = [];

                if (dataArrayID !== null) {
                    arrayData = this[dataArray][this[dataArrayID]];
                } else if (dataProp !== null && dataPropID === null) {
                    arrayData = this[dataArray][dataProp];
                } else if (dataProp !== null && dataPropID !== null) {
                    arrayData = this[dataArray][dataProp][this[dataPropID]];
                } else {
                    arrayData = this[dataArray];
                }

                let arraySorted = arrayData.sort(function(obj1, obj2) {
                    // Ascending
                    return obj1.performance[pref] - obj2.performance[pref];
                });
                if (order === "descending") {
                    arraySorted = arraySorted.reverse();
                }

                if (dataArrayID !== null) {
                    this[dataArray][this[dataArrayID]] = arraySorted;
                } else if (dataProp !== null && dataPropID === null) {
                    this[dataArray][dataProp] = arraySorted;
                } else if (dataProp !== null && dataPropID !== null) {
                    this[dataArray][dataProp][this[dataPropID]] = arraySorted;
                } else {
                    this[dataArray] = arraySorted;
                }
                if (additionalAction === "paginateResamples") {
                    this.paginateResamples(1);
                    this.$refs.resamplesTable.doLayout();
                } else if (additionalAction === "paginateModels") {
                    this.paginateModels(1);
                    this.$refs.modelDetailsTable.doLayout();
                }
            }
        },
        // Download and delete resample actions
        handleOperations(clickAction, rowInfo) {
            if (clickAction === "downloadResample") {
                this.resamplesTableLoading = true;
                ApiGenarateFileDownloadLink({ downloadType: "resample", recordID: rowInfo.resampleID })
                    .then(response => {
                        if (response.data.success === true && response.data.message.length > 0) {
                            this.$alert(downloadItemsTemplate(response.data.message), "Download links", {
                                dangerouslyUseHTMLString: true,
                                callback: action => {}
                            });
                        }
                        this.resamplesTableLoading = false;
                    })
                    .catch(error => {
                        console.log(error);
                        this.resamplesTableLoading = false;
                    });
            } else if (clickAction === "deleteResample") {
                this.$confirm(
                    this.$t("views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.operations.delete.dialog.description"),
                    this.$t("views.apps.simon.exploration.components.tabs.datasetsTab.index.resamples_table.operations.delete.dialog.title"),
                    {
                        type: "warning"
                    }
                )
                    .then(_ => {
                        this.resamplesTableLoading = true;
                        ApiDeleteDatasetResampleTask({ resampleID: rowInfo.resampleID })
                            .then(response => {
                                if (response.data.success === true) {
                                    this.getDatasetQueueList();
                                    this.$message({
                                        type: "success",
                                        message: this.$t("globals.messages.success")
                                    });
                                }
                                this.resamplesTableLoading = false;
                            })
                            .catch(error => {
                                console.log(error);
                                this.resamplesTableLoading = false;
                            });
                    })
                    .catch(_ => {
                        this.$message({
                            type: "info",
                            message: this.$t("globals.messages.canceled")
                        });
                    });
            } else if (clickAction === "deleteModels") {
                this.$confirm(
                    this.$t("views.apps.simon.exploration.components.tabs.datasetsTab.index.models_table.operations.delete.dialog.description"),
                    this.$t("views.apps.simon.exploration.components.tabs.datasetsTab.index.models_table.operations.delete.dialog.title"),
                    {
                        type: "warning"
                    }
                )
                    .then(_ => {
                        ApiDeleteDatasetResampleTask({ modelIDs: this.selectedModelsIDs })
                            .then(response => {
                                if (response.data.success === true) {
                                    this.getDatasetQueueList();
                                    this.$message({
                                        type: "success",
                                        message: this.$t("globals.messages.success")
                                    });
                                }
                            })
                            .catch(error => {
                                console.log(error);
                            });
                    })
                    .catch(_ => {
                        this.$message({
                            type: "info",
                            message: this.$t("globals.messages.canceled")
                        });
                    });
            } else if (clickAction === "downloadModels") {
                this.modelDetailsTableLoading = true;
                ApiGenarateFileDownloadLink({ downloadType: "models", recordID: this.selectedModelsIDs })
                    .then(response => {
                        if (response.data.success === true && response.data.message.length > 0) {
                            this.$confirm(downloadItemsTemplate(response.data.message), "Download links", {
                                dangerouslyUseHTMLString: true,
                                distinguishCancelAndClose: true,
                                confirmButtonText: "Close",
                                cancelButtonText: "Export table",
                                callback: action => {
                                    // Export table is clicked, make the export!
                                    if (action == "cancel") {
                                        this.exportModelsTable();
                                    }
                                }
                            });
                        }
                        this.modelDetailsTableLoading = false;
                    })
                    .catch(error => {
                        console.log(error);
                        this.modelDetailsTableLoading = false;
                    });
            } else if (clickAction === "deployModels") {
                this.$message({
                    type: "info",
                    message: this.$t("globals.messages.not_implemented")
                });
            }
        },
        // Filter and display classes on user typing!
        filterAvaliableClasses(userInput) {
            if (userInput.length >= 2) {
                this.jobClassesDisaply = this.jobDetailsData.queueDetails.selectedOptions.classes.filter(item => {
                    return item.original.toLowerCase().indexOf(userInput.toLowerCase()) > -1;
                });
            } else {
                this.jobClassesDisaply = [];
            }
        },
        // Display random first five items (classes) on user click/focus
        selectSuggestClasses(event) {
            if (this.jobClassesDisaply.length === 0) {
                let sliceEnd = 5;
                if (this.jobDetailsData.queueDetails.selectedOptions.classes.length < 5) {
                    sliceEnd = this.jobDetailsData.queueDetails.selectedOptions.classes.length;
                }
                this.jobClassesDisaply = this.jobDetailsData.queueDetails.selectedOptions.classes.slice(0, sliceEnd);
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
                restriction: "selectedClasses"
            };
            // If there is no classes selected show only Variable Importance Tab
            if (selected.length > 0) {
                if (selected.length > 5) {
                    this.$message({
                        message: this.$t("views.apps.simon.exploration.components.tabs.datasetsTab.index.messages.max_classes"),
                        type: "warning"
                    });
                    return;
                }
                // STEP 1
                // Fetch details for specifically selected classes
                const selectedClassesDetails = this.jobDetailsData.queueDetails.selectedOptions.classes.filter(item => {
                    return selected.indexOf(item.remapped) > -1;
                });

                for (let i = 0, lenI = selectedClassesDetails.length; i < lenI; i++) {
                    let selectedClass = selectedClassesDetails[i];
                    console.log("selectedClass: ", selectedClass);

                    let checkIfClassInSelectedTabs = this.datasetsTabMapOptions.filter(function(e) {
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
                        this.datasetsTabMapOptions = this.datasetsTabMapOptions.filter(function(e) {
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
                    if (this.jobDetailsData.resampleModels[this.selectedFeatureSetId].length > 0) {
                        this.selectedModels = this.jobDetailsData.resampleModels[this.selectedFeatureSetId].filter(model => this.selectedModelsIDs.includes(model.modelID));
                        this.selectedModels.forEach(row => {
                            this.$refs.modelDetailsTable.toggleRowSelection(row, true);
                        });
                    }
                }
            }
        },
        // Check if Tab should be disabled based on restriction property in datasetsTabMapOptions
        isTabDisabled(item) {
            let check = false;
            if (item.restriction !== undefined) {
                if (this[item.restriction] !== undefined) {
                    if (Number.isInteger(this[item.restriction])) {
                        if (this[item.restriction] < 1) {
                            check = true;
                        }
                    } else if (Array.isArray(this[item.restriction])) {
                        let more_or_eq = 0;
                        // If there is nothing in array TAB is always disabled
                        if (this[item.restriction].length < 1) {
                            check = true;
                            return check;
                        }
                        if (item.restriction_details !== undefined) {
                            if (this[item.restriction].length < item.restriction_details) {
                                check = true;
                                return check;
                            }
                        }
                    } else {
                        check = this[item.restriction] === 0;
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
            let filteredSelection = selection;
            // Only select models if they are visible
            if (this.displayModels.length > 0) {
                filteredSelection = selection.filter(model => model.status > 0);
                this.selectedModelsIDs = filteredSelection.map(model => model.modelID);
                // If they are different in lenght this means we have some models that are Invalid (status 0)
                if (filteredSelection.length !== selection.length) {
                    const invalidModels = selection.filter(model => model.status === 0);
                    // Lets de-select those models!
                    invalidModels.forEach(row => {
                        this.$refs.modelDetailsTable.toggleRowSelection(row, false);
                    });
                }
            }
            this.selectedModels = filteredSelection;
            console.log("handleModelsSelectionChange: ", this.selectedModels);

            // If no models are selected lets activate some other TAB except Variable Importance Tab
            if (this.selectedModels.length === 0) {
                let check = false;
                this.datasetsTabMapOptions.forEach(tab => {
                    if (check == false && !this.isTabDisabled(tab)) {
                        this.activeDatasetSubTabName = tab.key;
                        check = true;
                    }
                });
            } else if (this.selectedModels.length === 1) {
                this.activeDatasetSubTabName = "varImp";
            }
        },
        // Initialize Pagination of Features
        paginateResamples(pageNumber) {
            if(this.selectedFeatureSetId <= 0){
                this.$refs.resamplesTable.clearSelection();
            }
            this.paginateResamplesData.currentPage = pageNumber;
            // because pages logically start with 1, but technically with 0
            pageNumber = pageNumber - 1;
            this.paginateResamplesData.total_items = this.jobDetailsData.resamplesList.length;

            this.displayResamples = this.jobDetailsData.resamplesList.slice(
                pageNumber * this.paginateResamplesData.page_size,
                (pageNumber + 1) * this.paginateResamplesData.page_size
            );
        },
        // Initialize Pagination of Models
        paginateModels(pageNumber) {
            this.paginateModelsData.currentPage = pageNumber;
            // because pages logically start with 1, but technically with 0
            pageNumber = pageNumber - 1;
            this.paginateModelsData.total_items = this.jobDetailsData.resampleModels[this.selectedFeatureSetId].length;

            this.displayModels = this.jobDetailsData.resampleModels[this.selectedFeatureSetId].slice(
                pageNumber * this.paginateModelsData.page_size,
                (pageNumber + 1) * this.paginateModelsData.page_size
            );
        },
        selectResample(selection, row) {
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
                    type: "warning"
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

            if (row.resampleID !== this.selectedFeatureSetId) {
                console.log("Filtering models for new resample!");

                this.selectedFeatureSetId = row.resampleID;
                this.selectedModelsIDs = [];

                // Select only models with that feature set ID
                this.jobDetailsData.resampleModels[this.selectedFeatureSetId] = this.jobDetailsData.modelsList.filter(model => model.resampleID === this.selectedFeatureSetId);

                this.$refs.resamplesTable.setCurrentRow(row);
                this.paginateModels(1);
                this.$nextTick(() => {
                    this.initSelectedModels();
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

            perfValues.forEach(function(pref) {
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
        // Export all models to Excel file
        exportModelsTable() {
            this.modelDetailsTableLoading = true;

            import("@/vendor/Export2Excel").then(excel => {
                const exportData = JSON.parse(JSON.stringify(this.jobDetailsData.resampleModels[this.selectedFeatureSetId]));
                // Filter models based on selection
                // const filteredArray = exportData.filter(({ modelID }) => this.selectedModelsIDs.includes(modelID));

                // Map performance variables to root node
                const flattenData = exportData.map(function(item) {
                    let itemFlat = item;
                    itemFlat = Object.assign(itemFlat, item.performance);
                    delete itemFlat.performance;

                    return itemFlat;
                });
                let filterVal = Object.keys(flattenData[0]);
                let tHeader = filterVal;
                const formattedData = this.formatJson(filterVal, flattenData);

                excel.export_json_to_excel(tHeader, formattedData, "models_resampleID_" + this.selectedFeatureSetId);

                this.modelDetailsTableLoading = false;
            });
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v =>
                filterVal.map(j => {
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
                .then(response => {
                    this.datasets = response.data.data;
                    this.datasetsTabLoading = false;
                })
                .catch(error => {
                    console.log(error);
                });
        },
        copyToClipboard(content, event) {
            clipboard(content, event);
        }
    },
    watch: {
        "jobDetailsData.queueDetails": function(newVal, oldVal) {
            console.log("Updating jobClassesDisaply");
            // And new selected queue classes
            if (typeof newVal.selectedOptions !== "undefined") {
                this.jobClassesDisaply = newVal.selectedOptions.classes;
                // Paginate Resample
                this.paginateResamples(1);

                this.$nextTick(() => {
                    this.datasetsTabMapOptions = this.datasetsTabMapOptionsTemplate;
                });
            }
        }
    }
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
</style>
