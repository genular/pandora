<template>
    <div class="app-container" v-loading="explorationLoading" :element-loading-text="$t('globals.page_loading')">
        <el-row type="flex" align="middle">
            <el-col :span="24">
                <el-tooltip style="float: left;" placement="top" v-if="selectedQueueIDs">
                    <div slot="content">{{ $t("globals.buttons.copy") }}</div>
                    <el-button
                        style="cursor: copy; float: left;border: 0 none;background-color: #e3006e; color: #FFFFFF;"
                        size="small"
                        @click="copyToClipboard(selectedQueueIDs, $event)"
                    >
                        {{ $t("views.apps.simon.exploration.header.selected_queue") }}: {{ selectedQueueIDs }}
                    </el-button>
                </el-tooltip>
                <el-tooltip style="float: left;" placement="top" v-if="selectedFeatureSetId > 0">
                    <div slot="content">{{ $t("globals.buttons.copy") }}</div>
                    <el-button style="cursor: copy;" class="animated flipInX" type="success" size="small" @click="copyToClipboard(selectedFeatureSetId, $event)"
                        >{{ $t("views.apps.simon.exploration.header.selected_dataset") }}: {{ selectedFeatureSetId }}</el-button
                    >
                </el-tooltip>
                <el-tooltip style="float: right;" placement="top" v-if="selectedModelsIDs.length > 0">
                    <div slot="content">{{ $t("globals.buttons.copy") }}</div>
                    <el-button style="cursor: copy;" type="success" class="animated flipInX" size="small" @click="copyToClipboard(JSON.stringify(selectedModelsIDs), $event)">
                        {{ $t("views.apps.simon.exploration.header.selected_models") }}: {{ selectedModelsIDs.join(", ") }}
                    </el-button>
                </el-tooltip>
                <el-select
                    style="float: left; width: auto;min-width: 535px;margin-left: 10px;"
                    v-model="jobDetailsData.performance"
                    multiple
                    filterable
                    size="small"
                    :loading="explorationLoading"
                    :placeholder="$t('globals.performanceVariables.placeholder')"
                >
                    <el-option
                        v-for="item in jobDetailsData.performaceVariables"
                        :key="item"
                        :value="item"
                        :label="$t(['globals.performanceVariables.options.', item, '.title'].join(''))"
                    >
                        <span>{{ $t("globals.performanceVariables.options." + item + ".title") }}</span>
                    </el-option>
                </el-select>
            </el-col>
        </el-row>
        <br />
        <el-tabs v-model="activeTabName" type="border-card" class="tab-container">
            <el-tab-pane v-for="item in tabMapOptions" :label="item.label" :key="item.key" :name="item.key" :disabled="isTabDisabled(item)">
                <span slot="label"><i :class="item.icon"></i> {{ item.label }}</span>
                <keep-alive>
                    <tab-pane v-if="activeTabName == item.key" :currentView="item.key" :jobDetailsData="jobDetailsData"></tab-pane>
                    <!-- inactive components will be cached! -->
                </keep-alive>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
import clipboard from "@/utils/clipboard";

import { fetchQueueExplorationDetails as ApiFetchQueueExplorationDetails } from "@/api/backend";

import tabPane from "./components/tabPane";

