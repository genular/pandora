<template>
    <div class="samrAnalysisTab-container">
        <div v-if="!isTabDisabled">
            <el-row type="flex" align="top" :gutter="20">
                <el-col :span="7" v-loading="loadingOptions" element-loading-text="Processing">
                    <el-form ref="settingsForm" :model="settingsForm" class="samr_form" size="large" label-width="200px">
                        <el-form-item label="Delta">
                            <el-slider
                                v-model="settingsForm.deltaInput.value"
                                :min="settingOptions.deltaInput.min"
                                :max="settingOptions.deltaInput.max"
                                :step="settingOptions.deltaInput.step"
                                show-input
                            >
                            </el-slider>
                        </el-form-item>
                        <el-form-item label="Response">
                            <el-select v-model="settingsForm.responseType_array" placeholder="Select">
                                <el-option v-for="(item, index) in settingOptions.responseType_array" :key="index" :label="item.title" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Analysis Type">
                            <el-select v-model="settingsForm.testStatistic" placeholder="Select">
                                <el-option v-for="(item, index) in settingOptions.testStatistic" :key="index" :label="item.title" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Median center the arrays">
                            <el-select v-model="settingsForm.centerArrays" placeholder="Select">
                                <el-option v-for="(item, index) in settingOptions.centerArrays" :key="index" :label="item.title" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="analysisType">
                            <el-select v-model="settingsForm.analysisType" placeholder="Select">
                                <el-option v-for="(item, index) in settingOptions.analysisType" :key="index" :label="item.title" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="timeSummaryType">
                            <el-select v-model="settingsForm.timeSummaryType" placeholder="Select">
                                <el-option v-for="(item, index) in settingOptions.timeSummaryType" :key="index" :label="item.title" :value="item.value"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="K-Nearest Neighbors">
                            <el-slider
                                v-model="settingsForm.numberOfNeighbors.value"
                                :min="settingOptions.numberOfNeighbors.min"
                                :max="settingOptions.numberOfNeighbors.max"
                                :step="settingOptions.numberOfNeighbors.step"
                                show-input
                            >
                            </el-slider>
                        </el-form-item>
                        <el-form-item label="Number of Permutations">
                            <el-input-number
                                v-model="settingsForm.nperms.value"
                                :step="settingOptions.nperms.step"
                                :max="settingOptions.nperms.max"
                                :min="settingOptions.nperms.min"
                            >
                            </el-input-number>
                        </el-form-item>
                        <el-form-item label="Random Seed">
                            <el-input-number v-model="settingsForm.random_seed" :min="1" :max="10000"> </el-input-number>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" :loading="loadingResults" round @click="recalculateSAM">Calculate</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="17" v-loading="loadingResults" element-loading-text="Processing">
                    <el-row>
                        <el-col :span="24" style="text-align: center;">
                            <!--
                                    c("Row", "Gene ID", "Gene Name", "Score(d)", "Numerator(r)", "Denominator(s+s0)", "Fold Change", "q-value(%)", "status")
                                    c("row", "gene_id", "gene_name", "score", "numerator", "denominator", "fold_change", "q_value", "status")
                                -->
                            <el-table
                                :data="resultsData.sig_table"
                                :default-sort="{ prop: 'score', order: 'descending' }"
                                border
                                empty-text="No data avaliable. Please ajdust your parametars."
                                style="float: right;"
                            >
                                <el-table-column prop="gene_name" label="Name" sortable> </el-table-column>
                                <el-table-column prop="score" label="Score" sortable> </el-table-column>
                                <el-table-column prop="fold_change" label="Fold Change" sortable> </el-table-column>
                                <el-table-column prop="q_value" label="Q-Value" sortable> </el-table-column>
                                <el-table-column prop="status" label="Status" sortable> </el-table-column>
                            </el-table>
                        </el-col>
                    </el-row>
                    <el-row v-if="resultsData.request">
                        <el-col :span="24" style="margin-top: 10px;">
                            <div>Input parameters:</div>
                            <pre class="code-output">
                                    <div class="highlight_code">
                                        {{resultsData.request}}
                                    </div>
                                </pre>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </div>
        <!-- ELSE if Tab is DISABLED -->
        <div v-else>
            <el-alert title="Notification" description="Unfortionatly this function is currently disabled" type="warning" style="margin-top: 20px;" show-icon :closable="false">
            </el-alert>
        </div>
    </div>
</template>
<script>
import { fetchSamrFormOptions, submitSAMJob } from "@/api/analysis";

export default {
    name: "samrAnalysisTab",
    props: {
        columnName: {
            type: String,
            default: ""
        },
        isTabDisabled: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            settingOptions: {
                deltaInput: {
                    value: 0.01,
                    min: 0.01,
                    max: 10,
                    step: 0.01
                },
                responseType_array: [],
                testStatistic: [],
                centerArrays: [],
                analysisType: [],
                timeSummaryType: [],
                numberOfNeighbors: {
                    value: 10,
                    min: 1,
                    max: 50,
                    step: 1
                },
                nperms: {
                    value: 100,
                    min: 25,
                    max: 5000,
                    step: 5
                },
                random_seed: 1337
            },
            settingsForm: {
                deltaInput: {
                    value: 0
                },
                responseType_array: "Two class unpaired",
                testStatistic: "standard",
                centerArrays: "No",
                numberOfNeighbors: {
                    value: 10
                },
                nperms: {
                    value: 100
                },
                random_seed: 6187
            },
            loadingOptions: false,
            loadingResults: false,
            resultsData: []
        };
    },
    mounted() {
        console.log("mounted: samrAnalysisTab");
        this.handleFetchFormOptions();
    },
    computed: {
        selectedFeatureSetId: {
            get() {
                return this.$store.getters.pandoraExplorationSelectedFeatureSetId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedFeatureSetId", value);
            }
        }
    },
    methods: {
        recalculateSAM() {
            this.handleSubmitSAMJob();
        },
        handleSubmitSAMJob() {
            this.loadingResults = true;
            submitSAMJob({ resampleID: this.selectedFeatureSetId, settings: encodeURIComponent(window.btoa(JSON.stringify(this.settingsForm))) })
                .then(response => {
                    if (response.data.status === "success") {
                        this.resultsData = response.data.message;
                        this.resultsData.request = JSON.stringify(this.resultsData.request, null, 2);
                    } else {
                        console.log(response.data);
                    }
                    this.loadingResults = false;
                })
                .catch(error => {
                    console.log(error);
                    this.loadingResults = false;
                });
        },
        handleFetchFormOptions() {
            this.loadingOptions = true;
            fetchSamrFormOptions()
                .then(response => {
                    if (response.data.status === "success") {
                        console.log(response.data.message);
                        this.settingOptions = response.data.message;
                    } else {
                        console.log(response.data);
                    }
                    this.loadingOptions = false;
                })
                .catch(error => {
                    console.log(error);
                    this.loadingOptions = false;
                });
        }
    },
    watch: {
        /**
         * Once tab is enabled lets load the data
         * @param  boolean  newVal New item value
         * @param  boolean  oldVal Old item value
         * @return null
         */
        isTabDisabled: function(newVal, oldVal) {
            if (newVal === false) {
                this.handleFetchFormOptions();
            }
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.samr_form {
    .el-form-item {
        margin-bottom: 5px;
        label {
            color: #333333;
            font-weight: 500;
        }
    }
}
.code-output {
    max-width: 90%;
    height: 300px;
    overflow: auto;
    font-size: 11px;
}
</style>
