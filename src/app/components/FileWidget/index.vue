<template>
    <el-col :xs="{ span: 3 }" :sm="{ span: 2 }" :md="{ span: 3 }" :lg="{ span: 3 }" :xl="{ span: 2 }">
        <template v-if="Array.isArray(file)">
            <div class="file">
                <div class="file-preview">
                    <div class="icon">
                        <i class="fa fa-fw fa-folder"></i>
                    </div>
                </div>
                <div class="file-title">
                    <h3>{{ filekey }}</h3>
                </div>
            </div>
        </template>
        <template v-else-if="!Array.isArray(file)">
            <div class="file" :class="file.basename === '.processing' ? 'system-file' : ''">
                <div class="file-preview">
                    <div class="icon">
                        <i class="fa fa-fw fa-file"></i>
                    </div>
                </div>
                <div class="file-title">
                    <h3>{{ file.basename }}</h3>
                </div>
            </div>
        </template>
    </el-col>
</template>
<script>
export default {
    props: ["file", "filekey"],
    methods: {},
};
</script>
<style rel="stylesheet/scss" lang="scss">
@import "~scss_vars";
$fileHeight: 100px;
.active-file {
    .file {
        background-color: #35224a;
        .icon {
            color: #ffffff !important;
        }
    }
}

.file {
    position: relative;
    margin: 10px;
    cursor: pointer;
    transition: border-color 0.4s;
    background-color: white;
    .file-preview {
        height: $fileHeight;
        overflow: hidden;
        .thumb {
            width: 100%;
        }
        .icon {
            text-align: center;
            line-height: $fileHeight - 15;
            font-size: $fileHeight / 2;
            color: $ui-background;
        }
    }
    .file-title {
        position: absolute;
        height: 20px;
        right: 0;
        bottom: 0;
        left: 0;
        overflow: hidden;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        h3 {
            color: #fff;
            margin: 0 4px;
            line-height: 20px;
            font-size: 10px;
        }
    }
}

.system-file {
    opacity: 0.5;
}

.file:hover,
.file:focus,
.file.selected {
    .file-actions {
        display: block;
    }
}
</style>
