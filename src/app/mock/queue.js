import Mock from "mockjs";
import { param2Obj } from "@/utils";

const List = [];
const count = 250;

for (let i = 0; i < count; i++) {
    List.push(
        Mock.mock({
            id: "@increment",
            submitted: +Mock.Random.date("T"),
            job_id: /\d{129}/,
            author: "@EMAIL",
            processing_time: "@integer(1000000, 10000000)",
            "status|1": ["finished", "queued", "running"]
        })
    );
}

export default {
    getList: config => {
        const { author, job_id, page = 1, limit = 20, sort } = param2Obj(
            config.url
        );

        let mockList = List.filter(item => {
            if (author && item.author !== author) return false;
            if (job_id && item.job_id.indexOf(job_id) < 0) return false;
            return true;
        });

        if (sort === "-id") {
            mockList = mockList.reverse();
        }

        const pageList = mockList.filter(
            (item, index) => index < limit * page && index >= limit * (page - 1)
        );

        return {
            total: mockList.length,
            items: pageList
        };
    },
    getPv: config => {
        const { pv } = param2Obj(config.url);
        const pvData = [
            { key: "PC", pv: pv },
            { key: "mobile", pv: pv },
            { key: "ios", pv: pv },
            { key: "android", pv: pv }
        ];
        return pvData;
    }
};
