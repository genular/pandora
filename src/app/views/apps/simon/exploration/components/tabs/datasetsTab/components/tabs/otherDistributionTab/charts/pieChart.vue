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
        }
    },
    data() {
        return {
            chart: null
        };
    },
    mounted() {
        console.log("pie mounted");
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
        console.log("pie activated");
    },
    created: function() {
        console.log("pie created");
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

            console.log(this.chart);

            this.chart.setOption({
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
                        name: "Demographics data",
                        type: "pie",
                        roseType: "radius",
                        radius: "55%",
                        center: ["50%", "50%"],
                        data: [{ value: 32, name: "Male" }, { value: 43, name: "Female" }],
                        animationEasing: "cubicInOut",
                        animationDuration: 2600
                    }
                ]
            });
        }
    }
};
</script>
