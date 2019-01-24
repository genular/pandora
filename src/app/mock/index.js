import Mock from "mockjs";

import loginAPI from "./login";
import transactionAPI from "./transaction";

// import queueAPI from "./queue";
// Mock.setup({
//   timeout: '350-600'
// })

Mock.mock(/\/login\/logout/, "post", loginAPI.logout);
Mock.mock(/\/transaction\/list/, "get", transactionAPI.getList);

// Mock.mock(/\/queue\/list/, "get", queueAPI.getList);
// Mock.mock(/\/queue\/pv/, "get", queueAPI.getPv);

/*
Mock.mock(/\/search\/user/, 'get', remoteSearchAPI.searchUser)
*/

export default Mock;
