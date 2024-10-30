<template>
    <div>
        <el-row>
            <el-col :span="24">
                <el-form :inline="true">
                    <el-form-item label="Theme">
                        <el-select v-model="settingsForm.theme" size="mini" placeholder="Select" @change="redrawImage" style="width:135px;">
                            <el-option v-for="item in settingOptions.theme" :key="item.id" :label="item.name" :value="item.id">
                                <span style="float: left">{{ item.name }}</span>
                                <span style="float: right; color: #8492a6; font-size: 13px">
                                    <el-tooltip placement="top">
                                        <div slot="content" style="text-align: center;">
                                            <img :src="'static/images/plot_styles/' + item.id + '_' + settingsForm.colorPalette + '.svg'" style="height: 125px;" /><br />
                                            <span style="max-width: 125px;width: 150px;display: block;">{{ item.description }}</span>
                                        </div>
                                        <span class="el-icon-info"></span>
                                    </el-tooltip>
                                </span>
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="Color">
                        <el-select v-model="settingsForm.colorPalette" @change="redrawImage" size="mini" placeholder="Select" style="width:130px;">
                            <el-option v-for="item in settingOptions.colorPalette" :key="item.id" :label="item.value" :value="item.id">
                                <span style="float: left">{{ item.value }}</span>
                                <span style="float: right; color: #8492a6; font-size: 13px">
                                    <el-tooltip placement="top">
                                        <div slot="content" style="text-align: center;">
                                            <img :src="'static/images/plot_styles/' + settingsForm.theme + '_' + item.id + '.svg'" style="height: 125px;" /><br />
                                            <span style="max-width: 125px;width: 150px;display: block;"> colorblind: {{ item.colorblind }} </span>
                                        </div>
                                        <span class="el-icon-info"></span>
                                    </el-tooltip>
                                </span>
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="Font">
                        <el-input-number size="mini" v-model="settingsForm.fontSize" :step="1" :max="48" :min="6" style="width:100px;"> </el-input-number>
                    </el-form-item>

                    <el-form-item label="Dot">
                        <el-input-number size="mini" v-model="settingsForm.dotsize" :step="0.02" :max="75" :min="0.02" style="width:100px;"> </el-input-number>
                    </el-form-item>

                    <el-form-item label="Ratio">
                        <el-input-number size="mini" v-model="settingsForm.aspect_ratio" :step="0.1" :max="4" :min="1" style="width:100px;"> </el-input-number>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="24" style="text-align: right;">
                <el-button size="mini" type="danger" :loading="loadingPlot" round @click="redrawImage">Redraw Plot</el-button>
                <el-button size="mini" type="success" icon="el-icon-download" :disabled="renderedImage === false || loadingPlot" @click="downloadPlotImage"></el-button>
            </el-col>
        </el-row>
        <el-row justify="center">
            <el-col :span="24" v-loading="loadingPlot" element-loading-text="Processing..." style="text-align: center;">
                <!-- SVG Plot placeholder -->
                <div v-if="renderedImage !== false" style="text-align: center;">
                    <img id="var_imp_chart" class="animated fadeIn" :src="renderedImageDisplay" fit="scale-down">
                </div>
                <div v-else class="plot-placeholder">
                    <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { fetchGraphVariableImportance } from "@/api/plots";
import { md5String } from "@/utils";

import line_chart_404 from "@/assets/404_images/charts/line_chart.svg";

import plotColorPalettes from "@/assets/plots/color_palettes.json";
import plotThemes from "@/assets/plots/themes.json";

export default {
    name: "varImpChart",
    props: {
        selectedVariableImp: {
            type: Array,
            default: function() {
                return [];
            }
        },
        selectedOutcomeOptionsIDs: {
            type: Array,
            default: function() {
                return [];
            }
        }
    },
    data() {
        return {
            loadingPlot: true,
            renderedImage: false,
            renderedImageDisplay: false,
            settingOptions: {
                dotsize: 0.5,
                theme: plotThemes,
                colorPalette: plotColorPalettes
            },
            settingsForm: {
                dotsize: 0.5,
                fontSize: 12,
                theme: "theme_bw",
                colorPalette: "Set1",
                aspect_ratio: 1
            }
        };
    },
    computed: {
        selectedFeatureSetId: {
            get() {
                return this.$store.getters.pandoraExplorationSelectedFeatureSetId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedFeatureSetId", value);
            }
        },
        selectedModelsIDs: {
            get() {
                return this.$store.getters.pandoraExplorationSelectedModelId;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationSelectedModelId", value);
            }
        }
    },
    mounted() {
        console.log("mounted: varImpChart");
        if (this.renderedImage === false) {
            this.handleFetchGraphVariableImportance();
        }
    },
    methods: {
        redrawImage() {
            console.log("redrawImage");
            this.handleFetchGraphVariableImportance();
        },
        downloadPlotImage() {
            const svgBlob = new Blob([window.atob(decodeURIComponent(this.renderedImage.substring(26))) + "<!-- created by PANDORA: https://atomic-lab.org -->"], {
                type: "image/svg+xml;charset=utf-8"
            });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = "variableImportance-boxplot.svg";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        },
        handleFetchGraphVariableImportance() {
            this.loadingPlot = true;

            const plotFileName = md5String(this.selectedFeatureSetId + JSON.stringify(this.selectedVariableImp) + JSON.stringify(this.settingsForm)) + ".svg";

            fetchGraphVariableImportance({
                resampleID: this.selectedFeatureSetId,
                modelsID: JSON.stringify(this.selectedModelsIDs),
                variables: JSON.stringify(this.selectedVariableImp.map(item => item.feature_name)),
                selectedOutcomeOptionsIDs: JSON.stringify(this.selectedOutcomeOptionsIDs),
                settings: JSON.stringify(this.settingsForm)
            })
                .then(response => {
                    this.renderedImage = "data:image/svg+xml;base64," + encodeURIComponent(response.data.image);
                    this.renderedImageDisplay = "data:image/png;base64," + encodeURIComponent(response.data.image_png);
                    this.loadingPlot = false;
                })
                .catch(error => {
                    console.log("Server error occurred");
                    this.renderedImage = false;
                    this.renderedImageDisplay = false;
                    this.loadingPlot = false;
                });
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.plot-placeholder {
    text-align: center;
    > i {
        font-size: 256px;
        color: #333333;
    }
}
#var_imp_chart {
    max-width: 100%;
    margin: 0 auto;
    margin-top: 10px;
    display: block;
    image-rendering: pixelated;
    float: right;
}
</style>
