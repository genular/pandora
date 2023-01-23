<template>
    <div :class="className" :style="{ height: height, width: width }"></div>
</template>

<script>
import * as echarts from "echarts";
// echarts theme
require("echarts/theme/macarons");

import { debounce } from "@/utils/helpers";

export default {
    name: "pieChart",
    props: {
        className: {
            type: String,
            default: "chart",
        },
        width: {
            type: String,
            default: "100%",
        },
        height: {
            type: String,
            default: "300px",
        },
    },
    data() {
        return {
            chart: null,
            __resizeHanlder: null,
        };
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
        this.$nextTick(() => {
            this.initChart();
        });

        this.__resizeHanlder = debounce(() => {
            if (this.chart) {
                this.chart.resize();
            }
        }, 100);
        window.addEventListener("resize", this.__resizeHanlder);
    },
    activated: function () {
        console.log("activated: " + this.$options.name);
    },
    created: function () {
        console.log("created: " + this.$options.name);
    },
    beforeDestroy() {
        if (!this.chart) {
            return;
        }
        window.removeEventListener("resize", this.__resizeHanlder);
        this.chart.dispose();
        this.chart = null;
    },
    methods: {
        initChart() {
            this.chart = echarts.init(this.$el, "macarons");

            this.chart.setOption({
                legend: {},
                tooltip: {
                    trigger: "item",
                    formatter: "{a} <br/>{b} : {c} ({d}%)",
                },
                toolbox: {
                    show: true,
                    showTitle: false,
                    orient: "horizontal",
                    left: "right",
                    top: -10,
                    feature: {
                        saveAsImage: {
                            type: "png",
                            title: "save as image",
                            name: "chart",
                        },
                        dataView: {
                            show: true,
                            title: "show data",
                        },
                    },
                },
                grid: {
                    top: 20,
                },
                series: [
                    {
                        name: "min distribution",
                        type: "pie",
                        radius: 60,
                        center: ["25%", "30%"],
                        data: [
                            { value: 25, name: "Training" },
                            { value: 75, name: "Testing" },
                        ],
                    },
                    {
                        name: "max distribution",
                        type: "pie",
                        radius: 60,
                        center: ["75%", "30%"],
                        data: [
                            { value: 50, name: "Training" },
                            { value: 50, name: "Testing" },
                        ],
                    },
                    {
                        name: "median",
                        type: "pie",
                        radius: 60,
                        center: ["25%", "75%"],
                        data: [
                            { value: 50, name: "Training" },
                            { value: 50, name: "Testing" },
                        ],
                    },
                    {
                        name: "unique values",
                        type: "pie",
                        radius: 60,
                        center: ["25%", "75%"],
                        data: [
                            { value: 50, name: "Training" },
                            { value: 50, name: "Testing" },
                        ],
                    },
                ],
            });
        },
    },
};
</script>
