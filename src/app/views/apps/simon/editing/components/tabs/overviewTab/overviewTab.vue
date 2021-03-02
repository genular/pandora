<template>
    <div class="overviewTab-container">
            overviewTab
    </div>
</template>
<script>

export default {
    name: "overviewTab",
    props: {
        selectedFileDetails: {
            type: Array,
            default: []
        }
    },
    computed: {
        activeTabName: {
            get() {
                return this.$store.getters.simonExplorationActiveTabName;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationnActiveTabName", value);
            }
        },
        selectedFeatureSetId: {
            get() {
                return this.$store.getters.simonExplorationSelectedFeatureSetId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedFeatureSetId", value);
            }
        }
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
        //this.redrawImage();
    },
    activated(){
        console.log("activated: " + this.$options.name);
        //this.redrawImage();
    },
    methods: {

    }
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
