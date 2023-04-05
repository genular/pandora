const getters = {
    /** main.js **/
    sidebar: (state) => state.main.sidebar,
    is_online: (state) => state.main.is_online,
    backendServerLoad: (state) => state.main.backendServerLoad,
    language: (state) => state.main.language,
    is_configured: (state) => state.main.is_configured,
    selectedFiles: (state) => state.main.selectedFiles,
    selectedFileDetails: (state) => state.main.selectedFileDetails,
    packageVersion: (state) => state.main.packageVersion,
    packageEnviroment: (state) => state.main.packageEnviroment,

    workspace_current_directory: (state) => state.main.workspace.currentDirectory,

    /** tagsView.js **/
    visitedViews: (state) => state.tagsView.visitedViews,
    cachedViews: (state) => state.tagsView.cachedViews,

    /** user.js **/
    user_username: (state) => state.user.username,
    auth_token: (state) => state.user.auth_token,
    user_id: (state) => state.user.user_id,
    user_role: (state) => state.user.role,

    user_settings_server_address_analysis: (state) => state.user.settings.server.address.analysis,
    user_settings_server_address_backend: (state) => state.user.settings.server.address.backend,
    user_settings_server_address_plots: (state) => state.user.settings.server.address.plots,
    user_settings_server_address_frontend: (state) => state.user.settings.server.address.frontend,

    /** permission.js **/
    permission_routers: (state) => state.permission.routers,
    addRouters: (state) => state.permission.addRouters,

    /** errorLog.js **/
    errorLogs: (state) => state.errorLog.logs,

    /** apps.js **/
    pandoraAvaliablePackages: (state) => state.apps.pandora.avaliablePackages,
    pandoraSelectedPackages: (state) => state.apps.pandora.selectedPackages,

    pandoraAnalysisJobId: (state) => state.apps.pandora.analysis.job_id,
    pandoraAnalysisSelectedFileHash: (state) => state.apps.pandora.analysis.selectedFilesHash,
    pandoraAnalysisAvaliableFeatures: (state) => state.apps.pandora.analysis.avaliableFeatures,
    pandoraAnalysisSelectedFeatures: (state) => state.apps.pandora.analysis.selectedFeatures,
    pandoraAnalysisExcludeFeatures: (state) => state.apps.pandora.analysis.excludeFeatures,
    pandoraAnalysisSelectedOutcome: (state) => state.apps.pandora.analysis.selectedOutcome,
    pandoraAnalysisSelectedClasses: (state) => state.apps.pandora.analysis.selectedClasses,
    pandoraAnalysisSelectedFormula: (state) => state.apps.pandora.analysis.selectedFormula,
    pandoraAnalysisTimeSeriesDate: (state) => state.apps.pandora.analysis.timeSeriesDate,
    pandoraAnalysisSelectedPreProcess: (state) => state.apps.pandora.analysis.selectedPreProcess,
    pandoraAnalysisSelectedPartitionSplit: (state) => state.apps.pandora.analysis.selectedPartitionSplit,
    pandoraAnalysisTotalSamples: (state) => state.apps.pandora.analysis.total_samples,
    pandoraAnalysisInvalidSamples: (state) => state.apps.pandora.analysis.invalid_samples,
    pandoraAnalysisTotalNAValues: (state) => state.apps.pandora.analysis.total_na_values,
    pandoraAnalysisFilterFeatures: (state) => state.apps.pandora.analysis.filter.features,
    pandoraAnalysisFilterOutcome: (state) => state.apps.pandora.analysis.filter.outcome,
    pandoraAnalysisFilterExtraction: (state) => state.apps.pandora.analysis.filter.extraction,
    pandoraAnalysisBackwardSelection: (state) => state.apps.pandora.analysis.filter.backwardSelection,
    pandoraAnalysisModelProcessingTimeLimit: (state) => state.apps.pandora.analysis.modelProcessingTimeLimit,
    // exploration
    pandoraExplorationQueueIDs: (state) => state.apps.pandora.exploration.queueIDs,
    pandoraExplorationSelectedQueueID: (state) => state.apps.pandora.exploration.selectedQueueID,
    pandoraExplorationSelectedFeatureSetId: (state) => state.apps.pandora.exploration.selectedFeatureSetId,
    pandoraExplorationSelectedModelId: (state) => state.apps.pandora.exploration.selectedModelsIDs,
    pandoraExplorationActiveTabName: (state) => state.apps.pandora.exploration.activeTabName,
    datasetsTabMapOptions: (state) => state.apps.pandora.exploration.datasetsTabMapOptions,
    // editing
    pandoraEditingActiveTabName: (state) => state.apps.pandora.editing.activeTabName,
    pandoraEditingSelectedPreProcess: (state) => state.apps.pandora.editing.selectedPreProcess,
};
export default getters;
