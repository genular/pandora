<template>
    <div class="variableImportanceTab-container" v-loading="listLoading" element-loading-text="Processing...">
        <div v-if="!isTabDisabled">
            <el-col :span="10">
                <el-row>
                    <div class="filter-and-tags-container" style="display: flex; align-items: center; flex-wrap: nowrap;">
                        <!-- Inline Form for filters -->
                        <el-form :inline="true" size="large" class="filter-form" style="display: flex; align-items: center; flex-wrap: nowrap;">
                            <el-form-item label="Class" style="margin-right: 20px;">
                                <el-select v-model="paginateVariableImpData.selectedOutcomeOptionsIDs" collapse-tags size="large" multiple placeholder="Outcome class" @change="handleFetchVariableImp">
                                    <el-option v-for="item in selectedOutcomeOptions" :key="item.id" :label="'Outcome: ' + item.class_original" :value="item.id">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Order" style="margin-right: 20px;">
                                <el-select @change="handleTableFilter" class="filter-item" v-model="paginateVariableImpData.sort_by" size="large">
                                    <el-option v-for="item in tableSortOptions" :key="item.key" :label="item.label" :value="item.key"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item style="margin-right: 20px;">
                                <el-switch v-model="paginateVariableImpData.sort" @change="handleTableFilter" active-color="#13ce66" inactive-color="#ff4949" active-text="ASC" inactive-text="DESC"></el-switch>
                            </el-form-item>
                            <el-form-item>
                                <el-button size="mini" class="filter-item" type="success" :loading="downloadLoading" v-waves icon="el-icon-download" @click="downloadTable"></el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-row>
                <el-row style="padding-top: 10px;">
                    <!-- Feature Tags Container -->
                    <div class="feature-tag-container" v-if="selectedVariableImp.length > 0">
                        <el-tag size="mini" :key="feature.id" v-for="feature in selectedVariableImp" :disable-transitions="false" type="success" closable @close="deselectVariableImp(feature)">
                            {{ feature.original | truncateString(15) }}
                        </el-tag>
                    </div>
                </el-row>
                <el-row style="padding-top: 15px;">
                    <el-table ref="variableImpTable" :data="displayVariableImportance" :row-class-name="tableVariableImpClass" row-key="id" @select-all="handleVarImpSelection" @select="handleVarImpSelection" style="min-height: 600px" size="small" border>
                        <el-table-column type="selection" reserve-selection></el-table-column>
                        <el-table-column fixed label="Model">
                            <template slot-scope="scope">
                                <span>{{ scope.row.model_internal_id }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column fixed label="Outcome">
                            <template slot-scope="scope">
                                <span>{{ scope.row.class_original ? scope.row.class_original : 'Overall' }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column fixed label="Feature">
                            <template slot-scope="scope">
                                <el-tooltip class="item" effect="dark" placement="top-start">
                                    <div slot="content">{{ scope.row.original }} accounts for {{ scope.row.score_perc }}% of this model's variance, for selected class</div>
                                    <span>{{ scope.row.original | truncateString(10)}} </span>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                        <el-table-column width="125px" align="center" label="Rank" prop="rank">
                            <template slot-scope="scope">
                                <span v-if="scope.row.rank">{{ scope.row.rank }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                        <el-table-column width="125px" align="center" label="Score" prop="score_perc">
                            <template slot-scope="scope">
                                <span v-if="scope.row.score_perc">{{ scope.row.score_perc }}</span>
                                <span v-else>N/A</span>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="pagination-container">
                        <el-pagination v-if="paginateVariableImpData.total_items > 20" background @size-change="handlePaginationPageSizeChange" @current-change="handlePaginationPageChange" :current-page.sync="paginateVariableImpData.page" :page-sizes="[10, 20, 30, 50]" :page-size="paginateVariableImpData.page_size" layout="total, prev, pager, next, jumper" :total="paginateVariableImpData.total_items"></el-pagination>
                    </div>
                </el-row>
            </el-col>
            <el-col :span="14" style="padding-left: 10px">
                <div v-if="displayVariableImportance.length > 0">
                    <el-tabs :value="'features_across_dataset'">
                        <el-tab-pane label="Features across dataset" name="features_across_dataset">
                            <div v-if="selectedVariableImp.length > 0 && selectedVariableImp.length <= 25">
                                <var-imp-chart :selectedVariableImp="selectedVariableImp" :selectedOutcomeOptionsIDs="paginateVariableImpData.selectedOutcomeOptionsIDs"></var-imp-chart>
                            </div>
                            <div v-else>
                                <el-alert title="Notification:" description="Please select at least one Feature to display Graphs.. You can select maximum of 25 Features." type="warning" show-icon :closable="false"></el-alert>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="Variable Importance" name="variable_importance_chart">
                            <category-stack className="variable-importance-features-chart" :categoryStackData="categoryStackData" :width="'1000px'" :height="'1000px'">
                            </category-stack>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </el-col>
        </div>
        <!-- ELSE if Tab is DISABLED -->
        <div v-else>
            <el-alert title="Notification" description="Unfortionatly this function is currently disabled" type="warning" style="margin-top: 20px" show-icon :closable="false"></el-alert>
        </div>
    </div>
</template>
<script>
import { getVariableImportance } from "@/api/backend";

import waves from "@/directive/waves";
import { md5String } from "@/utils";
import { parseTime } from "@/filters";

import varImpChart from "./charts/varImpChart";
import categoryStack from "@/components/Charts/categoryStack";

export default {
    name: "variableImportanceTab",
    directives: {
        waves,
    },
    components: { varImpChart, categoryStack },
    props: {
        columnName: {
            type: String,
            default: "",
        },
        isTabDisabled: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            listLoading: false,
            selectedVariableImp: [],

            categoryStackData: {
                yAxis: { type: 'category', data: [] },
                series: [],
            },

            paginateVariableImpData: {
                page: 1,
                page_size: 20,
                sort: false,
                sort_by: "score_perc",
                total_items: null,
                selectedOutcomeOptionsIDs: [],

            },
            tableSortOptions: [{
                    label: "Feature name",
                    key: "feature_name",
                },
                {
                    label: "Rank",
                    key: "rank",
                },
                {
                    label: "Score",
                    key: "score_perc",
                },
                {
                    label: "Model",
                    key: "model_internal_id",
                },
                {
                    label: "Outcome",
                    key: "class_original",
                }
            ],
            downloadLoading: false,
        };
    },
    computed: {
        selectedQueueID: {
            get() {
                return this.$store.getters.pandoraExplorationSelectedQueueID;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedQueueID", value);
            },
        },
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
        selectedOutcomeOptions: {
            get() {
                return this.$store.getters.pandoraExplorationSelectedOutcomeOptions;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedOutcomeOptions", value);
            },
        },
        selectedOutcomeOptionsIDs: {
            get() {
                return this.$store.getters.pandoraExplorationSelectedOutcomeOptionsIDs;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedOutcomeOptionsIDs", value);
            }
        },
        displayVariableImportance: {
            get() {
                return this.$store.getters.pandoraExplorationDisplayVariableImportance;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationDisplayVariableImportance", value);
            }
        },
    },
    mounted() {
        console.log("mounted: variableImportanceTab: " + this.isTabDisabled);

        if (this.paginateVariableImpData.selectedOutcomeOptionsIDs.length === 0 && this.selectedOutcomeOptionsIDs.length > 0) {
            this.paginateVariableImpData.selectedOutcomeOptionsIDs = this.selectedOutcomeOptionsIDs;
        }

        if (this.listLoading === false) {
            this.handleFetchVariableImp();
        }
    },
    methods: {
        deselectVariableImp(feature) {
            console.log("deselectVariableImp");
            console.log(feature);

            // Remove deselected TAG feature from selected features
            this.selectedVariableImp = this.selectedVariableImp.filter((item) => {
                return item.feature_name !== feature.feature_name;
            });
            // Uncheck table check-box
            this.$refs.variableImpTable.toggleRowSelection(feature, false);
        },
        handleVarImpSelection(selection, row) {
            console.log("handleVarImpSelection");
            // select unique objects by key value
            const selectionCheck = new Set();
            const uniqueSelection = selection.filter((entry) => {
                if (selectionCheck.has(entry.feature_name)) {
                    return false;
                }
                selectionCheck.add(entry.feature_name);
                return true;
            });

            this.selectedVariableImp = uniqueSelection;
        },
        handleTableFilter() {
            this.paginateVariableImpData.page = 1;
            this.handleFetchVariableImp();
        },
        handlePaginationPageSizeChange(val) {
            this.paginateVariableImpData.page_size = val;
            this.handleFetchVariableImp();
        },
        handlePaginationPageChange(val) {
            this.paginateVariableImpData.page = val;
            this.handleFetchVariableImp();
        },
        handleFetchVariableImp() {
            this.listLoading = true;

            getVariableImportance({
                    pqid: this.selectedQueueID,
                    resampleID: this.selectedFeatureSetId,
                    modelsID: this.selectedModelsIDs,
                    ...this.paginateVariableImpData,
                })
                .then((response) => {
                    if (response.data.success === true) {
                        this.displayVariableImportance = response.data.data;
                        this.paginateVariableImpData.total_items = response.data.total;

                        this.prepareDataForChart();

                    } else {
                        console.log(response.data);
                    }
                    this.listLoading = false;
                })
                .catch((error) => {
                    this.$message({
                        message: this.$t("globals.errors.request_general"),
                        type: "error",
                    });
                    console.log(error);
                    this.listLoading = false;
                });
        },
        prepareDataForChart() {
            getVariableImportance({
                pqid: this.selectedQueueID,
                resampleID: this.selectedFeatureSetId,
                modelsID: this.selectedModelsIDs,
                selectedOutcomeOptionsIDs: this.paginateVariableImpData.selectedOutcomeOptionsIDs,
                page: 1,
                page_size: 100000,
                sort: true,
                sort_by: "score_perc",
                total_items: 100000,
            }).then((response) => {
                if (response.data.success === true) {
                    // Step 1: Aggregate the data
                    const featureScoresByDrmId = response.data.data.reduce((acc, curr) => {
                        const feature = curr.original;
                        const drmId = curr.drm_id;
                        const score = curr.score_perc;

                        if (!acc[feature]) {
                            acc[feature] = {};
                        }
                        acc[feature][drmId] = score;
                        return acc;
                    }, {});

                    // Step 2: Calculate sums of scores for each feature across all drm_id
                    const featureSums = {};
                    Object.keys(featureScoresByDrmId).forEach(feature => {
                        const scores = featureScoresByDrmId[feature];
                        const sum = Object.values(scores).reduce((sum, score) => sum + score, 0);
                        featureSums[feature] = sum;
                    });

                    // Step 3: Sort features based on their sums (Descending order)
                    const sortedFeatures = Object.entries(featureSums)
                        .sort(([, sumA], [, sumB]) => sumB - sumA) // Descending order
                        .map(([feature]) => feature);

                    // yAxisData is the sorted features
                    const yAxisData = sortedFeatures;

                    // Step 4: Collect all unique seriesNames (drm_id mapped to class_original)
                    const seriesNamesSet = new Set();
                    response.data.data.forEach(item => {
                        const drmId = item.drm_id;
                        const matchingOutcomeOption = this.selectedOutcomeOptions.find(option => option.id === parseInt(drmId));
                        const seriesName = matchingOutcomeOption ? matchingOutcomeOption.class_original : `DRM ID ${drmId}`;
                        seriesNamesSet.add(seriesName);
                    });

                    // Convert seriesNamesSet to an array
                    const seriesNames = Array.from(seriesNamesSet);

                    // Step 5: Initialize seriesData for each seriesName
                    const seriesData = {};
                    seriesNames.forEach(seriesName => {
                        seriesData[seriesName] = {
                            name: seriesName,
                            type: 'bar',
                            stack: 'total',
                            data: new Array(yAxisData.length).fill(0)
                        };
                    });

                    // Step 6: Fill in the data arrays
                    response.data.data.forEach(item => {
                        const drmId = item.drm_id;
                        const matchingOutcomeOption = this.selectedOutcomeOptions.find(option => option.id === parseInt(drmId));
                        const seriesName = matchingOutcomeOption ? matchingOutcomeOption.class_original : `DRM ID ${drmId}`;
                        const featureName = item.original;
                        const featureIndex = yAxisData.indexOf(featureName);

                        if (featureIndex === -1) {
                            console.warn(`Feature ${featureName} not found in yAxisData`);
                            return;
                        }

                        if (seriesData[seriesName]) {
                            seriesData[seriesName].data[featureIndex] = item.score_perc;
                        } else {
                            console.warn(`Series name '${seriesName}' not found in seriesData.`);
                        }
                    });

                    // Step 7: Convert seriesData from object to array
                    const series = Object.values(seriesData);

                    // Add labels to series data
                    series.forEach(seriesItem => {
                        seriesItem.label = { show: true };
                        seriesItem.emphasis = { focus: 'series' };
                    });

                    // Step 8: Prepare data for chart
                    this.categoryStackData = {
                        yAxis: {
                            type: 'category',
                            data: yAxisData, // sorted feature names
                            axisLabel: {
                                color: 'black', // Set y-axis label color to black
                            }
                        },
                        series: series,
                    };
                }
            }).catch((error) => {
                console.error('Error fetching variable importance:', error);
                this.$message({
                    message: 'Error fetching variable importance data.',
                    type: 'error',
                });
            });
        },

        tableVariableImpClass({ row, rowIndex }) {
            if (row.score_perc > 50) {
                return "success-row";
            } else if (row.t_auc < 0.2) {
                return "warning-row";
            }
            return "";
        },
        // Export all features for selected models in Excel table
        downloadTable() {
            this.downloadLoading = true;

            getVariableImportance({
                    pqid: this.selectedQueueID,
                    resampleID: this.selectedFeatureSetId,
                    modelsID: this.selectedModelsIDs,
                    selectedOutcomeOptionsIDs: this.selectedOutcomeOptions.map((item) => item.id),
                    page: 1,
                    page_size: 100000,
                    sort: true,
                    sort_by: "score_perc",
                    total_items: 100000,
                })
                .then((response) => {
                    if (response.data.success === true) {
                        import("@/vendor/Export2Excel").then((excel) => {
                            const filterVal = ["model_id", "model_internal_id", "original", "score_perc", "score_no"];
                            const tHeader = ["model_id", "model_name", "feature", "score_percentage", "score_numeric"];

                            const modelsValues = response.data.data.map((item) => item.model_internal_id);
                            // Get unique models and format for display
                            let models = modelsValues.filter((value, index, self) => {
                                return self.indexOf(value) === index;
                            });
                            models = models.join("_");

                            excel.export_json_to_excel(tHeader, this.formatJson(filterVal, response.data.data), "varImp_resampleID_" + this.selectedFeatureSetId + "_" + models);
                            this.downloadLoading = false;
                        });
                    } else {
                        console.log(response.data);
                    }
                    this.downloadLoading = false;
                })
                .catch((error) => {
                    this.$message({
                        message: this.$t("globals.errors.request_general"),
                        type: "error",
                    });
                    console.log(error);
                    this.downloadLoading = false;
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
    },
    watch: {
        /**
         * Watch for model selection change
         * @param  {[type]} newVal [description]
         * @param  {[type]} oldVal [description]
         * @return {[type]}        [description]
         */
        selectedModelsIDs: function(newVal, oldVal) {
            console.log("variableImportanceTab getting new variables based on model change");
            if (this.isTabDisabled === false) {
                // Remove any previously selected variables
                this.selectedVariableImp = [];
                this.handleFetchVariableImp();
            }
        },
        /**
         * Once tab is enabled lets load the data
         * @param  boolean  newVal New item value
         * @param  boolean  oldVal Old item value
         * @return null
         */
        isTabDisabled: function(newVal, oldVal) {
            console.log("variableImportanceTab isTabDisabled: " + newVal);
            if (newVal === false) {
                // Remove any previously selected variables
                this.selectedVariableImp = [];
                this.handleFetchVariableImp();
            }
        },
    },
};

</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.feature-tag-container {
    overflow: auto;

    .el-tag {
        margin-left: 5px;
        margin-top: 5px;

        &:first-child {
            margin-left: 0;
        }
    }
}

.filter-form {
    .el-form-item {
        margin-bottom: 0;
    }
}

</style>
