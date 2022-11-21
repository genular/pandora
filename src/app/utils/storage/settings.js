const engine = require("store/src/store-engine");
const storages = [
	require("store/storages/localStorage"),
	require("store/storages/sessionStorage"),
	require("store/storages/cookieStorage"),
	require("store/storages/memoryStorage"),
];
const plugins = [require("store/plugins/defaults"), require("store/plugins/expire")];

const estore = engine.createStore(storages, plugins);

export default estore;
