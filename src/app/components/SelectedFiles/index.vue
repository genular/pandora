<template>
    <div class="selected-files-container">
        <div v-if="selectedFiles.length < 1" class="files-view-item empty-selection">{{ $t('components.SelectedFiles.select_file') }}</div>
        <div v-for="file in selectedFiles" :key="file.id" class="files-view-item active">
            {{ file.basename }}
            <span class="close-container" @click="closeSelectedFile(file.id)">x</span>
        </div>
        <div v-if="explorationJobId != ''" class="files-view-item explorationJobId" closable>
            Analysis ID: {{ explorationJobId }}
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

        background-color: #e3006e;
        color: #fff;

        padding: 0 10px;
        height: 40px;
        font-size: 12px;
        cursor: default;
        &:not(:last-child) {
            margin-right: 10px;
        }
        .close-container {
            width: 15px;
            height: 15px;
            border-radius: 25%;
            text-align: center;
            font-weight: bold;
            cursor: pointer;

            &:hover {
                background-color: #b4bccc;
                color: #fff;
            }
        }
    }
    .explorationJobId {
        background-color: #85ce61;
        color: #fff;
        border-color: #85ce61;
    }
}
</style>
