<template>
    <div :class="className" :style="{ height: height, width: width }"></div>
</template>

<script>
import echarts from "echarts";
// echarts theme
require("echarts/theme/macarons");

import { debounce } from "@/utils/helpers";



export default {
    name: "gaugeChart",
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
        dataValue: {
            type: Number,
            default: 100,
        },
    },
    watch: { 
        dataValue: function(newVal, oldVal) { // watch it
            this.setChartOptions(newVal);
        }
    },
    data() {
        return {
            chart: null,
        };
    },
    mounted() {
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
    beforeDestroy() {
        if (!this.chart) {
            return;
        }
        window.removeEventListener("resize", this.__resizeHanlder);
        this.chart.dispose();
        this.chart = null;
    },
    methods: {
        setChartOptions() {
            const chartOptions = {
                series: [
                    // POPULATE THIS
                ],
            };

            if (this.dataValue !== false) {
                chartOptions.series.push({
                    animation: true,
                    animationDuration: 2500,
                    type: "gauge",
                    axisLine: {
                        lineStyle: {
                            width: 10,
                            color: [
                                [0.15, "#67e0e3"],
                                [0.3, "#37a2da"],
                                [1, "#fd666d"],
                            ],
                        },
                    },
                    pointer: {
                        itemStyle: {
                            color: "auto",
                        },
                    },
                    axisTick: {
                        distance: -10,
                        length: 5,
                        lineStyle: {
                            color: "#fff",
                            width: 1,
                        },
                    },
                    splitLine: {
                        distance: -10,
                        length: 5,
                        lineStyle: {
                            color: "#fff",
                            width: 10,
                        },
                    },
                    axisLabel: {
                        color: "auto",
                        distance: 10,
                        fontSize: 12,
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: "{value}",
                        color: "auto",
                        fontSize: 14,
                    },
                    data: [
                        {
                            value: this.dataValue,
                        },
                    ],
                });
            }

            this.chart.setOption(chartOptions);
        },
        initChart() {
            this.chart = echarts.init(this.$el, "macarons");
            // Init chart options
            this.setChartOptions();
        },
    },
};
</script>
