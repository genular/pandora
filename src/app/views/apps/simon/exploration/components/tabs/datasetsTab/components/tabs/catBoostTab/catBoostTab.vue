<template>
    <div>
        catBoostTab
    </div>
</template>
<script>



export default {
    name: "catBoostTab",

    data() {
        return {
            isLoading: true,
            statisticalData: {
                types: []
            }
        };
    },
    mounted() {
        console.log("mounted: catBoostTab");
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
    methods:  {

    }
};
</script>
<style rel='stylesheet/scss' lang='scss'>

</style>
