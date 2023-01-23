<template>
    <div class="samrAnalysisTab-container">
        <div v-if="!isTabDisabled">
            <el-row type="flex" align="top" :gutter="20">
                <el-col :span="7" v-loading="loadingOptions" element-loading-text="Processing">
                    <el-form ref="settingsForm" :model="settingsForm" label-width="200px">
                        <el-form-item label="k-fold size">
                            <el-slider
                                v-model="settingsForm.kFolds.value"
                                :min="settingOptions.kFolds.min"
                                :max="settingOptions.kFolds.max"
                                :step="settingOptions.kFolds.step"
                                show-input
                            >
                            </el-slider>
                        </el-form-item>
                        <el-form-item label="CV Repeats">
                            <el-slider
                                v-model="settingsForm.cvRepeats.value"
                                :min="settingOptions.cvRepeats.min"
                                :max="settingOptions.cvRepeats.max"
                                :step="settingOptions.cvRepeats.step"
                                show-input
                            >
                            </el-slider>
                        </el-form-item>
                        <el-form-item label="TuneLength">
                            <el-slider
                                v-model="settingsForm.tuneLength.value"
                                :min="settingOptions.tuneLength.min"
                                :max="settingOptions.tuneLength.max"
                                :step="settingOptions.tuneLength.step"
                                show-input
                            >
                            </el-slider>
                        </el-form-item>
                        <el-form-item label="Random Seed">
                            <el-input-number v-model="settingsForm.random_seed" :min="1" :max="10000"> </el-input-number>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" :loading="loadingResults" round @click="recalculateCatBoost">Calculate</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="17" v-loading="loadingResults" element-loading-text="Processing">
                    <el-row>
                        <el-col :span="24" style="text-align: center;">
                            TODO
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </div>
        <!-- ELSE if Tab is DISABLED -->
        <div v-else>
            <el-alert title="Notification" description="Unfortionatly this function is currently disabled" type="warning" style="margin-top: 20px;" show-icon :closable="false">
            </el-alert>
        </div>
    </div>
</template>
<script>
import { fetchCatBoostFormOptions, submitCatBoostJob } from "@/api/analysis";

export default {
    name: "catBoostTab",
    props: {
        columnName: {
            type: String,
            default: ""
        },
        isTabDisabled: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            loadingOptions: true,
            loadingResults: false,
            settingOptions: {
                kFolds: {
                    min: 1,
                    max: 5,
                    value: 5,
                    step: 1
                },
                cvRepeats: {
                    min: 1,
                    max: 3,
                    value: 3,
                    step: 1
                },
                tuneLength: {
                    min: 1,
                    max: 5,
                    value: 5,
                    step: 1
                },
                random_seed: 1337
            },
            settingsForm: {
                kFolds: {
                    value: 5
                },
                cvRepeats: {
                    value: 3
                },
                tuneLength: {
                    value: 5
                },
                random_seed: 1337
            }
        };
    },
    mounted() {
        console.log("mounted: catBoostTab");
        if (!this.isTabDisabled) {
            this.handleFetchFormOptions();
        }
    },
    computed: {
        selectedFeatureSetId: {
            get() {
                return this.$store.getters.pandoraExplorationSelectedFeatureSetId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedFeatureSetId", value);
            }
        }
    },
    methods: {
        recalculateCatBoost() {
            this.handleSubmitCatBoosJob();
        },
        handleSubmitCatBoosJob() {
            this.loadingResults = true;
            submitCatBoostJob({ resampleID: this.selectedFeatureSetId, settings: encodeURIComponent(window.btoa(JSON.stringify(this.settingsForm))) })
                .then(response => {
                    if (response.data.status === "success") {
                        this.resultsData = response.data.message;
                        this.resultsData.request = JSON.stringify(this.resultsData.request, null, 2);
                    } else {
                        console.log(response.data);
                    }
                    this.loadingResults = false;
                })
                .catch(error => {
                    console.log(error);
                    this.loadingResults = false;
                });
        },
        handleFetchFormOptions() {
            this.loadingOptions = true;
            fetchCatBoostFormOptions()
                .then(response => {
                    if (response.data.status === "success") {
                        console.log(response.data.message);

                        this.settingOptions = response.data.message;
                    } else {
                        console.log(response.data);
                    }
                    this.loadingOptions = false;
                })
                .catch(error => {
                    console.log(error);
                    this.loadingOptions = false;
                });
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss"></style>
