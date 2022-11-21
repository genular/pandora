<template>
    <div class="server-load" style="clear: both;bottom: 0;position: absolute;">
        <el-row>
            <el-col :span="12">
                <gauge-chart className="gauge-chart-cpu" :dataValue="currentServerLoad" :width="'250px'" :height="'300px'"></gauge-chart>
            </el-col>
        </el-row>
    </div>
</template>

<script>

import gaugeChart from "@/components/Charts/gaugeChart";

export default {
    name: "ServerLoad",
    components: { gaugeChart },
    props: {
        currentServerLoad: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            dataValue: 0,
        };
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">

</style>
