<template>
    <div class="correlationTab-container" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
        <el-row v-if="tabEnabled">
            <el-row type="flex" align="top">
                <el-col :span="24" style="text-align: right">
                    <el-button
                        :title="$t('views.apps.simon.exploration.components.tabs.correlationTab.buttons.download')"
                        type="success"
                        icon="el-icon-download"
                        :disabled="renderedImage === '' || loadingPlot"
                        @click="downloadPlotImage"
                    ></el-button>
                </el-col>
            </el-row>
            <el-row type="flex" align="top">
                <el-col :span="9">
                    <el-form class="corrolation-form" ref="settingsForm" :model="settingsForm" label-width="200px">
                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.columns.title')">
                            <el-select
                                v-model="settingsForm.selectedColumns"
                                multiple
                                filterable
                                remote
                                default-first-option
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.clusteringTab.form.columns.placeholder')"
                                :remote-method="querySearch"
                            >
                                <el-option v-for="item in selectedFileDetailsDisplay" :key="item.remapped" :label="item.original" :value="item.remapped">
                                    <span style="float: left">{{ item.original }}</span>
                                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.unique_count }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.correlation_method.label')">
                            <el-select
                                v-model="settingsForm.correlation_method"
                                :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.correlation_method.placeholder')"
                            >
                                <el-option
                                    v-for="item in settingOptions.correlation_method"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.correlationTab.form.correlation_method.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.correlationTab.form.correlation_method.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.na_action.label')">
                            <el-select v-model="settingsForm.na_action" :placeholder="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.na_action.placeholder')">
                                <el-option
                                    v-for="item in settingOptions.na_action"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.correlationTab.form.na_action.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.correlationTab.form.na_action.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item
                            v-if="settingsForm.confidence.enable === false"
                            :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.plot_method.label')"
                        >
                            <el-select
                                v-model="settingsForm.plot_method"
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.plot_method.placeholder')"
                            >
                                <el-option
                                    v-for="item in settingOptions.plot_method"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.correlationTab.form.plot_method.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.correlationTab.form.plot_method.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item
                            v-if="settingsForm.plot_method === 'mixed' && settingsForm.confidence.enable === false"
                            :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.plot_method_mixed.lower_method.label')"
                        >
                            <el-select
                                v-model="settingsForm.plot_method_mixed.lower_method"
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.plot_method_mixed.lower_method.placeholder')"
                            >
                                <el-option
                                    v-for="item in settingOptions.plot_method_mixed.lower_method"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.correlationTab.form.plot_method_mixed.lower_method.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.correlationTab.form.plot_method_mixed.lower_method.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item
                            v-if="settingsForm.plot_method === 'mixed' && settingsForm.confidence.enable === false"
                            :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.plot_method_mixed.upper_method.label')"
                        >
                            <el-select
                                v-model="settingsForm.plot_method_mixed.upper_method"
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.plot_method_mixed.upper_method.placeholder')"
                            >
                                <el-option
                                    v-for="item in settingOptions.plot_method_mixed.upper_method"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.correlationTab.form.plot_method_mixed.upper_method.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.correlationTab.form.plot_method_mixed.upper_method.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item v-if="settingsForm.plot_method !== 'mixed'" :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.plot_type.label')">
                            <el-select v-model="settingsForm.plot_type" :placeholder="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.plot_type.placeholder')">
                                <el-option
                                    v-for="item in settingOptions.plot_type"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.correlationTab.form.plot_type.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.correlationTab.form.plot_type.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.reorder_correlation.label')">
                            <el-select
                                v-model="settingsForm.reorder_correlation"
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.reorder_correlation.placeholder')"
                            >
                                <el-option
                                    v-for="item in settingOptions.reorder_correlation"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.correlationTab.form.reorder_correlation.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.correlationTab.form.reorder_correlation.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item
                            v-if="settingsForm.reorder_correlation === 'hclust'"
                            :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.reorder_correlation_hclust.method.label')"
                        >
                            <el-select
                                v-model="settingsForm.reorder_correlation_hclust.method"
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.reorder_correlation_hclust.method.label')"
                            >
                                <el-option
                                    v-for="item in settingOptions.reorder_correlation_hclust.method"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.correlationTab.form.reorder_correlation_hclust.method.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.correlationTab.form.reorder_correlation_hclust.method.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item
                            v-if="settingsForm.reorder_correlation === 'hclust'"
                            :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.reorder_correlation_hclust.number_of_rectangles')"
                        >
                            <el-input-number v-model="settingsForm.reorder_correlation_hclust.number_of_rectangles" :min="1"></el-input-number>
                        </el-form-item>
                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.text_size')">
                            <el-input-number
                                v-model="settingsForm.text_size.value"
                                :value="settingsForm.text_size.value"
                                :min="settingOptions.text_size.min"
                                :max="settingOptions.text_size.max"
                                :step="settingOptions.text_size.step"
                                controls-position="right"
                            ></el-input-number>
                        </el-form-item>
                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.significance.enable')">
                            <el-checkbox v-model="settingsForm.significance.enable"></el-checkbox>
                        </el-form-item>
                        <el-form-item
                            :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.significance.level')"
                            v-if="settingsForm.significance.enable === true"
                        >
                            <el-input-number
                                v-model="settingsForm.significance.level.value"
                                :value="settingsForm.significance.level.value"
                                :min="settingOptions.significance.level.min"
                                :max="settingOptions.significance.level.max"
                                :step="settingOptions.significance.level.step"
                                controls-position="right"
                            ></el-input-number>
                        </el-form-item>
                        <el-form-item
                            :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.significance.insignificant_action.label')"
                            v-if="settingsForm.significance.enable === true"
                        >
                            <el-select
                                v-model="settingsForm.significance.insignificant_action"
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.significance.insignificant_action.placeholder')"
                            >
                                <el-option
                                    v-for="item in settingOptions.significance.insignificant_action"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.correlationTab.form.significance.insignificant_action.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.correlationTab.form.significance.insignificant_action.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.confidence.enable')">
                            <el-checkbox v-model="settingsForm.confidence.enable"></el-checkbox>
                        </el-form-item>
                        <el-form-item
                            :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.confidence.level')"
                            v-if="settingsForm.confidence.enable === true"
                        >
                            <el-input-number
                                v-model="settingsForm.confidence.level.value"
                                :min="settingOptions.confidence.level.min"
                                :max="settingOptions.confidence.level.max"
                                :step="settingOptions.confidence.level.step"
                                controls-position="right"
                            ></el-input-number>
                        </el-form-item>
                        <el-form-item
                            :label="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.confidence.ploting_method.label')"
                            v-if="settingsForm.confidence.enable === true"
                        >
                            <el-select
                                v-model="settingsForm.confidence.ploting_method"
                                :placeholder="$t('views.apps.simon.exploration.components.tabs.correlationTab.form.confidence.ploting_method.placeholder')"
                            >
                                <el-option
                                    v-for="(item, index) in settingOptions.confidence.ploting_method"
                                    :key="item.id"
                                    :label="$t(['views.apps.simon.exploration.components.tabs.correlationTab.form.confidence.ploting_method.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.simon.exploration.components.tabs.correlationTab.form.confidence.ploting_method.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="danger" round @click="redrawImage">
                                {{ $t("views.apps.simon.exploration.components.tabs.correlationTab.buttons.plot_image") }}
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="15" class="correlation-svg-container" style="text-align: center">
                    <!-- Plot placeholder -->
                    <div v-if="renderedImage !== false" style="text-align: center">
                        <img id="varImp-svg" class="animated fadeIn" :src="renderedImageDisplay" fit="scale-down" />
                    </div>
                    <div v-else class="plot-placeholder">
                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                    </div>
                </el-col>
            </el-row>
        </el-row>
        <!-- ELSE if Tab is DISABLED -->
        <el-row v-else>
            <el-col :span="24">
                <el-alert
                    :title="$t('views.apps.simon.exploration.components.tabs.correlationTab.alert.function_disabled.title')"
                    description="Tab is currently disabled! Total columns in selected: selectedFileDetails"
                    type="warning"
                    style="margin-top: 20px"
                    show-icon
                    :closable="false"
                ></el-alert>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { fetchEditingCorrPlotImage } from "@/api/plots";
