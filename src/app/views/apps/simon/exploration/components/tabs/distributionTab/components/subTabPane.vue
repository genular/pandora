<template>
    <div>

        <component v-bind:is="currentView" :columnName="columnName" :isTabDisabled="isTabDisabled">
            <!-- component changes when vm.currentView changes! -->
        </component>


    </div>
</template>

<script>
import { distributionTraining, distributionTesting, distributionResample } from "./tabs";

export default {
    name: "subTabPane",
    props: {
        currentView: {
            type: String,
            default: "distributionTraining"
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
        distributionTraining,
        distributionTesting,
        distributionResample
    },
    data() {
        return {};
    },
    created() {},
    methods: {}
};
</script>
