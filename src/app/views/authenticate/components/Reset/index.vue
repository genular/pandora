<template>
    <div class="reset-tab-container">
       <span><br />This function is not implemented. Please go back.<br /></span>
    </div>
</template>
<script>

export default {
    name: "Reset",
    props: {
        action: {
            default: "reset",
            type: String
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
@import "~scss_vars";

.reset-tab-container {
    padding: 15px;
}
</style>
