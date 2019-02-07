<template>
    <div class="simon-start-button">
        <el-row type="flex" align="middle">
            <el-col :offset="13" :span="11">
                <el-row type="flex" align="middle">
                    <el-col :span="24">
                        <el-button
                            class="validate-analysis"
                            type="primary"
                            size="medium"
                            round
                            icon="el-icon-caret-right"
                            :disabled="isValidateDisabled == true"
                            @click="validateJob"
                            >Validate data</el-button
                        >
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
        <!-- Confirm submission Alert Dialog -->
        <el-dialog title="Looks good! Please confirm task submission" :visible.sync="submissionVisible" width="40%" :before-close="handleSubmissionCancle">
            <div class="tip">
                <div style="float: left;">>Based on your current selection what we got following dataset(s):</div>

                <el-tooltip placement="top">
                    <div slot="content">This number tell you how many missing values occur across your dataset.</div>
                    <div style="float: right;">
                        Data sparsity <span>{{ datasetQueueSparsity * 100 }}%</span>
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
                            @selection-change="
                                selection => {
                                    resampleSelectionChange(selection, index);
                                }
                            "
                        >
                            <el-table-column type="selection"> </el-table-column>

                            <el-table-column property="totalFeatures" label="Features" sortable align="center"> </el-table-column>

                            <el-table-column property="totalSamples" label="Samples" sortable align="center"> </el-table-column>

                            <el-table-column property="totalDatapoints" label="Datapoints" align="center"> </el-table-column>

                            <el-table-column align="center">
                                <template slot-scope="scope">
                                    <el-button
                                        type="primary"
                                        size="mini"
                                        @click.native.prevent="downloadResampleDataset(scope.$index, index)"
                                        icon="el-icon-download"
                                        circle
                                    ></el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane>
                </el-tabs>
                <br />
                <br />Now this data will be submitted for processing. You can track the progress of this task in your Dashboard panel. <br />
                <br />Do you wish to proceed?
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="info" size="medium" round icon="el-icon-caret-right" @click="handleSubmissionCancle">Cancel</el-button>
                <el-button class="submit-analysis" type="primary" size="medium" round icon="el-icon-caret-right" :disabled="!processTaskVisible" @click="processTask"
                    >Process</el-button
                >
            </span>
        </el-dialog>
        <!-- ERROR Alert Dialog -->
        <el-dialog title="Following errors needs to be corrected" :visible.sync="messageWarnings.length > 0" width="35%" :show-close="false" center>
            <div class="tip">
                <p>
                    <el-alert v-for="(item, index) in messageWarnings" :title="item" :key="index" type="error" :closable="false" show-icon></el-alert>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="danger" @click="messageWarnings = []">Confirm</el-button>
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
    genarateFileDownloadLink as ApiGenarateFileDownloadLink
} from "@/api/backend";

import clipboard from "@/utils/clipboard";
import { findObjectIndexByKey } from "@/utils/helpers";
import { downloadFileTemplate, downloadItemsTemplate } from "@/utils/templates.js";

