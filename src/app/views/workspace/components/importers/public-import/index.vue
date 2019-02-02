<template>
    <div class="workspace-public-import">
        <el-button icon="el-icon-question" size="mini" type="primary" round v-waves :loading="datasetsLoading" @click.prevent.stop="fetchDatasets">Public Import</el-button>

        <el-dialog title="Please choose dataset you wish to import" :visible.sync="datasetsDialog" :close-on-click-modal="false">
            <div class="filter-container">
                <el-input style="width: 300px;" class="filter-item" @keyup.enter.native="filterUpdate(1, 'page')" placeholder="Search by keyword" v-model="filterQuery.custom">
                </el-input>
                <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click.prevent.stop="filterUpdate(1, 'page')">{{
                    $t("views.dashboard.jobs.search.buttons.search")
                }}</el-button>
                <el-button class="filter-item" type="primary" v-waves icon="el-icon-download" @click.prevent.stop="exportData">{{
                    $t("views.dashboard.jobs.search.buttons.export")
                }}</el-button>
            </div>

            <el-table
                :data="datasetsData"
                size="mini"
                @expand-change="highlightMatches"
                row-key="datasetID"
                v-loading="datasetsLoading"
                ref="datasetGenularImport"
                empty-text="Finding datasets for import"
                stripe
                fit
                style="width: 100%"
            >
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <div class="inline_preview">
                            <div v-if="props.row.description">
                                <h4 class="data_headings">Description</h4>
                                <div v-html="props.row.description"></div>
                            </div>
                            <div v-if="props.row.format">
                                <h4 class="data_headings">Data format</h4>
                                <div v-html="props.row.format"></div>
                            </div>
                            <div v-if="props.row.source">
                                <h4 class="data_headings">Source</h4>
                                <div v-html="props.row.source"></div>
                            </div>
                            <div v-if="props.row.references">
                                <h4 class="data_headings">References</h4>
                                <div v-html="props.row.references"></div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column property="datasetID" label="ID" width="60" align="center"> </el-table-column>
                <el-table-column label="Title" align="left" width="275">
                    <template slot-scope="scope">
                        <div class="title_box">
                            <div class="title_box_title" :title="scope.row.title">{{ scope.row.title | truncateString(25) }}</div>
                            <div class="title_box_vote">
                                <i class="fa fa-thumbs-up" aria-hidden="true"></i>
                                <i class="fa fa-thumbs-down" aria-hidden="true"></i>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="Rows" width="75" align="center">
                    <template slot-scope="scope">
                        {{ scope.row.rows }}
                    </template>
                </el-table-column>
                <el-table-column label="Columns" width="85" align="center">
                    <template slot-scope="scope">
                        {{ scope.row.columns }}
                    </template>
                </el-table-column>
                <el-table-column label="Sparsity" width="85" align="center">
                    <template slot-scope="scope">
                        <span v-if="scope.row.sparsity < 50"> <span class="el-icon-success"></span> {{ scope.row.sparsity }}% </span>
                        <span v-else-if="scope.row.sparsity > 50 && scope.row.sparsity < 75"> <span class="el-icon-warning"></span> {{ scope.row.sparsity }}% </span>
                        <span v-else> <span class="el-icon-error"></span> {{ scope.row.sparsity }}% </span>
                    </template>
                </el-table-column>
                <el-table-column label="Updated" align="center">
                    <template slot-scope="scope">
                        {{ scope.row.updated | parseTime("{y}-{m}-{d}") }}
                    </template>
                </el-table-column>
                <el-table-column label="Actions" width="110" align="center">
                    <template slot-scope="scope">
                        <el-popover placement="bottom" title="Dataset preview" trigger="click">
                            <div class="preview_container">
                                <div v-if="scope.row.example.length > 2">
                                    <el-table :data="scope.row.example" size="mini">
                                        <el-table-column
                                            v-for="(colItem, colIndex) in Object.keys(scope.row.example[0])"
                                            :prop="colItem"
                                            :key="colItem + '_' + colIndex"
                                            :label="colItem"
                                        >
                                        </el-table-column>
                                    </el-table>
                                </div>
                                <div v-else>Cannot display preview of the dataset. Please download it manually <a :href="scope.row.downloadLink" target="_blank">here</a>.</div>
                            </div>
                            <el-button style="float: left;" round plain type="info" size="mini" icon="el-icon-info" slot="reference" title="Preview"></el-button>
                        </el-popover>
                        <el-button
                            round
                            plain
                            type="success"
                            size="mini"
                            icon="el-icon-download"
                            title="Import"
                            @click.prevent.stop="importDatasets([scope.row.datasetID])"
                        ></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination-container">
                <el-pagination
                    background
                    @size-change="
                        input => {
                            filterUpdate(input, 'limit');
                        }
                    "
                    @current-change="
                        input => {
                            filterUpdate(input, 'page');
                        }
                    "
                    :current-page.sync="filterQuery.page"
                    :page-sizes="[5, 10]"
                    :page-size="filterQuery.limit"
                    :total="itemsTotal"
                    layout="total, sizes, prev, pager, next, jumper"
                >
                </el-pagination>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import waves from "@/directive/waves";
