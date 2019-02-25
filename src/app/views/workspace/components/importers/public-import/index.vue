<template>
    <div class="workspace-public-import">
        <el-button icon="el-icon-question" size="mini" type="primary" round v-waves :loading="datasetsLoading" @click.prevent.stop="fetchDatasets">
            {{ $t("views.workspace.components.importers.public_import.button") }}
        </el-button>

        <el-dialog :title="$t('views.workspace.components.importers.public_import.dialog.title')" :visible.sync="datasetsDialog" :close-on-click-modal="false">
            <div class="filter-container">
                <el-input
                    style="width: 300px;"
                    class="filter-item"
                    @keyup.enter.native="filterUpdate(1, 'page')"
                    :placeholder="$t('views.workspace.components.importers.public_import.dialog.filters.full_text.placeholder')"
                    v-model="filterQuery.custom"
                >
                </el-input>
                <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click.prevent.stop="filterUpdate(1, 'page')">{{
                    $t("views.workspace.components.importers.public_import.dialog.filters.buttons.search")
                }}</el-button>
                <el-button class="filter-item" type="primary" v-waves icon="el-icon-download" @click.prevent.stop="exportData">{{
                    $t("views.workspace.components.importers.public_import.dialog.filters.buttons.export")
                }}</el-button>
            </div>

            <el-table
                :data="datasetsData"
                size="mini"
                @expand-change="highlightMatches"
                row-key="datasetID"
                v-loading="datasetsLoading"
                ref="datasetGenularImport"
                :empty-text="$t('views.workspace.components.importers.public_import.dialog.table.no_data')"
                :default-sort="{ prop: 'datasetID', order: 'ascending' }"
                @sort-change="sortDatasetResults"
                stripe
                fit
                style="width: 100%"
            >
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <div class="inline_preview">
                            <div v-if="props.row.description">
                                <h4 class="data_headings">{{ $t("views.workspace.components.importers.public_import.dialog.table.expand.headings.description") }}</h4>
                                <div v-html="props.row.description"></div>
                            </div>
                            <div v-if="props.row.format">
                                <h4 class="data_headings">{{ $t("views.workspace.components.importers.public_import.dialog.table.expand.headings.format") }}</h4>
                                <div v-html="props.row.format"></div>
                            </div>
                            <div v-if="props.row.source">
                                <h4 class="data_headings">{{ $t("views.workspace.components.importers.public_import.dialog.table.expand.headings.source") }}</h4>
                                <div v-html="props.row.source"></div>
                            </div>
                            <div v-if="props.row.references">
                                <h4 class="data_headings">{{ $t("views.workspace.components.importers.public_import.dialog.table.expand.headings.references") }}</h4>
                                <div v-html="props.row.references"></div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="datasetID"
                    sortable="custom"
                    :sort-orders="['ascending', 'descending']"
                    :label="$t('views.workspace.components.importers.public_import.dialog.table.header.dataset_id')"
                    min-width="60"
                    align="center"
                >
                </el-table-column>
                <el-table-column
                    sortable="custom"
                    :sort-orders="['ascending', 'descending']"
                    :label="$t('views.workspace.components.importers.public_import.dialog.table.header.title')"
                    align="left"
                    min-width="275"
                >
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
                <el-table-column
                    prop="rows"
                    sortable="custom"
                    :sort-orders="['ascending', 'descending']"
                    :label="$t('views.workspace.components.importers.public_import.dialog.table.header.total_rows')"
                    min-width="100"
                    align="center"
                >
                    <template slot-scope="scope">
                        {{ scope.row.rows }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="columns"
                    sortable="custom"
                    :sort-orders="['ascending', 'descending']"
                    :label="$t('views.workspace.components.importers.public_import.dialog.table.header.total_columns')"
                    min-width="100"
                    align="center"
                >
                    <template slot-scope="scope">
                        {{ scope.row.columns }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="sparsity"
                    sortable="custom"
                    :sort-orders="['ascending', 'descending']"
                    :label="$t('views.workspace.components.importers.public_import.dialog.table.header.sparsity')"
                    min-width="100"
                    align="center"
                >
                    <template slot-scope="scope">
                        <span v-if="scope.row.sparsity < 50"> <span class="el-icon-success"></span> {{ scope.row.sparsity }}% </span>
                        <span v-else-if="scope.row.sparsity > 50 && scope.row.sparsity < 75"> <span class="el-icon-warning"></span> {{ scope.row.sparsity }}% </span>
                        <span v-else> <span class="el-icon-error"></span> {{ scope.row.sparsity }}% </span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="updated"
                    sortable="custom"
                    :sort-orders="['ascending', 'descending']"
                    min-width="100"
                    :label="$t('views.workspace.components.importers.public_import.dialog.table.header.updated')"
                    align="center"
                >
                    <template slot-scope="scope">
                        {{ scope.row.updated | parseTime("{y}-{m}-{d}") }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('views.workspace.components.importers.public_import.dialog.table.header.actions')" width="110" align="center">
                    <template slot-scope="scope">
                        <el-popover
                            placement="bottom"
                            :title="$t('views.workspace.components.importers.public_import.dialog.table.operations.preview.dialog.title')"
                            trigger="click"
                        >
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
                                <div v-else>
                                    {{ $t("views.workspace.components.importers.public_import.dialog.table.operations.preview.dialog.error") }}
                                    <a :href="scope.row.downloadLink" target="_blank">
                                        {{ $t("views.workspace.components.importers.public_import.dialog.table.operations.preview.dialog.download_link") }} </a
                                    >.
                                </div>
                            </div>
                            <el-button
                                style="float: left;"
                                round
                                plain
                                type="info"
                                size="mini"
                                icon="el-icon-info"
                                slot="reference"
                                :title="$t('views.workspace.components.importers.public_import.dialog.table.operations.preview.title')"
                            >
                            </el-button>
                        </el-popover>
                        <el-button
                            round
                            plain
                            type="success"
                            size="mini"
                            icon="el-icon-download"
                            :title="$t('views.workspace.components.importers.public_import.dialog.table.operations.import.title')"
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
                    :page-sizes="[5, 25, 50]"
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
import { parseTime } from "@/filters";

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
                sort_by: "id",
                sort: "+",
                custom: ""
            },
            itemsTotal: 0
        };
    },

    methods: {
        importDatasets(datasetIDs) {
            this.$confirm(
                this.$t("views.workspace.components.importers.public_import.dialog.table.operations.import.dialog.message"),
                this.$t("views.workspace.components.importers.public_import.dialog.table.operations.import.dialog.title"),
                {
                    type: "info"
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
                            this.$message({
                                message: this.$t("globals.errors.request_general"),
                                type: "error"
                            });
                            this.datasetsLoading = false;
                            console.log(error);
                        });
                })
                .catch(_ => {
                    this.$message({
                        type: "info",
                        message: this.$t("globals.messages.canceled")
                    });
                });
        },
        filterUpdate(value, updateType) {
            if (typeof this.filterQuery[updateType] !== "undefined") {
                this.filterQuery[updateType] = value;
                this.fetchDatasets();
            }
        },
        sortDatasetResults({ column, prop, order }) {
            let sortColumn = "";
            let sortOrdering = "+";
            if (typeof prop !== "undefined") {
                if (prop == "datasetID") {
                    sortColumn = "id";
                } else {
                    sortColumn = prop;
                }
            }

            if (order === "descending") {
                sortOrdering = "-";
            }

            if (prop === null) {
                sortColumn = "id";
            }
            if (order === null) {
                sortOrdering = "+";
            }

            if (this.filterQuery.sort_by !== sortColumn || this.filterQuery.sort !== sortOrdering) {
                this.filterQuery.sort_by = sortColumn;
                this.filterQuery.sort = sortOrdering;
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
                    this.$message({
                        message: this.$t("globals.errors.request_general"),
                        type: "error"
                    });
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
