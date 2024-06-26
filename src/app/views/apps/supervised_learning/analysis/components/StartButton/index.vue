<template>
    <div class="pandora-start-button">
        <el-row type="flex" align="middle">
            <el-col :offset="13" :span="11">
                <el-row type="flex" align="middle">
                    <el-col :span="24">
                        <el-button class="validate-analysis" size="large" type="primary" round icon="el-icon-caret-right" :disabled="isValidateDisabled == true" @click="validateJob">
                            Validate data
                        </el-button>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
        <!-- Confirm submission Alert Dialog -->
        <el-dialog
            :title="$t('views.apps.supervised_learning.analysis.components.StartButton.dialogs.confirm.title')"
            :visible.sync="submissionVisible"
            width="40%"
            :before-close="handleSubmissionCancle"
        >
            <div class="tip">
                <div style="float: left">{{ $t("views.apps.supervised_learning.analysis.components.StartButton.dialogs.confirm.header") }}:</div>
                <el-tooltip placement="top">
                    <div slot="content">
                        {{ $t("views.apps.supervised_learning.analysis.components.StartButton.dialogs.confirm.sparsity.description") }}
                    </div>
                    <div style="float: right">
                        {{ $t("views.apps.supervised_learning.analysis.components.StartButton.dialogs.confirm.sparsity.title") }}
                        <span style="font-weight: bold" v-if="!isNaN(datasetQueueSparsity)">{{ Math.round(datasetQueueSparsity * 100) }}%</span>
                        <span style="font-weight: bold" v-else>Not calculated</span>
                    </div>
                </el-tooltip>
                <br />
                <br />
                <el-tabs v-if="datasetResamples.length > 0" type="border-card">
                    <el-tab-pane
                        v-for="(item, index) in datasetResamples"
                        :label="item.outcome.original + ' (' + datasetResamples[index]['data'].length + ')'"
                        :key="index"
                        :name="String(index)"
                        :v-model="0"
                    >
                        <el-table
                            :data="datasetResamples[index]['data']"
                            :ref="'datasetResamplesTable_' + item.outcome.remapped"
                            height="250"
                            style="width: 100%"
                            row-key="id"
                            @select="selectResampleItem"
                            @selection-change="
                                (selection) => {
                                    resampleSelectionChange(selection, index, item.outcome.remapped);
                                }
                            "
                        >
                            <el-table-column type="selection"></el-table-column>
                            <el-table-column
                                property="totalFeatures"
                                :label="$t('views.apps.supervised_learning.analysis.components.StartButton.dialogs.confirm.table.features')"
                                sortable
                                align="center"
                            ></el-table-column>
                            <el-table-column
                                property="totalSamples"
                                :label="$t('views.apps.supervised_learning.analysis.components.StartButton.dialogs.confirm.table.samples')"
                                sortable
                                align="center"
                            ></el-table-column>
                            <el-table-column
                                property="totalDatapoints"
                                :label="$t('views.apps.supervised_learning.analysis.components.StartButton.dialogs.confirm.table.datapoints')"
                                sortable
                                align="center"
                            ></el-table-column>
                            <el-table-column align="center">
                                <template slot-scope="scope">
                                    <el-button
                                        type="primary"
                                        size="small"
                                        @click.native.prevent="downloadResampleDataset(scope.$index, index)"
                                        icon="el-icon-download"
                                        circle
                                    ></el-button>
                                    <el-popover
                                        placement="top-start"
                                        v-if="!scope.row.isValid"
                                        :title="$t('views.apps.supervised_learning.analysis.components.StartButton.dialogs.errors_resample.title')"
                                        width="200"
                                        style="margin-left: 5px"
                                        trigger="hover"
                                    >
                                        <div v-for="(message, messageIndex) in scope.row.message">
                                            {{ $t("views.apps.supervised_learning.analysis.components.StartButton.dialogs.errors_resample.messages." + message.msg_info) }} {{ message.data }}
                                        </div>
                                        <el-button slot="reference" type="danger" size="small" icon="el-icon-warning" circle></el-button>
                                    </el-popover>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane>
                </el-tabs>
                <br />
                <br />
                {{ $t("views.apps.supervised_learning.analysis.components.StartButton.dialogs.confirm.footer_1") }}
                <br />
                <br />
                {{ $t("views.apps.supervised_learning.analysis.components.StartButton.dialogs.confirm.footer_2") }}
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="info" size="medium" round icon="el-icon-caret-right" @click="handleSubmissionCancle">
                    {{ $t("views.apps.supervised_learning.analysis.components.StartButton.dialogs.confirm.buttons.cancel") }}
                </el-button>
                <el-button class="submit-analysis" size="medium" type="primary" round icon="el-icon-caret-right" :disabled="!processTaskVisible" @click="processTask">
                    {{ $t("views.apps.supervised_learning.analysis.components.StartButton.dialogs.confirm.buttons.process") }}
                </el-button>
            </span>
        </el-dialog>
        <!-- ERROR Alert Dialog -->
        <el-dialog
            :title="$t('views.apps.supervised_learning.analysis.components.StartButton.dialogs.errors.title')"
            :visible.sync="messageWarnings.length > 0"
            width="35%"
            :show-close="false"
            center
        >
            <el-alert v-for="(item, index) in messageWarnings" :title="item" :key="index" type="info" :closable="false" show-icon></el-alert>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" size="medium" @click="messageWarnings = []">{{ $t("views.apps.supervised_learning.analysis.components.StartButton.dialogs.errors.confirm") }}</el-button>
            </span>
        </el-dialog>
        <div class="progress-circle" v-if="progressBar.percentage > 0 || progressBar.status != ''">
            <el-progress type="circle" :percentage="progressBar.percentage" :width="256" :stroke-width="8" :status="progressBar.status"></el-progress>
        </div>
    </div>
