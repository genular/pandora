/*
 * @Author: LogIN-
 * @Date:   2018-03-22 13:10:06
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2021-02-01 11:02:53
 */
import request from "@/utils/request";
const baseUrlPath = "/plots";

/**
 * [fetchCorrPlotImage description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchCorrPlotImage(query) {
    return request({
        url: baseUrlPath + "/correlation/render-plot",
        method: "GET",
        params: query,
    });
}

/**
 * [fetchEditingCorrPlotImage description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchEditingCorrPlotImage(query) {
    return request({
        url: baseUrlPath + "/editing/correlation/render-plot",
        method: "GET",
        params: query,
    });
}

/**
 * [fetchEditingPcaAnalysisPlot Fetch available columns for PCA analysis]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function getPCAavailableColumns(query) {
    return request({
        url: baseUrlPath + "/editing/pcaAnalysis/getAvaliableColumns",
        method: "GET",
        params: query,
    });
}

/**
 * [getOverViewAavailableColumns Fetch overview of available columns]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function getOverViewAavailableColumns(query) {
    return request({
        url: baseUrlPath + "/editing/overview/getAvaliableColumns",
        method: "GET",
        params: query,
    });
}

/**
 * [fetchEditingPcaAnalysisPlot description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchEditingPcaAnalysisPlot(query) {
    return request({
        url: baseUrlPath + "/editing/pcaAnalysis/render-plot",
        method: "GET",
        params: query,
    });
}

/**
 * [fetchOverViewPlot description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchOverViewPlot(query) {
    return request({
        url: baseUrlPath + "/editing/overview/render-plot",
        method: "GET",
        params: query,
    });
}

/**
 * [fetchTsnePlot description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchTsnePlot(query) {
    return request({
        url: baseUrlPath + "/editing/tsne/render-plot",
        method: "GET",
        params: query,
    });
}

/**
 * [fetchUmapPlot description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchUmapPlot(query) {
    return request({
        url: baseUrlPath + "/editing/umap/render-plot",
        method: "GET",
        params: query,
    });
}

/**
 * [fetchEditingPcaAnalysisPlotZoomed description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchEditingPcaAnalysisPlotZoomed(query) {
    return request({
        url: baseUrlPath + "/editing/pcaAnalysis/render-plot-zoomed",
        method: "GET",
        params: query,
    });
}

/**
 * [fetchHeatmapImage description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchHeatmapImage(query) {
    return request({
        url: baseUrlPath + "/heatmap/render-plot",
        method: "GET",
        params: query,
    });
}

/**
 * [fetchHeatmapImage description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchEditingClusteringPlotImage(query) {
    return request({
        url: baseUrlPath + "/editing/heatmap/render-plot",
        method: "GET",
        params: query,
    });
}
/**
 * [fetchGraphVariableImportance description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchGraphVariableImportance(query) {
    return request({
        url: baseUrlPath + "/variableImportance/render-plot",
        method: "GET",
        params: query,
    });
}
/**
 * [fetchDatasetStatisticsBoolean description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchDatasetStatisticsBoolean(query) {
    return request({
        url: baseUrlPath + "/stats/two-class",
        method: "GET",
        params: query,
    });
}
/**
 * [fetchDatasetStatisticsOther description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchDatasetStatisticsOther(query) {
    return request({
        url: baseUrlPath + "/stats/multi-class",
        method: "GET",
        params: query,
    });
}
/**
 * [fetchGraphSummary description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchGraphSummary(query) {
    return request({
        url: baseUrlPath + "/summary/render-plot",
        method: "GET",
        params: query,
    });
}
/**
 * [fetchGraphModelSummaryTwoClass description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchGraphModelSummaryTwoClass(query) {
    return request({
        url: baseUrlPath + "/model-summary/render-plot/two-class",
        method: "GET",
        params: query,
    });
}
/**
 * [fetchGraphModelSummaryMultiClass description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchGraphModelSummaryMultiClass(query) {
    return request({
        url: baseUrlPath + "/model-summary/render-plot/multi-class",
        method: "GET",
        params: query,
    });
}

/**
 * [fetchGraphDistribution description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchGraphDistribution(query) {
    return request({
        url: baseUrlPath + "/distribution/render-plot",
        method: "GET",
        params: query,
    });
}

/**
 * [getDatasetTempPath description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function getDatasetTempPath(query) {
    return request({
        url: baseUrlPath + "/general/get-temp-file-path",
        method: "GET",
        params: query,
    });
}

