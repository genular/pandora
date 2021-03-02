<template>
    <div>
        <component v-bind:is="currentView" :selectedFileDetails="selectedFileDetails">
            <!-- component changes when vm.currentView changes! -->
        </component>
    </div>
</template>

<script>
import { correlationTab, overviewTab } from "./tabs";

export default {
    name: "tabPane",
    props: {
        currentView: {
            type: String,
            default: "overviewTab"
        },
        selectedFileDetails: {
            type: Array,
            default: []
        }
    },
    components: {
        overviewTab,
        correlationTab
    }
};
</script>
