import {
    fetchSimonAvailablePackages as ApiFetchSimonAvailablePackages,
    pandoraHeaderVerify as ApiSimonHeaderVerify,
    submitDatasetQueueTask as ApiSubmitDatasetQueueTask,
} from "@/api/backend";

import estore from "@/utils/storage/settings";

const apps = {
    state: {
        pandora: {
            avaliablePackages: estore.get("apps-pandora-avaliablePackages") || [],
            selectedPackages: estore.get("apps-pandora-selectedPackages") || [],
            analysis: {
                job_id: estore.get("apps-pandora-analysis-job_id") || "",
                selectedFilesHash: estore.get("apps-pandora-analysis-selectedFilesHash") || "",

                avaliableFeatures: estore.get("apps-pandora-analysis-avaliableFeatures") || [],
                selectedFeatures: estore.get("apps-pandora-analysis-selectedFeatures") || [],
                excludeFeatures: estore.get("apps-pandora-analysis-excludeFeatures") || [],
                selectedOutcome: estore.get("apps-pandora-analysis-selectedOutcome") || [],
                selectedClasses: estore.get("apps-pandora-analysis-selectedClasses") || [],
                selectedFormula: estore.get("apps-pandora-analysis-selectedFormula") || [],
                timeSeriesDate: estore.get("apps-pandora-analysis-timeSeriesDate") || [],
                selectedPreProcess: estore.get("apps-pandora-analysis-selectedPreProcess") || ["center", "scale"],
                selectedPartitionSplit: estore.get("apps-pandora-analysis-selectedPartitionSplit") || 75,

                modelProcessingTimeLimit: estore.get("apps-pandora-analysis-modelProcessingTimeLimit") || 10,

                total_samples: estore.get("apps-pandora-analysis-total_samples") || 0,
                invalid_samples: estore.get("apps-pandora-analysis-invalid_samples") || [],
                total_na_values: estore.get("apps-pandora-analysis-total_na_values") || 0,

                filter: {
                    features: estore.get("apps-pandora-analysis-filter-features") || false,
                    outcome: estore.get("apps-pandora-analysis-filter-outcome") || false,
                    extraction: estore.get("apps-pandora-analysis-filter-extraction") || false,
                    backwardSelection: estore.get("apps-pandora-analysis-filter-backwardSelection") || false,
                },
            },
            exploration: {
                queueIDs: estore.get("apps-pandora-exploration-queueIDs") || [],
                selectedQueueID: estore.get("apps-pandora-exploration-selected-queueID") || "",
                selectedFeatureSetId: estore.get("apps-pandora-exploration-selectedFeatureSetId") || 0,
                selectedModelsIDs: estore.get("apps-pandora-exploration-selectedModelsIDs") || [],

                selectedOutcomeOptions: estore.get("apps-pandora-exploration-selectedOutcomeOptions") || [{
                    "id": 0,
                    "drid": 0,
                    "class_column": "",
                    "class_type": 2,
                    "class_original": "Overall",
                    "class_remapped": "overall"
                }],
                selectedOutcomeOptionsIDs: estore.get("apps-pandora-exploration-selectedOutcomeOptionsIDs") || [0],
                displayVariableImportance: estore.get("apps-pandora-exploration-displayVariableImportance") || [],

                activeTabName: estore.get("apps-pandora-exploration-activeTabName") || "datasetsTab",
                datasetsTabMapOptions: estore.get("apps-pandora-exploration-datasetsTabMapOptions") || [],
            },
            editing: {
                activeTabName: estore.get("apps-pandora-editing-activeTabName") || "overviewTab",

                selectedColumns: estore.get("apps-pandora-editing-selectedColumns") || [],

                selectedPreProcess: estore.get("apps-pandora-editing-selectedPreProcess") || ["medianImpute", "center", "scale", "corr", "nzv", "zv"],

                tabs: {
                    tsne: {
                        mlSettingsForm: estore.get("apps-pandora-editing-mlSettingsForm") || {
                            selectedColumns: [],
                            excludedColumns: [],
                            dataset: null
                        },
                        settingsForm: estore.get("apps-pandora-editing-tsne-settingsForm") || {
                            excludedColumns: [],
                            groupingVariables: [],
                            colorVariables: [],
                            preProcessDataset: [],

                            fontSize: 12,
                            pointSize: 8,
                            theme: "theme_bw",
                            colorPalette: "Dark2",
                            aspect_ratio: 1,
                            plot_size: 12,

                            clusterType: "Louvain",
                            epsQuantile: 0.9,
                            excludeOutliers: true,

                            // Immunaut Specific parameters for Louvain clustering
                            resolution_increments: [0.01, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5],
                            min_modularities: [0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9],
                            target_clusters_range: [3, 6],
                            pickBestClusterMethod: "Modularity",
                            selectedColumnsSIMON: [],
                            weights: { AUROC: 1, modularity: 0, silhouette: 0 },

                            cutOffColumnSize: 50000,
                            removeNA: true,

                            perplexity: 0,
                            exaggeration_factor: 0,
                            max_iter: 0,
                            theta: 0,
                            eta: 0,

                            knn_clusters: 25,
                            clustLinkage: "ward.D2",

                            clustGroups: 3,
                            legendPosition: "right",

                            datasetAnalysisClustLinkage: "ward.D2",
                            datasetAnalysisType: "heatmap",
                            datasetAnalysisGrouped: true,
                            datasetAnalysisRemoveOutliersDownstream: true,

                            datasetAnalysisSortColumn: "pandora_cluster",
                            datasetAnalysisClustOrdering: 1,
                            anyNAValues: false,
                            categoricalVariables: false,
                        }
                    }
                }
            },
        },
    },

    mutations: {
        SET_PANDORA_AVALIABLE_PACKAGES: (state, avaliablePackages) => {
            state.pandora.avaliablePackages = avaliablePackages;
            estore.set("apps-pandora-avaliablePackages", avaliablePackages);
        },
        SET_PANDORA_SELECTED_PACKAGES: (state, selectedPackages) => {
            state.pandora.selectedPackages = selectedPackages;
            estore.set("apps-pandora-selectedPackages", selectedPackages);
        },

        // exploration
        SET_PANDORA_EXPLORATION_QUEUE_IDS: (state, queueIDs) => {
            state.pandora.exploration.queueIDs = queueIDs;
            estore.set("apps-pandora-exploration-queueIDs", queueIDs);
        },
        SET_PANDORA_EXPLORATION_SELECTED_QUEUE_ID: (state, selectedQueueID) => {
            state.pandora.exploration.selectedQueueID = selectedQueueID;
            estore.set("apps-pandora-exploration-selected-queueID", selectedQueueID);
        },
        SET_PANDORA_EXPLORATION_SELECTED_FEATURE_SET_ID: (state, selectedFeatureSetId) => {
            state.pandora.exploration.selectedFeatureSetId = selectedFeatureSetId;
            estore.set("apps-pandora-exploration-selectedFeatureSetId", selectedFeatureSetId);
        },
        SET_PANDORA_EXPLORATION_SELECTED_MODEL_ID: (state, selectedModelsIDs) => {
            state.pandora.exploration.selectedModelsIDs = selectedModelsIDs;
            estore.set("apps-pandora-exploration-selectedModelsIDs", selectedModelsIDs);
        },
        SET_PANDORA_EXPLORATION_SELECTED_OUTCOME_OPTIONS: (state, selectedOutcomeOptions) => {
            state.pandora.exploration.selectedOutcomeOptions = selectedOutcomeOptions;
            estore.set("apps-pandora-exploration-selectedOutcomeOptions", selectedOutcomeOptions);
        },
        SET_PANDORA_EXPLORATION_SELECTED_OUTCOME_OPTIONS_IDS: (state, selectedOutcomeOptionsIDs) => {
            state.pandora.exploration.selectedOutcomeOptionsIDs = selectedOutcomeOptionsIDs;
            estore.set("apps-pandora-exploration-selectedOutcomeOptionsIDs", selectedOutcomeOptionsIDs);
        },
        SET_PANDORA_EXPLORATION_DISPLAY_VARIABLE_IMPORTANCE: (state, displayVariableImportance) => {
            state.pandora.exploration.displayVariableImportance = displayVariableImportance;
            estore.set("apps-pandora-exploration-displayVariableImportance", displayVariableImportance);
        },
        SET_PANDORA_EXPLORATION_ACTIVE_TAB_NAME: (state, activeTabName) => {
            state.pandora.exploration.activeTabName = activeTabName;
            estore.set("apps-pandora-exploration-activeTabName", activeTabName);
        },
        SET_PANDORA_EXPLORATION_ACTIVE_DATASETS_TAB_MAP_OPTIONS: (state, datasetsTabMapOptions) => {
            state.pandora.exploration.datasetsTabMapOptions = datasetsTabMapOptions;
            estore.set("apps-pandora-exploration-datasetsTabMapOptions", datasetsTabMapOptions);
        },

        // editing
        SET_PANDORA_EDITING_ACTIVE_TAB_NAME: (state, activeTabName) => {
            state.pandora.editing.activeTabName = activeTabName;
            estore.set("apps-pandora-editing-activeTabName", activeTabName);
        },
        SET_PANDORA_EDITING_SELECTED_PREPROCESS: (state, selectedPreProcess) => {
            state.pandora.editing.selectedPreProcess = selectedPreProcess;
            estore.set("apps-pandora-editing-selectedPreProcess", selectedPreProcess);
        },
        SET_PANDORA_EDITING_ML_SETTINGS_FORM: (state, settingsForm) => {
            state.pandora.editing.tabs.tsne.mlSettingsForm = settingsForm;
            estore.set("apps-pandora-editing-mlSettingsForm", settingsForm);
        },
        SET_PANDORA_EDITING_TSNE_SETTINGS_FORM: (state, settingsForm) => {
            state.pandora.editing.tabs.tsne.settingsForm = settingsForm;
            estore.set("apps-pandora-editing-tsne-settingsForm", settingsForm);
        },
        SET_PANDORA_EDITING_SELECTED_COLUMNS: (state, selectedColumns) => {
            state.pandora.editing.selectedColumns = selectedColumns;
            estore.set("apps-pandora-editing-selectedColumns", selectedColumns);
        },
        // analysis
        SET_PANDORA_ANALYSIS_JOB_ID: (state, job_id) => {
            state.pandora.analysis.job_id = job_id;
            estore.set("apps-pandora-analysis-job_id", job_id);
        },
        SET_PANDORA_ANALYSIS_SELECTED_FILES_HASH: (state, selectedFilesHash) => {
            state.pandora.analysis.selectedFilesHash = selectedFilesHash;
            estore.set("apps-pandora-analysis-selectedFilesHash", selectedFilesHash);
        },
        SET_PANDORA_ANALYSIS_AVALIABLE_FEATURES: (state, avaliableFeatures) => {
            state.pandora.analysis.avaliableFeatures = avaliableFeatures;
            estore.set("apps-pandora-analysis-avaliableFeatures", avaliableFeatures);
        },
        SET_PANDORA_ANALYSIS_SELECTED_FEATURES: (state, selectedFeatures) => {
            state.pandora.analysis.selectedFeatures = selectedFeatures;
            estore.set("apps-pandora-analysis-selectedFeatures", selectedFeatures);
        },
        SET_PANDORA_ANALYSIS_EXCLUDE_FEATURES: (state, excludeFeatures) => {
            state.pandora.analysis.excludeFeatures = excludeFeatures;
            estore.set("apps-pandora-analysis-excludeFeatures", excludeFeatures);
        },
        SET_PANDORA_ANALYSIS_SELECTED_OUTCOME: (state, selectedOutcome) => {
            state.pandora.analysis.selectedOutcome = selectedOutcome;
            estore.set("apps-pandora-analysis-selectedOutcome", selectedOutcome);
        },
        SET_PANDORA_ANALYSIS_SELECTED_CLASSES: (state, selectedClasses) => {
            state.pandora.analysis.selectedClasses = selectedClasses;
            estore.set("apps-pandora-analysis-selectedClasses", selectedClasses);
        },
        SET_PANDORA_ANALYSIS_SELECTED_FORMULA: (state, selectedFormula) => {
            state.pandora.analysis.selectedFormula = selectedFormula;
            estore.set("apps-pandora-analysis-selectedFormula", selectedFormula);
        },
        SET_PANDORA_ANALYSIS_TIME_SERIES_DATE: (state, timeSeriesDate) => {
            state.pandora.analysis.timeSeriesDate = timeSeriesDate;
            estore.set("apps-pandora-analysis-timeSeriesDate", timeSeriesDate);
        },
        SET_PANDORA_ANALYSIS_SELECTED_PREPROCESS: (state, selectedPreProcess) => {
            state.pandora.analysis.selectedPreProcess = selectedPreProcess;
            estore.set("apps-pandora-analysis-selectedPreProcess", selectedPreProcess);
        },
        SET_PANDORA_ANALYSIS_SELECTED_PARITTIONSPLIT: (state, selectedPartitionSplit) => {
            state.pandora.analysis.selectedPartitionSplit = selectedPartitionSplit;
            estore.set("apps-pandora-analysis-selectedPartitionSplit", selectedPartitionSplit);
        },
        SET_PANDORA_ANALYSIS_MODEL_PROCESSING_TIME_LIMIT: (state, modelProcessingTimeLimit) => {
            state.pandora.analysis.modelProcessingTimeLimit = modelProcessingTimeLimit;
            estore.set("apps-pandora-analysis-modelProcessingTimeLimit", modelProcessingTimeLimit);
        },
        SET_PANDORA_ANALYSIS_TOTAL_SAMPLES: (state, total_samples) => {
            state.pandora.analysis.total_samples = total_samples;
            estore.set("apps-pandora-analysis-total_samples", total_samples);
        },
        SET_PANDORA_ANALYSIS_INVALID_SAMPLES: (state, invalid_samples) => {
            state.pandora.analysis.invalid_samples = invalid_samples;
            estore.set("apps-pandora-analysis-invalid_samples", invalid_samples);
        },
        SET_PANDORA_ANALYSIS_TOTAL_NA_VALUES: (state, total_na_values) => {
            state.pandora.analysis.total_na_values = total_na_values;
            estore.set("apps-pandora-analysis-total_na_values", total_na_values);
        },
        SET_PANDORA_ANALYSIS_FILTER_FEATURES: (state, filter_features) => {
            state.pandora.analysis.filter.features = filter_features;
            estore.set("apps-pandora-analysis-filter-features", filter_features);
        },
        SET_PANDORA_ANALYSIS_FILTER_OUTCOME: (state, filter_outcome) => {
            state.pandora.analysis.filter.outcome = filter_outcome;
            estore.set("apps-pandora-analysis-filter-outcome", filter_outcome);
        },
        SET_PANDORA_ANALYSIS_FILTER_EXTRACTION: (state, filter_extraction) => {
            state.pandora.analysis.filter.extraction = filter_extraction;
            estore.set("apps-pandora-analysis-filter-extraction", filter_extraction);
        },
        SET_PANDORA_ANALYSIS_BACKWARD_SELECTION: (state, backwardSelection) => {
            state.pandora.analysis.filter.backwardSelection = backwardSelection;
            estore.set("apps-pandora-analysis-filter-backwardSelection", backwardSelection);
        },
    },

    actions: {
        resetPandoraSelectedQueue({ commit, state }) {
            commit("SET_PANDORA_EXPLORATION_QUEUE_IDS", []);
            commit("SET_PANDORA_EXPLORATION_SELECTED_QUEUE_ID", "");
            commit("SET_PANDORA_EXPLORATION_SELECTED_FEATURE_SET_ID", 0);
            commit("SET_PANDORA_EXPLORATION_SELECTED_MODEL_ID", []);
            commit("SET_PANDORA_EXPLORATION_SELECTED_OUTCOME_OPTIONS", [{
                "id": 0,
                "drid": 0,
                "class_column": "",
                "class_type": 2,
                "class_original": "Overall",
                "class_remapped": "overall"
            }]);
            commit("SET_PANDORA_EXPLORATION_SELECTED_OUTCOME_OPTIONS_IDS", [0]);
            commit("SET_PANDORA_EXPLORATION_DISPLAY_VARIABLE_IMPORTANCE", []);

            commit("SET_PANDORA_EXPLORATION_ACTIVE_TAB_NAME", "datasetsTab");
            commit("SET_PANDORA_EXPLORATION_ACTIVE_DATASETS_TAB_MAP_OPTIONS", []);
        },
        addSimonJobAnalysis({ commit, state }, submitData) {
            return new Promise((resolve, reject) => {
                ApiSubmitDatasetQueueTask(submitData)
                    .then((response) => {
                        console.log("ApiSubmitDatasetQueueTask reponse:");
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
                                "SET_PANDORA_AVALIABLE_PACKAGES",
                                response.data.message.filter((obj) => obj.preselected === 0)
                            );
                            commit(
                                "SET_PANDORA_SELECTED_PACKAGES",
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
                    .then(function(response) {
                        const success = response.data.success;
                        const message = response.data.message;

                        let status = true;

                        if (success === false) {
                            commit("SET_PANDORA_ANALYSIS_AVALIABLE_FEATURES", []);
                            status = message;
                        } else if (success === true) {
                            commit("SET_PANDORA_ANALYSIS_AVALIABLE_FEATURES", message);
                            console.log("Reseting all available features");

                            // Reset submission fields from prev analysis
                            commit("SET_PANDORA_ANALYSIS_SELECTED_FEATURES", []);
                            commit("SET_PANDORA_ANALYSIS_EXCLUDE_FEATURES", []);
                            commit("SET_PANDORA_ANALYSIS_SELECTED_OUTCOME", []);
                            commit("SET_PANDORA_ANALYSIS_SELECTED_CLASSES", []);
                            commit("SET_PANDORA_ANALYSIS_SELECTED_FORMULA", []);

                            commit("SET_PANDORA_ANALYSIS_SELECTED_PREPROCESS", ["center", "scale"]);
                            commit("SET_PANDORA_ANALYSIS_SELECTED_PARITTIONSPLIT", 75);
                            commit("SET_PANDORA_ANALYSIS_MODEL_PROCESSING_TIME_LIMIT", 5);
                            commit("SET_PANDORA_ANALYSIS_FILTER_EXTRACTION", false);
                            commit("SET_PANDORA_ANALYSIS_BACKWARD_SELECTION", false);
                            commit("SET_PANDORA_ANALYSIS_FILTER_FEATURES", false);
                            commit("SET_PANDORA_ANALYSIS_FILTER_OUTCOME", false);
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
            commit("SET_PANDORA_AVALIABLE_PACKAGES", packages);
        },
        setSimonSelectedPackages({ commit }, packages) {
            commit("SET_PANDORA_SELECTED_PACKAGES", packages);
        },
        setSimonAnalysisJobId({ commit }, job_id) {
            commit("SET_PANDORA_ANALYSIS_JOB_ID", job_id);
        },
        setSimonAnalysisSelectedFileHash({ commit }, selectedFilesHash) {
            commit("SET_PANDORA_ANALYSIS_SELECTED_FILES_HASH", selectedFilesHash);
        },
        setSimonAnalysisAvaliableFeatures({ commit }, avaliableFeatures) {
            commit("SET_PANDORA_ANALYSIS_AVALIABLE_FEATURES", avaliableFeatures);
        },
        setSimonAnalysisSelectedFeatures({ commit }, selectedFeatures) {
            commit("SET_PANDORA_ANALYSIS_SELECTED_FEATURES", selectedFeatures);
        },
        setSimonAnalysisExcludeFeatures({ commit }, excludeFeatures) {
            commit("SET_PANDORA_ANALYSIS_EXCLUDE_FEATURES", excludeFeatures);
        },
        setSimonAnalysisSelectedOutcome({ commit }, selectedOutcome) {
            commit("SET_PANDORA_ANALYSIS_SELECTED_OUTCOME", selectedOutcome);
        },
        setSimonAnalysisSelectedClasses({ commit }, selectedClasses) {
            commit("SET_PANDORA_ANALYSIS_SELECTED_CLASSES", selectedClasses);
        },
        setSimonAnalysisSelectedFormula({ commit }, selectedFormula) {
            commit("SET_PANDORA_ANALYSIS_SELECTED_FORMULA", selectedFormula);
        },
        setSimonAnalysisTimeSeriesDate({ commit }, timeSeriesDate) {
            commit("SET_PANDORA_ANALYSIS_TIME_SERIES_DATE", timeSeriesDate);
        },
        setSimonAnalysisSelectedPreProcess({ commit }, selectedPreProcess) {
            commit("SET_PANDORA_ANALYSIS_SELECTED_PREPROCESS", selectedPreProcess);
        },
        setSimonAnalysisSelectedPartitionSplit({ commit }, selectedPartitionSplit) {
            commit("SET_PANDORA_ANALYSIS_SELECTED_PARITTIONSPLIT", selectedPartitionSplit);
        },
        setSimonAnalysisModelProcessingTimeLimit({ commit }, modelProcessingTimeLimit) {
            commit("SET_PANDORA_ANALYSIS_MODEL_PROCESSING_TIME_LIMIT", modelProcessingTimeLimit);
        },
        setSimonAnalysisTotalSamples({ commit }, total_samples) {
            commit("SET_PANDORA_ANALYSIS_TOTAL_SAMPLES", total_samples);
        },
        setSimonAnalysisInvalidSamples({ commit }, total_samples) {
            commit("SET_PANDORA_ANALYSIS_INVALID_SAMPLES", total_samples);
        },
        setSimonAnalysisTotalNAValues({ commit }, total_na_values) {
            commit("SET_PANDORA_ANALYSIS_TOTAL_NA_VALUES", total_na_values);
        },
        setSimonAnalysisFilterFeatures({ commit }, filter_features) {
            commit("SET_PANDORA_ANALYSIS_FILTER_FEATURES", filter_features);
        },
        setSimonAnalysisFilterOutcome({ commit }, filter_outcome) {
            commit("SET_PANDORA_ANALYSIS_FILTER_OUTCOME", filter_outcome);
        },
        setSimonAnalysisFilterExtraction({ commit }, filter_extraction) {
            commit("SET_PANDORA_ANALYSIS_FILTER_EXTRACTION", filter_extraction);
        },
        setSimonAnalysisBackwardSelection({ commit }, backwardSelection) {
            commit("SET_PANDORA_ANALYSIS_BACKWARD_SELECTION", backwardSelection);
        },
        // exploration
        setSimonExplorationQueueIDs({ commit }, queueIDs) {
            commit("SET_PANDORA_EXPLORATION_QUEUE_IDS", queueIDs);
        },
        setSimonExplorationSelectedQueueID({ commit }, selectedQueueID) {
            commit("SET_PANDORA_EXPLORATION_SELECTED_QUEUE_ID", selectedQueueID);
        },
        setSimonExplorationSelectedFeatureSetId({ commit }, selectedFeatureSetId) {
            commit("SET_PANDORA_EXPLORATION_SELECTED_FEATURE_SET_ID", selectedFeatureSetId);
        },
        setSimonExplorationSelectedModelId({ commit }, selectedModelsIDs) {
            commit("SET_PANDORA_EXPLORATION_SELECTED_MODEL_ID", selectedModelsIDs);
        },

        setSimonExplorationSelectedOutcomeOptions({ commit }, selectedOutcomeOptions) {
            commit("SET_PANDORA_EXPLORATION_SELECTED_OUTCOME_OPTIONS", selectedOutcomeOptions);
        },
        setSimonExplorationSelectedOutcomeOptionsIDs({ commit }, selectedOutcomeOptionsIDs) {
            commit("SET_PANDORA_EXPLORATION_SELECTED_OUTCOME_OPTIONS_IDS", selectedOutcomeOptionsIDs);
        },
        setSimonExplorationDisplayVariableImportance({ commit }, displayVariableImportance) {
            commit("SET_PANDORA_EXPLORATION_DISPLAY_VARIABLE_IMPORTANCE", displayVariableImportance);
        },

        setSimonExplorationnActiveTabName({ commit }, activeTabName) {
            commit("SET_PANDORA_EXPLORATION_ACTIVE_TAB_NAME", activeTabName);
        },
        setSimonExplorationDatasetsTabMapOptions({ commit }, datasetsTabMapOptions) {
            commit("SET_PANDORA_EXPLORATION_ACTIVE_DATASETS_TAB_MAP_OPTIONS", datasetsTabMapOptions);
        },
        // editing
        setSimonEditingActiveTabName({ commit }, activeTabName) {
            commit("SET_PANDORA_EDITING_ACTIVE_TAB_NAME", activeTabName);
        },
        setSimonEditingSelectedPreProcess({ commit }, selectedPreProcess) {
            commit("SET_PANDORA_EDITING_SELECTED_PREPROCESS", selectedPreProcess);
        },
        setPandoraEditingMLSettingsForm({ commit }, settingsForm) {
            commit("SET_PANDORA_EDITING_ML_SETTINGS_FORM", settingsForm);
        },
        setPandoraEditingTSNESettingsForm({ commit }, settingsForm) {
            commit("SET_PANDORA_EDITING_TSNE_SETTINGS_FORM", settingsForm);
        },
        setPandoraEditingSelectedColumns({ commit }, selectedColumns) {
            commit("SET_PANDORA_EDITING_SELECTED_COLUMNS", selectedColumns);
        }
    },
};

export default apps;
