/*
* @Author: LogIN-
* @Date:   2018-03-22 13:10:00
* @Last Modified by:   LogIN-
* @Last Modified time: 2018-06-15 16:02:46
*/
import request from "@/utils/request";
const baseUrlPath = "/general";

export function checkServerConnectivity() {
    return request({
        url: baseUrlPath + "/",
        method: "GET"
    });
}



// export function fetchCurrentProcessList(query) {
//     return request({
//         url: baseUrlPath + "/transaction/list",
//         method: "GET",
//         params: query
//     });
// }