</template>
<script>
import { sortAlphaNum } from "@/utils/helpers";
import {
    getSimonPreAnalysisDetails as ApiGetSimonPreAnalysisDetails,
    cancelDatasetQueueTask as ApiCancelDatasetQueueTask,
    genarateFileDownloadLink as ApiGenarateFileDownloadLink,
} from "@/api/backend";

import clipboard from "@/utils/clipboard";
import { findObjectIndexByKey } from "@/utils/helpers";
import { downloadItemsTemplate } from "@/utils/templates";

export default {
    name: "StartButton",
    data() {
        return {
            progressBar: {
                percentage: 0,
                status: "",
            },
            loadingInstance: null,
            loadingText: this.$t("globals.page_loading_slow"),

            submissionVisible: false,
            processTaskVisible: false,
            isValidateDisabled: false,
            messageWarnings: [],

            datasetResamples: [],
            datasetQueueID: 0,
            datasetQueueSparsity: false,

            submitJobForm: {
                selectedFiles: [],
                selectedFeatures: [],
                excludeFeatures: [],
                selectedOutcome: [],
                selectedPreProcess: [],
                selectedPartitionSplit: 75,
                modelProcessingTimeLimit: 5,
                selectedFormula: [],
                timeSeriesDate: [],
                selectedClasses: [],
                selectedPackages: [],
                extraction: false,
                backwardSelection: false,
            },
        };
    },
    mounted() {},
    computed: {
        /** Current Selected Features */
        selectedFeatures: {
            get() {
                return this.$store.getters.pandoraAnalysisSelectedFeatures;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedFeatures", value);
            },
        },
        /** Excluded Features */
        excludeFeatures: {
            get() {
                return this.$store.getters.pandoraAnalysisExcludeFeatures;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisExcludeFeatures", value);
            },
        },
        /** Current Selected Outcome */
        selectedOutcome: {
            get() {
                return this.$store.getters.pandoraAnalysisSelectedOutcome;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedOutcome", value);
            },
        },
        selectedClasses: {
            get() {
                return this.$store.getters.pandoraAnalysisSelectedClasses;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedClasses", value);
            },
        },
        selectedFormula: {
            get() {
                return this.$store.getters.pandoraAnalysisSelectedFormula;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedFormula", value);
            },
        },
        /* Regression analysis dependents */
        timeSeriesDate: {
            get() {
                return this.$store.getters.pandoraAnalysisTimeSeriesDate;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisTimeSeriesDate", value);
            },
        },
        selectedPreProcess: {
            get() {
                return this.$store.getters.pandoraAnalysisSelectedPreProcess;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedPreProcess", value);
            },
        },
        selectedPartitionSplit: {
            get() {
                return this.$store.getters.pandoraAnalysisSelectedPartitionSplit;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedPartitionSplit", value);
            },
        },
        /** Time limit in seconds before we terminate model building */
        modelProcessingTimeLimit: {
            get() {
                return this.$store.getters.pandoraAnalysisModelProcessingTimeLimit;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisModelProcessingTimeLimit", value);
            },
        },
        selectedFiles: {
            get() {
                return this.$store.getters.selectedFiles;
            },
            set(value) {
                this.$store.dispatch("setSelectedFiles", value);
            },
        },
        selectedFilesHash: {
            get() {
                return this.$store.getters.pandoraAnalysisSelectedFileHash;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedFileHash", value);
            },
        },
    },
    methods: {
        downloadResampleDataset(rowIndex, resampleIndex) {
            this.startLoading();
            const item = this.datasetResamples[resampleIndex]["data"][rowIndex];

            ApiGenarateFileDownloadLink({ downloadType: "resample", recordID: item.id })
                .then((response) => {
                    if (response.data.success === true && response.data.message.length > 0) {
                        this.$alert(downloadItemsTemplate(response.data.message), "Download links", {
                            dangerouslyUseHTMLString: true,
                            callback: (action) => {},
                        });
                    }
                    this.stopLoading();
                })
                .catch((error) => {
                    this.stopLoading();
                });
        },
        progressStatus(percentage, status = "") {
            this.progressBar.percentage = percentage;
            this.progressBar.status = status;
            if (status !== "") {
                setTimeout(() => {
                    this.progressBar = {
                        percentage: 0,
                        status: "",
                    };
                    if (status === "success") {
                        this.submissionVisible = true;
                        this.isValidateDisabled = true;
                    }
                }, 1500);
            }
        },
        startLoading() {
            this.loadingInstance = this.$loading({
                lock: true,
                text: this.loadingText,
                spinner: "el-icon-loading",
                fullscreen: true,
                customClass: "loading-api",
                background: "rgba(0, 0, 0, 0.7)",
            });
        },
        stopLoading() {
            this.loadingInstance.close();
        },
        /*
            quite - Should we display confirmation box or not
         */
        handleSubmissionCancle(quite = false) {
            console.log("handleSubmissionCancle:" + this.datasetQueueID);
            this.startLoading();
            if (quite === false) {
                this.$confirm(this.$t("views.apps.supervised_learning.analysis.components.StartButton.dialogs.cancel.message"))
                    .then((_) => {
                        this.cancelSubmission();
                    })
                    .catch((_) => {
                        this.stopLoading();
                    });
            } else {
                this.cancelSubmission();
            }
        },
        cancelSubmission() {
            this.submissionVisible = false;
            this.processTaskVisible = false;
            this.isValidateDisabled = false;

            ApiCancelDatasetQueueTask({ queueID: this.datasetQueueID })
                .then((response) => {
                    this.stopLoading();
                })
                .catch((error) => {
                    this.stopLoading();
                    console.log(error);
                });
        },
        processTask() {
            return new Promise((resolve, reject) => {
                this.loadingText = this.$t("views.apps.supervised_learning.analysis.components.StartButton.other.loading_data");
                this.startLoading();

                this.$store
                    .dispatch("addSimonJobAnalysis", { queueID: this.datasetQueueID, resamples: this.datasetResamples })
                    .then((status) => {
                        if (status === true) {
                            // Reset current JobID
                            this.$store.dispatch("setSimonAnalysisJobId", "");
                            this.submissionVisible = false;
                            this.processTaskVisible = false;
                            this.isValidateDisabled = false;
                            this.$router.push({
                                path: "/",
                            });
                            resolve(status);
                        } else {
                            reject(true);
                            console.log("Cannot submit Task to the server for analysis, status is false:");
                            console.log(status);
                        }

                        this.stopLoading();
                    })
                    .catch((error) => {
                        console.log("Cannot submit Task to the server for analysis");
                        console.log(error);
                        this.stopLoading();
                        reject(true);
                    });
            });
        },
        validateJob() {
            if (this.$config.isDemoServer) {
                this.$message({
                    type: "warning",
                    message: this.$t("globals.demo_server.function_disabled"),
                });
                return;
            }
            const message_warnings = [];
            // Check if Features are selected
            if (this.selectedFeatures.length === 0) {
                message_warnings.push(this.$t("views.apps.supervised_learning.analysis.components.StartButton.other.misssing_features"));
            }
            // Check if Packages are selected
            //      if this is a demo server and more than five packages are selected warn the user!
            if (this.$store.getters.pandoraSelectedPackages.length === 0) {
                message_warnings.push(this.$t("views.apps.supervised_learning.analysis.components.StartButton.other.misssing_packages"));
            }

            if (this.selectedOutcome.length === 0) {
                message_warnings.push(this.$t("views.apps.supervised_learning.analysis.components.StartButton.other.misssing_outcome"));
            }

            if (message_warnings.length > 0) {
                this.messageWarnings = message_warnings;
                return;
            }
            // Reset stat info
            this.samples = {
                naValues: 0,
                naValuesColumns: [],
                totalNaValues: 0,
                totalSamples: 0,
            };

            // Try to get number of usable samples from server
            this.submitJobForm = {
                selectedFiles: this.selectedFiles
                    .map(function (item) {
                        return item.id;
                    })
                    .sort(sortAlphaNum),
                selectedFilesHash: this.selectedFilesHash,
                selectedFeatures: this.selectedFeatures.sort(sortAlphaNum),
                excludeFeatures: this.excludeFeatures.sort(sortAlphaNum),
                selectedOutcome: this.selectedOutcome.sort(sortAlphaNum),

                selectedPreProcess: this.selectedPreProcess.sort(function (a, b) {
                    const sortingArr = [
                        "medianImpute",
                        "bagImpute",
                        "knnImpute",
                        "expoTrans",
                        "YeoJohnson",
                        "BoxCox",
                        "center",
                        "scale",
                        "range",
                        "ica",
                        "spatialSign",
                        "corr",
                        "zv",
                        "nzv",
                        "conditionalX",
                        "pca",
                    ];
                    return sortingArr.indexOf(a[1]) - sortingArr.indexOf(b[1]);
                }),

                selectedPartitionSplit: this.selectedPartitionSplit,
                modelProcessingTimeLimit: this.modelProcessingTimeLimit,
                selectedFormula: this.selectedFormula.sort(sortAlphaNum),
                timeSeriesDate: this.timeSeriesDate.sort(sortAlphaNum),
                selectedClasses: this.selectedClasses.sort(sortAlphaNum),
                selectedPackages: this.$store.getters.pandoraSelectedPackages
                    .map(function (item) {
                        return item.id;
                    })
                    .sort(sortAlphaNum),
                extraction: this.$store.getters.pandoraAnalysisFilterExtraction,
                backwardSelection: this.$store.getters.pandoraAnalysisBackwardSelection,
            };
            this.datasetResamples = [];
            this.datasetQueueID = 0;

            console.log("Start loading");

            this.startLoading();

            console.log("End loading");

            ApiGetSimonPreAnalysisDetails(this.submitJobForm)
                .then((response) => {
                    if (response.data.success === true) {
                        this.datasetResamples = response.data.details.dataset_queues;
                        this.datasetQueueID = response.data.details.queueID;

                        if (this.datasetResamples.length > 0) {
                            this.datasetQueueSparsity = response.data.details.sparsity;

                            this.submissionVisible = true;
                            this.isValidateDisabled = true;
                            // Automatically preselect valid re-samples
                            this.$nextTick(() => {
                                console.log("INFO: preSelectDatasetResamples");
                                this.preSelectDatasetResamples();
                            });
                        } else {
                            // TODO:
                            // Cancel task, delete Queue from database
                            this.handleSubmissionCancle(true);

                            const h = this.$createElement;
                            let messageInfo = this.$t("globals.errors.request_general") + "<br />";

                            response.data.details.message.forEach((msg, msgIndex) => {
                                if (msg.msg_info === "invalid_columns") {
                                    messageInfo = messageInfo + "<br />Invalid column values detected: " + msg.data;
                                }
                            });

                            this.$message({
                                dangerouslyUseHTMLString: true,
                                message: messageInfo,
                                type: "error",
                                duration: 10000,
                                showClose: true,
                            });
                        }
                    }

                    this.stopLoading();
                })
                .catch((error) => {
                    this.stopLoading();
                    this.$message({
                        message: this.$t("globals.errors.request_general"),
                        type: "warning",
                    });
                    console.log(error);
                    this.stopLoading();
                });
        },
        preSelectDatasetResamples() {
            // Loop all created tables and preselect all rows
            this.datasetResamples.forEach((queue, resampleIndex) => {
                const tableReference = "datasetResamplesTable_" + queue.outcome.remapped;
                console.log(tableReference);
                this.$refs[tableReference][0].toggleAllSelection();
            });
        },
        /**
         * Check if we can select specific resample when user clicks check-box next to it!
         * @param  {[type]} selection [description]
         * @param  {[type]} row       [description]
         * @return {[type]}           [description]
         */
        selectResampleItem(selection, row) {
            // In-case select all check-box is pressed, row is than undefined
            if (typeof row !== "undefined") {
                if (row.isValid === false) {
                    row.message.forEach((message, messageIndex) => {
                        this.$message({
                            message: this.$t("views.apps.supervised_learning.analysis.components.StartButton.dialogs.errors_resample.messages." + message.msg_info),
                            type: "warning",
                        });
                    });
                    return true;
                } else {
                    return false;
                }
            }
        },
        /**
         * On each selection change check if we need to adjust isSelected variable in datasetResamples and
         * enable/disable main task process button
         * @param  {[type]} selection Whole current selection of the complete table
         * @param  {[type]} index     [description]
         * @return {[type]}           [description]
         */
        resampleSelectionChange(selection, queueIndex, tableTab) {
            const tableReference = "datasetResamplesTable_" + tableTab;
            // Unselect following rows
            let unselectRows = [];
            // Total active selected rows
            let totalSelectedRows = 0;

            console.log("resampleSelectionChange: " + selection.length);

            // For each resample lets check if it selected in user side table
            selection.forEach((selectedRow, selectedRowIndex) => {
                let action = true;
                // Never mark row for processing if its not valid
                if (selectedRow.isValid === true) {
                    totalSelectedRows++;
                    action = true;
                } else {
                    action = false;
                }

                if (action === false) {
                    // If row is not valid always deselected them!
                    if (typeof unselectRows[selectedRow.id] === "undefined") {
                        unselectRows.push(selectedRow);
                    }
                }
            });

            for (let indexResamples = 0; indexResamples < this.datasetResamples[queueIndex].data.length; indexResamples++) {
                for (let indexUnselect = 0; indexUnselect < unselectRows.length; indexUnselect++) {
                    if (unselectRows[indexUnselect].id === this.datasetResamples[queueIndex].data[indexResamples].id) {
                        console.log("unselecting resample: " + unselectRows[indexUnselect].id);
                        // Toggle HTML table
                        this.$refs[tableReference][0].toggleRowSelection(unselectRows[indexUnselect], false);
                        // Toggle isSelected marker
                        this.datasetResamples[queueIndex].data[indexResamples].isSelected = false;
                        continue;
                    }
                }
                let selectedIndex = findObjectIndexByKey(selection, "id", this.datasetResamples[queueIndex].data[indexResamples].id);
                if (selectedIndex === -1) {
                    this.datasetResamples[queueIndex].data[indexResamples].isSelected = false;
                } else if (this.datasetResamples[queueIndex].data[indexResamples].isSelected !== true) {
                    this.datasetResamples[queueIndex].data[indexResamples].isSelected = true;
                }
            }

            console.log("Found " + totalSelectedRows + " selected resamples!");
            // Enable final Process button if there are some resamples selected
            if (totalSelectedRows > 0) {
                this.processTaskVisible = true;
            } else {
                this.processTaskVisible = false;
            }
        },
        copyToClipboard(content, event) {
            clipboard(content, event);
        },
    },
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~scss_vars";

.pandora-start-button {
    margin-top: 20px;

    .validate-analysis {
        float: right;
    }

    .progress-circle {
        position: fixed;
        width: 100%;
        height: 100%;
        display: block;
        top: 0;
        left: 0;
        z-index: 100;
        background-color: rgba(255, 255, 255, 0.5);

        .el-progress {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
    }
}
</style>
