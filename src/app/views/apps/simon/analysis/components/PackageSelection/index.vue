<template>
    <div class="simon-package-selection">
        <!--
        <el-row v-if="is_demo === true">
            <el-col :span="24">
                <el-alert title="Notification:" description="Please note since you are using demo server for SMON backend your selection will be limited to 5 statistical packages at a time. To get over this limitation please configure your private SIMON backend server." type="warning" style="margin-top: 20px;" show-icon> </el-alert>
            </el-col>
        </el-row>
        -->
        <el-row>
            <el-col :span="24">
                <el-checkbox-group v-model="filter.checkBoxSelected" class="checkbox-filters" @change="filterPackages">
                    <el-checkbox v-for="item in filter.checkBoxAvaliable" :label="item.key" :key="item.key" :disabled="item.disabled">
                        {{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="11">
                <el-card class="box-card">
                    <div slot="header">
                        {{ $t("views.apps.simon.analysis.components.PackageSelection.head.available.title") }}
                        <span class="track-count">{{ selectedPackages.length }}/{{ avaliablePackages.length + selectedPackages.length }}</span>
                        <el-switch v-model="filter.allPackages"></el-switch>
                    </div>
                    <div class="box-item">
                        <div class="search-packages">
                            <el-select
                                class="flud-selects"
                                v-model="packagesSearch.input"
                                value-key="internal_id"
                                :clearable="true"
                                placeholder="type to search"
                                filterable
                                remote
                                :remote-method="querySearchAvaliable"
                                :default-first-option="true"
                                popper-class="packages-autocomplete"
                                @change="selectPackage"
                                :loading="packagesSearch.loading"
                            >
                                <el-option v-for="item in packagesSearch.results" :key="item.internal_id" :label="item.label" :value="item">
                                    <div class="name" style="float: left;">{{ item.label }}</div>
                                    <span class="label" style="float: right;">{{ item.internal_id }}</span>
                                </el-option>
                            </el-select>
                        </div>
                        <div class="draggable-containers">
                            <draggable
                                class="draggable-items"
                                element="el-collapse"
                                :component-data="getComponentData('handleAvaliableChange')"
                                v-model="avaliablePackages"
                                :options="dragOptions"
                                :move="onMove"
                                @start="isDragging = true"
                                @end="isDragging = false"
                            >
                                <el-collapse-item
                                    :class="item.disabled ? 'draggable-item disabled' : 'draggable-item animated flipInX'"
                                    v-for="(item, index) in avaliablePackages"
                                    :name="index"
                                    :key="item.id"
                                >
                                    <template slot="title">
                                        <span :class="item.disabled ? 'item-icon fa fa-pause' : 'item-icon fa fa-play'" aria-hidden="true"></span>
                                        <span class="item-title">{{ item.label }}</span>
                                        <span class="item-library">{{ item.internal_id }}</span>
                                    </template>
                                    <div class="draggable-item-content-wrap">
                                        <ul class="general_info">
                                            <li>
                                                <span class="title"> {{ $t("views.apps.simon.analysis.components.PackageSelection.containers.method_type.title") }}: </span>
                                                <span class="desc">
                                                    <span v-if="item.classification == 1">
                                                        {{ $t("views.apps.simon.analysis.components.PackageSelection.containers.method_type.classification") }}
                                                    </span>
                                                    <span v-if="item.regression == 1">
                                                        {{ $t("views.apps.simon.analysis.components.PackageSelection.containers.method_type.regression") }}
                                                    </span>
                                                </span>
                                                <el-tooltip placement="top">
                                                    <div slot="content">
                                                        <span v-for="(key, value) in item.citations" :key="key" class="item">
                                                            <span>{{ value }} - {{ key }}</span
                                                            ><br /><br />
                                                        </span>
                                                    </div>
                                                    <el-button style="float: right;padding: 0;" type="info" icon="el-icon-info" circle></el-button>
                                                </el-tooltip>
                                            </li>
                                            <li v-if="item.tuning_parameters.length > 0">
                                                <span class="title"> {{ $t("views.apps.simon.analysis.components.PackageSelection.containers.tuning_parameters.title") }}: </span>
                                            </li>
                                        </ul>
                                        <ul class="tuning_parameters" v-if="item.tuning_parameters.length > 0">
                                            <li v-for="(tun_parm, index) in item.tuning_parameters" :key="index">
                                                <span class="title">{{ tun_parm.label }}</span>
                                                <span class="desc">
                                                    <el-input placeholder="N/A" size="mini" disabled> </el-input>
                                                </span>
                                            </li>
                                        </ul>
                                        <div class="tag-container">
                                            <el-tag :key="index" v-for="(tag, index) in item.tags" :disable-transitions="false" type="info"> {{ tag }} </el-tag>
                                        </div>
                                    </div>
                                </el-collapse-item>
                            </draggable>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="11" :push="2">
                <el-card class="box-card">
                    <div slot="header">
                        {{ $t("views.apps.simon.analysis.components.PackageSelection.head.selected.title") }} <span class="track-count">{{ selectedPackages.length }}</span>
                    </div>
                    <div class="box-item">
                        <div style="float: left; height: 36px; line-height: 36px;">
                            <el-tooltip placement="top">
                                <div slot="content">
                                    {{ $t("views.apps.simon.analysis.components.PackageSelection.head.selected.extraction.description") }}
                                </div>
                                <span class="field-label">{{ $t("views.apps.simon.analysis.components.PackageSelection.head.selected.extraction.title") }} </span>
                            </el-tooltip>
                            <el-switch v-model="filterExtraction"></el-switch>
                        </div>
                        <div style="float: right; height: 36px; line-height: 36px;">
                            <el-tooltip placement="top">
                                <div slot="content">
                                    {{ $t("views.apps.simon.analysis.components.PackageSelection.head.selected.feature_selection.description") }}
                                </div>
                                <span class="field-label">{{ $t("views.apps.simon.analysis.components.PackageSelection.head.selected.feature_selection.title") }}</span>
                            </el-tooltip>
                            <el-switch v-model="backwardSelection"></el-switch>
                        </div>
                        <div class="draggable-containers">
                            <draggable
                                class="draggable-items"
                                element="el-collapse"
                                :component-data="getComponentData('handleSelectedChange')"
                                v-model="selectedPackages"
                                :options="dragOptions"
                                :move="onMove"
                                @start="isDragging = true"
                                @end="isDragging = false"
                            >
                                <el-collapse-item
                                    :class="item.disabled ? 'draggable-item disabled' : 'draggable-item'"
                                    v-for="(item, index) in selectedPackages"
                                    :name="index"
                                    :key="item.id"
                                >
                                    <template slot="title">
                                        <span :class="item.disabled ? 'item-icon fa fa-pause' : 'item-icon fa fa-play'" aria-hidden="true"></span>
                                        <span class="item-title">{{ item.label }}</span>
                                        <span class="item-library">{{ item.internal_id }}</span>
                                    </template>
                                    <div class="draggable-item-content-wrap">
                                        <ul class="general_info">
                                            <li>
                                                <span class="title"> {{ $t("views.apps.simon.analysis.components.PackageSelection.containers.method_type.title") }}: </span>
                                                <span class="desc">
                                                    <span v-if="item.classification == 1">
                                                        {{ $t("views.apps.simon.analysis.components.PackageSelection.containers.method_type.classification") }}
                                                    </span>
                                                    <span v-if="item.regression == 1">
                                                        {{ $t("views.apps.simon.analysis.components.PackageSelection.containers.method_type.regression") }}
                                                    </span>
                                                </span>
                                                <el-tooltip placement="top">
                                                    <div slot="content">
                                                        <span v-for="(key, value) in item.citations" :key="key" class="item">
                                                            <span>{{ value }} - {{ key }}</span
                                                            ><br /><br />
                                                        </span>
                                                    </div>
                                                    <el-button style="float: right;padding: 0;" type="info" icon="el-icon-info" circle></el-button>
                                                </el-tooltip>
                                            </li>
                                            <li v-if="item.tuning_parameters.length > 0">
                                                <span class="title"> {{ $t("views.apps.simon.analysis.components.PackageSelection.containers.tuning_parameters.title") }}: </span>
                                            </li>
                                        </ul>
                                        <ul class="tuning_parameters" v-if="item.tuning_parameters.length > 0">
                                            <li v-for="(tun_parm, index) in item.tuning_parameters" :key="index">
                                                <span class="title">{{ tun_parm.label }}</span>
                                                <span class="desc">
                                                    <el-input placeholder="N/A" size="mini" disabled> </el-input>
                                                </span>
                                            </li>
                                        </ul>
                                        <div class="tag-container">
                                            <el-tag :key="index" v-for="(tag, index) in item.tags" :disable-transitions="false" type="info"> {{ tag }} </el-tag>
                                        </div>
                                    </div>
                                </el-collapse-item>
                            </draggable>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import draggable from "vuedraggable";
import { findObjectIndexByKey, removeDuplicateObjectsByKey, orderBy, debounce } from "@/utils/helpers";

export default {
    name: "PackageSelection",
    components: {
        draggable
    },
    data() {
        return {
            /** Global Dragging Enabled/Disabled */
            editable: true,
            /** Dragging Start Marker True if is dragging */
            isDragging: false,
            delayedDragging: false,
            /** Models for HTML filters */
            filter: {
                allPackages: false,
                checkBoxAvaliable: [
                    {
                        label: "Classification",
                        key: "classification",
                        disabled: true
                    },
                    {
                        label: "Regression",
                        key: "regression",
                        disabled: true
                    },
                    {
                        label: "Time-series",
                        key: "timeseries",
                        disabled: true
                    },
                    {
                        label: "Multiple outcomes",
                        key: "multipleoutcomes",
                        disabled: true
                    }
                ],
                checkBoxSelected: ["classification", "regression", "timeseries", "multipleoutcomes"]
            },
            /** Search for available packages */
            packagesSearch: {
                input: "",
                loading: false,
                results: []
            }
        };
    },

    computed: {
        /** Dragging options for both dragging instances */
        dragOptions() {
            return {
                animation: 150,
                group: "description",
                disabled: !this.editable,
                ghostClass: "ghost"
            };
        },
        /** Array of all available analysis packages */
        avaliablePackages: {
            get() {
                return this.$store.getters.simonAvaliablePackages;
            },
            set(value) {
                this.$store.dispatch("setSimonAvaliablePackages", value);
            }
        },
        /** Selected array of analysis packages */
        selectedPackages: {
            get() {
                return this.$store.getters.simonSelectedPackages;
            },
            set(value) {
                this.$store.dispatch("setSimonSelectedPackages", value);
            }
        },
        /** Extraction HTML model */
        filterExtraction: {
            get() {
                return this.$store.getters.simonAnalysisFilterExtraction;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisFilterExtraction", value);
            }
        },
        /** Feature extraction from builded models */
        backwardSelection: {
            get() {
                return this.$store.getters.simonAnalysisBackwardSelection;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisBackwardSelection", value);
            }
        }
    },
    methods: {
        getComponentData(changeType) {
            return {
                on: {
                    change: this[changeType]
                }
            };
        },
        handleAvaliableChange(activeTabs) {
            console.log("===== handleAvaliableChange =====");
            if (activeTabs.length > 0) {
                console.log(activeTabs);
                console.log(this.avaliablePackages[activeTabs[0]].label);
            }
        },
        handleSelectedChange(activeTabs) {
            console.log("===== handleSelectedChange =====");
            if (activeTabs.length > 0) {
                console.log(this.selectedPackages[activeTabs[0]].label);
            }
        },
        querySearchAvaliable: debounce(function(queryString) {
            this.packagesSearch.loading = true;
            let results = [];

            if (typeof queryString === "undefined" || queryString.length < 1) {
                results = this.avaliablePackages.slice(0, 25);
            } else {
                if (this.avaliablePackages.length > 0) {
                    queryString = queryString.toLowerCase().split(" ");
                    results = this.avaliablePackages.filter(function(item) {
                        if (item.disabled === true) {
                            return false;
                        } else {
                            return queryString.every(function(el) {
                                const searchText = item.internal_id + item.label + JSON.stringify(item.tags) + JSON.stringify(item.citations);
                                return searchText.toLowerCase().indexOf(el) > -1;
                            });
                        }
                    });
                }
            }
            this.packagesSearch.results = results;
            this.packagesSearch.loading = false;
        }, 500),
        filterPackages(currentSelection) {
            // Loop this.avaliablePackages and set disabled flag!
        },
        selectPackage(item) {
            if (typeof item === "object") {
                this.packagesSearch.input = "";

                const itemIndexAvaliable = findObjectIndexByKey(this.avaliablePackages, "id", item.id);
                const itemIndexSearch = findObjectIndexByKey(this.packagesSearch.results, "id", item.id);

                if (itemIndexSearch > -1) {
                    this.packagesSearch.results.splice(itemIndexSearch, 1);
                }

                if (itemIndexAvaliable > -1) {
                    this.avaliablePackages.splice(itemIndexAvaliable, 1);
                }

                this.selectedPackages.unshift(item);

                this.$message({
                    message: item.label + " selected!",
                    type: "success"
                });
            }
        },
        onMove({ relatedContext, draggedContext }) {
            const relatedElement = relatedContext.element;
            const draggedElement = draggedContext.element;

            /** Limit number of Analysis on DEMO server to 5
            if (
                this.is_demo === true &&
                this.selectedPackages.length === 5 &&
                relatedContext.component.$children.length === 5
            ) {
                return false;
            }
             */

            return (!relatedElement || !relatedElement.disabled) && !draggedElement.disabled;
        }
    },
    watch: {
        "filter.allPackages": function(newVal, oldVal) {
            const allPackages = [...this.avaliablePackages, ...this.selectedPackages];

            const allPackagesUnique = removeDuplicateObjectsByKey(allPackages, "internal_id");

            if (newVal === true) {
                this.selectedPackages = orderBy(allPackagesUnique, "internal_id").filter(function(item) {
                    return !item.disabled;
                });
                this.avaliablePackages = allPackagesUnique.filter(function(item) {
                    return item.disabled;
                });
            } else {
                this.avaliablePackages = orderBy(allPackagesUnique, "internal_id");
                this.selectedPackages = [];
            }
        },
        isDragging(newValue) {
            if (newValue) {
                this.delayedDragging = true;
                return;
            }
            this.$nextTick(() => {
                this.delayedDragging = false;
            });
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~scss_vars";

.simon-package-selection {
    .checkbox-filters {
        margin-top: 20px;
        margin-left: 2px;
    }
    .box-card {
        margin-top: 20px;
    }
    .el-card__header {
        .track-count {
            color: #97a8be;
            font-size: 13px;
            margin-left: 15px;
        }
        .el-switch {
            float: right;
        }
    }
    .search-packages {
        clear: both;

        .flud-selects {
            width: 100%;
            overflow: hidden;
        }
    }
    .draggable-containers {
        overflow-y: auto;
        overflow-x: hidden;
        max-height: 265px;
        margin-top: 15px;
        float: left;
        width: 100%;
        clear: left;
        .draggable-items {
            overflow: visible;
            box-sizing: border-box;
            .disabled {
                opacity: 0.5;
            }
            &:empty {
                height: 48px;
                background-color: #eff0f9;
                margin-bottom: 15px;
                &:after {
                    content: "nothing to show";
                    text-align: center;
                    width: 100%;
                    display: block;
                    line-height: 48px;
                    color: #97a8be;
                    font-size: 12px;
                    font-style: italic;
                }
            }
            .draggable-item {
                &:not(:first-child) {
                    margin-top: 5px;
                }
                .draggable-item-content-wrap {
                    padding-left: 10px;
                    padding-right: 10px;
                    .general_info {
                        padding: 0;
                        padding-left: 10px;
                        .title {
                            width: 65px;
                            text-align: left;
                        }
                        .desc {
                            font-style: italic;
                        }
                    }
                    .tuning_parameters {
                        padding: 0;
                        padding-left: 10px;
                        list-style-type: none;
                        float: left;
                        width: 100%;
                        > li {
                            float: left;
                            width: 50%;
                            &:not(:last-child) {
                                padding-right: 10px;
                            }
                        }
                        .title {
                            width: 65px;
                            text-align: left;
                        }
                        .desc {
                            max-width: 100px;
                        }
                    }
                }

                .el-collapse-item__header {
                    overflow: hidden;
                }
                .tag-container .el-tag {
                    margin-left: 10px;
                    margin-top: 5px;
                }
                .item-title {
                    margin-left: 5px;
                }
                .item-library {
                    color: $ui-background;
                    font-size: 13px;
                    text-align: right;
                    flex-grow: 1;
                    margin-right: 15px;
                }
            }
        }
    }
}

.packages-autocomplete {
    li {
        line-height: normal;
        padding: 7px;
        .name {
            text-overflow: ellipsis;
            overflow: hidden;
            margin-left: 15px;
        }
        .label {
            font-size: 12px;
            color: #b4b4b4;
            margin-right: 15px;
        }
    }
}
</style>
