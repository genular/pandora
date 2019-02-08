<template>
    <div>
        <component v-bind:is="currentView" :jobDetailsData="jobDetailsData">
            <!-- component changes when vm.currentView changes! -->
        </component>
    </div>
</template>

<script>
import { datasetsTab, correlationTab, clusteringTab } from "./tabs";

export default {
    name: "tabPane",
    props: {
        currentView: {
            type: String,
            default: "datasetsTab"
        },
        jobDetailsData: {
            type: Object,
            default: {}
        }
    },
    components: {
        datasetsTab,
        correlationTab,
        clusteringTab
    }
};
</script>
