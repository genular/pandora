<template>
  <div :class="className" :style="{height:height, width:width}"></div>
</template>

<script>
import * as echarts from "echarts";
// echarts theme
require("echarts/theme/macarons");

import { debounce } from "@/utils";

export default {
    name: "pieChart",
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
        },
        statisticalData: {
            type: Object,
            default: function() {
                return {};
            }
        }
    },
    data() {
        return {
            chart: null
        };
    },
    mounted() {
        console.log("pie mounted: " + this.className);

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
    activated: function() {
        console.log("pie activated: " + this.className);
    },
    created: function() {
        console.log("pie created: " + this.className);
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
            this.chart = echarts.init(this.$el, "macarons", { renderer: "svg" });

            const chartOptions = {
                tooltip: {
                    trigger: "item",
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    left: "center",
                    bottom: "10",
                    data: ["Male", "Female"]
                },
                toolbox: {
                    show: true,
                    showTitle: false,
                    orient: "horizontal",
                    left: "right",
                    top: -10,
                    feature: {
                        saveAsImage: {
                            type: "svg",
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
                    top: 20
                },
                series: [
                    {
                        name: "Summary",
                        type: "pie",
                        roseType: "radius",
                        radius: "55%",
                        center: ["50%", "50%"],
                        data: [
                            // POPULATE THIS
                        ],
                        animationEasing: "cubicInOut",
                        animationDuration: 2600
                    }
                ]
            };

            for (let type of this.statisticalData.types) {
                const name = "Data: " + type;
                const typeValue = this.statisticalData.series[name].data.total;

                chartOptions.series[0].data.push({ value: typeValue, name: name })
            }

            this.chart.setOption(chartOptions);
        }
    }
};
</script>
