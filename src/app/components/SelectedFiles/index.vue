<template>
    <div class="app-working-files">
        <span v-if="selectedFiles.length < 1" class="empty-selection"> Please select one file from Workspace!</span>

        <div v-for="file in selectedFiles" :key="file.id" class="files-view-item active" closable :type="file.type">
            {{file.basename}}
            <span class='el-icon-close' @click='closeSelectedFile(file.id)'></span>
        </div>

        <div v-if="explorationJobId != ''" class="files-view-item explorationJobId" closable>
            Analysis ID: {{ explorationJobId }}
            <span class='el-icon-close' @click.prevent.stop='handleCloseExplorationJobId()'></span>
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
.app-working-files {
    vertical-align: middle;

    .empty-selection {
        font-size: 14px;
        font-weight: 400;
    }

    .files-view-item {
        display: inline-block;
        line-height: 40px;
        border: 0;
        background: #3d2d53;
        padding: 0 10px;
        margin: 5px;
        height: 40px;
        font-size: 12px;
        cursor: default;
        &:first-of-type {
            margin-left: 5px;
        }
        &.active {
            background-color: #e3006e;
            color: #fff;
            border-color: #e3006e;
            &::before {
                content: "";
                background: #fff;
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                position: relative;
                margin-right: 2px;
            }
        }
        .el-icon-close {
            width: 17px;
            height: 17px;
            border-radius: 50%;
            text-align: center;
            transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
            transform-origin: 100% 50%;
            cursor: pointer;
            &:before {
                transform: scale(0.6);
                display: inline-block;
                vertical-align: -3px;
            }
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
