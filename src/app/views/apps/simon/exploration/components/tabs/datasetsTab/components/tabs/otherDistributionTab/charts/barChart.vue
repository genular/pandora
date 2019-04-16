<template>
    <div :class="className" :style="{ height: height, width: width }"></div>
</template>

<script>
import echarts from "echarts";
// echarts theme
require("echarts/theme/macarons");

import { debounce } from "@/utils/helpers";

const animationDuration = 6000;

export default {
    name: "barChart",
    props: {
        className: {
            type: String,
            default: "chart"
        },
        width: {
            type: String,
            default: "100%"
        },
        height: {
            type: String,
            default: "300px"
        }
    },
    data() {
        return {
            chart: null,
            barGaps: ["30%", "-100%"],
            loopIndex: 0
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
        toggleBarChartData() {
            var barGap = this.barGaps[this.loopIndex];

            this.chart.setOption({
                series: [
                    {
                        barGap: barGap
                    }
                ]
            });
            this.loopIndex = (this.loopIndex + 1) % this.barGaps.length;
        },
        initChart() {
            this.chart = echarts.init(this.$el, "macarons");
            const self = this;
            this.chart.setOption({
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "shadow"
                    }
                },
                toolbox: {
                    show: true,
                    showTitle: false,
                    orient: "horizontal",
                    left: "right",
                    top: -10,
                    feature: {
                        myTool1: {
                            show: true,
                            title: "toggle data",
                            icon:
                                "path://M432.45,595.444c0,2.177-4.661,6.82-11.305,6.82c-6.475,0-11.306-4.567-11.306-6.82s4.852-6.812,11.306-6.812C427.841,588.632,432.452,593.191,432.45,595.444L432.45,595.444z M421.155,589.876c-3.009,0-5.448,2.495-5.448,5.572s2.439,5.572,5.448,5.572c3.01,0,5.449-2.495,5.449-5.572C426.604,592.371,424.165,589.876,421.155,589.876L421.155,589.876z M421.146,591.891c-1.916,0-3.47,1.589-3.47,3.549c0,1.959,1.554,3.548,3.47,3.548s3.469-1.589,3.469-3.548C424.614,593.479,423.062,591.891,421.146,591.891L421.146,591.891zM421.146,591.891",
                            onclick: function() {
                                self.toggleBarChartData();
                            }
                        },
                        saveAsImage: {
                            type: "png",
                            title: "save as image",
                            name: "chart"
                        },
                        dataView: {
                            show: true,
                            title: "show data"
                        }
                    }
                },
                grid: {
                    top: 20,
                    left: "2%",
                    right: "2%",
                    bottom: "3%",
                    containLabel: true
                },
                xAxis: [
                    {
                        type: "category",
                        data: ["Training", "Testing"],
                        axisTick: {
                            alignWithLabel: true
                        }
                    }
                ],
                yAxis: [
                    {
                        type: "value",
                        axisTick: {
                            show: false
                        }
                    }
                ],
                series: [
                    {
                        name: "Male",
                        type: "bar",
                        silent: true,
                        barWidth: "25%",
                        barGap: "-100%", // Make series be overlap
                        data: [79, 52],
                        animationDuration
                    },
                    {
                        name: "Female",
                        type: "bar",
                        barWidth: "25%",
                        z: 10,
                        data: [45, 60],
                        animationDuration
                    }
                ]
            });
        }
    }
};
</script>
