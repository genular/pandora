const errorLog = {
    state: {
        logs: []
    },
    mutations: {
        ADD_LOG: (state, log) => {
            state.logs.push(log);
        },
        CLEAR_LOG: (state) => {
            state.logs = [];
        }
    },
    actions: {
        addLog({ commit }, log) {
            commit("ADD_LOG", log);
        },
        clearLog({ commit }) {
            commit("CLEAR_LOG");
        }
    }
};

export default errorLog;
