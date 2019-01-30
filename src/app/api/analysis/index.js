/*
* @Author: LogIN-
* @Date:   2018-03-22 13:10:16
* @Last Modified by:   LogIN-
* @Last Modified time: 2019-01-29 13:01:27
*/
import request from "@/utils/request";
const baseUrlPath = "/analysis";

export function submitSimonJobAnalysis(formData) {
    return request({
        url: baseUrlPath + "/queue/submit-job",
        method: "POST",
        data: formData
    });
}


export function fetchSamrFormOptions() {
    return request({
        url: baseUrlPath + "/other/sam/render-options",
        method: "GET"
    });
}

export function submitSAMJob(query) {
    return request({
        url: baseUrlPath + "/other/sam/render-plot",
        method: "GET",
        params: query
    });
}

// <!-- CATBOOST functions -->
export function fetchCatBoostFormOptions() {
    return request({
        url: baseUrlPath + "/other/predict/catboost/renderOptions",
        method: "GET"
    });
}

export function submitCatBoostJob(query) {
    return request({
        url: baseUrlPath + "/other/predict/catboost/submit",
        method: "GET",
        params: query
    });
}
