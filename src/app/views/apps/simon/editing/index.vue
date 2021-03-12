<template>
    <div class="app-container" v-loading="pageLoading" :element-loading-text="$t('globals.page_loading')">
        <el-tabs v-model="activeEditingTabName" type="border-card" class="tab-container">
            <el-tab-pane v-for="item in tabMapOptions" :label="item.label" :key="item.key" :name="item.key" :disabled="isTabDisabled(item)">
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
                    label: "Overview",
                    key: "overviewTab",
                    icon: "el-icon-date",
                },
                {
                    label: "Correlation",
                    key: "correlationTab",
                    icon: "el-icon-date",
                    restriction: "selectedFileDetails",
                    restriction_details: -1,
                },
                {
                    label: "Hierarchical clustering",
                    key: "clusteringTab",
                    icon: "el-icon-date",
                    restriction: "selectedFileDetails",
                    restriction_details: -1,
                },
                {
                    label: "PCA Analysis",
                    key: "pcaAnalysisTab",
                    icon: "el-icon-date",
                    restriction: "selectedFileDetails",
                    restriction_details: -1,
                },
                {
                    label: "t-SNE",
                    key: "tSNETab",
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

            getOverViewAavailableColumns({ selectedFileID: selectedFilesIDs[0] })
                .then((response) => {
                    if (response.data.success === true && typeof response.data.message.columns !== "undefined") {
                        this.selectedFileDetails = {
                            id: selectedFilesIDs[0],
                            columns: response.data.message.columns,
                            summary: response.data.message.summary,
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
}
.is-disabled {
    opacity: 0.25;
    cursor: no-drop !important;
}
</style>
