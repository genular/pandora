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
        params: query
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
        params: query
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
        params: query
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
        params: query
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
        params: query
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
        params: query
    });
}
/**
 * [fetchGraphModelSummary description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
export function fetchGraphModelSummary(query) {
    return request({
        url: baseUrlPath + "/model-summary/render-plot",
        method: "GET",
        params: query
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
        params: query
    });
}
