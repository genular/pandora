<template>
    <div class="app-container" v-loading.fullscreen.lock="loading" :element-loading-text="$t('globals.page_loading')">
        <el-row type="flex" align="middle">
            <el-col :span="24">
                <el-tooltip style="float: left;" placement="top" v-if="explorationJobId">
                    <div slot="content">{{ $t("globals.buttons.copy") }}</div>
                    <el-button style="cursor: copy;" type="success" size="small" @click="copyToClipboard(explorationJobId, $event)"
                        >{{ $t("views.apps.simon.exploration.header.selected_queue") }}: {{ explorationJobId }}</el-button
                    >
                </el-tooltip>
                <el-tooltip style="float: left;" placement="top" v-if="selectedFeatureSetId > 0">
                    <div slot="content">{{ $t("globals.buttons.copy") }}</div>
                    <el-button style="cursor: copy;" type="success" size="small" @click="copyToClipboard(selectedFeatureSetId, $event)"
                        >{{ $t("views.apps.simon.exploration.header.selected_dataset") }}: {{ selectedFeatureSetId }}</el-button
                    >
                </el-tooltip>
                <el-tooltip style="float: right;" placement="top" v-if="selectedModelsIDs.length > 0">
                    <div slot="content">{{ $t("globals.buttons.copy") }}</div>
                    <el-button style="cursor: copy;" type="success" size="small" @click="copyToClipboard(JSON.stringify(selectedModelsIDs), $event)">
                        {{ $t("views.apps.simon.exploration.header.selected_models") }}: {{ selectedModelsIDs.join(", ") }}
                    </el-button>
                </el-tooltip>
                <el-select
                    style="float: left; width: auto;min-width: 535px;margin-left: 10px;"
                    v-model="jobDetailsData.performance"
                    multiple
                    filterable
                    size="small"
                    :placeholder="$t('globals.performanceVariables.placeholder')"
                >
                    <el-option
                        v-for="item in performanceVariables"
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
        <el-tabs v-model="activeTabName" v-if="jobDetailsData.resamplesList.length > 0" type="border-card" class="tab-container">
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
            tabMapOptions: [
                { label: "Datasets", key: "datasetsTab", icon: "el-icon-date" },
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
                }
            ],
            performanceVariables: [],

            loading: true,
            jobDetailsData: {
                //feature_sets: [],
                resamplesList: [],
                //model_details: [],
                resampleModels: [],
                //all_models: [],
                modelsList: [],
                //process_queue: []
                queueDetails: {},
                performance: []
            }
        };
    },
    mounted() {
        console.log("mounted: exploration");
        this.handleFetchJobDetails();
    },
    activated() {
        console.log("activated: exploration");
        console.log(this.jobDetailsData.resamplesList.length);
        if (this.jobDetailsData.resamplesList.length < 1) {
            // this.handleFetchJobDetails();
        }
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
    methods: {
        isTabDisabled(item) {
            let check = false;
            if (item.restriction !== undefined) {
                if (this[item.restriction] !== undefined) {
                    check = this[item.restriction] === 0;
                }
            }
            return check;
        },
        handleFetchJobDetails() {
            ApiFetchQueueExplorationDetails({ queueID: this.explorationJobId, measurements: this.measurements })
                .then(response => {
                    if (response.data.success === true) {
                        this.jobDetailsData.resamplesList = response.data.message.resamplesList;
                        this.jobDetailsData.queueDetails = response.data.message.queueDetails;
                        this.jobDetailsData.modelsList = response.data.message.modelsList;

                        this.performanceVariables = response.data.message.performaceVariables;
                        // Preselect if nothing selected.. eg. first run
                        if (this.jobDetailsData.performance.length < 1) {
                            this.jobDetailsData.performance = ["Accuracy", "PredictAUC", "Sensitivity", "Specificity", "Recall"];
                        }

                        const prevSelectedFeatureSetId = this.selectedFeatureSetId;

                        // Preselect 1st resample dataset:
                        this.selectedFeatureSetId = this.jobDetailsData.resamplesList[0].resampleID;
                        // Clear selected models if new Feature Set is selected
                        if (prevSelectedFeatureSetId !== this.selectedFeatureSetId) {
                            this.selectedModelsIDs = [];
                        }

                        this.jobDetailsData.resampleModels[this.selectedFeatureSetId] = this.jobDetailsData.modelsList.filter(
                            modelItem => modelItem.resampleID === this.selectedFeatureSetId
                        );
                    } else {
                        // Something went wrong, cannot fetch details from Server
                        this.$message({
                            message: this.$t("globals.errors.request_general"),
                            type: "error",
                            duration: 10000,
                            showClose: true
                        });
                        this.explorationJobId = "";
                        this.jobDetailsData.resamplesList = [];

                        this.$router.push({
                            path: "/dashboard"
                        });
                    }
                    this.loading = false;
                })
                .catch(error => {
                    console.log(error);
                });
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
