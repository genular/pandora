<template>
    <div class="dashboard-inner-container">
        <panel-group></panel-group>
        <el-row>
            <el-col :xs="{ span: 24 }" :sm="{ span: 24 }" :md="{ span: 24 }" :lg="{ span: 24 }" :xl="{ span: 24 }" style="padding-right:8px; margin-bottom:30px;">
                <queue-table></queue-table>
            </el-col>
        </el-row>
        <el-button class="tutorial_button" icon="el-icon-question" size="mini" type="primary" round @click.prevent.stop="startGuide">{{ $t("globals.buttons.guide.title") }}</el-button>
    </div>
</template>
<script>
import Driver from "driver.js";
import "driver.js/dist/driver.min.css";

import { tutorial } from "./tutorial";
import { PanelGroup, QueueTable } from "./components";

export default {
    name: "dashboard-admin",
    components: {
        PanelGroup,
        QueueTable
    },
    mounted() {
        console.log("mounted: dashboard");
        this.driver = new Driver({
            doneBtnText: this.$t("globals.buttons.guide.doneBtnText"),
            closeBtnText: this.$t("globals.buttons.guide.closeBtnText"),
            nextBtnText: this.$t("globals.buttons.guide.nextBtnText"),
            prevBtnText: this.$t("globals.buttons.guide.prevBtnText")
        });
    },
    methods: {
        tutorial,
        startGuide() {
            this.driver.defineSteps(this.tutorial());
            if (!this.driver.isActivated) {
                this.driver.start();
            }
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.tutorial_button {
    position: fixed;
    right: 30px;
    bottom: 5px;
    z-index: 100;
}
</style>
