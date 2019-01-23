<template>
    <div class="datasetsTab-container">
        <el-row align="top">
            <el-col :span="24">
                <el-card class="box-card">
                    <div slot="header" class="clearfix"><span>1. Please select one dataset for exploration</span></div>
                    <el-table
                        ref="resamplesTable"
                        @sort-change="
                            ({ column, prop, order }) => {
                                deepSort(
                                    { column, prop, order },
                                    'jobDetailsData',
                                    null,
                                    'resamplesList',
                                    null,
                                    'paginateResamples'
                                );
                            }
                        "
                        :data="displayResamples"
                        :row-class-name="resamplesTableRowClass"
                        @row-click="selectResample"
                        highlight-current-row
                        height="300"
                        max-height="300"
                    >
                        <el-table-column type="expand" style="padding: 0;">
                            <template slot-scope="props">
                                <el-table
                                    :ref="'prop_table' + props.row.resampleID"
                                    :data="props.row.proportions"
                                    class="proportionsTable"
                                >
                                    <el-table-column align="center" label="Class" prop="label">
                                        <template slot-scope="scope">
                                            <span>{{ scope.row.label }}</span>
                                        </template>
                                    </el-table-column>
                                    <!-- loop datasets (train/test) -->
                                    <el-table-column
                                        v-for="(classesItem, classesIndex) in props.row.proportions[1].classes"
                                        :key="'props_dataset_' + classesIndex"
                                        :label="classesIndex"
                                    >
                                        <!-- loop dataset classes - outcomes (high/low/global) -->
                                        <el-table-column
                                            v-for="(classesSubItem, classesSubIndex) in classesItem"
                                            :key="'props_dataset_classes_' + classesSubIndex"
                                            :label="classesSubIndex"
                                        >
                                            <!-- loop dataset classes values (details / prop) -->
                                            <template slot-scope="scope">
                                                <div v-if="scope.row.classes[classesIndex][classesSubIndex]">
                                                    <div
                                                        v-for="(subItem, subItemIndex) in scope.row.classes[
                                                            classesIndex
                                                        ][classesSubIndex]"
                                                        style="text-align: center;"
                                                    >
                                                        <span v-html="subItem"></span>
                                                    </div>
                                                </div>
                                            </template>
                                        </el-table-column>
                                    </el-table-column>
                                </el-table>
                            </template>
                        </el-table-column>

                        <el-table-column align="center" width="30">
                            <template slot-scope="scope">
                                <div v-if="(scope.row.dataSource = 1)">
                                    <el-tooltip class="item" effect="dark" placement="top-start">
                                        <div slot="content">Initial</div>
                                        <span class="el-icon-more"></span>
                                    </el-tooltip>
                                </div>
                                <div v-else>
                                    <el-tooltip class="item" effect="dark" placement="top-start">
                                        <div slot="content">Predicted</div>
                                        <span class="el-icon-more-outline"></span>
                                    </el-tooltip>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column align="center" width="100" label="ID" prop="resampleID" sortable="custom">
                            <template slot-scope="scope">
                                <span>{{ scope.row.resampleID }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column align="center" width="125" label="Features" sortable="custom">
                            <template slot-scope="scope">
                                <span v-if="scope.row.featuresTotal">{{ scope.row.featuresTotal }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            v-for="(performanceItem, performanceIndex) in jobDetailsData.performance"
                            :prop="'performance|' + performanceItem"
                            :key="performanceItem + '_' + performanceIndex"
                            :label="performanceItem"
                            sortable="custom"
                            @sort-orders="['ascending', 'descending']"
                            align="center"
                            width="150"
                        >
                            <template slot-scope="scope">
                                <span
                                    v-if="
                                        typeof scope.row.performance !== 'undefined' &&
                                            scope.row.performance[performanceItem]
                                    "
                                    >{{ scope.row.performance[performanceItem] }}</span
                                >
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            align="center"
                            width="150"
                            label="Total samples"
                            prop="samplesTotal"
                            sortable="custom"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTotal">{{ scope.row.samplesTotal }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            width="170"
                            label="Samples Training"
                            prop="samplesTraining"
                            sortable="custom"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTraining">{{ scope.row.samplesTraining }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            width="170"
                            label="Samples Testing"
                            prop="samplesTesting"
                            sortable="custom"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTesting">{{ scope.row.samplesTesting }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            align="center"
                            width="175"
                            label="Models submitted"
                            prop="modelsTotal"
                            sortable="custom"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.modelsTotal">{{ scope.row.modelsTotal }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column class-name="settings" fixed="right" label="Operations" width="120">
                            <template slot-scope="scope">
                                <el-button
                                    size="mini"
                                    style="float: left;"
                                    type="primary"
                                    plain
                                    icon="el-icon-download"
                                    @click="handleOperations('download', scope.row)"
                                ></el-button>
                                <el-button
                                    size="mini"
                                    style="float: right;"
                                    type="danger"
                                    plain
                                    icon="el-icon-delete"
                                    @click="handleOperations('delete', scope.row)"
                                ></el-button>
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
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span>2. Please select as much as models you wish to compare</span>
                    </div>
                    <!-- Model Details data -->
                    <el-table
                        ref="modelDetailsTable"
                        :data="displayModels"
                        @select-all="handleModelsSelectionChange"
                        @select="handleModelsSelectionChange"
                        @sort-change="
                            ({ column, prop, order }) => {
                                deepSort(
                                    { column, prop, order },
                                    'jobDetailsData',
                                    null,
                                    'resampleModels',
                                    'selectedFeatureSetId',
                                    'paginateModels'
                                );
                            }
                        "
                        row-key="modelID"
                        empty-text="Nothing to display"
                        height="300"
                        max-height="300"
                    >
                        <el-table-column
                            type="selection"
                            reserve-selection
                            @selectable="checkModelsSelectionChange"
                            width="40"
                            fixed
                        >
                        </el-table-column>

                        <el-table-column
                            fixed
                            width="150"
                            prop="modelName"
                            sortable
                            :label="$t('views.dashboard.jobs.table.modal_info.methods.method')"
                        >
                            <template slot-scope="scope">
                                <div v-if="scope.row.status > 0" style="float: left;">
                                    <span class="el-icon-success"></span>
                                </div>
                                <div v-else style="float: left;">
                                    <el-tooltip class="item" effect="dark" placement="top-start">
                                        <div
                                            slot="content"
                                            v-html="
                                                $t('views.dashboard.jobs.table.modal_info.methods.model_error_info')
                                            "
                                        ></div>
                                        <span class="el-icon-warning"></span>
                                    </el-tooltip>
                                </div>
                                <span v-if="scope.row.modelName" style="padding-left: 10px;">{{
                                    scope.row.modelName
                                }}</span>
                                <span v-else style="padding-left: 10px;">N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            v-for="(performanceItem, performanceIndex) in jobDetailsData.performance"
                            :prop="'performance|' + performanceItem"
                            :key="performanceItem + '_' + performanceIndex"
                            :label="performanceItem"
                            sortable="custom"
                            @sort-orders="['ascending', 'descending']"
                        >
                            <template slot-scope="scope">
                                <span
                                    v-if="
                                        typeof scope.row.performance !== 'undefined' &&
                                            scope.row.performance[performanceItem]
                                    "
                                    >{{ scope.row.performance[performanceItem] }}</span
                                >
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            align="center"
                            prop="trainingTime"
                            sortable
                            show-overflow-tooltip
                            :label="$t('views.dashboard.jobs.table.modal_info.methods.time')"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.trainingTime">{{
                                    (scope.row.trainingTime * 1000) | millisecondsToStr
                                }}</span>
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

        <el-row v-if="jobClassesDisaply.length > 0" style="margin-top: 15px;">
            <el-col :span="12">
                <el-select
                    class="flud-selects"
                    v-model="selectedClasses"
                    multiple
                    filterable
                    remote
                    default-first-option
                    placeholder="Please select classes, type to search..."
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
                    ></el-option>
                </el-select>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="24" style="margin-top: 15px;">
                <el-tabs v-model="activeDatasetSubTabName" v-if="selectedFeatureSetId > 0" type="card">
                    <!-- Don't display Tab Pane if we have only one Tab to display and he doesn't satisfy display criteria -->
                    <el-tab-pane
                        v-for="item in datasetsTabMapOptions"
                        :label="item.label"
                        :key="item.key"
                        :name="item.key"
                        v-if="!isTabDisabled(item)"
                        :disabled="isTabDisabled(item)"
                    >
                        <span slot="label"><i :class="item.icon"></i> {{ item.label }}</span>
                        <keep-alive>
                            <sub-tab-pane
                                v-if="activeDatasetSubTabName == item.key"
                                :currentView="item.view"
                                :columnName="item.key"
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
import {
    deleteDatasetResampleTask as ApiDeleteDatasetResampleTask,
} from "@/api/backend";

