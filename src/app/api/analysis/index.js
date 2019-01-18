/*
* @Author: LogIN-
* @Date:   2018-03-22 13:10:16
* @Last Modified by:   LogIN-
* @Last Modified time: 2018-06-28 16:36:49
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
        params: query,
        responseType: "arraybuffer"
    });
}

export function fetchSAMJob() {
    return request({
        url: baseUrlPath + "/apps/simon/analysis/samrcheck",
        method: "GET",
        responseType: "arraybuffer"
    });
}
