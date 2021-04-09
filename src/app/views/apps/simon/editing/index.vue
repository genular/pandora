<template>
    <div class="app-container" v-loading="pageLoading" :element-loading-text="$t('globals.page_loading')">
        <el-tabs v-model="activeEditingTabName" type="border-card" class="tab-container">
            <el-tab-pane
                v-for="item in tabMapOptions"
                :label="item.label"
                :key="item.key"
                :name="item.key"
                :disabled="isTabDisabled(item) || selectedFileDetails.columns.length < 1"
            >
                <span slot="label">
                    <i :class="item.icon"></i>
                    {{ item.label }}
                </span>
                <keep-alive>
                    <tab-pane v-if="activeEditingTabName == item.key" :currentView="item.key"></tab-pane>
                    <!-- inactive components will be cached! -->
                </keep-alive>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
import clipboard from "@/utils/clipboard";

import { fetchSelectedFilesDetails as ApiFetchSelectedFilesDetails } from "@/api/backend";
import { getOverViewAavailableColumns } from "@/api/plots";

import tabPane from "./components/tabPane";

export default {
    name: "editing",
    components: { tabPane },
    data() {
        return {
            pageLoading: true,
            tabMapOptions: [
                {
                    label: this.$t("views.apps.simon.editing.components.tabs.overviewTab.title"),
                    key: "overviewTab",
                    icon: "el-icon-date",
                },
                {
                    label: this.$t("views.apps.simon.editing.components.tabs.correlationTab.title"),
                    key: "correlationTab",
                    icon: "el-icon-date",
                    restriction: "selectedFileDetails",
                    restriction_details: -1,
                },
                {
                    label: this.$t("views.apps.simon.editing.components.tabs.clusteringTab.title"),
                    key: "clusteringTab",
                    icon: "el-icon-date",
                    restriction: "selectedFileDetails",
                    restriction_details: -1,
                },
                {
                    label: this.$t("views.apps.simon.editing.components.tabs.pcaAnalysisTab.title"),
                    key: "pcaAnalysisTab",
                    icon: "el-icon-date",
                    restriction: "selectedFileDetails",
                    restriction_details: -1,
                },
                {
                    label: this.$t("views.apps.simon.editing.components.tabs.tSNETab.title"),
                    key: "tSNETab",
                    icon: "el-icon-date",
                    restriction: "selectedFileDetails",
                    restriction_details: -1,
                },
                {
                    label: this.$t("views.apps.simon.editing.components.tabs.umapTab.title"),
                    key: "umapTab",
                    icon: "el-icon-date",
                    restriction: "selectedFileDetails",
                    restriction_details: -1,
                },
            ],
        };
    },
    computed: {
        activeEditingTabName: {
            get() {
                return this.$store.getters.simonEditingActiveTabName;
            },
            set(value) {
                this.$store.dispatch("setSimonEditingActiveTabName", value);
            },
        },
        // Array of selected files from Workspace
        selectedFiles: {
            get() {
                return this.$store.getters.selectedFiles;
            },
            set(value) {
                this.$store.dispatch("setSelectedFiles", value);
            },
        },
        selectedFileDetails: {
            get() {
                return this.$store.getters.selectedFileDetails;
            },
            set(value) {
                this.$store.dispatch("setSelectedFileDetails", value);
            },
        },
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
        this.getFileDetails();
    },
    activated() {
        console.log("activated: " + this.$options.name);
        this.getFileDetails();
    },
    methods: {
        getFileDetails() {
            const selectedFilesIDs = this.selectedFiles.map((x) => x.id);
            // TODO: on new file selected reset selectedFileDetails variable
            if (this.selectedFileDetails.id === selectedFilesIDs[0]) {
                this.pageLoading = false;
                return;
            }
            this.pageLoading = true;
            this.activeEditingTabName = "overviewTab";
            this.selectedFileDetails = { id: null, columns: [], summary: [] };

            getOverViewAavailableColumns({ selectedFileID: selectedFilesIDs[0] })
                .then((response) => {
                    if (response.data.success === true && typeof response.data.message.columns !== "undefined") {
                        this.selectedFileDetails = {
                            id: selectedFilesIDs[0],
                            columns: response.data.message.columns,
                            summary: response.data.message.summary,
                            saveObjectHash: response.data.message.saveObjectHash,
                        };
                        console.log(this.selectedFileDetails);
                    } else {
                        // Something went wrong, cannot fetch details from Server
                        this.$message({
                            message: this.$t("globals.errors.request_general"),
                            type: "error",
                            duration: 10000,
                            showClose: true,
                        });
                    }
                    this.pageLoading = false;
                })
                .catch((error) => {
                    this.$message({
                        message: this.$t("globals.errors.request_general"),
                        type: "error",
                    });
                    console.log(error);
                    this.pageLoading = false;
                });
        },
        isTabDisabled(item) {
            let check = false;
            if (item.restriction !== undefined) {
                let restrictionVariable = false;

                if (Array.isArray(item.restriction)) {
                    console.log("== restriction - step 1");
                    let varCount = 0;
                    item.restriction.forEach((element) => {
                        if (varCount === 0) {
                            if (this[item.restriction] !== undefined) {
                                restrictionVariable = this[item.restriction];
                            }
                        } else {
                            if (restrictionVariable[item.restriction] !== undefined) {
                                restrictionVariable = restrictionVariable[item.restriction];
                            }
                        }
                        varCount++;
                    });
                } else if (this[item.restriction] !== undefined) {
                    console.log("== restriction - step 2");
                    restrictionVariable = this[item.restriction];
                }

                if (restrictionVariable !== false) {
                    console.log("== restriction - step 3");
                    if (Number.isInteger(restrictionVariable)) {
                        console.log("== restriction - step 4");
                        if (restrictionVariable < 1) {
                            check = true;
                        }
                    } else if (Array.isArray(restrictionVariable)) {
                        console.log("== restriction - step 5");
                        let more_or_eq = 0;
                        // If there is nothing in array TAB is always disabled
                        if (restrictionVariable.length < 1) {
                            console.log("== restriction - step 6");
                            check = true;
                            return check;
                        }
                        if (item.restriction_details !== undefined) {
                            console.log("== restriction - step 7");
                            if (restrictionVariable.length < item.restriction_details) {
                                console.log("== restriction - step 8");
                                check = true;
                                return check;
                            }
                        }
                    } else {
                        console.log("== restriction - step 9");
                        check = restrictionVariable === 0;
                    }
                }
            }
            return check;
        },
        copyToClipboard(content, event) {
            clipboard(content, event);
        },
    },
};
</script>