import clipboard from "@/utils/clipboard";
import _ from "lodash";

import subTabPane from "./components/subTabPane";
import { downloadFileTemplate } from "@/utils/templates.js";

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
            loading: true,
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
                    label: "Variable Importance",
                    view: "variableImportanceTab",
                    key: "varImp",
                    icon: "fa fa-balance-scale",
                    restriction: "selectedModels",
                    restriction_details: "1"
                    // If restriction (selectedModels) is array this is more or eq.. >=1 it will pass
                },
                {
                    label: "Summary",
                    view: "summaryTab",
                    key: "summaryTab",
                    icon: "fa fa-balance-scale",
                    restriction: "selectedModels",
                    restriction_details: "2"
                },
                {
                    label: "SAM",
                    view: "samrAnalysisTab",
                    key: "samrAnalysisTab",
                    icon: "fa fa-balance-scale",
                    restriction: "selectedFeatureSetId"
                },
                {
                    label: "CatBoost",
                    view: "catBoostTab",
                    key: "catBoostTab",
                    icon: "fa fa-balance-scale",
                    restriction: "selectedFeatureSetId"
                }
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

        this.jobClassesDisaply = this.jobDetailsData.queueDetails.selectedOptions.classes;

        // Paginate Features and Models
        this.initPagination();

        // Lets try to restore Models selection from previous user session
        this.$nextTick(() => {
            this.initSelectedModels();
            //if(this.datasetsTabMapOptions.length === 0){
            this.datasetsTabMapOptions = this.datasetsTabMapOptionsTemplate;
            //}
        });
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

                console.log(pref);
                console.log(order);

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
            if (clickAction === "download") {
                const fileID = rowInfo.fileID_train;

                const downloadWindow = window.open("", "_blank");
                downloadWindow.document.write(downloadFileTemplate());
                ApiGenarateFileDownloadLink({ fileID: fileID })
                    .then(response => {
                        downloadWindow.location.href = response.data.message.url;
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } else if (clickAction === "delete") {
                const resampleID = rowInfo.resampleID;
                this.$confirm(
                    "This will permanently delete everything on the system related to selected resample. Continue?",
                    "Warning",
                    {
                        type: "warning"
                    }
                )
                    .then(_ => {
                        ApiDeleteDatasetResampleTask({ resampleID: resampleID })
                            .then(response => {
                                if (response.data.success === true) {
                                    this.getDatasetQueueList();
                                }
                                this.$message({
                                    type: "success",
                                    message: "Successfully deleted!"
                                });
                            })
                            .catch(error => {
                                console.log(error);
                            });
                    })
                    .catch(_ => {
                        this.$message({
                            type: "info",
                            message: "Delete error, canceled!"
                        });
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
                        message: "Selection of maximum 5 classes is currently supported",
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
                    console.log("selectedClass: ");
                    console.log(selectedClass);

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
                console.log(
                    "STEP 2 ====================: " + this.datasetsTabMapOptions.length,
                    this.datasetsTabMapOptions
                );
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
            console.log("initSelectedModels: ", this.selectedModelsIDs);
            if (this.selectedModelsIDs.length > 0 && this.selectedModels.length === 0) {
                if (this.selectedFeatureSetId > 0) {
                    if (this.jobDetailsData.resampleModels[this.selectedFeatureSetId].length > 0) {
                        this.selectedModels = this.jobDetailsData.resampleModels[this.selectedFeatureSetId].filter(
                            model => this.selectedModelsIDs.includes(model.modelID)
                        );
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
            }
        },
        // Initialize Pagination of Features and Models Tables
        initPagination() {
            this.paginateResamples(1);
            this.paginateModels(1);
        },
        // Initialize Pagination of Features
        paginateResamples(pageNumber) {
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
        selectResample(row, event, column) {
            console.log("Feature set change: " + row.resampleID + " " + this.selectedFeatureSetId);

            if (row.modelsTotal < 1) {
                console.log("No models processed in selected resample..");
                return;
            }
            if (column.className === "settings") {
                return;
            }

            if (row.resampleID !== this.selectedFeatureSetId) {
                this.selectedFeatureSetId = row.resampleID;
                // Select only models with that feature set ID
                this.jobDetailsData.resampleModels[this.selectedFeatureSetId] = this.jobDetailsData.modelsList.filter(
                    model => model.resampleID === this.selectedFeatureSetId
                );

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
        fetchJobDetails(pqid) {
            this.loading = true;
            fetchJobDetails(pqid)
                .then(response => {
                    this.datasets = response.data.data;
                    this.loading = false;
                })
                .catch(error => {
                    console.log(error);
                });
        },
        copyToClipboard(content, event) {
            clipboard(content, event);
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
.el-table__expanded-cell[class*="cell"] {
    padding: 5px 0;
}
.proportionsTable {
    width: 1000px;
    font-size: 12px;
    th,
    td {
        padding: 5px 0;
    }
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
