<template>
    <div>
        <component v-bind:is="currentView" :columnName="columnName" :isTabDisabled="isTabDisabled" :jobDetailsData="jobDetailsData">
            <!-- component changes when vm.currentView changes! -->
        </component>
    </div>
</template>

<script>
import { variableImportanceTab, summaryTab, rocAnalysisTab, samrAnalysisTab, modelInterpretationTab } from "./tabs";

export default {
    name: "subTabPane",
    props: {
        currentView: {
            type: String,
            default: "variableImportanceTab",
        },
        columnName: {
            type: String,
            default: "",
        },
        isTabDisabled: {
            type: Boolean,
            default: true,
        },
        jobDetailsData: {
            type: Object,
            default: {}
        }
    },
    components: {
        variableImportanceTab,
        summaryTab,
        rocAnalysisTab,
        samrAnalysisTab,
        modelInterpretationTab,
    },
    data() {
        return {};
    },
    created() {},
    methods: {},
};
</script>
