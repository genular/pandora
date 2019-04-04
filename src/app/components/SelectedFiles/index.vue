<template>
    <div class="selected-files-container">
        <div v-if="selectedFiles.length < 1" class="files-view-item empty-selection animated fadeInLeft">{{ $t("components.SelectedFiles.select_file") }}</div>
        <div v-for="file in selectedFiles" :key="file.id" class="files-view-item active animated flipInX">
            {{ file.basename }}
            <span class="close-container" @click="closeSelectedFile(file.id)">x</span>
        </div>
        <div v-if="explorationJobId != ''" class="files-view-item explorationJobId animated flipInY" closable>
            Queue ID: <span style="font-weight: bold;">{{ explorationJobId }}</span>
            <span class="close-container" @click.prevent.stop="handleCloseExplorationJobId()">x</span>
        </div>
    </div>
</template>
<script>
export default {
    computed: {
        selectedFiles: {
            get() {
                return this.$store.getters.selectedFiles;
            },
            set(value) {
                this.$store.dispatch("setSelectedFiles", value);
            }
        },
        explorationJobId: {
            get() {
                return this.$store.getters.simonExplorationJobId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationJobId", value);
            }
        }
    },
    methods: {
        handleCloseExplorationJobId() {
            this.explorationJobId = "";
        },
        closeSelectedFile(selectdFileID) {
            this.selectedFiles = this.selectedFiles.filter(function(item) {
                return selectdFileID !== item.id;
            });
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~scss_vars";

.selected-files-container {
    vertical-align: middle;
    .empty-selection {
        font-size: 14px;
        font-weight: 400;
    }
    .files-view-item {
        display: inline-block;
        float: left;
        line-height: 40px;
        border: 0;

        background-color: $green;
        color: #fff;

        padding: 0 10px;
        height: 40px;
        font-size: 12px;
        cursor: default;

        &:not(:last-child) {
            margin-right: 10px;
        }
        .close-container {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            text-align: center;
            font-weight: bold;
            cursor: pointer;
            font-size: 15px;
            float: right;
            line-height: 17px;
            margin-top: 10px;
            margin-left: 5px;
            &:hover {
                background-color: $ui-background;
                color: #fff;
            }
        }
    }
    .explorationJobId {
        background-color: $pink;
        color: #fff;
    }
}
</style>
