<template>
    <div class="dataset-importer-genular">
        <el-button icon="el-icon-question" size="mini" type="primary" round v-waves :loading="datasetsLoading" @click.prevent.stop="fetchDatasets">Public Import</el-button>

        <el-dialog title="Please choose dataset you wish to import" :visible.sync="datasetsDialog" :close-on-click-modal="false">
            <div class="filter-container">
                <el-input 
                    style="width: 300px;"
                    class="filter-item" 
                    @keyup.enter.native="filterUpdate(1, 'page')"
                    placeholder="Search by keyword"
                    v-model="filterQuery.custom">
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
                        <div class="inline_preview" v-html="props.row.description"></div>
                    </template>
                </el-table-column>
                <el-table-column property="datasetID" label="ID" width="60" align="center"> </el-table-column>
                <el-table-column label="Title" align="left">
                    <template slot-scope="scope">
                        <span :title="scope.row.title">{{ scope.row.title | truncateString(25) }}</span>
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
                        <span v-if="scope.row.sparsity < 50">
                            <span class="el-icon-success"></span> {{ scope.row.sparsity }}%
                        </span>
                        <span v-else-if="scope.row.sparsity > 50 && scope.row.sparsity < 75">
                             <span class="el-icon-warning"></span> {{ scope.row.sparsity }}%
                        </span>
                        <span v-else>
                            <span class="el-icon-error"></span> {{ scope.row.sparsity }}%
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="Updated" align="center">
                    <template slot-scope="scope">
                        {{ scope.row.updated }}
                    </template>
                </el-table-column>
                <el-table-column label="Download" width="110" align="center">
                    <template slot-scope="scope">
                        <el-button-group>
                            <el-button type="primary" icon="el-icon-info" title="Preview" size="mini"></el-button>
                            <el-button type="primary" icon="el-icon-download" title="Import" size="mini"></el-button>
                        </el-button-group>
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
import { getPublicDatasets as ApiGetPublicDatasets } from "@/api/backend";
import { parseTime } from "@/utils";

export default {
    name: "dataset-importer-genular",

    mounted() {
        console.log("mounted: dataset-importer-genular");
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
</style>