import { getPublicDatasets as ApiGetPublicDatasets, importPublicDatasets as ApiImportPublicDatasets } from "@/api/backend";
import { parseTime } from "@/utils";
// import { htmlentities } from "@/utils/3rdparty/htmlentities";

export default {
    name: "workspace-public-import",

    mounted() {
        console.log("mounted: workspace-public-import");
    },
    directives: {
        waves
    },
    computed: {},
    data() {
        return {
            datasetsData: [],
            datasetsDialog: false,
            datasetsLoading: false,
            filterQuery: {
                page: 1,
                limit: 5,
                sort: "+",
                custom: ""
            },
            itemsTotal: 0
        };
    },

    methods: {
        importDatasets(datasetIDs) {
            this.$confirm("Are you sure you want to import this dataset(s) into your workspace?", "Info", {
                type: "info"
            })
                .then(_ => {
                    this.datasetsLoading = true;
                    ApiImportPublicDatasets({ datasetIDs: datasetIDs })
                        .then(response => {
                            this.datasetsLoading = false;
                            if (response.data.success === true) {
                                response.data.message.forEach(item => {
                                    let statusMsg = item.status === true ? "success" : "warning";
                                    this.$message({
                                        type: statusMsg,
                                        message: "Dataset: " + item.datasetID + " " + statusMsg
                                    });
                                });
                                this.$emit("refresh-items");
                            }
                        })
                        .catch(error => {
                            this.datasetsLoading = false;
                            console.log(error);
                        });
                })
                .catch(_ => {
                    this.$message({
                        type: "info",
                        message: "Action canceled"
                    });
                });
        },
        filterUpdate(value, updateType) {
            if (typeof this.filterQuery[updateType] !== "undefined") {
                this.filterQuery[updateType] = value;
                this.fetchDatasets();
            }
        },
        fetchDatasets() {
            this.datasetsLoading = true;
            ApiGetPublicDatasets(this.filterQuery)
                .then(response => {
                    if (response.data.success === true) {
                        this.datasetsData = response.data.message.itemsList;
                        this.itemsTotal = response.data.message.itemsTotal;
                        this.datasetsDialog = true;
                    }
                    this.datasetsLoading = false;
                })
                .catch(error => {
                    console.log("==> Cannot get ApiGetPublicDatasets stats: " + error);
                    this.datasetsLoading = false;
                    this.datasetsDialog = false;
                });
        },
        escapeRegExp(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },
        highlightMatches(row, expandedRows) {
            if (this.filterQuery.custom.trim().length > 3) {
                const index = this.datasetsData.findIndex(p => p.datasetID == row.datasetID);
                this.datasetsData[index].description = row.description.replace(
                    new RegExp(this.escapeRegExp(this.filterQuery.custom), "gi"),
                    "<span class='highlight_match'>" + this.filterQuery.custom + "</span>"
                );
            }
        },
        exportData() {
            import("@/vendor/Export2Excel").then(excel => {
                const tHeader = ["datasetID", "title", "rows", "columns", "sparsity", "updated", "downloadLink"];
                const filterVal = ["datasetID", "title", "rows", "columns", "sparsity", "updated", "downloadLink"];
                const data = this.formatJson(filterVal, this.datasetsData);
                excel.export_json_to_excel(tHeader, data, "table-list");
            });
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v =>
                filterVal.map(j => {
                    if (j === "updated") {
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
<style rel="stylesheet/scss" lang="scss">
.highlight_match {
    color: #2d2d2d;
    background-color: #ff1b0080;
    padding: 2px;
    letter-spacing: 1px;
}
/** Expand description  */
.inline_preview {
    .data_headings {
        border-bottom: 1px dashed #f1f1f1;
    }
}

.title_box {
    .title_box_title {
        float: left;
    }
    .title_box_vote {
        float: right;
        > i {
            font-size: 17px;
        }
        .fa-thumbs-up {
            color: green;
        }
        .fa-thumbs-down {
            color: red;
        }
    }
}
/** CSV Example preview modal class */
.preview_container {
    max-width: 500px;
    max-height: 500px;
    overflow: auto;
}
</style>
