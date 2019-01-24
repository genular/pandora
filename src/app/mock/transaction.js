import Mock from "mockjs";

const List = [];
const count = 500;

for (let i = 0; i < count; i++) {
    List.push(
        Mock.mock({
            job_id:
                "7c869cf957715a67b22cb9bde9ca5520b4c80aa665cb1244f6c883c4d23fee6db6e9d154f734630a443f77478d3c9b03b556243867d21827e07807768d605aa0",
            time: +Mock.Random.date("T"),
            username: "@name()",
            "status|1": ["success", "pending"]
        })
    );
}

export default {
    getList: () => {
        return {
            total: List.length,
            items: List
        };
    }
};