import { md5String } from "@/utils";
import { debounce } from "@/utils/helpers";

import Fuse from "fuse.js";

export default {
    name: "correlationTab",
    data() {
        return {
            fuse: null,
            // This tab is disabled and we will enable it on initialization if there is no too much data
            tabEnabled: false,
            loadingOptions: true,

            loadingPlot: false,

            renderedImage: false,
            renderedImageDisplay: false,
            renderedImageData: "",

            selectedFileDetailsDisplay: [],

            settingOptions: {
                selectedColumns: [],
                correlation_method: [{ id: "pearson" }, { id: "kendall" }, { id: "spearman" }],
                na_action: [{ id: "everything" }, { id: "all.obs" }, { id: "complete.obs" }, { id: "na.or.complete" }, { id: "pairwise.complete.obs" }],
                plot_method: [{ id: "mixed" }, { id: "circle" }, { id: "square" }, { id: "ellipse" }, { id: "number" }, { id: "shade" }, { id: "color" }, { id: "pie" }],
                plot_method_mixed: {
                    lower_method: [{ id: "circle" }, { id: "square" }, { id: "ellipse" }, { id: "number" }, { id: "shade" }, { id: "color" }, { id: "pie" }],
                    upper_method: [{ id: "circle" }, { id: "square" }, { id: "ellipse" }, { id: "number" }, { id: "shade" }, { id: "color" }, { id: "pie" }],
                },
                plot_type: [{ id: "full" }, { id: "lower" }, { id: "upper" }],
                reorder_correlation: [{ id: "original" }, { id: "AOE" }, { id: "FPC" }, { id: "hclust" }, { id: "alphabet" }],
                reorder_correlation_hclust: {
                    method: [
                        { id: "complete" },
                        { id: "ward" },
                        { id: "ward.D" },
                        { id: "ward.D2" },
                        { id: "single" },
                        { id: "average" },
                        { id: "mcquitty" },
                        { id: "median" },
                        { id: "centroid" },
                    ],
                    number_of_rectangles: 3,
                },
                text_size: {
                    min: 0.2,
                    max: 3,
                    step: 0.2,
                },
                significance: {
                    level: {
                        min: 0,
                        max: 1,
                        step: 0.05,
                    },
                    insignificant_action: [{ id: "pch" }, { id: "p-value" }, { id: "blank" }, { id: "n" }],
                },
                confidence: {
                    ploting_method: [{ id: "square" }, { id: "circle" }, { id: "rect" }],
                    level: {
                        min: 0,
                        max: 1,
                        step: 0.05,
                    },
                },
            },
            settingsForm: {
                selectedColumns: [],
                correlation_method: "pearson",
                na_action: "everything",
                // Only if confidence.enable is false
                plot_method: "circle",
                plot_method_mixed: {
                    lower_method: "circle",
                    upper_method: "circle",
                },
                // Only if plot_method is not mixed
                plot_type: "full",
                reorder_correlation: "original",
                reorder_correlation_hclust: {
                    method: "complete",
                    number_of_rectangles: 3,
                },
                text_size: {
                    value: 0.4,
                    min: 0.2,
                    max: 3,
                    step: 0.2,
                },
                significance: {
                    enable: false,
                    level: {
                        value: 0.05,
                        min: 0,
                        max: 1,
                        step: 0.05,
                    },
                    insignificant_action: "pch",
                },
                confidence: {
                    enable: false,
                    ploting_method: "square",
                    level: {
                        value: 0.95,
                        min: 0,
                        max: 1,
                        step: 0.05,
                    },
                },
            },
        };
    },
    computed: {
        activeTabName: {
            get() {
                return this.$store.getters.simonExplorationActiveTabName;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationnActiveTabName", value);
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
        this.redrawImage();
        this.initFuse(this.selectedFileDetails.items);
    },
    activated() {
        console.log("activated: " + this.$options.name);
        this.redrawImage();
    },
    methods: {
        initFuse(searchItems) {
            this.fuse = new Fuse(searchItems, {
                shouldSort: true,
                threshold: 0.4,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 0,
                includeScore: false,
                includeMatches: true,
                keys: [
                    {
                        name: "original",
                        weight: 0.7,
                    },
                    {
                        name: "remapped",
                        weight: 0.3,
                    },
                ],
            });
        },
        querySearch(query) {
            const items_found = this.fuse.search(query);
            this.selectedFileDetailsDisplay = items_found.map((x) => x.item);
        },
        redrawImage() {
            this.isTabEnabled();

            if (this.tabEnabled === true) {
                this.handleFetchCorrPlotImage();
            }
        },
        isTabEnabled() {
            if (this.selectedFileDetails.items.length >= 1 && this.selectedFileDetails.id === this.selectedFiles.map((x) => x.id)[0]) {
                this.tabEnabled = true;
            } else {
                this.tabEnabled = false;
            }

            if (this.tabEnabled === true && this.selectedFileDetailsDisplay.length === 0) {
                this.selectedFileDetailsDisplay = this.selectedFileDetails.items;
            }
        },
        downloadPlotImage() {
            const svgBlob = new Blob([window.atob(decodeURIComponent(this.renderedImage.substring(26))) + "<!-- created by SIMON: https://genular.org -->"], {
                type: "image/svg+xml;charset=utf-8",
            });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = "editing-correlation.svg";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        },
        handleFetchCorrPlotImage() {
            this.loadingPlot = true;
            // Clone objects as an simple object
            const settingsForm = JSON.parse(JSON.stringify(this.settingsForm));
            // If no columns are selected select 250 columns
            if (settingsForm.selectedColumns.length < 1) {
                settingsForm.selectedColumns = this.selectedFileDetailsDisplay.map((x) => x.remapped).slice(0, 50);
            }

            fetchEditingCorrPlotImage({ selectedFileID: this.selectedFiles[0].id, settings: settingsForm })
                .then((response) => {
                    this.renderedImage = "data:image/svg+xml;base64," + encodeURIComponent(response.data.image);
                    this.renderedImageDisplay = "data:image/png;base64," + encodeURIComponent(response.data.image_png);
                    this.loadingPlot = false;
                })
                .catch((error) => {
                    console.log("Server error occurred");
                    this.renderedImage = false;
                    this.renderedImageDisplay = false;
                    this.loadingPlot = false;

                    this.$message({
                        message: "There was error in generating plot. Please try again by selecting different options.",
                        type: "error",
                    });
                });
        },
    },
    watch: {
        selectedFileDetails: function (newVal, oldVal) {
            console.log("File selected change detected " + this.$options.name);

            if (newVal.items.length >= 1 && newVal.items.length < 5000) {
                this.tabEnabled = true;
                this.initFuse(newVal);
                this.selectedFileDetailsDisplay = newVal;
            } else {
                this.tabEnabled = false;
            }
        },
        deep: true,
    },
};
</script>
<style rel="stylesheet/scss" lang="scss">
.corrolation-form {
    .el-form-item {
        margin-bottom: 5px;
        label {
            color: #333333;
            font-weight: 500;
        }
    }
}
</style>
