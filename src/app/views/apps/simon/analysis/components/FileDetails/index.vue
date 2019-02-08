<template>
    <div>
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <el-row type="flex" align="middle">
                    <el-col :span="24">
                        <span>{{ $t("views.apps.simon.analysis.components.FileDetails.head.title") }}:</span>
                    </el-col>
                </el-row>

                <el-row type="flex" align="bottom" class="stat-badges">
                    <el-col :span="20">
                        <small>{{ $t("views.apps.simon.analysis.components.FileDetails.head.description") }}</small>
                        <div class="formula-placeholder" v-if="regressionFormula !== '' || classificationFormula.length > 0">
                            <div v-if="regressionFormula !== ''">
                                <div class="formula-title">Regression</div>
                                <el-tag class="formula-tag" type="info" size="mini">{{ regressionFormula }}</el-tag>
                            </div>
                            <div v-if="classificationFormula.length > 0">
                                <div class="formula-title">Classification</div>
                                <el-tag class="formula-tag" :key="index" v-for="(classificationFormula, index) in classificationFormula" type="info" size="mini">
                                    {{ classificationFormula }}
                                </el-tag>
                            </div>
                        </div>
                    </el-col>
                    <el-col :span="4">
                        <el-button style="float: right" type="primary" size="small" @click="clearSelection">{{
                            $t("views.apps.simon.analysis.components.FileDetails.head.clear")
                        }}</el-button>
                    </el-col>
                </el-row>
            </div>
            <el-row type="flex" align="middle">
                <el-col :span="1" style="min-width: 45px;">
                    <el-switch style="padding-top: 24px;" v-model="filterFeatures"></el-switch>
                </el-col>
                <el-col :span="14" class="analysis-option">
                    <el-tooltip placement="top">
                        <div slot="content">
                            {{ $t("views.apps.simon.analysis.components.FileDetails.body.predictor.description") }}
                        </div>
                        <span class="field-title">{{ $t("views.apps.simon.analysis.components.FileDetails.body.predictor.title") }}</span>
                    </el-tooltip>
                    <el-select
                        class="flud-selects"
                        v-model="selectedFeatures"
                        multiple
                        filterable
                        remote
                        :placeholder="$t('views.apps.simon.analysis.components.FileDetails.body.predictor.placeholder')"
                        size="large"
                        value-key="position"
                        :remote-method="
                            userInput => {
                                filterAvaliableFeaturesDisplay(userInput, 'selectedFeatures');
                            }
                        "
                        :loading="loading['selectedFeatures']"
                        @change="
                            selection => {
                                resampleSelectionChange(selection, 'selectedFeatures');
                            }
                        "
                        @focus="selectAvaliableFeaturesDisplay('selectedFeatures')"
                    >
                        <el-option v-for="item in avaliableFeaturesDisplay" :key="item.position + '_selectedFeatures'" :label="item.original" :value="item">
                            <span style="float: left; padding-left: 5px;">{{ item.original }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px; padding-right: 15px;">{{ $t("views.apps.simon.analysis.components.FileDetails.other.column") }}: {{ item.position }}</span>
                        </el-option>
                    </el-select>
                </el-col>
                <el-col :span="5" class="analysis-option">
                    <span class="field-title"></span>
                    <el-tooltip placement="bottom">
                        <div slot="content">
                            {{ $t("views.apps.simon.analysis.components.FileDetails.body.predictor_exclude.description") }}
                        </div>
                        <span class="field-title">{{ $t("views.apps.simon.analysis.components.FileDetails.body.predictor_exclude.title") }}</span>
                    </el-tooltip>
                    <el-select
                        class="flud-selects"
                        v-model="excludeFeatures"
                        multiple
                        filterable
                        remote
                        :placeholder="$t('views.apps.simon.analysis.components.FileDetails.body.predictor_exclude.placeholder')"
                        size="large"
                        value-key="position"
                        :disabled="!filterFeatures"
                        :remote-method="
                            userInput => {
                                filterAvaliableFeaturesDisplay(userInput, 'excludeFeatures');
                            }
                        "
                        :loading="loading['excludeFeatures']"
                        @change="
                            selection => {
                                resampleSelectionChange(selection, 'excludeFeatures');
                            }
                        "
                        @focus="selectAvaliableFeaturesDisplay('excludeFeatures')"
                    >
                        <el-option v-for="item in avaliableFeaturesDisplay" :key="item.position + '_excludeFeatures'" :label="item.original" :value="item">
                            <span style="float: left; padding-left: 5px;">{{ item.original }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px; padding-right: 15px;">{{ $t("views.apps.simon.analysis.components.FileDetails.other.column") }}: {{ item.position }}</span>
                        </el-option>
                    </el-select>
                </el-col>

                <el-col :span="4" class="analysis-option" style="min-width: 235px;">
                    <span class="field-title" style="width: 100%;float: none;">
                        <el-tooltip placement="bottom">
                            <div slot="content">
                                {{ $t("views.apps.simon.analysis.components.FileDetails.body.partitions.title") }}
                            </div>
                            <span class="field-title">{{ $t("views.apps.simon.analysis.components.FileDetails.body.partitions.description") }}</span>
                        </el-tooltip>
                    </span>
                    <el-slider v-model="selectedPartitionSplit" height="200px" :step="5" :min="50" :max="95" show-input :format-tooltip="formatPartitionSplitTooltip" show-stops>
                    </el-slider>
                </el-col>
            </el-row>
            <el-row type="flex" align="middle">
                <el-col :span="1" style="min-width: 45px;"></el-col>
                <el-col :span="7" class="analysis-option">
                    <el-tooltip placement="bottom">
                        <div slot="content">
                            {{ $t("views.apps.simon.analysis.components.FileDetails.body.response.description") }}
                        </div>
                        <span class="field-title">{{ $t("views.apps.simon.analysis.components.FileDetails.body.response.title") }}</span>
                    </el-tooltip>
                    <el-select
                        class="flud-selects"
                        v-model="selectedOutcome"
                        multiple
                        filterable
                        remote
                        :placeholder="$t('views.apps.simon.analysis.components.FileDetails.body.response.placeholder')"
                        size="large"
                        value-key="position"
                        :remote-method="
                            userInput => {
                                filterAvaliableFeaturesDisplay(userInput, 'selectedOutcome');
                            }
                        "
                        :loading="loading['selectedOutcome']"
                        @change="
                            selection => {
                                resampleSelectionChange(selection, 'selectedOutcome');
                            }
                        "
                        @focus="selectAvaliableFeaturesDisplay('selectedOutcome')"
                    >
                        <el-option v-for="item in avaliableFeaturesDisplay" :key="item.position + '_selectedOutcome'" :label="item.original" :value="item">
                            <span style="float: left; padding-left: 5px;">{{ item.original }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px; padding-right: 15px;">{{ $t("views.apps.simon.analysis.components.FileDetails.other.column") }}: {{ item.position }}</span>
                        </el-option>
                    </el-select>
                </el-col>

                <el-col :span="7" class="analysis-option">
                    <el-tooltip placement="bottom">
                        <div slot="content">
                            {{ $t("views.apps.simon.analysis.components.FileDetails.body.regression.description") }}
                        </div>
                        <span class="field-title">{{ $t("views.apps.simon.analysis.components.FileDetails.body.regression.title") }}</span>
                    </el-tooltip>
                    <el-select
                        class="flud-selects"
                        v-model="selectedFormula"
                        :disabled="true"
                        multiple
                        filterable
                        remote
                        :placeholder="$t('views.apps.simon.analysis.components.FileDetails.body.regression.placeholder')"
                        size="large"
                        value-key="position"
                        :remote-method="
                            userInput => {
                                filterAvaliableFeaturesDisplay(userInput, 'selectedFormula');
                            }
                        "
                        :loading="loading['selectedFormula']"
                        @change="
                            selection => {
                                resampleSelectionChange(selection, 'selectedFormula');
                            }
                        "
                        @focus="selectAvaliableFeaturesDisplay('selectedFormula')"
                    >
                        <el-option v-for="item in avaliableFeaturesDisplay" :key="item.position + '_selectedFormula'" :label="item.original" :value="item">
                            <span style="float: left; padding-left: 5px;">{{ item.original }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px; padding-right: 15px;">{{ $t("views.apps.simon.analysis.components.FileDetails.other.column") }}: {{ item.position }}</span>
                        </el-option>
                    </el-select>
                </el-col>

                <el-col :span="5" class="analysis-option">
                    <span class="field-title"></span>
                    <el-tooltip placement="bottom">
                        <div slot="content">
                            {{ $t("views.apps.simon.analysis.components.FileDetails.body.classes.description") }}
                        </div>
                        <span class="field-title">{{ $t("views.apps.simon.analysis.components.FileDetails.body.classes.title") }}</span>
                    </el-tooltip>
                    <el-select
                        class="flud-selects"
                        v-model="selectedClasses"
                        multiple
                        filterable
                        remote
                        :placeholder="$t('views.apps.simon.analysis.components.FileDetails.body.classes.placeholder')"
                        size="large"
                        value-key="position"
                        :remote-method="
                            userInput => {
                                filterAvaliableFeaturesDisplay(userInput, 'selectedClasses');
                            }
                        "
                        :loading="loading['selectedClasses']"
                        @change="
                            selection => {
                                resampleSelectionChange(selection, 'selectedClasses');
                            }
                        "
                        @focus="selectAvaliableFeaturesDisplay('selectedClasses')"
                    >
                        <el-option v-for="item in avaliableFeaturesDisplay" :key="item.position + '_selectedClasses'" :label="item.original" :value="item">
                            <span style="float: left; padding-left: 5px;">{{ item.original }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px; padding-right: 15px;">{{ $t("views.apps.simon.analysis.components.FileDetails.other.column") }}: {{ item.position }}</span>
                        </el-option>
                    </el-select>
                </el-col>

                <el-col :span="4" class="analysis-option">
                    <el-tooltip placement="bottom">
                        <div slot="content">
                            {{ $t("views.apps.simon.analysis.components.FileDetails.body.preprocessing.description") }}
                        </div>
                        <span class="field-title">{{ $t("views.apps.simon.analysis.components.FileDetails.body.preprocessing.title") }}</span>
                    </el-tooltip>
                    <el-select
                        class="flud-selects"
                        v-model="selectedPreProcess"
                        clearable
                        :placeholder="$t('views.apps.simon.analysis.components.FileDetails.body.preprocessing.placeholder')"
                        size="large"
                        :loading="loading['selectedPreProcess']"
                        multiple
                    >
                        <el-option v-for="item in selectedPreProcessOptions" :key="item.value" :value="item.value" :disabled="item.disabled">
                            <span style="float: left; margin-right: 10px; color: #8492a6; font-size: 13px">{{ item.value }}</span>
                            <span style="float: right;">{{ $t("views.apps.simon.analysis.components.FileDetails.body.preprocessing.dropdown." + item.value) }}</span>
                        </el-option>
                    </el-select>
                </el-col>
            </el-row>
        </el-card>
        <el-dialog :title="$t('views.apps.simon.analysis.components.FileDetails.dialog.title')" :visible.sync="notEnoughSamplesDialog" width="35%" center>
            <div class="tip">
                <p>
                    {{ $t("views.apps.simon.analysis.components.FileDetails.dialog.head") }}
                    <br />
                    {{ $t("views.apps.simon.analysis.components.FileDetails.dialog.content_1") }}: <strong>{{ selectedFeatures.join(", ") }}</strong>

                    <br /><br />
                    {{ $t("views.apps.simon.analysis.components.FileDetails.dialog.content_2") }} <br /><br />
                    {{ $t("views.apps.simon.analysis.components.FileDetails.dialog.content_3") }}
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="danger" @click="notEnoughSamplesDialog = false">Confirm</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import clipboard from "@/utils/clipboard";
import { findObjectIndexByKey, removeDuplicateObjectsByKey, arrayIntersection, debounce } from "@/utils/helpers";
import { getSimonHeaderSuggest as ApiGetSimonHeaderSuggest } from "@/api/backend";

export default {
    name: "FileDetails",
    data() {
        return {
            loading: {
                selectedFeatures: false,
                excludeFeatures: false,
                selectedOutcome: false,
                selectedFormula: false,
                selectedClasses: false,
                selectedPreProcess: false
            },
            /** Insufficient samples (rows) modal dialog */
            notEnoughSamplesDialog: false,
            /** Current features for display based on user filter criteria, copy of avaliableFeatures */
            avaliableFeaturesDisplay: [],
            regressionFormula: "",
            classificationFormula: [],
            selectedPreProcessOptions: [
                {
                    value: "BoxCox",
                    disabled: false
                },
                {
                    value: "YeoJohnson",
                    disabled: false
                },
                {
                    value: "expoTrans",
                    disabled: false
                },
                {
                    value: "center",
                    disabled: false
                },
                {
                    value: "scale",
                    disabled: false
                },
                {
                    value: "range",
                    disabled: false
                },
                {
                    value: "knnImpute",
                    disabled: false
                },
                {
                    value: "bagImpute",
                    disabled: false
                },
                {
                    value: "medianImpute",
                    disabled: false
                },
                {
                    value: "pca",
                    disabled: false
                },
                {
                    value: "ica",
                    disabled: true
                },
                {
                    value: "spatialSign",
                    disabled: false
                },
                {
                    value: "corr",
                    disabled: false
                },
                {
                    value: "zv",
                    disabled: false
                },
                {
                    value: "nzv",
                    disabled: false
                },
                {
                    value: "conditionalX",
                    disabled: false
                }
            ]
        };
    },
    computed: {
        /** Current Selected Features */
        selectedFeatures: {
            get() {
                return this.$store.getters.simonAnalysisSelectedFeatures;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedFeatures", value);
            }
        },
        /** Excluded Features */
        excludeFeatures: {
            get() {
                return this.$store.getters.simonAnalysisExcludeFeatures;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisExcludeFeatures", value);
            }
        },
        /** Current Selected Outcome */
        selectedOutcome: {
            get() {
                return this.$store.getters.simonAnalysisSelectedOutcome;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedOutcome", value);
            }
        },
        /** Current Selected Classes */
        selectedClasses: {
            get() {
                return this.$store.getters.simonAnalysisSelectedClasses;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedClasses", value);
            }
        },
        selectedFormula: {
            get() {
                return this.$store.getters.simonAnalysisSelectedFormula;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedFormula", value);
            }
        },
        selectedPreProcess: {
            get() {
                return this.$store.getters.simonAnalysisSelectedPreProcess;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedPreProcess", value);
            }
        },
        selectedPartitionSplit: {
            get() {
                return this.$store.getters.simonAnalysisSelectedPartitionSplit;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedPartitionSplit", value);
            }
        },
        /** Select all Features input switch */
        filterFeatures: {
            get() {
                return this.$store.getters.simonAnalysisFilterFeatures;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisFilterFeatures", value);
            }
        },
        selectedFiles: {
            get() {
                return this.$store.getters.selectedFiles;
            },
            set(value) {
                this.$store.dispatch("setSelectedFiles", value);
            }
        }
    },
    mounted() {
        if (this.avaliableFeaturesDisplay.length === 0) {
            const allSelectedFeatures = [...this.selectedFeatures, ...this.excludeFeatures, ...this.selectedOutcome, ...this.selectedFormula, ...this.selectedClasses];
            const allSelectedFeaturesUnique = removeDuplicateObjectsByKey(allSelectedFeatures, "position");
            this.avaliableFeaturesDisplay = allSelectedFeaturesUnique;
        }
        this.checkFormula();
    },
    methods: {
        formatPartitionSplitTooltip(val) {
            const training = Math.round(val);
            const testing = Math.round(100 - training);
            const message = this.$t("views.apps.simon.analysis.components.FileDetails.other.training") + ": " + training + "% - " + this.$t("views.apps.simon.analysis.components.FileDetails.other.testing") + ": " + testing + "%";

            return message;
        },
        /** On user Input search available Features and suggest some results */
        filterAvaliableFeaturesDisplay: debounce(function(userInput, inputType) {
            this.loading[inputType] = true;
            ApiGetSimonHeaderSuggest(this.selectedFiles, userInput)
                .then(response => {
                    if (response.data.success === true) {
                        this.avaliableFeaturesDisplay = response.data.message;
                    }
                    this.loading[inputType] = false;
                })
                .catch(error => {
                    this.loading[inputType] = false;
                    console.log(error);
                });
        }, 500),
        /** On user focus display first rand 50 Features in drop-down */
        selectAvaliableFeaturesDisplay(inputType) {
            if (this.avaliableFeaturesDisplay.length <= 1) {
                this.filterAvaliableFeaturesDisplay("", inputType);
            }
        },
        resampleSelectionChange(selected, variable) {
            const selectors = ["selectedFeatures", "excludeFeatures", "selectedOutcome", "selectedFormula", "selectedClasses"];

            if (variable === "selectedFeatures") {
                const selectedFeaturesIndex = findObjectIndexByKey(this.selectedFeatures, "remapped", "ALL");
                if (this.filterFeatures === true && selectedFeaturesIndex === -1) {
                    this.filterFeatures = false;
                } else if (this.filterFeatures === true && selectedFeaturesIndex > -1) {
                    this.selectedFeatures = [
                        {
                            original: this.$t("views.apps.simon.analysis.components.FileDetails.other.all_columns"),
                            position: false,
                            remapped: "ALL"
                        }
                    ];
                    this.$message({
                        message: this.$t("views.apps.simon.analysis.components.FileDetails.other.message_1"),
                        type: "warning"
                    });
                }
            }
            for (let i = 0, l = selectors.length; i < l; i++) {
                if (selectors[i] !== variable) {
                    if (variable === "selectedOutcome" && selectors[i] === "selectedFormula") {
                        continue;
                    } else if (variable === "selectedFormula" && selectors[i] === "selectedOutcome") {
                        continue;
                    }
                    const selectionDifference = arrayIntersection(selected, this[selectors[i]]);
                    if (selectionDifference.length > 0) {
                        if (this[selectors[i]].length > 1) {
                            this[selectors[i]] = removeDuplicateObjectsByKey(selectionDifference, "position");
                        } else {
                            this[selectors[i]] = [];
                        }
                    }
                }
            }
            this.checkFormula();
        },
        checkFormula() {
            const allExcludeFeatures = [...this.excludeFeatures, ...this.selectedOutcome, ...this.selectedFormula, ...this.selectedClasses];
            const allExcludeFeaturesUnique = removeDuplicateObjectsByKey(allExcludeFeatures, "position");
            // Construct regression formula if any regression fields are selected
            if (this.selectedFeatures.length > 0 && this.selectedFormula.length > 0) {
                this.regressionFormula = this.selectedFormula.map(i => i.original).join(" + ") + " ~ " + this.selectedFeatures.map(i => i.original).join(" + ");
            } else {
                this.regressionFormula = "";
            }

            if (this.filterFeatures === true && allExcludeFeaturesUnique.length > 0 && this.regressionFormula !== "") {
                this.regressionFormula += " - (-" + allExcludeFeaturesUnique.map(i => i.original).join(", -") + ")";
            }

            // Construct classification formula if any regression fields are selected
            if (this.selectedFeatures.length > 0 && this.selectedOutcome.length > 0) {
                this.classificationFormula = [];
                let i = 0;
                this.selectedOutcome.forEach(outcome => {
                    this.classificationFormula[i] = outcome.original + " ~ " + this.selectedFeatures.map(i => i.original).join(" + ");

                    if (this.filterFeatures === true && allExcludeFeaturesUnique.length > 0) {
                        this.classificationFormula[i] += " - (-" + allExcludeFeaturesUnique.map(i => i.original).join(", -") + ")";
                    }
                    i++;
                });
            } else {
                this.classificationFormula = [];
            }
        },
        /** On Clear button click clear all selections */
        clearSelection(event) {
            this.selectedFilesHash = "";
            this.selectedFeatures = [];
            this.excludeFeatures = [];
            this.selectedPartitionSplit = 75;
            this.selectedOutcome = [];
            this.selectedClasses = [];
            this.selectedFormula = [];
            this.selectedPreProcess = ["center", "scale"];
            this.regressionFormula = "";
            this.classificationFormula = [];
            this.avaliableFeaturesDisplay = [];

            this.filterFeatures = false;

            this.$message({
                message: "Cleared",
                type: "success"
            });
        },
        /** Copy some string to clipboard */
        copyToClipboard(content, event) {
            clipboard(content, event);
        }
    },
    watch: {
        filterFeatures: function(newVal, oldVal) {
            const selectedIndex = findObjectIndexByKey(this.selectedFeatures, "remapped", "ALL");
            const avaliableIndex = findObjectIndexByKey(this.avaliableFeaturesDisplay, "remapped", "ALL");

            if (newVal === true) {
                const allSwitch = {
                    original: this.$t("views.apps.simon.analysis.components.FileDetails.other.all_columns"),
                    position: false,
                    remapped: "ALL"
                };
                if (avaliableIndex === -1) {
                    this.avaliableFeaturesDisplay.push(allSwitch);
                }
                this.selectedFeatures = [allSwitch];
            } else {
                this.excludeFeatures = [];
                if (selectedIndex > -1) {
                    this.selectedFeatures.splice(selectedIndex, 1);
                }
                if (avaliableIndex > -1) {
                    this.avaliableFeaturesDisplay.splice(selectedIndex, 1);
                }
            }
            this.checkFormula();
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~scss_vars";
.stat-badges {
    padding-top: 10px;
    .el-badge:not(:first-child) {
        margin-left: 50px;
    }
    .formula-placeholder {
        width: 100%;
        padding-top: 10px;
        > div {
            float: left;
            &:not(:last-child) {
                margin-right: 15px;
            }

            .formula-title {
                font-size: 14px;
            }
            .formula-tag {
                margin-top: 5px;
                &:not(:last-child) {
                    margin-right: 5px;
                }
            }
        }
    }
}
.analysis-option {
    &:not(:last-child) {
        margin-right: 10px;
    }

    .field-title {
        height: 25px;
        line-height: 25px;
        font-size: 14px;
        float: left;
        display: block;
    }
}

.box-card {
    .el-alert {
        padding-left: 5px;
        padding-right: 5px;
    }
    .alert-na-title {
        width: 65%;
        float: left;
    }
    .alert-na-desc {
        width: 35%;
        float: right;
        text-align: center;
    }
    .alert-samples-title {
        width: 65%;
        float: left;
    }
    .alert-samples-desc {
        width: 35%;
        float: right;
        text-align: center;
    }
    .flud-selects {
        width: 100%;
        margin-right: 10px;
        overflow: hidden;
    }
}
</style>
