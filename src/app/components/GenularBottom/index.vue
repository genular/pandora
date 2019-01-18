<template>
    <div>

    </div>
</template>

<script>
export default {
    name: "GenularBottom"
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.el-button-group {
    position: absolute;
    width: 170px;
    left: 0;
    right: 0;
    margin: 0 auto;
    bottom: 5px;
}

.hideSidebar {
    .el-button-group {
        left: 0;
        button {
            padding: 11px;
            border: 0 none;
            border-bottom-left-radius: 0;
            border-top-right-radius: 0;
        }
    }
}
</style>
