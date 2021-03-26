import {
    fetchSimonAvailablePackages as ApiFetchSimonAvailablePackages,
    simonHeaderVerify as ApiSimonHeaderVerify,
    submitDatasetQueueTask as ApiSubmitDatasetQueueTask,
} from "@/api/backend";

import estore from "@/utils/storage/settings";

const apps = {
    state: {
        simon: {
            avaliablePackages: estore.get("apps-simon-avaliablePackages") || [],
            selectedPackages: estore.get("apps-simon-selectedPackages") || [],
            analysis: {
                job_id: estore.get("apps-simon-analysis-job_id") || "",
                selectedFilesHash: estore.get("apps-simon-analysis-selectedFilesHash") || "",

                avaliableFeatures: estore.get("apps-simon-analysis-avaliableFeatures") || [],
                selectedFeatures: estore.get("apps-simon-analysis-selectedFeatures") || [],
                excludeFeatures: estore.get("apps-simon-analysis-excludeFeatures") || [],
                selectedOutcome: estore.get("apps-simon-analysis-selectedOutcome") || [],
                selectedClasses: estore.get("apps-simon-analysis-selectedClasses") || [],
                selectedFormula: estore.get("apps-simon-analysis-selectedFormula") || [],
                timeSeriesDate: estore.get("apps-simon-analysis-timeSeriesDate") || [],
                selectedPreProcess: estore.get("apps-simon-analysis-selectedPreProcess") || ["center", "scale"],
                selectedPartitionSplit: estore.get("apps-simon-analysis-selectedPartitionSplit") || 75,

                total_samples: estore.get("apps-simon-analysis-total_samples") || 0,
                invalid_samples: estore.get("apps-simon-analysis-invalid_samples") || [],
                total_na_values: estore.get("apps-simon-analysis-total_na_values") || 0,
                filter: {
                    features: estore.get("apps-simon-analysis-filter-features") || false,
                    outcome: estore.get("apps-simon-analysis-filter-outcome") || false,
                    extraction: estore.get("apps-simon-analysis-filter-extraction") || false,
                    backwardSelection: estore.get("apps-simon-analysis-filter-backwardSelection") || false,
                },
            },
            exploration: {
                queueIDs: estore.get("apps-simon-exploration-queueIDs") || "",
                selectedFeatureSetId: estore.get("apps-simon-exploration-selectedFeatureSetId") || 0,
                selectedModelsIDs: estore.get("apps-simon-exploration-selectedModelsIDs") || [],
                activeTabName: estore.get("apps-simon-exploration-activeTabName") || "datasetsTab",
                datasetsTabMapOptions: estore.get("apps-simon-exploration-datasetsTabMapOptions") || [],
            },
            editing: {
                activeTabName: estore.get("apps-simon-editing-activeTabName") || "overviewTab",
            },
        },
    },

    mutations: {
        SET_SIMON_AVALIABLE_PACKAGES: (state, avaliablePackages) => {
            state.simon.avaliablePackages = avaliablePackages;
            estore.set("apps-simon-avaliablePackages", avaliablePackages);
        },
        SET_SIMON_SELECTED_PACKAGES: (state, selectedPackages) => {
            state.simon.selectedPackages = selectedPackages;
            estore.set("apps-simon-selectedPackages", selectedPackages);
        },
        // exploration
        SET_SIMON_EXPLORATION_QUEUE_IDS: (state, queueIDs) => {
            state.simon.exploration.queueIDs = queueIDs;
            estore.set("apps-simon-exploration-queueIDs", queueIDs);
        },
        SET_SIMON_EXPLORATION_SELECTED_FEATURE_SET_ID: (state, selectedFeatureSetId) => {
            state.simon.exploration.selectedFeatureSetId = selectedFeatureSetId;
            estore.set("apps-simon-exploration-selectedFeatureSetId", selectedFeatureSetId);
        },
        SET_SIMON_EXPLORATION_SELECTED_MODEL_ID: (state, selectedModelsIDs) => {
            state.simon.exploration.selectedModelsIDs = selectedModelsIDs;
            estore.set("apps-simon-exploration-selectedModelsIDs", selectedModelsIDs);
        },
        SET_SIMON_EXPLORATION_ACTIVE_TAB_NAME: (state, activeTabName) => {
            state.simon.exploration.activeTabName = activeTabName;
            estore.set("apps-simon-exploration-activeTabName", activeTabName);
        },
        SET_SIMON_EXPLORATION_ACTIVE_DATASETS_TAB_MAP_OPTIONS: (state, datasetsTabMapOptions) => {
            state.simon.exploration.datasetsTabMapOptions = datasetsTabMapOptions;
            estore.set("apps-simon-exploration-datasetsTabMapOptions", datasetsTabMapOptions);
        },
        // editing
        SET_SIMON_EDITING_ACTIVE_TAB_NAME: (state, activeTabName) => {
            state.simon.editing.activeTabName = activeTabName;
            estore.set("apps-simon-editing-activeTabName", activeTabName);
        },
        // analysis
        SET_SIMON_ANALYSIS_JOB_ID: (state, job_id) => {
            state.simon.analysis.job_id = job_id;
            estore.set("apps-simon-analysis-job_id", job_id);
        },
        SET_SIMON_ANALYSIS_SELECTED_FILES_HASH: (state, selectedFilesHash) => {
            state.simon.analysis.selectedFilesHash = selectedFilesHash;
            estore.set("apps-simon-analysis-selectedFilesHash", selectedFilesHash);
        },
        SET_SIMON_ANALYSIS_AVALIABLE_FEATURES: (state, avaliableFeatures) => {
            state.simon.analysis.avaliableFeatures = avaliableFeatures;
            estore.set("apps-simon-analysis-avaliableFeatures", avaliableFeatures);
        },
        SET_SIMON_ANALYSIS_SELECTED_FEATURES: (state, selectedFeatures) => {
            state.simon.analysis.selectedFeatures = selectedFeatures;
            estore.set("apps-simon-analysis-selectedFeatures", selectedFeatures);
        },
        SET_SIMON_ANALYSIS_EXCLUDE_FEATURES: (state, excludeFeatures) => {
            state.simon.analysis.excludeFeatures = excludeFeatures;
            estore.set("apps-simon-analysis-excludeFeatures", excludeFeatures);
        },
        SET_SIMON_ANALYSIS_SELECTED_OUTCOME: (state, selectedOutcome) => {
            state.simon.analysis.selectedOutcome = selectedOutcome;
            estore.set("apps-simon-analysis-selectedOutcome", selectedOutcome);
        },
        SET_SIMON_ANALYSIS_SELECTED_CLASSES: (state, selectedClasses) => {
            state.simon.analysis.selectedClasses = selectedClasses;
            estore.set("apps-simon-analysis-selectedClasses", selectedClasses);
        },
        SET_SIMON_ANALYSIS_SELECTED_FORMULA: (state, selectedFormula) => {
            state.simon.analysis.selectedFormula = selectedFormula;
            estore.set("apps-simon-analysis-selectedFormula", selectedFormula);
        },
        SET_SIMON_ANALYSIS_TIME_SERIES_DATE: (state, timeSeriesDate) => {
            state.simon.analysis.timeSeriesDate = timeSeriesDate;
            estore.set("apps-simon-analysis-timeSeriesDate", timeSeriesDate);
        },
        SET_SIMON_ANALYSIS_SELECTED_PREPROCESS: (state, selectedPreProcess) => {
            state.simon.analysis.selectedPreProcess = selectedPreProcess;
            estore.set("apps-simon-analysis-selectedPreProcess", selectedPreProcess);
        },
        SET_SIMON_ANALYSIS_SELECTED_PARITTIONSPLIT: (state, selectedPartitionSplit) => {
            state.simon.analysis.selectedPartitionSplit = selectedPartitionSplit;
            estore.set("apps-simon-analysis-selectedPartitionSplit", selectedPartitionSplit);
        },
        SET_SIMON_ANALYSIS_TOTAL_SAMPLES: (state, total_samples) => {
            state.simon.analysis.total_samples = total_samples;
            estore.set("apps-simon-analysis-total_samples", total_samples);
        },
        SET_SIMON_ANALYSIS_INVALID_SAMPLES: (state, invalid_samples) => {
            state.simon.analysis.invalid_samples = invalid_samples;
            estore.set("apps-simon-analysis-invalid_samples", invalid_samples);
        },
        SET_SIMON_ANALYSIS_TOTAL_NA_VALUES: (state, total_na_values) => {
            state.simon.analysis.total_na_values = total_na_values;
            estore.set("apps-simon-analysis-total_na_values", total_na_values);
        },
        SET_SIMON_ANALYSIS_FILTER_FEATURES: (state, filter_features) => {
            state.simon.analysis.filter.features = filter_features;
            estore.set("apps-simon-analysis-filter-features", filter_features);
        },
        SET_SIMON_ANALYSIS_FILTER_OUTCOME: (state, filter_outcome) => {
            state.simon.analysis.filter.outcome = filter_outcome;
            estore.set("apps-simon-analysis-filter-outcome", filter_outcome);
        },
        SET_SIMON_ANALYSIS_FILTER_EXTRACTION: (state, filter_extraction) => {
            state.simon.analysis.filter.extraction = filter_extraction;
            estore.set("apps-simon-analysis-filter-extraction", filter_extraction);
        },
        SET_SIMON_ANALYSIS_BACKWARD_SELECTION: (state, backwardSelection) => {
            state.simon.analysis.filter.backwardSelection = backwardSelection;
            estore.set("apps-simon-analysis-filter-backwardSelection", backwardSelection);
        },
    },

    actions: {
        addSimonJobAnalysis({ commit, state }, submitData) {
            return new Promise((resolve, reject) => {
                ApiSubmitDatasetQueueTask(submitData)
                    .then((response) => {
                        if (response.data.success === true) {
                            resolve(true);
                        } else {
                            console.log(response);
                            resolve(false);
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        resolve(false);
                    });
            });
        },

        /** Fetch and set available statistical packages in the Store */
        setSimonAvailablePackages({ commit, state }, selectedFiles) {
            return new Promise((resolve, reject) => {
                ApiFetchSimonAvailablePackages(selectedFiles)
                    .then((response) => {
                        if (response.data.success === true) {
                            commit(
                                "SET_SIMON_AVALIABLE_PACKAGES",
                                response.data.message.filter((obj) => obj.preselected === 0)
                            );
                            commit(
                                "SET_SIMON_SELECTED_PACKAGES",
                                response.data.message.filter((obj) => obj.preselected === 1)
                            );
                            resolve(true);
                        } else {
                            reject(response.data);
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        /** Read features for desired file from back-end API */
        setSimonAnalysisFeatures({ commit }, selectedFiles) {
            return new Promise((resolve, reject) => {
                ApiSimonHeaderVerify(selectedFiles)
                    .then(function (response) {
                        const success = response.data.success;
                        const message = response.data.message;

                        let status = true;

                        if (success === false) {
                            commit("SET_SIMON_ANALYSIS_AVALIABLE_FEATURES", []);
                            status = message;
                        } else if (success === true) {
                            commit("SET_SIMON_ANALYSIS_AVALIABLE_FEATURES", message);
                            console.log("Reseting all available features");

                            // Reset submission fields from prev analysis
                            commit("SET_SIMON_ANALYSIS_SELECTED_FEATURES", []);
                            commit("SET_SIMON_ANALYSIS_EXCLUDE_FEATURES", []);
                            commit("SET_SIMON_ANALYSIS_SELECTED_OUTCOME", []);
                            commit("SET_SIMON_ANALYSIS_SELECTED_CLASSES", []);
                            commit("SET_SIMON_ANALYSIS_SELECTED_FORMULA", []);

                            commit("SET_SIMON_ANALYSIS_SELECTED_PREPROCESS", ["center", "scale"]);
                            commit("SET_SIMON_ANALYSIS_SELECTED_PARITTIONSPLIT", 75);
                            commit("SET_SIMON_ANALYSIS_FILTER_EXTRACTION", false);
                            commit("SET_SIMON_ANALYSIS_BACKWARD_SELECTION", false);
                            commit("SET_SIMON_ANALYSIS_FILTER_FEATURES", false);
                            commit("SET_SIMON_ANALYSIS_FILTER_OUTCOME", false);
                        }

                        if (typeof success !== "undefined") {
                            resolve(status);
                        } else {
                            reject("Invalid response");
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        setSimonAvaliablePackages({ commit }, packages) {
            commit("SET_SIMON_AVALIABLE_PACKAGES", packages);
        },
        setSimonSelectedPackages({ commit }, packages) {
            commit("SET_SIMON_SELECTED_PACKAGES", packages);
        },
        setSimonAnalysisJobId({ commit }, job_id) {
            commit("SET_SIMON_ANALYSIS_JOB_ID", job_id);
        },
        setSimonAnalysisSelectedFileHash({ commit }, selectedFilesHash) {
            commit("SET_SIMON_ANALYSIS_SELECTED_FILES_HASH", selectedFilesHash);
        },
        setSimonAnalysisAvaliableFeatures({ commit }, avaliableFeatures) {
            commit("SET_SIMON_ANALYSIS_AVALIABLE_FEATURES", avaliableFeatures);
        },
        setSimonAnalysisSelectedFeatures({ commit }, selectedFeatures) {
            commit("SET_SIMON_ANALYSIS_SELECTED_FEATURES", selectedFeatures);
        },
        setSimonAnalysisExcludeFeatures({ commit }, excludeFeatures) {
            commit("SET_SIMON_ANALYSIS_EXCLUDE_FEATURES", excludeFeatures);
        },
        setSimonAnalysisSelectedOutcome({ commit }, selectedOutcome) {
            commit("SET_SIMON_ANALYSIS_SELECTED_OUTCOME", selectedOutcome);
        },
        setSimonAnalysisSelectedClasses({ commit }, selectedClasses) {
            commit("SET_SIMON_ANALYSIS_SELECTED_CLASSES", selectedClasses);
        },
        setSimonAnalysisSelectedFormula({ commit }, selectedFormula) {
            commit("SET_SIMON_ANALYSIS_SELECTED_FORMULA", selectedFormula);
        },
        setSimonAnalysisTimeSeriesDate({ commit }, timeSeriesDate) {
            commit("SET_SIMON_ANALYSIS_TIME_SERIES_DATE", timeSeriesDate);
        },
        setSimonAnalysisSelectedPreProcess({ commit }, selectedPreProcess) {
            commit("SET_SIMON_ANALYSIS_SELECTED_PREPROCESS", selectedPreProcess);
        },
        setSimonAnalysisSelectedPartitionSplit({ commit }, selectedPartitionSplit) {
            commit("SET_SIMON_ANALYSIS_SELECTED_PARITTIONSPLIT", selectedPartitionSplit);
        },
        setSimonAnalysisTotalSamples({ commit }, total_samples) {
            commit("SET_SIMON_ANALYSIS_TOTAL_SAMPLES", total_samples);
        },
        setSimonAnalysisInvalidSamples({ commit }, total_samples) {
            commit("SET_SIMON_ANALYSIS_INVALID_SAMPLES", total_samples);
        },
        setSimonAnalysisTotalNAValues({ commit }, total_na_values) {
            commit("SET_SIMON_ANALYSIS_TOTAL_NA_VALUES", total_na_values);
        },
        setSimonAnalysisFilterFeatures({ commit }, filter_features) {
            commit("SET_SIMON_ANALYSIS_FILTER_FEATURES", filter_features);
        },
        setSimonAnalysisFilterOutcome({ commit }, filter_outcome) {
            commit("SET_SIMON_ANALYSIS_FILTER_OUTCOME", filter_outcome);
        },
        setSimonAnalysisFilterExtraction({ commit }, filter_extraction) {
            commit("SET_SIMON_ANALYSIS_FILTER_EXTRACTION", filter_extraction);
        },
        setSimonAnalysisBackwardSelection({ commit }, backwardSelection) {
            commit("SET_SIMON_ANALYSIS_BACKWARD_SELECTION", backwardSelection);
        },
        // exploration
        setSimonExplorationQueueIDs({ commit }, queueIDs) {
            commit("SET_SIMON_EXPLORATION_QUEUE_IDS", queueIDs);
        },
        setSimonExplorationSelectedFeatureSetId({ commit }, selectedFeatureSetId) {
            commit("SET_SIMON_EXPLORATION_SELECTED_FEATURE_SET_ID", selectedFeatureSetId);
        },
        setSimonExplorationSelectedModelId({ commit }, selectedModelsIDs) {
            commit("SET_SIMON_EXPLORATION_SELECTED_MODEL_ID", selectedModelsIDs);
        },
        setSimonExplorationnActiveTabName({ commit }, activeTabName) {
            commit("SET_SIMON_EXPLORATION_ACTIVE_TAB_NAME", activeTabName);
        },
        setSimonExplorationDatasetsTabMapOptions({ commit }, datasetsTabMapOptions) {
            commit("SET_SIMON_EXPLORATION_ACTIVE_DATASETS_TAB_MAP_OPTIONS", datasetsTabMapOptions);
        },
        // editing
        setSimonEditingActiveTabName({ commit }, activeTabName) {
            commit("SET_SIMON_EDITING_ACTIVE_TAB_NAME", activeTabName);
        },
    },
};

export default apps;
