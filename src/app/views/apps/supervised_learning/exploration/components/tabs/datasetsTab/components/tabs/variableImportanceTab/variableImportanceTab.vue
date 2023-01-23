<template>
    <div class="variableImportanceTab-container" v-loading="listLoading" element-loading-text="Processing...">
        <div v-if="!isTabDisabled">
            <el-row style="height: 50px" align="top">
                <el-col :span="10">
                    <el-form :inline="true">
                        <el-form-item label="Order by">
                            <el-select @change="handleTableFilter" style="width: 140px" class="filter-item" v-model="paginateVariableImpData.sort_by">
                                <el-option v-for="item in tableSortOptions" :key="item.key" :label="item.label" :value="item.key"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-switch
                                v-model="paginateVariableImpData.sort"
                                @change="handleTableFilter"
                                active-color="#13ce66"
                                inactive-color="#ff4949"
                                active-text="ASC"
                                inactive-text="DESC"
                            ></el-switch>
                        </el-form-item>
                        <el-form-item style="float: right">
                            <el-button size="mini" class="filter-item" type="success" :loading="downloadLoading" v-waves icon="el-icon-download" @click="downloadTable"></el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="14">
                    <div class="feature-tag-container" v-if="selectedVariableImp.length > 0">
                        <el-tag
                            size="mini"
                            :key="feature.id"
                            v-for="feature in selectedVariableImp"
                            :disable-transitions="false"
                            type="success"
                            closable
                            @close="deselectVariableImp(feature)"
                        >
                            {{ feature.original | truncateString(10) }}
                        </el-tag>
                    </div>
                </el-col>
            </el-row>
            <el-row align="top" style="padding-top: 10px">
                <el-col :span="10">
                    <el-table
                        ref="variableImpTable"
                        :data="displayVariableImp"
                        :row-class-name="tableVariableImpClass"
                        row-key="id"
                        @select-all="handleVarImpSelection"
                        @select="handleVarImpSelection"
                        style="min-height: 600px"
                        size="small"
                        border
                    >
                        <el-table-column type="selection" reserve-selection width="35" fixed></el-table-column>

                        <el-table-column fixed label="Model">
                            <template slot-scope="scope">
                                <span>{{ scope.row.model_internal_id }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column fixed label="Feature">
                            <template slot-scope="scope">
                                <el-tooltip class="item" effect="dark" placement="top-start">
                                    <div slot="content">This feature accounts for {{ scope.row.score_perc }}% of this model's variance</div>
                                    <span>{{ scope.row.original }}</span>
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
                        <el-pagination
                            v-if="paginateVariableImpData.total_items > 20"
                            background
                            @size-change="handlePaginationPageSizeChange"
                            @current-change="handlePaginationPageChange"
                            :current-page.sync="paginateVariableImpData.page"
                            :page-sizes="[10, 20, 30, 50]"
                            :page-size="paginateVariableImpData.page_size"
                            layout="total, prev, pager, next, jumper"
                            :total="paginateVariableImpData.total_items"
                        ></el-pagination>
                    </div>
                </el-col>
                <el-col :span="14">
                    <div v-if="displayVariableImp.length > 0">
                        <el-tabs :value="'features_across_dataset'">
                            <el-tab-pane label="Selected Features across dataset" name="features_across_dataset">
                                <div v-if="selectedVariableImp.length > 0 && selectedVariableImp.length <= 25">
                                    <var-imp-chart :selectedVariableImp="selectedVariableImp"></var-imp-chart>
                                </div>
                                <div v-else>
                                    <el-alert
                                        title="Notification:"
                                        description="Please select at least one Feature to display Graphs.. You can select maximum of 25 Features."
                                        type="warning"
                                        show-icon
                                        :closable="false"
                                    ></el-alert>
                                </div>
                            </el-tab-pane>
                            <el-tab-pane label="Variable Importance Chart" name="variable_importance_chart">
                                This function is disabled and not available in current version.
                            </el-tab-pane>
                        </el-tabs>
                    </div>
                </el-col>
            </el-row>
        </div>
        <!-- ELSE if Tab is DISABLED -->
        <div v-else>
            <el-alert
                title="Notification"
                description="Unfortionatly this function is currently disabled"
                type="warning"
                style="margin-top: 20px"
                show-icon
                :closable="false"
            ></el-alert>
        </div>
    </div>
</template>
<script>
import { getVariableImportance } from "@/api/backend";

import waves from "@/directive/waves";
import { md5String } from "@/utils";
import { parseTime } from "@/filters";

import varImpChart from "./charts/varImpChart";

export default {
    name: "variableImportanceTab",
    directives: {
        waves,
    },
    components: { varImpChart },
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
            displayVariableImp: [],
            selectedVariableImp: [],

            paginateVariableImpData: {
                page: 1,
                page_size: 20,
                sort: false,
                sort_by: "score_perc",
                total_items: null,
            },
            tableSortOptions: [
                {
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
    },
    mounted() {
        console.log("mounted: variableImportanceTab: " + this.isTabDisabled);
        if (this.listLoading === false && this.displayVariableImp.length === 0) {
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
                        this.displayVariableImp = response.data.data;
                        this.paginateVariableImpData.total_items = response.data.total;
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
        selectedModelsIDs: function (newVal, oldVal) {
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
        isTabDisabled: function (newVal, oldVal) {
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
    max-height: 50px;
    overflow: auto;

    .el-tag {
        margin-left: 5px;
        margin-top: 5px;
    }
}
</style>
