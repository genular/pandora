const getters = {
    /** main.js **/
    sidebar: state => state.main.sidebar,
    is_online: state => state.main.is_online,
    language: state => state.main.language,
    is_configured: state => state.main.is_configured,
    selectedFiles: state => state.main.selectedFiles,
    selectedFileDetails: state => state.main.selectedFileDetails,
    packageVersion: state => state.main.packageVersion,
    packageEnviroment: state => state.main.packageEnviroment,
    
    /** tagsView.js **/
    visitedViews: state => state.tagsView.visitedViews,
    cachedViews: state => state.tagsView.cachedViews,
    /** user.js **/
    user_username: state => state.user.username,
    auth_token: state => state.user.auth_token,
    user_id: state => state.user.user_id,
    user_role: state => state.user.role,
    
    user_settings_server_address_analysis: state => state.user.settings.server.address.analysis,
    user_settings_server_address_backend: state => state.user.settings.server.address.backend,
    user_settings_server_address_plots: state => state.user.settings.server.address.plots,
    user_settings_server_address_frontend: state => state.user.settings.server.address.frontend,

    /** permission.js **/
    permission_routers: state => state.permission.routers,
    addRouters: state => state.permission.addRouters,
    /** errorLog.js **/
    errorLogs: state => state.errorLog.logs,
    /** apps.js **/
    simonAvaliablePackages: state => state.apps.simon.avaliablePackages,
    simonSelectedPackages: state => state.apps.simon.selectedPackages,

    simonAnalysisJobId: state => state.apps.simon.analysis.job_id,
    simonAnalysisSelectedFileHash: state => state.apps.simon.analysis.selectedFilesHash,
    simonAnalysisAvaliableFeatures: state => state.apps.simon.analysis.avaliableFeatures,
    simonAnalysisSelectedFeatures: state => state.apps.simon.analysis.selectedFeatures,
    simonAnalysisExcludeFeatures: state => state.apps.simon.analysis.excludeFeatures,
    simonAnalysisSelectedOutcome: state => state.apps.simon.analysis.selectedOutcome,
    simonAnalysisSelectedClasses: state => state.apps.simon.analysis.selectedClasses,
    simonAnalysisSelectedFormula: state => state.apps.simon.analysis.selectedFormula,
    simonAnalysisTimeSeriesDate: state => state.apps.simon.analysis.timeSeriesDate,
    simonAnalysisSelectedPreProcess: state => state.apps.simon.analysis.selectedPreProcess,
    simonAnalysisSelectedPartitionSplit: state => state.apps.simon.analysis.selectedPartitionSplit,
    simonAnalysisTotalSamples: state => state.apps.simon.analysis.total_samples,
    simonAnalysisInvalidSamples: state => state.apps.simon.analysis.invalid_samples,
    simonAnalysisTotalNAValues: state => state.apps.simon.analysis.total_na_values,
    simonAnalysisFilterFeatures: state => state.apps.simon.analysis.filter.features,
    simonAnalysisFilterOutcome: state => state.apps.simon.analysis.filter.outcome,
    simonAnalysisFilterExtraction: state => state.apps.simon.analysis.filter.extraction,
    simonAnalysisBackwardSelection: state => state.apps.simon.analysis.filter.backwardSelection,
    // exploration
    simonExplorationQueueIDs: state => state.apps.simon.exploration.queueIDs,
    simonExplorationSelectedFeatureSetId: state => state.apps.simon.exploration.selectedFeatureSetId,
    simonExplorationSelectedModelId: state => state.apps.simon.exploration.selectedModelsIDs,
    simonExplorationActiveTabName: state => state.apps.simon.exploration.activeTabName,
    datasetsTabMapOptions: state => state.apps.simon.exploration.datasetsTabMapOptions,
    // editing
    simonEditingActiveTabName: state => state.apps.simon.editing.activeTabName,
};
export default getters;