export default {
    name: "StartButton",
    data() {
        return {
            progressBar: {
                percentage: 0,
                status: ""
            },
            loadingInstance: null,
            loadingText: "please wait...",

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
                selectedFormula: [],
                selectedClasses: [],
                selectedPackages: [],
                extraction: false,
                backwardSelection: false
            }
        };
    },
    mounted() {},
    computed: {
        /** Current Selected Features */
        selectedFeatures: {
            get() {
                return this.$store.getters.simonAnalysisSelectedFeatures;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedFeatures", value);
            }
        },
        /** Excluded Features */
        excludeFeatures: {
            get() {
                return this.$store.getters.simonAnalysisExcludeFeatures;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisExcludeFeatures", value);
            }
        },
        /** Current Selected Outcome */
        selectedOutcome: {
            get() {
                return this.$store.getters.simonAnalysisSelectedOutcome;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedOutcome", value);
            }
        },
        selectedClasses: {
            get() {
                return this.$store.getters.simonAnalysisSelectedClasses;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedClasses", value);
            }
        },
        selectedFormula: {
            get() {
                return this.$store.getters.simonAnalysisSelectedFormula;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedFormula", value);
            }
        },
        selectedPreProcess: {
            get() {
                return this.$store.getters.simonAnalysisSelectedPreProcess;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedPreProcess", value);
            }
        },
        selectedPartitionSplit: {
            get() {
                return this.$store.getters.simonAnalysisSelectedPartitionSplit;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedPartitionSplit", value);
            }
        },
        selectedFiles: {
            get() {
                return this.$store.getters.selectedFiles;
            },
            set(value) {
                this.$store.dispatch("setSelectedFiles", value);
            }
        },
        selectedFilesHash: {
            get() {
                return this.$store.getters.simonAnalysisSelectedFileHash;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedFileHash", value);
            }
        }
    },
    methods: {
        downloadResampleDataset(rowIndex, resampleIndex) {
            this.startLoading();
            const item = this.datasetResamples[resampleIndex]["data"][rowIndex];

            const downloadWindow = window.open("", "_blank");
            downloadWindow.document.write(downloadFileTemplate());

            ApiGenarateFileDownloadLink({ downloadType: "resample", recordID: item.id })
                .then(response => {
                    if (response.data.success === true && response.data.message.length > 0) {
                        downloadWindow.document.getElementById("download_links").innerHTML = downloadItemsTemplate(response.data.message);
                    } else {
                        downloadWindow.close();
                    }
                    this.stopLoading();
                })
                .catch(error => {
                    this.stopLoading();
                    downloadWindow.close();
                });
        },
        resampleSelectionChange(selection, index) {
            this.datasetResamples[index].data.forEach((row, rowIndex) => {
                let selected = false;
                selection.forEach((selectedRow, selectedRowIndex) => {
                    if (selectedRow.id === row.id) {
                        selected = true;
                    }
                });
                this.datasetResamples[index].data[rowIndex].selected = selected;
            });

            const resampleIndex = findObjectIndexByKey(this.datasetResamples[index].data, "selected", true);
            if (resampleIndex !== -1) {
                this.processTaskVisible = true;
            } else {
                this.processTaskVisible = false;
            }
        },
        progressStatus(percentage, status = "") {
            this.progressBar.percentage = percentage;
            this.progressBar.status = status;
            if (status !== "") {
                setTimeout(() => {
                    this.progressBar = {
                        percentage: 0,
                        status: ""
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
                background: "rgba(0, 0, 0, 0.7)"
            });
        },
        stopLoading() {
            this.loadingInstance.close();
        },
        handleSubmissionCancle(event) {
            this.startLoading();

            this.$confirm(this.$t("views.simon.messages.confirm_close"))
                .then(_ => {
                    this.submissionVisible = false;
                    this.processTaskVisible = false;
                    this.isValidateDisabled = false;

                    ApiCancelDatasetQueueTask({ queueID: this.datasetQueueID })
                        .then(response => {
                            this.stopLoading();
                        })
                        .catch(error => {
                            this.stopLoading();
                            console.log(error);
                        });
                })
                .catch(_ => {
                    this.stopLoading();
                });
        },
        processTask() {
            return new Promise((resolve, reject) => {
                this.loadingText = this.$t("views.simon.messages.loading_data");
                this.startLoading();

                this.$store
                    .dispatch("addSimonJobAnalysis", { queueID: this.datasetQueueID, resamples: this.datasetResamples })
                    .then(status => {
                        if (status === true) {
                            // Reset current JobID
                            this.$store.dispatch("setSimonAnalysisJobId", "");
                            this.submissionVisible = false;
                            this.processTaskVisible = false;
                            this.isValidateDisabled = false;
                            this.$router.push({
                                path: "/"
                            });
                            resolve(status);
                        } else {
                            reject(true);
                            console.log("Cannot submit Task to the server for analysis, status is false:");
                            console.log(status);
                        }

                        this.stopLoading();
                    })
                    .catch(error => {
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
                    message: "This function is disabled on demo server"
                });
                return;
            }
            const message_warnings = [];
            // Check if Features are selected
            if (this.selectedFeatures.length === 0) {
                message_warnings.push(this.$t("views.simon.messages.misssing_features"));
            }
            // Check if Packages are selected
            //      if this is a demo server and more than five packages are selected warn the user!
            if (this.$store.getters.simonSelectedPackages.length === 0) {
                message_warnings.push(this.$t("views.simon.messages.misssing_packages"));
            }

            if (this.selectedOutcome.length === 0) {
                message_warnings.push(this.$t("views.simon.messages.misssing_outcome"));
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
                totalSamples: 0
            };

            // Try to get number of usable samples from server
            this.submitJobForm = {
                selectedFiles: this.selectedFiles
                    .map(function(item) {
                        return item.id;
                    })
                    .sort(sortAlphaNum),
                selectedFilesHash: this.selectedFilesHash,
                selectedFeatures: this.selectedFeatures.sort(sortAlphaNum),
                excludeFeatures: this.excludeFeatures.sort(sortAlphaNum),
                selectedOutcome: this.selectedOutcome.sort(sortAlphaNum),
                selectedPreProcess: this.selectedPreProcess.sort(sortAlphaNum),
                selectedPartitionSplit: this.selectedPartitionSplit,
                selectedFormula: this.selectedFormula.sort(sortAlphaNum),
                selectedClasses: this.selectedClasses.sort(sortAlphaNum),
                selectedPackages: this.$store.getters.simonSelectedPackages
                    .map(function(item) {
                        return item.id;
                    })
                    .sort(sortAlphaNum),
                extraction: this.$store.getters.simonAnalysisFilterExtraction,
                backwardSelection: this.$store.getters.simonAnalysisBackwardSelection
            };
            this.datasetResamples = [];
            this.datasetQueueID = 0;

            this.startLoading();

            ApiGetSimonPreAnalysisDetails(this.submitJobForm)
                .then(response => {
                    if (response.data.success === true) {
                        this.datasetResamples = response.data.message.resamples;
                        this.datasetQueueID = response.data.message.queueID;

                        this.datasetQueueSparsity = response.data.message.sparsity * 100;

                        this.submissionVisible = true;
                        this.isValidateDisabled = true;

                        this.preSelectDatasetResamples();
                    }

                    this.stopLoading();
                })
                .catch(error => {
                    this.stopLoading();
                    this.$message({
                        message: "There was an error processing your request",
                        type: "warning"
                    });
                    console.log(error);
                });
        },
        preSelectDatasetResamples() {
            this.$nextTick(() => {
                // Loop all created tables and preselect all rows
                this.datasetResamples.forEach((resample, resampleIndex) => {
                    const tableReference = "datasetResamplesTable_" + resample.outcome.remapped;
                    if (resample.data.length > 0) {
                        this.processTaskVisible = true;
                    }
                    resample.data.forEach((row, rowIndex) => {
                        if (typeof this.$refs[tableReference][0] !== "undefined") {
                            this.$refs[tableReference][0].toggleRowSelection(row, true);
                        }
                    });
                });
            });
        },
        copyToClipboard(content, event) {
            clipboard(content, event);
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~scss_vars";
.simon-start-button {
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