<style rel="stylesheet/scss" lang="scss">
@import "~scss_vars";

.tab-container {
    min-height: 500px;
    height: 100%;

    .el-form-item--small .el-form-item__label {
        line-height: 32px;
        font-weight: normal;
        color: #413053;
    }
}
.is-disabled {
    opacity: 0.25;
    cursor: no-drop !important;
}

.el-select__tags-text {
    display: inline-flex;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 125px;
    white-space: nowrap;
}

.el-tooltip__popper.is-light[x-placement^="top"] .popper__arrow {
    border-top-color: transparent !important;
    border: 0 !important;
}

.el-tooltip__popper.is-light[x-placement^="top"] .popper__arrow:after {
    border-top-color: transparent !important;
    border: 0 !important;
}

.download_tooltip {
    background: none !important;
    border: none !important;
    border-top-color: transparent !important;
}
.plot-placeholder {
    text-align: center;
    height: 100%;
    font-size: 256px;
    opacity: 0.2;

    i {
        margin: 0 auto;
        margin-top: 50px;
    }
}

.item_danger {
    opacity: 0.4;
}

.is_tab_active {
    opacity: 0.1;
}
.code-output {
    max-height: 1000px;
    font-size: 12px;
    margin-top: 15px;
    text-align: left;

    .highlight_code {
        font-family: monospace;
        white-space: pre;
        background-color: #20262e;
        color: #afff00;
        border-radius: 15px;
        padding: 10px;
        font-size: 14px;
        overflow: auto;
    }

    .code-header {
        font-size: 16px;
        padding-bottom: 15px;
    }
}

.box-column-item {
    margin-top: 10px;

    .box-column-item-text {
        font-size: 14px;
        padding-top: 5px;

        .box-column-item-details {
            float: right;
        }
    }
}
</style>
