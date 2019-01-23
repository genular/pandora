<template>
    <div
        class="calendar-list-container"
        v-loading="queueListLoading"
        :element-loading-text="$t('views.dashboard.jobs.loading_title')"
    >
        <div class="filter-container">
            <el-input
                @keyup.enter.native="handleFilter"
                style="width: 300px;"
                class="filter-item"
                :placeholder="$t('views.dashboard.jobs.search.fields.job_id')"
                v-model="queueFilterQuery.queueID"
            >
            </el-input>
            <el-select @change="handleFilter" style="width: 140px" class="filter-item" v-model="queueFilterQuery.sort">
                <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key">
                </el-option>
            </el-select>
            <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{
                $t("views.dashboard.jobs.search.buttons.search")
            }}</el-button>
            <el-button
                class="filter-item"
                type="primary"
                :loading="downloadLoading"
                v-waves
                icon="el-icon-download"
                @click="handleDownload"
                >{{ $t("views.dashboard.jobs.search.buttons.export") }}</el-button
            >
        </div>
        <el-table
            :data="queueList"
            ref="queueTable"
            empty-text="Looks like you did not submit any tasks. Please go to workspace upload and chhose file and create a new analasys task!"
            @select-all="selectJobID"
            @select="selectJobID"
            row-key="queueID"
            stripe
            border
            fit
            style="width: 100%"
        >
            <el-table-column type="selection" reserve-selection width="40" fixed> </el-table-column>

            <el-table-column align="center" :label="$t('views.dashboard.jobs.table.header.id')" width="65">
                <template slot-scope="scope">
                    <span>{{ scope.row.queueID }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('views.dashboard.jobs.table.header.submitted')">
                <template slot-scope="scope">
                    <span>{{ scope.row.submitted | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" :label="$t('views.dashboard.jobs.table.header.processing_time')">
                <template slot-scope="scope">
                    <span v-if="scope.row.queueProcessingTime || scope.row.updated">{{
                        formatProcessingTime(scope.row.queueProcessingTime) | millisecondsToStr
                    }}</span>
                    <span v-else>N/A</span>
                </template>
            </el-table-column>
            <el-table-column
                align="center"
                class-name="status-col"
                :label="$t('views.dashboard.jobs.table.header.status')"
                width="175"
            >
                <template slot-scope="scope">
                    <el-tag :type="statusFilter(scope.row.status, 'class')">{{
                        statusFilter(scope.row.status, "value")
                    }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column align="center" label="Extraction">
                <template slot-scope="scope">
                    <span v-if="scope.row.queueExtraction < 1">No</span> <span v-else>Yes</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="Sparsity (%)">
                <template slot-scope="scope">
                    <span>{{ scope.row.sparsity * 100 }}%</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="Resamples">
                <template slot-scope="scope">
                    <span>{{ scope.row.resamplesTotal }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="Models Processed">
                <template slot-scope="scope">
                    <span>{{ scope.row.modelsTotal }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="Sucesfull">
                <template slot-scope="scope">
                    <span>{{ scope.row.modelsSuccess }}</span>
                </template>
            </el-table-column>
            <el-table-column class-name="settings" fixed="right" label="Operations" width="180">
                <template slot-scope="scope">
                    <el-button
                        size="mini"
                        type="success"
                        round
                        icon="el-icon-info"
                        @click="handleOperations('info', scope.row)"
                    ></el-button>
                    <el-button
                        size="mini"
                        type="primary"
                        plain
                        icon="el-icon-download"
                        @click="handleOperations('download', scope.row)"
                    ></el-button>
                    <el-button
                        size="mini"
                        type="danger"
                        plain
                        icon="el-icon-delete"
                        @click="handleOperations('delete', scope.row)"
                    ></el-button>
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
        <el-dialog title="Reading statistics" :visible.sync="dialogQueueDetails" width="75%">
            <span slot="title">
                <el-row type="flex" align="top">
                    <el-col :span="12"> <span>Reading statistics</span> </el-col>
                    <el-col :span="12" style="text-align: right;" v-if="performaceVariables[selectedResamplesID]">
                        <el-select
                            style="padding-right: 25px;width: 100%;"
                            v-model="selectedPerformace"
                            multiple
                            filterable
                            size="small"
                            placeholder="Select performace measurement"
                        >
                            <el-option
                                v-for="item in performaceVariables[selectedResamplesID]"
                                :key="item"
                                :label="item"
                                :value="item"
                            >
                            </el-option>
                        </el-select>
                    </el-col>
                </el-row>
            </span>
            <!-- Feature Sets data -->
            <el-row type="flex" align="top">
                <el-col :span="24">
                    <el-table
                        ref="resamplesDetailsTable"
                        :data="resamplesList[selectedQueueID]"
                        empty-text="Nothing to display"
                        @row-click="getDatasetResamplesModels"
                        highlight-current-row
                        style="width: 100%"
                        height="250"
                    >
                        <el-table-column align="center" label="Resample ID">
                            <template slot-scope="scope">
                                <span>{{ scope.row.resampleID }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            fixed
                            align="center"
                            :label="$t('views.dashboard.jobs.table.modal_info.feature_sets.source')"
                            width="75"
                        >
                            <template slot-scope="scope">
                                <div v-if="(scope.row.dataSource = 1)">
                                    <el-tooltip class="item" effect="dark" placement="top-start">
                                        <div slot="content">
                                            {{ $t("views.dashboard.jobs.table.modal_info.feature_sets.initial") }}
                                        </div>
                                        <span class="el-icon-more"></span>
                                    </el-tooltip>
                                </div>
                                <div v-else>
                                    <el-tooltip class="item" effect="dark" placement="top-start">
                                        <div slot="content">
                                            {{ $t("views.dashboard.jobs.table.modal_info.feature_sets.predicted") }}
                                        </div>
                                        <span class="el-icon-more-outline"></span>
                                    </el-tooltip>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            prop="samplesTotal"
                            sortable
                            :label="$t('views.dashboard.jobs.table.modal_info.feature_sets.samples')"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTotal">{{ scope.row.samplesTotal }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            prop="featuresTotal"
                            sortable
                            :label="$t('views.dashboard.jobs.table.modal_info.feature_sets.features')"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.featuresTotal">{{ scope.row.featuresTotal }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            prop="samplesTraining"
                            sortable
                            :label="$t('views.dashboard.jobs.table.modal_info.feature_sets.samples_training')"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTraining">{{ scope.row.samplesTraining }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            prop="samplesTesting"
                            sortable
                            :label="$t('views.dashboard.jobs.table.modal_info.feature_sets.samples_testing')"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.samplesTesting">{{ scope.row.samplesTesting }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" label="Models Processed">
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
                                deepSort({ column, prop, order }, 'modelsList', 'selectedResamplesID', null, null);
                            }
                        "
                        :data="modelsList[selectedResamplesID]"
                        empty-text="Nothing to display"
                        :row-class-name="modelDetailsTableRowClassName"
                        style="width: 100%"
                        height="300"
                    >
                        <el-table-column fixed align="center" width="50">
                            <template slot-scope="scope">
                                <div v-if="scope.row.status > 0"><span class="el-icon-success"></span></div>
                                <div v-else>
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
                            </template>
                        </el-table-column>
                        <el-table-column align="center" label="Model ID">
                            <template slot-scope="scope">
                                <span>{{ scope.row.modelID }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="left"
                            prop="modelName"
                            sortable
                            :label="$t('views.dashboard.jobs.table.modal_info.methods.method')"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.modelName">{{ scope.row.modelName }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            align="center"
                            prop="trainingTime"
                            sortable
                            :label="$t('views.dashboard.jobs.table.modal_info.methods.time')"
                        >
                            <template slot-scope="scope">
                                <span v-if="scope.row.trainingTime">{{
                                    (scope.row.trainingTime * 1000) | millisecondsToStr
                                }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            v-for="(performanceItem, performanceIndex) in selectedPerformace"
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
                    </el-table>
                </el-col>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogQueueDetails = false">{{
                    $t("views.dashboard.jobs.table.modal_info.buttons.close")
                }}</el-button>
            </span>
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
import { parseTime, md5String } from "@/utils";
import { sortAlphaNum } from "@/utils/helpers.js";

import { downloadFileTemplate } from "@/utils/templates.js";

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
            selectedResamplesID: 0,
            modelsList: [],
            modelsListLoading: false,
            performaceVariables: [],
            selectedPerformace: [],

            interval: null,
            queueTotalItems: null,
            queueFilterQuery: {
                page: 1,
                limit: 20,
                queueID: undefined,
                sort: "+"
            },
            sortOptions: [
                {
                    label: this.$t("views.dashboard.jobs.search.fields.sort.id_asc"),
                    key: "+"
                },
                {
                    label: this.$t("views.dashboard.jobs.search.fields.sort.id_desc"),
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
            this.getDatasetQueueList();
        }
        this.interval = setInterval(
            function() {
                this.getDatasetQueueList();
            }.bind(this),
            120000
        );
    },
    beforeDestroy: function() {
        clearInterval(this.interval);
    },
    methods: {
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
                    const fileID = rowInfo.fileID;

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
                    const queueID = rowInfo.queueID;
                    this.$confirm(
                        "This will permanently delete everything on the system related to selected queue. Continue?",
                        "Warning",
                        {
                            type: "warning"
                        }
                    )
                        .then(_ => {
                            ApiDeleteDatasetQueueTask({ queueID: queueID })
                                .then(response => {
                                    this.queueListLoading = false;
                                    if (response.data.success === true) {
                                        this.getDatasetQueueList();
                                    }
                                    this.$message({
                                        type: "success",
                                        message: "Successfully deleted!"
                                    });
                                })
                                .catch(error => {
                                    this.queueListLoading = false;
                                    console.log(error);
                                });
                        })
                        .catch(_ => {
                            this.queueListLoading = false;
                            this.$message({
                                type: "info",
                                message: "Delete error, canceled!"
                            });
                        });
                }
            } else if (clickAction === "info") {
                const queueID = rowInfo.queueID;
                if (this.checkselectJobID(rowInfo) === true) {
                    this.getDatasetResamplesList(queueID, rowInfo.status);
                } else {
                    this.$message({
                        message: "You cannot view detail information for this submission",
                        type: "warning"
                    });
                }
            }
        },
        formatProcessingTime(row) {
            let time = 0;

            const currentTime = +new Date();
            const createdTime = Date.parse(row.updated);

            if (row.status < 3) {
                time = currentTime - createdTime;
            } else if (row.status > 3) {
                time = row.queueProcessingTime;
            } else {
                time = currentTime - createdTime;
            }

            return time;
        },
        statusFilter(status, type) {
            const statusMap = {
                0: { class: "success", value: "Created" },
                1: { class: "success", value: "Confirmed" },
                2: { class: "info", value: "Canceled" },
                3: { class: "info", value: "Processing" },
                4: { class: "info", value: "Processing" },
                5: { class: "success", value: "Completed" },
                6: { class: "danger", value: "Some errors" }
            };
            return statusMap[status][type];
        },
        getDatasetQueueList() {
            this.queueListLoading = true;
            apiFetchQueueList(this.queueFilterQuery)
                .then(response => {
                    const queueListHash = md5String(JSON.stringify(response.data.data));
                    // Update elements only if needed to avoid DOM rendering
                    if (this.queueListHash !== queueListHash && typeof response.data.data !== "undefined") {
                        this.queueList = response.data.data;
                        this.queueListHash = queueListHash;
                        this.queueTotalItems = response.data.totalItems;
                    }

                    this.queueListLoading = false;
                })
                .catch(error => {
                    console.log(error);
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
                            } else {
                                this.$message({
                                    message:
                                        "Cannot fetch Job details from the back-end server. Please try again latter or choose another Job!",
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
        getDatasetResamplesModels(row, event, column) {
            console.log("Resamples change: " + row.resampleID + " " + this.selectedResamplesID);
            if (row.resampleID !== this.selectedResamplesID && row.modelsTotal > 0) {
                this.modelsListLoading = true;
                ApiFetchResampleModels({ drid: row.resampleID, measurements: this.selectedPerformace })
                    .then(response => {
                        if (response.data.success === true) {
                            this.selectedResamplesID = row.resampleID;
                            this.modelsList[row.resampleID] = response.data.data.modelsList;
                            this.performaceVariables[row.resampleID] = response.data.data.performaceVariables;

                            // Preselect if nothing selected.. eg. first run
                            if (this.selectedPerformace.length < 1) {
                                this.selectedPerformace = ["Accuracy"];
                            }
                        } else {
                            this.$message({
                                message:
                                    "Cannot fetch Job details from the back-end server. Please try again latter or choose another Job!",
                                type: "error",
                                duration: 5000,
                                showClose: true
                            });
                            console.log(response.data);
                        }
                        this.modelsListLoading = false;
                    })
                    .catch(error => {
                        console.log(error);
                    });
                this.$refs.resamplesDetailsTable.setCurrentRow(row);
            } else {
                this.selectedResamplesID = 0;
                this.$refs.resamplesDetailsTable.setCurrentRow();
            }
        },
        checkselectJobID(row, index) {
            if (row.modelsTotal < 1 || row.modelsSuccess < 1 || row.status < 4) {
                return false;
            } else {
                return true;
            }
        },
        selectJobID(selection, row) {
            // In-case select all check-box is pressed, row is than undefined
            if (typeof row === "undefined") {
                this.$refs.queueTable.clearSelection();
                if (selection.length > 0) {
                    row = selection[0];
                    this.$refs.queueTable.toggleRowSelection(row, true);
                } else {
                    return;
                }
            }
            // If someone select multiple rows keep only last one
            if (selection.length > 1) {
                this.$refs.queueTable.clearSelection();
                row = selection.pop();
                this.$refs.queueTable.toggleRowSelection(row, true);
            }
            if (this.checkselectJobID(row) === false) {
                this.$refs.queueTable.clearSelection();
            }
            // Should in progress jobs be selected?
            if (row.status < 4) {
                // If there is no model processing time that means that no model has been processed
                // Allow selection only of jobs that have at least one model processed!
                if (row.modelsTotal < 1) {
                    this.$message({
                        message: this.$t("views.dashboard.jobs.table.messages.in_progress"),
                        type: "warning"
                    });
                    return;
                }
            }
            // Job should have at least one model processed successfully
            if (row.modelsSuccess < 1) {
                this.$message({
                    message: this.$t("views.dashboard.jobs.table.messages.missing_models"),
                    type: "warning"
                });
                return;
            }

            if (row.queueID !== this.explorationJobId) {
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
                const tHeader = [
                    "queueID",
                    "created",
                    "modelsSuccess",
                    "modelsTotal",
                    "queueExtraction",
                    "queueProcessingTime",
                    "resamplesTotal",
                    "sparsity",
                    "status"
                ];
                const filterVal = [
                    "queueID",
                    "created",
                    "modelsSuccess",
                    "modelsTotal",
                    "queueExtraction",
                    "queueProcessingTime",
                    "resamplesTotal",
                    "sparsity",
                    "status"
                ];
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
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~scss_vars";
.job_selectable {
    cursor: copy;
}
.job_not_selectable {
    cursor: not-allowed;
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
