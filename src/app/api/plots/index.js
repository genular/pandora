/*
* @Author: LogIN-
* @Date:   2018-03-22 13:10:06
* @Last Modified by:   LogIN-
* @Last Modified time: 2019-02-08 14:30:28
*/
import request from "@/utils/request";
const baseUrlPath = "/plots";

export function fetchCorrPlotImage(query) {
    return request({
        url: baseUrlPath + "/correlation/render-plot",
        method: "GET",
        params: query
    });
}

export function fetchHeatmapImage(query) {
    return request({
        url: baseUrlPath + "/heatmap/render-plot",
        method: "GET",
        params: query
    });
}

export function fetchGraphVariableImportance(query) {
    return request({
        url: baseUrlPath + "/variableImportance/render-plot",
        method: "GET",
        params: query
    });
}

export function fetchDatasetStatisticsBoolean(query) {
    return request({
        url: baseUrlPath + "/stats/two-class",
        method: "GET",
        params: query
    });
}

export function fetchDatasetStatisticsOther(query) {
    return request({
        url: baseUrlPath + "/stats/multi-class",
        method: "GET",
        params: query
    });
}

export function fetchGraphSummary(query) {
    return request({
        url: baseUrlPath + "/summary/render-plot",
        method: "GET",
        params: query
    });
}




