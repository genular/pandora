<template>
  <div :class="className" :style="{ height: height, width: width }"></div>
</template>

<script>
// Import core and necessary chart type
import * as echarts from 'echarts/core';
import { GaugeChart } from 'echarts/charts';
import {
  TooltipComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// Import the theme
import 'echarts/theme/macarons';

import { debounce } from "@/utils/helpers";

// Register components and the renderer
echarts.use([GaugeChart, TooltipComponent, TitleComponent, CanvasRenderer]);

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
                                [0.15, "#472D2D"],
                                [0.3, "#678983"],
                                [0.5, "#251B37"],
                                [1, "#A62349"],
                            ],
                        },
                    },
                    pointer: {
                        itemStyle: {
                            color: "inherit",
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
                        color: "inherit",
                        distance: 30,
                        fontSize: 14,
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: "{value}",
                        color: "inherit",
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
          // Initialize the chart
          this.chart = echarts.init(this.$el, 'macarons');
          this.setChartOptions();
        }
    },
};
</script>
