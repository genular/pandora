<template>
    <div class="dashboard-editor-container">
        <panel-group></panel-group>
        <el-row>
            <el-col :xs="{ span: 24 }" :sm="{ span: 24 }" :md="{ span: 24 }" :lg="{ span: 24 }" :xl="{ span: 24 }" style="padding-right:8px; margin-bottom:30px;">
                <queue-table></queue-table>
            </el-col>
        </el-row>
        <el-button style="float: right;" icon="el-icon-question" size="mini" type="primary" round @click.prevent.stop="startGuide">Guide</el-button>
    </div>
</template>
<script>
import Driver from "driver.js";
import "driver.js/dist/driver.min.css";
import steps from "./tutorial";

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
        this.driver = new Driver();
    },
    methods: {
        startGuide() {
            this.driver.defineSteps(steps);
            this.driver.start();
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~scss_vars";
</style>