export default {
    name: "exploration",
    components: { tabPane },
    data() {
        return {
            explorationLoading: true,
            tabMapOptions: [
                { label: "Datasets", key: "datasetsTab", icon: "el-icon-date", restriction: ["jobDetailsData", "resamplesList"] },
                {
                    label: "Correlation",
                    key: "correlationTab",
                    icon: "el-icon-date",
                    restriction: "selectedFeatureSetId"
                },
                {
                    label: "Clustering",
                    key: "clusteringTab",
                    icon: "el-icon-date",
                    restriction: "selectedFeatureSetId"
                },
                {
                    label: "Data distribution",
                    key: "distributionTab",
                    icon: "el-icon-date",
                    restriction: "selectedFeatureSetId"
                }
            ],

            jobDetailsData: {
                // Returned from server
                resamplesList: [],
                modelsList: [],
                queueDetails: {},
                performaceVariables: [],
                // In the JS
                resampleModels: [],
                // Array of selected performaceVariables
                performance: []
            }
        };
    },
    computed: {
        activeTabName: {
            get() {
                return this.$store.getters.simonExplorationActiveTabName;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationnActiveTabName", value);
            }
        },
        selectedQueueIDs: {
            get() {
                return this.$store.getters.simonExplorationQueueIDs;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationQueueIDs", value);
            }
        },
        selectedFeatureSetId: {
            get() {
                return this.$store.getters.simonExplorationSelectedFeatureSetId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedFeatureSetId", value);
            }
        },
        selectedModelsIDs: {
            get() {
                return this.$store.getters.simonExplorationSelectedModelId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedModelId", value);
            }
        }
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
        this.resetExploration();
    },
    activated() {
        console.log("activated: " + this.$options.name);
        this.resetExploration();
    },
    methods: {
        resetExploration() {
            // Check if new queue is selected if we already have loaded queue details
            if (typeof this.jobDetailsData.queueDetails.id !== "undefined") {
                // If completely new queue is selected
                if (this.selectedQueueIDs !== this.jobDetailsData.queueDetails.id) {
                    console.log("Reseting exploration variables");
                    this.selectedFeatureSetId = 0;
                    this.jobDetailsData = {
                        // Returned from server
                        resamplesList: [],
                        modelsList: [],
                        queueDetails: {},
                        performaceVariables: [],
                        // In the JS
                        resampleModels: [],
                        // Array of selected performaceVariables
                        performance: []
                    };
                    // Reset any selected models for the resample
                    this.selectedModelsIDs = [];
                    this.activeTabName = "datasetsTab";
                    this.getDatasetResamples();
                }
            } else {
                console.log("Fetching queue exploration details for first time (resetExploration)");
                // in case user is back on page and he didn't changed selection
                this.selectedFeatureSetId = 0;
                // Reset any selected models for the resample
                this.selectedModelsIDs = [];
                this.activeTabName = "datasetsTab";
                
                this.getDatasetResamples();
            }
        },
        getDatasetResamples() {
            console.log("getDatasetResamples: " + this.selectedQueueIDs);

            this.explorationLoading = true;
            ApiFetchQueueExplorationDetails({ queueID: this.selectedQueueIDs, measurements: [] })
                .then(response => {
                    if (response.data.success === true) {
                        this.jobDetailsData.resamplesList = response.data.message.resamplesList;
                        this.jobDetailsData.modelsList = response.data.message.modelsList;
                        this.jobDetailsData.queueDetails = response.data.message.queueDetails;
                        this.jobDetailsData.performaceVariables = response.data.message.performaceVariables;

                        console.log("Trying to preselect performance variables:");
                        // Preselect if nothing selected.. eg. first run
                        if (this.jobDetailsData.performance.length < 1) {
                            let prefferedVariables = ["Accuracy", "PredictAUC", "Sensitivity", "Specificity", "Recall"];
                            this.jobDetailsData.performance = [];

                            prefferedVariables.forEach((item, index) => {
                                if(this.jobDetailsData.performaceVariables.includes(item)){
                                    this.jobDetailsData.performance.push(item)
                                }
                            });

                            // If some performance variables are missing from default ones take the remaining from server return data
                            const preselectDifference = (5 - this.jobDetailsData.performance.length);

                            if(preselectDifference > 0 && this.jobDetailsData.performaceVariables.length >= preselectDifference){
                                let addCount = 0;
                               this.jobDetailsData.performaceVariables.forEach((item, index) => {
                                    if(this.jobDetailsData.performance.includes(item) === false && addCount < preselectDifference){
                                        this.jobDetailsData.performance.push(item);
                                        addCount++;
                                    }
                                });

                            }
                        }
                    } else {
                        // Something went wrong, cannot fetch details from Server
                        this.$message({
                            message: this.$t("globals.errors.request_general"),
                            type: "error",
                            duration: 10000,
                            showClose: true
                        });

                        this.$router.push({
                            path: "/dashboard"
                        });
                    }
                    this.explorationLoading = false;
                })
                .catch(error => {
                    console.log(error);
                });
        },
        isTabDisabled(item) {
            let check = false;
            if (item.restriction !== undefined) {
                let restrictionVariable = false;

                if (Array.isArray(item.restriction)) {
                    let varCount = 0;
                    item.restriction.forEach(element => {
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
                    restrictionVariable = this[item.restriction];
                }

                if (restrictionVariable !== false) {
                    if (Number.isInteger(restrictionVariable)) {
                        if (restrictionVariable < 1) {
                            check = true;
                        }
                    } else if (Array.isArray(restrictionVariable)) {
                        let more_or_eq = 0;
                        // If there is nothing in array TAB is always disabled
                        if (restrictionVariable.length < 1) {
                            check = true;
                            return check;
                        }
                        if (item.restriction_details !== undefined) {
                            if (restrictionVariable.length < item.restriction_details) {
                                check = true;
                                return check;
                            }
                        }
                    } else {
                        check = restrictionVariable === 0;
                    }
                }
            }
            return check;
        },
        copyToClipboard(content, event) {
            clipboard(content, event);
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
@import "~scss_vars";

.tab-container {
    min-height: 500px;
}
.is-disabled {
    opacity: 0.25;
    cursor: no-drop !important;
}
</style>
