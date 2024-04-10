<template>
    <div :class="className" :style="{ height: height, width: width }"></div>
</template>
<script>
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
    TooltipComponent,
    LegendComponent,
    GridComponent,
    AxisPointerComponent,
    TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { debounce } from "@/utils/helpers";

// Register components and the renderer
echarts.use([
    BarChart,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    AxisPointerComponent,
    TitleComponent,
    CanvasRenderer
]);

export default {
    name: "CategoryStack",
    props: {
        className: {
            type: String,
            default: "echarts-category-stack",
        },
        width: {
            type: String,
            default: "100%",
        },
        height: {
            type: String,
            default: "300px",
        },
        categoryStackData: {
            type: Object,
            required: true,
        },
        theme: {
            type: String,
            default: 'macarons',
        },
    },
    data() {
        return {
            chart: null,
        };
    },
    mounted() {
        this.initChart();
        this.__resizeHanlder = debounce(() => this.chart && this.chart.resize(), 100);
        window.addEventListener("resize", this.__resizeHanlder);
    },
    beforeDestroy() {
        if (this.chart) {
            window.removeEventListener("resize", this.__resizeHanlder);
            this.chart.dispose();
            this.chart = null;
        }
    },
    watch: {
        categoryStackData: {
            handler() {
                this.updateChart();
            },
            deep: true,
        },
        theme: {
            handler() {
                this.initChart();
            }
        }
    },
    methods: {
        initChart() {
            if (this.chart != null) {
                this.chart.dispose(); // Dispose the existing chart instance before creating a new one
            }
            this.chart = echarts.init(this.$el, this.theme);
            this.updateChart();
        },
        updateChart() {
            if (!this.chart) {
                return;
            }
            const option = {
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                legend: {},
                grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                xAxis: {
                    type: 'value', // Example category data
                    axisLabel: {
                        color: 'black', // Set y-axis label color to black
                    }
                },
                yAxis: this.categoryStackData.yAxis,
                series: this.categoryStackData.series,
            };
            this.chart.setOption(option, true); // The second parameter `true` ensures not to merge with previous options
        }
    },
};

</script>
<style scoped>
.echarts-category-stack {
    display: block;
    /* Ensures the div container takes up space as per width and height */
}

</style>
