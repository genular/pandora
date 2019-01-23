<template>
    <div class="dashboard-editor-container">
        <panel-group></panel-group>
        <el-row>
            <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 24}" :xl="{span: 24}" style="padding-right:8px; margin-bottom:30px;">
                <queue-table></queue-table>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import PanelGroup from "./components/PanelGroup";
import QueueTable from "./components/QueueTable";

export default {
    name: "dashboard-admin",
    components: {
        PanelGroup,
        QueueTable
    },
    mounted() {
        console.log("mounted: dashboard");
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~scss_vars";
</style>
