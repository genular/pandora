<template>
    <div>

        <component v-bind:is="currentView" :columnName="columnName" :isTabDisabled="isTabDisabled">
            <!-- component changes when vm.currentView changes! -->
        </component>


    </div>
</template>

<script>
import { variableImportanceTab, booleanDistributionTab, otherDistributionTab, samrAnalysisTab, catBoostTab, summaryTab } from "./tabs";

export default {
    name: "subTabPane",
    props: {
        currentView: {
            type: String,
            default: "variableImportanceTab"
        },
        columnName: {
            type: String,
            default: ""
        },
        isTabDisabled: {
            type: Boolean,
            default: true
        }
    },
    components: {
        variableImportanceTab,
        booleanDistributionTab,
        otherDistributionTab,
        samrAnalysisTab,
        catBoostTab,
        summaryTab
    },
    data() {
        return {};
    },
    created() {},
    methods: {}
};
</script>
