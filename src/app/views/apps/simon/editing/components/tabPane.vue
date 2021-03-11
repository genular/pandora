<template>
    <div>
        <component v-bind:is="currentView">
            <!-- component changes when vm.currentView changes! -->
        </component>
    </div>
</template>

<script>
import { overviewTab, correlationTab, clusteringTab, pcaAnalysisTab, tSNETab } from "./tabs";

export default {
    name: "tabPane",
    props: {
        currentView: {
            type: String,
            default: "overviewTab",
        },
    },
    components: {
        overviewTab,
        correlationTab,
        clusteringTab,
        pcaAnalysisTab,
        tSNETab,
    },
};
</script>
