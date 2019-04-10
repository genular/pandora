<template>
    <div class="queue-list-container" v-loading="queueListLoading" :element-loading-text="$t('globals.page_loading')">
        <div class="filter-container">
            <el-input
                @keyup.enter.native="handleFilter"
                style="width: 300px;"
                class="filter-item"
                :placeholder="$t('views.dashboard.admin.components.QueueTable.filters.queue_id.placeholder')"
                v-model="queueFilterQuery.queueID"
            >
            </el-input>
            <el-select @change="handleFilter" style="width: 140px" class="filter-item" v-model="queueFilterQuery.sort">
                <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key"> </el-option>
            </el-select>
            <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">
                {{ $t("views.dashboard.admin.components.QueueTable.filters.buttons.search") }}
            </el-button>
            <el-button class="filter-item" type="primary" :loading="downloadLoading" v-waves icon="el-icon-download" @click="handleDownload">{{
                $t("views.dashboard.admin.components.QueueTable.filters.buttons.export")
            }}</el-button>
        </div>
        <el-table
            :data="queueList"
            ref="queueTable"
            :empty-text="$t('views.dashboard.admin.components.QueueTable.table.no_data')"
            @select-all="selectQueue"
            @select="selectQueue"
            row-key="queueID"
            stripe
            border
            fit
            class="queue-list-container-table"
            style="width: 100%"
        >
            <el-table-column type="selection" reserve-selection width="40" fixed> </el-table-column>

            <el-table-column align="center" :label="$t('views.dashboard.admin.components.QueueTable.table.header.queue_id')" width="65">
                <template slot-scope="scope">
                    <span>{{ scope.row.queueID }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" :label="$t('views.dashboard.admin.components.QueueTable.table.header.queue_name')">
                <template slot-scope="scope">
                    <span class="queue-name" :title="scope.row.queueName">{{ scope.row.queueName }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('views.dashboard.admin.components.QueueTable.table.header.created')">
                <template slot-scope="scope">
                    <span>{{ scope.row.created | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('views.dashboard.admin.components.QueueTable.table.header.queueProcessingTime')">
                <template slot-scope="scope">
                    <span v-if="scope.row.queueProcessingTime">{{ scope.row.queueProcessingTime | millisecondsToStr }}</span>
                    <span v-else>N/A</span>
                </template>
            </el-table-column>
            <el-table-column align="center" class-name="status-col" :label="$t('views.dashboard.admin.components.QueueTable.table.header.status')" width="175">
                <template slot-scope="scope">
                    <el-tag :type="statusFilter(scope.row.status, 'class')">{{ statusFilter(scope.row.status, "value") }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('views.dashboard.admin.components.QueueTable.table.header.extraction.title')">
                <template slot-scope="scope">
                    <span v-if="scope.row.queueExtraction < 1">
                        {{ $t("views.dashboard.admin.components.QueueTable.table.header.extraction.options.no") }}
                    </span>
                    <span v-else>
                        {{ $t("views.dashboard.admin.components.QueueTable.table.header.extraction.options.yes") }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('views.dashboard.admin.components.QueueTable.table.header.sparsity')">
                <template slot-scope="scope">
                    <span v-if="scope.row.sparsity < 0.5"> <span class="el-icon-success"></span> {{ scope.row.sparsity * 100 }}% </span>
                    <span v-else-if="scope.row.sparsity > 0.5 && scope.row.sparsity < 0.75"> <span class="el-icon-warning"></span> {{ scope.row.sparsity * 100 }}% </span>
                    <span v-else> <span class="el-icon-error"></span> {{ scope.row.sparsity * 100 }}% </span>
                </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('views.dashboard.admin.components.QueueTable.table.header.resamples')">
                <template slot-scope="scope">
                    <span>{{ scope.row.resamplesTotal }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('views.dashboard.admin.components.QueueTable.table.header.modelsTotal')">
                <template slot-scope="scope">
                    <span>{{ scope.row.modelsTotal }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('views.dashboard.admin.components.QueueTable.table.header.modelsSuccess')">
                <template slot-scope="scope">
                    <span>{{ scope.row.modelsSuccess }}</span>
                </template>
            </el-table-column>
            <el-table-column class-name="settings" fixed="right" :label="$t('views.dashboard.admin.components.QueueTable.table.header.operations')" width="180">
                <template slot-scope="scope">
                    <el-button
                        size="mini"
                        :title="$t('views.dashboard.admin.components.QueueTable.table.operations.info.title')"
                        type="success"
                        round
                        icon="el-icon-info"
                        @click="handleOperations('info', scope.row)"
                    >
                    </el-button>
                    <el-button
                        size="mini"
                        :title="$t('views.dashboard.admin.components.QueueTable.table.operations.download.title')"
                        type="primary"
                        plain
                        icon="el-icon-download"
                        @click="handleOperations('download', scope.row)"
                    >
                    </el-button>
                    <el-button
                        size="mini"
                        :title="$t('views.dashboard.admin.components.QueueTable.table.operations.delete.title')"
                        type="danger"
                        plain
                        icon="el-icon-delete"
                        @click="handleOperations('delete', scope.row)"
                    >
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination-container">
            <el-pagination
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="queueFilterQuery.page"
                :page-sizes="[10, 20, 30, 50]"
                :page-size="queueFilterQuery.limit"
                layout="total, sizes, prev, pager, next, jumper"
                :total="queueTotalItems"
            >
            </el-pagination>
        </div>
        <!-- Queue Details Info Dialog -->
        <el-dialog :visible.sync="dialogQueueDetails" :before-close="closeQueueDetailsDialog" width="75%">
            <span slot="title">
                <el-row type="flex" align="top" style="line-height: 32px;">
                    <el-col :span="12">
                        <span>{{ $t("views.dashboard.admin.components.QueueTable.dialog.title") }}</span>
                    </el-col>
                    <el-col :span="12" style="text-align: right;" v-if="performaceVariables[selectedResampleIDsHash]">
                        <el-select
                            style="padding-right: 25px;width: 100%;"
                            v-model="selectedPerformace"
                            multiple
                            filterable
                            size="small"
                            :placeholder="$t('globals.performanceVariables.placeholder')"
                        >
                            <el-option
                                v-for="item in performaceVariables[selectedResampleIDsHash]"
                                :key="item"
                                :value="item"
                                :label="$t(['globals.performanceVariables.options.', item, '.title'].join(''))"
                            >
                                <span>{{ $t("globals.performanceVariables.options." + item + ".title") }}</span>
                            </el-option>
                        </el-select>
                    </el-col>
                </el-row>
                <el-row type="flex" align="top" style="text-align: right;margin-right: 25px; padding-top: 25px;">
                    <el-col :span="24">
                        <el-button style="cursor: copy;" type="success" class="animated flipInX" size="small">
                            {{ $t("views.dashboard.admin.components.QueueTable.dialog.selected_queue_id") }}: {{ selectedQueueID }}
                        </el-button>
                        <el-button style="cursor: copy;" type="success" class="animated flipInX" size="small">
                            {{ $t("views.dashboard.admin.components.QueueTable.dialog.selected_resamples_ids") }}: {{ selectedResampleIDs.join(", ") }}
                        </el-button>
                    </el-col>
                </el-row>
            </span>
            <!-- Resample data -->
            <el-row type="flex" align="top">
                <el-col :span="24">
                    <el-table
                        ref="resamplesDetailsTable"
                        :data="resamplesList[selectedQueueID]"
                        :empty-text="$t('views.dashboard.admin.components.QueueTable.dialog.no_data')"
                        @selection-change="getDatasetResamplesModels"
                        row-key="resampleID"
                        style="width: 100%"
                        height="250"
                    >
                        <el-table-column type="selection" reserve-selection width="40" fixed> </el-table-column>
                        <el-table-column align="center" :label="$t('views.dashboard.admin.components.QueueTable.dialog.resamples_table.header.resample_id')">
                            <template slot-scope="scope">
                                <span>{{ scope.row.resampleID }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" :label="$t('views.dashboard.admin.components.QueueTable.dialog.resamples_table.header.processingTime')">
                            <template slot-scope="scope">
                                <span v-if="scope.row.processing_time">{{ scope.row.processing_time | millisecondsToStr }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column fixed align="center" :label="$t('views.dashboard.admin.components.QueueTable.dialog.resamples_table.header.source.title')" width="75">
                            <template slot-scope="scope">
                                <div v-if="(scope.row.dataSource = 1)">
                                    <el-tooltip class="item" effect="dark" placement="top-start">
                                        <div slot="content">{{ $t("views.dashboard.admin.components.QueueTable.dialog.resamples_table.header.source.options.initial") }}</div>
                                        <span class="el-icon-more"></span>
                                    </el-tooltip>
                                </div>
                                <div v-else>
                                    <el-tooltip class="item" effect="dark" placement="top-start">
                                        <div slot="content">{{ $t("views.dashboard.admin.components.QueueTable.dialog.resamples_table.header.source.options.predicted") }}</div>
                                        <span class="el-icon-more-outline"></span>
                                    </el-tooltip>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            prop="samplesTotal"
                            sortable
                            :label="$t('views.dashboard.admin.components.QueueTable.dialog.resamples_table.header.total_samples')"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTotal">{{ scope.row.samplesTotal }}</span> <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            prop="featuresTotal"
                            sortable
                            :label="$t('views.dashboard.admin.components.QueueTable.dialog.resamples_table.header.total_features')"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.featuresTotal">{{ scope.row.featuresTotal }}</span> <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            prop="samplesTraining"
                            sortable
                            :label="$t('views.dashboard.admin.components.QueueTable.dialog.resamples_table.header.total_samples_training')"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTraining">{{ scope.row.samplesTraining }}</span> <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            prop="samplesTesting"
                            sortable
                            :label="$t('views.dashboard.admin.components.QueueTable.dialog.resamples_table.header.total_samples_testing')"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTesting">{{ scope.row.samplesTesting }}</span> <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" :label="$t('views.dashboard.admin.components.QueueTable.dialog.resamples_table.header.total_models_processed')">
                            <template slot-scope="scope">
                                <span>{{ scope.row.modelsTotal }}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-col>
            </el-row>
            <!-- Model Details data -->
            <el-row type="flex" align="top">
                <el-col :span="24">
                    <el-table
                        ref="modelDetailsTable"
                        v-loading="modelsListLoading"
                        @sort-change="
                            ({ column, prop, order }) => {
                                deepSort({ column, prop, order }, 'modelsList', null, null, null);
                            }
                        "
                        :data="modelsList"
                        :empty-text="$t('views.dashboard.admin.components.QueueTable.dialog.no_data')"
                        :row-class-name="modelDetailsTableRowClassName"
                        style="width: 100%"
                        height="300"
                    >
                        <el-table-column
                            fixed
                            align="center"
                            width="30"
                            prop="status"
                            :filters="[{ text: 'Failed', value: 0 }, { text: 'Success', value: 1 }]"
                            :filter-method="filterModelStatus"
                            filter-placement="bottom-end"
                        >
                            <template slot-scope="scope">
                                <div v-if="scope.row.status > 0"><span class="el-icon-success"></span></div>
                                <div v-else>
                                    <el-tooltip class="item" effect="dark" placement="top-start">
                                        <div slot="content">
                                            {{ $t("views.dashboard.admin.components.QueueTable.dialog.models_table.header.status.options.error") }}
                                        </div>
                                        <span class="el-icon-warning"></span>
                                    </el-tooltip>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" width="125" :label="$t('views.dashboard.admin.components.QueueTable.dialog.resamples_table.header.resample_id')">
                            <template slot-scope="scope">
                                <span>{{ scope.row.resampleID }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" width="125" :label="$t('views.dashboard.admin.components.QueueTable.dialog.models_table.header.model_id')">
                            <template slot-scope="scope">
                                <span>{{ scope.row.modelID }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="left"
                            prop="modelName"
                            sortable
                            :label="$t('views.dashboard.admin.components.QueueTable.dialog.models_table.header.analasys_method')"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.modelName">{{ scope.row.modelName }}</span> <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            prop="processing_time"
                            sortable
                            :label="$t('views.dashboard.admin.components.QueueTable.dialog.models_table.header.processing_time')"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.processing_time">{{ scope.row.processing_time | millisecondsToStr }}</span> <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            v-for="(performanceItem, performanceIndex) in selectedPerformace"
                            :prop="'performance|' + performanceItem"
                            :key="performanceItem + '_' + performanceIndex"
                            :label="$t(['globals.performanceVariables.options.', performanceItem, '.title'].join(''))"
                            sortable="custom"
                            @sort-orders="['ascending', 'descending']"
                        >
                            <template slot-scope="scope">
                                <span v-if="typeof scope.row.performance !== 'undefined' && scope.row.performance[performanceItem]">
                                    {{ scope.row.performance[performanceItem] }}
                                </span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-col>
            </el-row>
        </el-dialog>
    </div>
</template>
<script>
import {
    fetchQueueList as apiFetchQueueList,
    fetchQueueResamples as ApiFetchQueueResamples,
    fetchResampleModels as ApiFetchResampleModels,
    deleteDatasetQueueTask as ApiDeleteDatasetQueueTask,
    genarateFileDownloadLink as ApiGenarateFileDownloadLink
} from "@/api/backend";

import waves from "@/directive/waves";

import { md5String } from "@/utils";
import { parseTime } from "@/filters";
import { sortAlphaNum } from "@/utils/helpers.js";
import { downloadItemsTemplate } from "@/utils/templates.js";

export default {
    name: "QueueTable",
    directives: {
        waves
    },
    data() {
        return {
            queueList: [],
            queueListHash: "",
            dialogQueueDetails: false,
            queueListLoading: true,

            selectedQueueID: 0,
            resamplesList: [],

            selectedResampleIDs: [],
            selectedResampleIDsHash: "",
            // Array of objects holding all models for selected resamples
            modelsList: [],
            modelsListLoading: false,

            performaceVariables: [],
            selectedPerformace: [],
            // Timer to update queue table
            updateInterval: null,
            queueTotalItems: null,
            queueFilterQuery: {
                page: 1,
                limit: 20,
                queueID: undefined,
                sort: "+"
            },
            sortOptions: [
                {
                    label: this.$t("views.dashboard.admin.components.QueueTable.filters.queue_id.sorting.ascending"),
                    key: "+"
                },
                {
                    label: this.$t("views.dashboard.admin.components.QueueTable.filters.queue_id.sorting.descending"),
                    key: "-"
                }
            ],

            downloadLoading: false
        };
    },
    computed: {
        explorationJobId: {
            get() {
                return this.$store.getters.simonExplorationJobId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationJobId", value);
            }
        }
    },
    mounted() {
        // Initial Items request
        if (this.queueListHash === "") {
            this.explorationJobId = "";
            this.getDatasetQueueList();
        }
        // Set the timer to get new data each 60 seconds
        if (this.updateInterval === null) {
            this.updateInterval = setInterval(
                function() {
                    this.getDatasetQueueList();
                }.bind(this),
                60000
            );
        }
    },
    beforeDestroy: function() {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
    },
    methods: {
        // Called when user closed queue details Dialog
        closeQueueDetailsDialog(done) {
            console.log("closeQueueDetailsDialog: " + this.selectedResampleIDs);
            // Reset if any resample was selected on some previous screen
            // Reset resamples
            this.selectedResampleIDs = [];
            this.$refs.resamplesDetailsTable.setCurrentRow();
            this.$refs.resamplesDetailsTable.clearSelection();
            // Reset models
            this.selectedPerformace = [];
            // Close dialog
            this.dialogQueueDetails = false;

            done();
        },
        deepSort({ column, prop, order }, dataArray, dataArrayID, dataProp, dataPropID) {
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
            }
        },
        handleOperations(clickAction, rowInfo) {
            if (clickAction === "download" || clickAction === "delete") {
                if (clickAction === "download") {
                    this.queueListLoading = true;
                    ApiGenarateFileDownloadLink({ downloadType: "queue", recordID: rowInfo.queueID })
                        .then(response => {
                            if (response.data.success === true && response.data.message.length > 0) {
                                this.$alert(downloadItemsTemplate(response.data.message), "Download links", {
                                    dangerouslyUseHTMLString: true,
                                    callback: action => {}
                                });
                            }
                            this.queueListLoading = false;
                        })
                        .catch(error => {
                            console.log(error);
                            this.queueListLoading = false;
                        });
                } else if (clickAction === "delete") {
                    const queueID = rowInfo.queueID;

                    this.$confirm(
                        this.$t("views.dashboard.admin.components.QueueTable.table.operations.delete.dialog.description"),
                        this.$t("views.dashboard.admin.components.QueueTable.table.operations.delete.dialog.title"),
                        {
                            type: "warning"
                        }
                    )
                        .then(_ => {
                            if (this.$config.isDemoServer) {
                                this.$message({
                                    type: "warning",
                                    message: this.$t("globals.demo_server.function_disabled")
                                });
                                return;
                            }
                            this.queueListLoading = true;

                            ApiDeleteDatasetQueueTask({ queueID: queueID })
                                .then(response => {
                                    this.queueListLoading = false;
                                    this.getDatasetQueueList();
                                    this.$message({
                                        type: "success",
                                        message: this.$t("globals.messages.success")
                                    });
                                })
                                .catch(error => {
                                    this.queueListLoading = false;
                                    console.log(error);
                                });
                        })
                        .catch(_ => {
                            this.$message({
                                type: "info",
                                message: this.$t("globals.messages.canceled")
                            });
                        });
                }
            } else if (clickAction === "info") {
                const queueID = rowInfo.queueID;
                if (this.canSelectQueue(rowInfo) === true) {
                    this.getDatasetResamplesList(queueID, rowInfo.status);
                } else {
                    this.$message({
                        message: this.$t("views.dashboard.admin.components.QueueTable.messages.in_progress"),
                        type: "warning"
                    });
                }
            }
        },
        statusFilter(status, type) {
            const statusMap = {
                0: { class: "success", value: this.$t("views.dashboard.admin.components.QueueTable.status_map.0") }, // User created
                1: { class: "info", value: this.$t("views.dashboard.admin.components.QueueTable.status_map.1") }, // User confirmed waiting to process
                2: { class: "warning", value: this.$t("views.dashboard.admin.components.QueueTable.status_map.2") }, // User canceled
                3: { class: "danger", value: this.$t("views.dashboard.admin.components.QueueTable.status_map.3") }, // Processing
                4: { class: "info", value: this.$t("views.dashboard.admin.components.QueueTable.status_map.4") },
                5: { class: "success", value: this.$t("views.dashboard.admin.components.QueueTable.status_map.5") }, // Finished
                6: { class: "danger", value: this.$t("views.dashboard.admin.components.QueueTable.status_map.6") }
            };
            return statusMap[status][type];
        },
        getDatasetQueueList() {
            // Display loading only for initial request
            if (this.queueListHash === "") {
                this.queueListLoading = true;
            }
            apiFetchQueueList(this.queueFilterQuery)
                .then(response => {
                    const queueData = response.data.message;
                    const queueListHash = md5String(JSON.stringify(queueData));
                    // Update elements only if needed to avoid DOM rendering
                    if (this.queueListHash !== queueListHash && response.data.success === true) {
                        this.queueListHash = queueListHash;

                        this.queueList = queueData.queueList;
                        this.queueTotalItems = queueData.queueTotalItems;
                    }
                    if (this.queueListLoading === true) {
                        this.queueListLoading = false;
                    }
                })
                .catch(error => {
                    console.log("==> Cannot get dashboard queue stats: " + error);
                });
        },
        getDatasetResamplesList(pqid, status) {
            if (status >= 3) {
                this.dialogQueueDetails = false;
                if (typeof this.resamplesList[pqid] !== "undefined") {
                    this.selectedQueueID = pqid;
                    this.dialogQueueDetails = true;
                } else {
                    ApiFetchQueueResamples({ pqid: pqid })
                        .then(response => {
                            if (response.data.success === true) {
                                this.selectedQueueID = pqid;
                                this.resamplesList[pqid] = response.data.data;
                                this.dialogQueueDetails = true;
                                // Toggle selection status of first row
                                this.$nextTick(() => {
                                    this.resamplesList[pqid].forEach((resampleRow, resampleIndex) => {
                                        if (resampleIndex === 0) {
                                            this.$refs.resamplesDetailsTable.toggleRowSelection(resampleRow);
                                        }
                                    });
                                });
                            } else {
                                this.$message({
                                    message: this.$t("globals.errors.request_general"),
                                    type: "error",
                                    duration: 5000,
                                    showClose: true
                                });
                                console.log(response.data);
                            }
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }
            } else {
                console.log(status);
            }
        },
        getDatasetResamplesModels(selection) {
            this.selectedResampleIDs = selection.map(selectionItem => {
                return selectionItem.resampleID;
            });

            const resamplesIDsHash = md5String(JSON.stringify(this.selectedResampleIDs));

            if (this.selectedResampleIDs.length !== 0) {
                this.modelsListLoading = true;
                ApiFetchResampleModels({ resampleIDs: this.selectedResampleIDs, measurements: [] })
                    .then(response => {
                        if (response.data.success === true) {
                            this.modelsList = response.data.data.modelsList;

                            // Save performance vars on first run
                            if (typeof this.performaceVariables[resamplesIDsHash] === "undefined") {
                                this.performaceVariables[resamplesIDsHash] = response.data.data.performaceVariables;
                            }
                            // Preselect if nothing selected.. eg. first run
                            if (this.selectedPerformace.length < 1) {
                                this.selectedPerformace = ["Accuracy"];
                            }
                        } else {
                            this.$message({
                                message: this.$t("globals.errors.request_general"),
                                type: "error",
                                duration: 5000,
                                showClose: true
                            });
                            console.log(response.data);
                        }
                        this.selectedResampleIDsHash = resamplesIDsHash;
                        this.modelsListLoading = false;
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } else {
                // Everything is deselected clear leftovers
                this.modelsList = [];
                this.performaceVariables = [];
                this.selectedPerformace = [];
                this.selectedResampleIDsHash = resamplesIDsHash;
            }
        },
        filterModelStatus(value, row) {
            return row.status === value;
        },
        canSelectQueue(row, index) {
            if (row.modelsSuccess < 1) {
                return false;
            } else {
                return true;
            }
        },
        selectQueue(selection, row) {
            // In-case "select all" check-box is pressed, row is than undefined
            if (typeof row === "undefined") {
                // Clear selection and remove any selected queue from store
                this.explorationJobId = "";
                this.$refs.queueTable.clearSelection();
                //if (selection.length > 0) {
                //    row = selection[0];
                //    this.$refs.queueTable.toggleRowSelection(row, true);
                //} else {
                //    return;
                //}
                return;
            }
            // If someone select multiple rows keep only last one
            if (selection.length > 1) {
                this.$refs.queueTable.clearSelection();
                row = selection.pop();
                this.$refs.queueTable.toggleRowSelection(row, true);
            }
            if (this.canSelectQueue(row) === false) {
                this.$refs.queueTable.clearSelection();
            }
            // Should in progress jobs be selected?
            if (row.status < 4) {
                // If there is no model processing time that means that no model has been processed
                // Allow selection only of jobs that have at least one model processed!
                if (row.modelsTotal < 1) {
                    this.$message({
                        message: this.$t("views.dashboard.admin.components.QueueTable.messages.in_progress"),
                        type: "warning"
                    });
                    return;
                }
            }
            // Job should have at least one model processed successfully
            if (row.modelsSuccess < 1) {
                this.$message({
                    message: this.$t("views.dashboard.admin.components.QueueTable.messages.missing_models"),
                    type: "warning"
                });
                return;
            }

            if (row.queueID !== this.explorationJobId) {
                // Select new queue
                this.explorationJobId = row.queueID;
                this.$refs.queueTable.setCurrentRow(row);
            } else {
                this.explorationJobId = "";
                this.$refs.queueTable.clearSelection();
            }
        },
        modelDetailsTableRowClassName({ row, rowIndex }) {
            if (row.status === 0) {
                return "warning-row";
            } else {
                return "success-row";
            }
        },
        handleFilter() {
            this.queueFilterQuery.page = 1;
            this.getDatasetQueueList();
        },
        handleSizeChange(val) {
            this.queueFilterQuery.limit = val;
            this.getDatasetQueueList();
        },
        handleCurrentChange(val) {
            this.queueFilterQuery.page = val;
            this.getDatasetQueueList();
        },
        handleDownload() {
            this.downloadLoading = true;
            import("@/vendor/Export2Excel").then(excel => {
                const tHeader = ["queueID", "created", "modelsSuccess", "modelsTotal", "queueExtraction", "queueProcessingTime", "resamplesTotal", "sparsity", "status"];
                const filterVal = ["queueID", "created", "modelsSuccess", "modelsTotal", "queueExtraction", "queueProcessingTime", "resamplesTotal", "sparsity", "status"];
                const data = this.formatJson(filterVal, this.queueList);
                excel.export_json_to_excel(tHeader, data, "table-list");
                this.downloadLoading = false;
            });
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v =>
                filterVal.map(j => {
                    if (j === "created") {
                        return parseTime(v[j]);
                    } else {
                        return v[j];
                    }
                })
            );
        }
    },
    watch: {
        explorationJobId: function(newVal, oldVal) {
            if (newVal === "") {
                this.$refs.queueTable.clearSelection();
            }
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.queue-list-container {
    .queue-list-container-table {
        .queue-name {
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }
    }
    .el-dialog__body {
        padding: 0 20px;
    }
}
.el-table .warning-row {
    background-color: rgba(53, 34, 74, 0.05);
}
.el-table .success-row {
    background-color: #ffffff;
}
/** Icons **/
.el-icon-success {
    color: #67c23a;
}
.el-icon-warning {
    color: #e3006e;
}
</style>
