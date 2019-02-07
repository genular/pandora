<template>
    <div class="variableImportanceTab-container">
        <el-row style="height: 50px;" align="top">
            <el-col :span="10">
                <el-form :inline="true">
                    <el-form-item label="Order by">
                        <el-select @change='handleTableFilter' style="width: 140px" class="filter-item" v-model="paginateVariableImpData.sort_by">
                            <el-option v-for="item in tableSortOptions" :key="item.key" :label="item.label" :value="item.key">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-switch
                            v-model="paginateVariableImpData.sort"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                            active-text="ASC"
                            inactive-text="DESC">
                        </el-switch>
                    </el-form-item>
                    <el-form-item>
                        <el-button  size="mini" class="filter-item" type="primary" v-waves @click="handleTableFilter">Sort</el-button>
                    </el-form-item>
                    <el-form-item style="float: right;">
                        <el-button  size="mini" class="filter-item" type="primary" :loading="downloadLoading" v-waves icon="el-icon-download" @click="handleDownload">
                            {{$t('views.dashboard.jobs.search.buttons.export')}}
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-col>

            <el-col :span="14">
                <div class="feature-tag-container" v-if="selectedVariableImp.length > 0">
                    <el-tag size="mini" :key="feature.id" v-for="feature in selectedVariableImp" :disable-transitions="false" type="success" closable @close="deselectVariableImp(feature)"> {{feature.original | truncateString(10)}} </el-tag>
                </div>
            </el-col>
        </el-row>
        <el-row align="top" style="padding-top: 10px;">
            <el-col :span="10">

                <el-table ref="variableImpTable"
                    :data="displayVariableImp"
                    :row-class-name="tableVariableImpClass"
                    v-loading="listLoading"
                    row-key="id"
                    @select-all="handleVarImpSelection"
                    @select="handleVarImpSelection"

                    max-height="600"
                    size="small"
                    border>

                    <el-table-column
                        type="selection"
                        reserve-selection

                        width="35"
                        fixed>
                    </el-table-column>

                    <el-table-column fixed label="Feature">
                        <template slot-scope="scope">
                             <span v-if="scope.row.original">{{scope.row.original}}</span> <span v-else>N/A</span>
                        </template>
                    </el-table-column>

                    <el-table-column width="125px" align="center" label="Rank" prop="rank" sortable>
                        <template slot-scope="scope">
                            <span v-if="scope.row.rank">{{scope.row.rank}}</span> <span v-else>N/A</span>
                        </template>
                    </el-table-column>
                    <el-table-column width="125px" align="center" label="Score" prop="score_perc" sortable>
                        <template slot-scope="scope">
                            <span v-if="scope.row.score_perc">{{scope.row.score_perc}}</span> <span v-else>N/A</span>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="pagination-container">
                    <el-pagination v-if="paginateVariableImpData.total_items > 20" background
                        @size-change="handlePaginationPageSizeChange"
                        @current-change="handlePaginationPageChange"
                        :current-page.sync="paginateVariableImpData.page"
                        :page-sizes="[10,20,30, 50]"
                        :page-size="paginateVariableImpData.page_size"
                        layout="total, prev, pager, next, jumper"
                        :total="paginateVariableImpData.total_items">
                    </el-pagination>
                </div>
            </el-col>
            <el-col :span="14">

                <div v-if="selectedVariableImp.length > 0 && selectedVariableImp.length <= 15">
                    <var-imp-chart :selectedVariableImp="selectedVariableImp"></var-imp-chart>
                </div>
                <div v-else>
                  <el-alert title="Notification:" description="Please select at least one Feature to display Graphs.. You can select maximum of 15 Features." type="warning" show-icon :closable="false"> </el-alert>
                </div>

            </el-col>
        </el-row>
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
        waves
    },
    components: { varImpChart },
    props: {
        columnName: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
            listLoading: true,
            displayVariableImp: [],
            selectedVariableImp: [],

            paginateVariableImpData: {
                page: 1,
                page_size: 20,
                sort: false,
                sort_by: "feature_name",
                total_items: null
            },
            tableSortOptions: [
                {
                    label: "Feature name",
                    key: "feature_name"
                },
                {
                    label: "Rank",
                    key: "rank"
                },
                {
                    label: "Score",
                    key: "score_perc"
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
        },
        selectedFeatureSetId: {
            get() {
                return this.$store.getters.simonExplorationSelectedFeatureSetId;
            },
            set(value) {
                this.$store.dispatch(
                    "setSimonExplorationSelectedFeatureSetId",
                    value
                );
            }
        },
        selectedModelsIDs: {
            get() {
                return this.$store.getters.simonExplorationSelectedModelId;
            },
            set(value) {
                this.$store.dispatch(
                    "setSimonExplorationSelectedModelId",
                    value
                );
            }
        }
    },
    mounted() {
        console.log("mounted: variableImportanceTab");
        this.handleFetchVariableImp();
    },
    methods: {
        deselectVariableImp(feature) {
            console.log("deselectVariableImp");
            // Remove deselected TAG feature from selected features
            this.selectedVariableImp = this.selectedVariableImp.filter(item => {
                return item.id !== feature.id;
            });
            // Uncheck table check-box
            this.$refs.variableImpTable.toggleRowSelection(feature, false);
        },
        handleVarImpSelection(selection, row) {
            console.log("handleVarImpSelection");
            console.log(selection);
            
            this.selectedVariableImp = selection;
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
                pqid: this.explorationJobId,
                resampleID: this.selectedFeatureSetId,
                modelsID: this.selectedModelsIDs,
                ...this.paginateVariableImpData
            })
                .then(response => {
                    console.log("fetchVariableImp");

                    if (response.data.success === true) {
                        this.displayVariableImp = response.data.data;
                        this.paginateVariableImpData.total_items =
                            response.data.total;
                    } else {
                        console.log(response.data);
                    }
                    this.listLoading = false;
                })
                .catch(error => {
                    console.log(error);
                });
        },
        tableVariableImpClass({ row, rowIndex }) {
            if (row.t_auc > 0.6) {
                return "success-row";
            } else if (row.t_auc < 0.2) {
                return "warning-row";
            }
            return "";
        },
        handleDownload() {
            this.downloadLoading = true;
            import("@/vendor/Export2Excel").then(excel => {
                const tHeader = ["Feature", "Rank", "Score"];
                const filterVal = ["original", "rank", "score_perc"];

                const data = this.formatJson(
                    filterVal,
                    this.displayVariableImp
                );

                excel.export_json_to_excel(tHeader, data, "table-list");
                this.downloadLoading = false;
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
        }
    }
};
</script>
<style rel='stylesheet/scss' lang='scss' scoped>
.feature-tag-container {
    max-height: 50px;
    overflow: auto;

    .el-tag {
        margin-left: 5px;
        margin-top: 5px;
    }
}
</style>
