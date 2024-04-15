<template>
    <div class="app-container" v-loading="explorationLoading" :element-loading-text="$t('globals.page_loading')">
        <el-row type="flex" align="middle">
            <el-col :span="12">
                <el-select v-model="selectedOutcomeOptionsIDs" collapse-tags size="large" multiple placeholder="Outcome class" @change="getDatasetResamples">
                    <el-option v-for="item in selectedOutcomeOptions" :key="item.id" :label="'Outcome: ' + item.class_original" :value="item.id">
                    </el-option>
                </el-select>
                <el-select style="padding-left: 10px; width: auto;"  v-model="jobDetailsData.performance" multiple filterable collapse-tags size="large" :loading="explorationLoading" :placeholder="$t('globals.performanceVariables.placeholder')">
                    <el-option v-for="item in jobDetailsData.performaceVariables" :key="item" :value="item" :label="$t(['globals.performanceVariables.options.', item, '.title'].join(''))">
                        <span>{{ $t("globals.performanceVariables.options." + item + ".title") }}</span>
                    </el-option>
                </el-select>
            </el-col>
            <el-col :span="12" style="text-align: right;">
                <el-tooltip placement="top" v-if="selectedQueueID">
                    <div slot="content">{{ $t("globals.buttons.copy") }}</div>
                    <el-button style="cursor: copy; border: 0 none; background-color: #e3006e; color: #ffffff" size="large" @click="copyToClipboard(selectedQueueID, $event)">
                        {{ $t("views.apps.supervised_learning.exploration.header.selected_queue") }}: {{ selectedQueueID }}
                    </el-button>
                </el-tooltip>
                <el-tooltip placement="top" v-if="selectedFeatureSetId > 0">
                    <div slot="content">{{ $t("globals.buttons.copy") }}</div>
                    <el-button style="cursor: copy" class="animated flipInX" type="success" size="large" @click="copyToClipboard(selectedFeatureSetId, $event)">
                        {{ $t("views.apps.supervised_learning.exploration.header.selected_dataset") }}: {{ selectedFeatureSetId }}
                    </el-button>
                </el-tooltip>
                <el-tooltip placement="top" v-if="selectedModelsIDs.length > 0">
                    <div slot="content">{{ $t("globals.buttons.copy") }}</div>
                    <el-button style="cursor: copy" type="success" class="animated flipInX" size="large" @click="copyToClipboard(JSON.stringify(selectedModelsIDs), $event)">
                        {{ $t("views.apps.supervised_learning.exploration.header.selected_models") }}: {{ selectedModelsIDs.join(", ") }}
                    </el-button>
                </el-tooltip>
            </el-col>
        </el-row>
        <br />
        <el-tabs v-model="activeTabName" type="border-card" class="tab-container">
            <el-tab-pane v-for="item in tabMapOptions" :label="item.label" :key="item.key" :name="item.key" :disabled="isTabDisabled(item)">
                <span slot="label">
                    <i :class="item.icon"></i>
                    {{ item.label }}
                </span>
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
                // {
                //     label: "Correlation",
                //     key: "correlationTab",
                //     icon: "el-icon-date",
                //     restriction: "selectedFeatureSetId",
                // },
                // {
                //     label: "Clustering",
                //     key: "clusteringTab",
                //     icon: "el-icon-date",
                //     restriction: "selectedFeatureSetId",
                // },
                // {
                //     label: "Data distribution",
                //     key: "distributionTab",
                //     icon: "el-icon-date",
                //     restriction: "selectedFeatureSetId",
                // },
            ],

            initialMeasurements: [],

            jobDetailsData: {
                // Returned from server
                resamplesList: [],
                modelsList: [],
                queueDetails: {},
                performaceVariables: [],
                // In the JS
                resampleModels: [],
                // Array of selected performaceVariables
                performance: [],
            },
        };
    },
    computed: {
        activeTabName: {
            get() {
                return this.$store.getters.pandoraExplorationActiveTabName;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationnActiveTabName", value);
            },
        },
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
            console.log("Current selectedModelsIDs:", this.selectedModelsIDs);
            // Check if new queue is selected if we already have loaded queue details
            if (typeof this.jobDetailsData.queueDetails.id !== "undefined") {
                // If completely new queue is selected
                if (this.selectedQueueID !== this.jobDetailsData.queueDetails.id) {
                    console.log("Resting exploration variables");
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
                }
            } else {
                console.log("Fetching queue exploration details for first time (resetExploration)");
                // in case user is back on page and he didn't changed selection
                this.selectedFeatureSetId = 0;
                // Reset any selected models for the resample
                this.selectedModelsIDs = [];
            }

             this.$nextTick(() => {
                this.activeTabName = "datasetsTab";
                this.getDatasetResamples();
                this.selectedOutcomeOptionsIDs = [0];
            });

        },
        getDatasetResamples() {
            console.log("getDatasetResamples: " + this.selectedQueueID);

            this.jobDetailsData.performance = [];

            this.explorationLoading = true;
            ApiFetchQueueExplorationDetails({ queueID: this.selectedQueueID, measurements: this.initialMeasurements, selectedOutcomeOptionsIDs: this.selectedOutcomeOptionsIDs })
                .then((response) => {
                    if (response.data.success === true) {
                        this.jobDetailsData.resamplesList = response.data.message.resamplesList;
                        this.jobDetailsData.modelsList = response.data.message.modelsList;
                        this.jobDetailsData.queueDetails = response.data.message.queueDetails;
                        this.jobDetailsData.performaceVariables = response.data.message.performaceVariables;

                        console.log("Trying to preselect performance variables:");
                        if (this.jobDetailsData.queueDetails.outcomeMappings && this.jobDetailsData.queueDetails.outcomeMappings.length > 0) {

                            console.log("Outcome mappings found!");
                            console.log(this.jobDetailsData.queueDetails.outcomeMappings);

                            // Copy the first outcomeMapping and modify it as needed
                            let newOutcomeOption = { ...this.jobDetailsData.queueDetails.outcomeMappings[0] };
                            newOutcomeOption.id = 0;
                            newOutcomeOption.class_original = "Overall";
                            newOutcomeOption.class_remapped = "overall";

                            // Prepare selectedOutcomeOptions by mapping outcomeMappings
                            this.selectedOutcomeOptions = this.jobDetailsData.queueDetails.outcomeMappings.map(mapping => ({
                                id: mapping.id,
                                drid: mapping.drid,
                                class_column: mapping.class_column,
                                class_type: mapping.class_type,
                                class_original: mapping.class_original,
                                class_remapped: mapping.class_remapped
                            }));

                            // Add the modified copy to the beginning of the array
                            this.selectedOutcomeOptions.unshift(newOutcomeOption);
                        }
                        // Preselect if nothing selected, e.g., first run
                        if (this.jobDetailsData.performance.length < 1) {
                            const preferredVariables = ["Accuracy", "PredictAUC", "Sensitivity", "Specificity", "Recall"];
                            this.jobDetailsData.performance = [];

                            // Add preferred variables if they exist in performaceVariables
                            preferredVariables.forEach(item => {
                                if (this.jobDetailsData.performaceVariables.includes(item)) {
                                    this.jobDetailsData.performance.push(item);
                                }
                            });

                            // Calculate the number of variables still needed to preselect
                            const neededVars = 5 - this.jobDetailsData.performance.length;

                            // Add more variables from performaceVariables if needed, avoiding duplicates
                            if (neededVars > 0) {
                                const additionalVars = this.jobDetailsData.performaceVariables.filter(item => 
                                    !this.jobDetailsData.performance.includes(item)
                                ).slice(0, neededVars);
                                
                                this.jobDetailsData.performance = [...this.jobDetailsData.performance, ...additionalVars];
                            }
                        }

                    } else {
                        // Something went wrong, cannot fetch details from Server
                        this.$message({
                            message: this.$t("globals.errors.request_general"),
                            type: "error",
                            duration: 10000,
                            showClose: true,
                        });

                        // this.$router.push({
                        //     path: "/dashboard",
                        // });
                    }
                    this.explorationLoading = false;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        isTabDisabled(item) {
            let check = false;
            if (item.restriction !== undefined) {
                let restrictionVariable = false;

                if (Array.isArray(item.restriction)) {
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
