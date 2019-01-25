<template>
    <div class="samrAnalysisTab-container">
        <el-row v-if="tabEnabled">
            <el-row type="flex" align="top">
                    <el-col :span="7">
                        <el-form ref="settingsForm" :model="settingsForm" label-width="200px">
                            <el-form-item label="Delta Slider">
                                <el-slider
                                    v-model="settingsForm.deltaInput.value"
                                    :min="settingOptions.deltaInput.min"
                                    :max="settingOptions.deltaInput.max"
                                    :step="settingOptions.deltaInput.step"
                                    show-input>
                                </el-slider>
                            </el-form-item>
                            <el-form-item label="Response Type">
                                <el-select v-model="settingsForm.responseType_array" placeholder="Select">
                                    <el-option
                                        v-for="(item, index) in settingOptions.responseType_array"
                                        :key="index"
                                        :label="item"
                                        :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Analysis Type">
                                <el-select v-model="settingsForm.testStatistic" placeholder="Select">
                                    <el-option
                                        v-for="(item, index) in settingOptions.testStatistic"
                                        :key="index"
                                        :label="item"
                                        :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Median center the arrays">
                                <el-select v-model="settingsForm.centerArrays" placeholder="Select">
                                    <el-option
                                        v-for="(item, index) in settingOptions.centerArrays"
                                        :key="index"
                                        :label="item"
                                        :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="K-Nearest Neighbors">
                                <el-slider
                                    v-model="settingsForm.numberOfNeighbors.value"
                                    :min="settingOptions.numberOfNeighbors.min"
                                    :max="settingOptions.numberOfNeighbors.max"
                                    :step="settingOptions.numberOfNeighbors.step"
                                    show-input>
                                </el-slider>
                            </el-form-item>
                           <el-form-item label="Number of Permutations">
                                <el-input-number
                                    v-model="settingsForm.nperms.value"
                                    :step="settingOptions.nperms.step"
                                    :max="settingOptions.nperms.max"
                                    :min="settingOptions.nperms.min">
                               </el-input-number>
                            </el-form-item>
                           <el-form-item label="Random Seed">
                                <el-input-number
                                    v-model="settingsForm.random_seed"
                                    :min="1"
                                    :max="10000">
                                </el-input-number>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" :loading="inProgress" round @click="recalculateSAM">Calculate</el-button>
                            </el-form-item>
                        </el-form>
                    </el-col>
                    <el-col :span="17">
                        <el-col :span="24" v-loading="loadingPlot" element-loading-text="Processing..." style="text-align: center;">
                            <object id="sam-svg" style="margin: 0 auto;" :data="renderedImage" type="image/svg+xml"></object>
                        </el-col>
                    </el-col>
            </el-row>
        </el-row>
        <!-- ELSE if Tab is DISABLED -->
        <el-row v-else>
            <el-col :span="24">
                <el-alert title="Notification:" description="This function is disabled for selected feature set since its still not supported to calculate correlation for sets that have more than 250 features." type="warning" style="margin-top: 20px;" show-icon :closable="false"> </el-alert>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { fetchSamrFormOptions, submitSAMJob, fetchSAMJob } from "@/api/analysis";
import { md5String } from "@/utils";

export default {
    name: "samrAnalysisTab",

    data() {
        return {
            tabEnabled: false,
            inProgress: false,
            loadingOptions: true,
            settingOptions: {
                deltaInput: {
                    value: 0,
                    min: 0,
                    max: 10,
                    step: 0.01
                },
                responseType_array: [
                    "Quantitative",
                    "Two class unpaired",
                    "Survival",
                    "Multiclass",
                    "One class",
                    "Two class paired",
                    "Two class unpaired timecourse",
                    "One class timecourse",
                    "Two class paired timecourse",
                    "Pattern discovery"
                ],
                testStatistic: ["T-statistic", "Wilcoxon"],
                centerArrays: ["No", "Yes"],

                numberOfNeighbors: {
                    value: 10,
                    min: 1,
                    max: 30,
                    step: 1
                },
                nperms: {
                    value: 100,
                    min: 25,
                    max: 1000,
                    step: 10
                },
                "random_seed": 6187
            },
            settingsForm: {
                deltaInput: {
                    value: 0
                },
                responseType_array: "Two class unpaired",
                testStatistic: "T-statistic",
                centerArrays: "No",
                numberOfNeighbors: {
                    value: 10
                },
                nperms: {
                    value: 100,
                },
                "random_seed": 6187
            },
            // Timer to check if Process is finished!
            jobInterval: null,
            loadingPlot: true,
            renderedImage: "",
        };
    },
    mounted() {
        console.log("mounted: samrAnalysisTab");
        this.tabEnabled = true;


        if(this.renderedImage === ""){
            this.recalculateSAM();
        }
    },
    computed: {
        selectedFeatureSetId: {
            get() {
                return this.$store.getters.simonExplorationSelectedFeatureSetId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedFeatureSetId", value);
            }
        }
    },
    methods: {
        recalculateSAM(){
            this.handleSubmitSAMJob();
        },
        handleSubmitSAMJob(){
            this.loadingPlot = true;
            submitSAMJob({ resampleID: this.selectedFeatureSetId, settings: JSON.stringify(this.settingsForm) })
                .then((response) => {
                    // Update the image data.
                    this.renderedImageData = new Buffer(response.data, "base64")
                        .toString("ascii")
                        .replace(/(\r\n|\n|\r)/gm, "")
                        .trim();

                    this.renderedImage = "data:image/svg+xml;utf8," + this.renderedImageData;
                    this.loadingPlot = false;
                })
                .catch((error) => {
                    console.log(error);
                    this.loadingPlot = false;
                });
        },
        handleFetchFormOptions(){
            this.loadingOptions = true;
            fetchSamrFormOptions()
                .then((response) => {
                    if (response.data.status === "success") {
                        this.settingOptions = response.data.data;
                    } else {
                        console.log(response.data);
                    }
                    this.loadingOptions = false;
                })
                .catch((error) => {
                    console.log(error);
                    this.loadingOptions = false;
                });
        },
        handleFetchSAMJob() {

        }
    }
};
</script>
<style rel='stylesheet/scss' lang='scss'>


</style>
