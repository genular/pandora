<template>
    <div class="datasetTab-container">
        <el-row>
            <el-col :span="24" style="margin-top: 15px;">
                <el-tabs v-model="activeDistributionSubTabName" v-if="selectedFeatureSetId > 0" type="card" tab-position="top">
                    <!-- Don't display Tab Pane if we have only one Tab to display and he doesn't satisfy display criteria -->
                    <el-tab-pane
                        v-for="item in distributionTabsMapOptions"
                        v-if="!isTabDisabled(item)"
                        :label="item.label"
                        :key="item.key"
                        :name="item.key"
                        :disabled="isTabDisabled(item)"
                    >
                        <span slot="label"><i :class="item.icon"></i> {{ item.label }}</span>
                        <keep-alive>
                            <sub-tab-pane v-if="activeDistributionSubTabName == item.key" :currentView="item.view" :columnName="item.key" :isTabDisabled="isTabDisabled(item)">
                            </sub-tab-pane>
                            <!-- inactive components will be cached! -->
                        </keep-alive>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import subTabPane from "./components/subTabPane";

export default {
    name: "distributionTab",
    props: {
        jobDetailsData: {
            type: Object,
            default: {}
        }
    },
    components: { subTabPane },
    data() {
        return {
            activeDistributionSubTabName: "distributionTraining",
            distributionTabsMapOptions: [
                {
                    label: this.$t("views.apps.supervised_learning.exploration.components.tabs.distributionTab.index.tabs.distributionTraining.title"),
                    view: "distributionTraining",
                    key: "distributionTraining",
                    icon: "fa fa-balance-scale",
                },
                {
                    label: this.$t("views.apps.supervised_learning.exploration.components.tabs.distributionTab.index.tabs.distributionTesting.title"),
                    view: "distributionTesting",
                    key: "distributionTesting",
                    icon: "fa fa-balance-scale",
                },
                {
                    label: this.$t("views.apps.supervised_learning.exploration.components.tabs.distributionTab.index.tabs.distributionResample.title"),
                    view: "distributionResample",
                    key: "distributionResample",
                    icon: "fa fa-balance-scale",
                }
            ],
        };
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
    },
    computed: {
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
        },
        datasetsTabMapOptions: {
            get() {
                return this.$store.getters.datasetsTabMapOptions;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationDatasetsTabMapOptions", value);
            }
        }
    },
    methods: {

        /**
         * Check if Tab should be disabled
         * Returns true is tab is disabled and false if tab is enabled
         * @param  {[type]}  item [description]
         * @return {Boolean}      [description]
         */
        isTabDisabled(item) {
            return false;
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
.clustering_form {
    .el-form-item {
        margin-bottom: 5px;
        .checkbox_group {
            .el-checkbox {
                float: left;
                min-width: 100px;
            }
        }
        label {
            color: #333333;
            font-weight: 500;
        }
    }
}
</style>
