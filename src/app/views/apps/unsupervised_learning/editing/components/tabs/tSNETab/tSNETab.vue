<template>
    <div class="editing-tsne-tab" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
        <el-row type="flex" align="top" v-if="tabEnabled === false">
            <el-col :span="24">
                <el-alert :title="$t('views.apps.unsupervised_learning.editing.components.tabs.correlationTab.alert.function_disabled.title')" description="Tab is currently disabled. Please try to refresh or choose another file from Workspace." type="warning" style="margin-top: 20px" show-icon :closable="false"></el-alert>
            </el-col>
        </el-row>
        <el-row v-else type="flex" align="top">
            <el-col :span="4">
                <el-row>
                    <el-form ref="settingsForm" :model="settingsForm">
                        <el-collapse v-model="activeSections" :accordion="false" class="settings-tabpanel-content">
                            <el-collapse-item title="Column Selection" name="columnSelection">
                                <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.columns.title')">
                                    <el-button size="mini" class="filter-item" type="success" style="padding: 0" v-waves icon="el-icon-download" @click="downloadTable" round></el-button>
                                    <el-tooltip placement="top" style="padding-left: 5px">
                                        <div slot="content">
                                            {{ $t("views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.columns.description") }}
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                    <el-button v-if="reverseSelectedColumns.length > 0" :title="bottomBarOpen ? 'Hide Details' : 'Show Details'" size="mini" class="filter-item" type="info" style="padding: 0; float: right" v-waves :icon="bottomBarOpen ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" @click="bottomBarOpen = !bottomBarOpen">
                                    </el-button>
                                    <br />
                                    <el-select style="float: left; width: 100%" v-model="selectedColumns" multiple filterable remote default-first-option reserve-keyword value-key="remapped" clearable collapse-tags :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.columns.placeholder')" :remote-method="
                                            (userInput) => {
                                                querySearch(userInput, 'selectedColumns');
                                            }
                                        ">
                                        <el-option v-for="item in selectedFileDetailsDisplay['selectedColumns']" :key="item.remapped" :label="item.original" :value="item" v-bind:class="{
                                                item_danger: item.valid_numeric !== 1,
                                            }">
                                            <el-row>
                                                <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                                    {{ item.original }}
                                                </el-col>
                                                <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right">
                                                    {{ item.valid_10p === 1 ? "*" : "" }}
                                                    {{ item.unique_count }}
                                                    {{ item.na_percentage > 0 ? "NA" : "" }}
                                                </el-col>
                                            </el-row>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.first_n_columns.title')">
                                    <el-tooltip placement="top" style="padding-left: 5px">
                                        <div slot="content">
                                            {{ $t("views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.first_n_columns.description") }}
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                    <br />
                                    <el-input-number style="float: left; width: 100%" v-model="settingsForm.cutOffColumnSize" :step="10" :min="2" :max="50000"></el-input-number>
                                </el-form-item>
                                <el-form-item label="Exclude Columns">
                                    <el-tooltip placement="top" style="padding-left: 5px">
                                        <div slot="content">Please select any columns you wish to exclude from analysis.</div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                    <br />
                                    <el-select style="float: left; width: 100%" v-model="settingsForm.excludedColumns" multiple filterable remote default-first-option reserve-keyword value-key="remapped" clearable collapse-tags :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.columns.placeholder')" :remote-method="
                                            (userInput) => {
                                                querySearch(userInput, 'excludedColumns');
                                            }
                                        ">
                                        <el-option v-for="item in selectedFileDetailsDisplay['excludedColumns']" :key="item.remapped" :label="item.original" :value="item">
                                            <el-row>
                                                <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                                    {{ item.original }}
                                                </el-col>
                                                <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right">
                                                    {{ item.valid_10p === 1 ? "*" : "" }}
                                                    {{ item.unique_count }}
                                                    {{ item.na_percentage > 0 ? "NA" : "" }}
                                                </el-col>
                                            </el-row>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="Grouping variable">
                                    <el-tooltip placement="top" style="padding-left: 5px">
                                        <div slot="content">
                                            Please select categorical column to "group by" t-SNE plot. Grouping variable will be excluded from t-SNE analysis and only t-SNE results will be
                                            colored by it.
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                    <br />
                                    <el-select style="float: left; width: 100%" v-model="settingsForm.groupingVariables" multiple filterable remote default-first-option reserve-keyword value-key="remapped" clearable collapse-tags :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.columns.placeholder')" :remote-method="
                                            (userInput) => {
                                                querySearch(userInput, 'groupingVariables');
                                            }
                                        ">
                                        <el-option v-for="item in selectedFileDetailsDisplay['groupingVariables']" :key="item.remapped" :label="item.original" :value="item" :disabled="item.valid_10p !== 1 || item.unique_count < 2">
                                            <el-row>
                                                <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                                    {{ item.original }}
                                                </el-col>
                                                <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right">
                                                    {{ item.valid_10p === 1 ? "*" : "" }}
                                                    {{ item.unique_count }}
                                                    {{ item.na_percentage > 0 ? "NA" : "" }}
                                                </el-col>
                                            </el-row>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="Color variable">
                                    <el-tooltip placement="top" style="padding-left: 5px">
                                        <div slot="content">
                                            Please select continuous column to color t-SNE plot. This columns unlike grouping columns will be included in t-SNE analysis. Values from Group
                                            variables should not be included also here.
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                    <br />
                                    <el-select style="float: left; width: 100%" v-model="settingsForm.colorVariables" multiple filterable remote default-first-option reserve-keyword value-key="remapped" clearable collapse-tags :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.columns.placeholder')" :remote-method="
                                            (userInput) => {
                                                querySearch(userInput, 'colorVariables');
                                            }
                                        ">
                                        <el-option v-for="item in selectedFileDetailsDisplay['colorVariables']" :key="item.remapped" :label="item.original" :value="item" :disabled="item.valid_numeric === 0 || item.unique_count < 2">
                                            <el-row>
                                                <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                                    {{ item.original }}
                                                </el-col>
                                                <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right">
                                                    {{ item.valid_10p === 1 ? "*" : "" }}
                                                    {{ item.unique_count }}
                                                    {{ item.na_percentage > 0 ? "NA" : "" }}
                                                </el-col>
                                            </el-row>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </el-collapse-item>
                            <el-collapse-item title="Clustering Settings" name="clusteringSettings">
                                <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.clust_algorithm.title')">
                                    <br />
                                    <el-select style="float: left; width: 100%" v-model="settingsForm.clusterType" filterable default-first-option reserve-keyword :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.columns.placeholder')">
                                        <el-option v-for="item in settingsOptions.clusterType" :key="item.value" :label="item.name" :value="item.value">
                                            <span style="float: left">
                                                {{ item.name }}
                                            </span>
                                            <el-tooltip placement="top" style="float: right; padding-top: 10px">
                                                <div slot="content">
                                                    {{ item.description }}
                                                </div>
                                                <i class="el-icon-question"></i>
                                            </el-tooltip>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.clust_method.label')" v-if="['Hierarchical'].includes(settingsForm.clusterType)">
                                    <el-select style="float: right" v-model="settingsForm.clustLinkage" :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.clust_method.placeholder')">
                                        <el-option v-for="item in settingsOptions.clustLinkage" :key="item.id" :label="$t(['views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.clust_method.options.', item.id].join(''))" :value="item.id">
                                            <span>{{ $t("views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.clust_method.options." + item.id) }}</span>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="K" v-if="['Louvain'].includes(settingsForm.clusterType)">
                                    <el-input-number style="float: right" v-model="settingsForm.knn_clusters" :step="1" :min="2" :max="2048"></el-input-number>
                                    <el-tooltip placement="top" style="padding-left: 5px">
                                        <div slot="content">
                                            Maximum number of nearest neighbors to search. The optimal K value usually found is the square root of N, where N is the total number of
                                            samples.
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                </el-form-item>
                                <!-- Additional Louvain-specific parameters -->
                                <el-form-item label="Resolution Increments" v-if="['Louvain'].includes(settingsForm.clusterType)">
                                    <el-tooltip placement="top" style="padding-left: 5px">
                                        <div slot="content">
                                            Defines the step size for resolution values tested during clustering. Controls how detailed the clustering is, with smaller values creating finer groups. Think of this as adjusting the "focus" on clusters. Typical values range from 0.01 to 0.5.
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                    <el-select style="width: 100%;" v-model="settingsForm.resolution_increments" multiple placeholder="Select increments">
                                        <el-option v-for="increment in [0.01, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5]" :key="increment" :label="increment" :value="increment">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="Minimum Modularity" v-if="['Louvain'].includes(settingsForm.clusterType)">
                                    <el-tooltip placement="top" style="padding-left: 5px">
                                        <div slot="content">
                                            Sets the minimum modularity threshold for accepting clusters. Higher modularity values indicate stronger intra-cluster connections, improving cluster quality. Think of it as Quality check that measures how strong the clusters are internally. Higher values (e.g., 0.5 to 0.9) mean clusters are well-separated from each other.
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                    <el-select style="width: 100%;" v-model="settingsForm.min_modularities" multiple placeholder="Select modularities">
                                        <el-option v-for="modularity in [0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9]" :key="modularity" :label="modularity" :value="modularity">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="Target Clusters Range" v-if="['Louvain'].includes(settingsForm.clusterType)">
                                    <el-tooltip placement="top" style="padding-left: 5px">
                                        <div slot="content">
                                            Sets the ideal range for the number of clusters you want (for example, 3 to 6 clusters). This helps guide the clustering to create groups within this range.
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                    <div style="display: flex; align-items: center; gap: 5px;">
                                        <el-input-number size="mini" v-model="settingsForm.target_clusters_range[0]" :step="1" :min="1"></el-input-number>
                                        <span> to </span>
                                        <el-input-number size="mini" v-model="settingsForm.target_clusters_range[1]" :step="1" :min="1"></el-input-number>
                                    </div>
                                </el-form-item>
                                <el-form-item label="Pick 'Best Cluster' Method" v-if="['Louvain'].includes(settingsForm.clusterType)">
                                    <el-select style="width: 100%;" v-model="settingsForm.pickBestClusterMethod" placeholder="Select method">
                                        <el-option v-for="method in settingsOptions.pickBestClusterMethod" :key="method.value" :label="method.name" :value="method.value">
                                            <span style="display: flex; justify-content: space-between; align-items: center;">
                                                <span>{{ method.name }}</span>
                                                <el-tooltip placement="right">
                                                    <div slot="content">{{ method.description }}</div>
                                                    <i class="el-icon-question" style="margin-left: 8px;"></i>
                                                </el-tooltip>
                                            </span>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <!-- Selected Columns (SIMON) Dropdown -->
                                <el-form-item label="Selected Columns (SIMON)" v-if="settingsForm.pickBestClusterMethod === 'SIMON'">
                                    <el-select style="float: left; width: 100%" v-model="settingsForm.selectedColumnsSIMON" multiple filterable remote default-first-option reserve-keyword value-key="remapped" clearable collapse-tags :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.columns.placeholder')" :remote-method="
                                            (userInput) => {
                                                querySearch(userInput, 'selectedColumnsSIMON');
                                            }
                                        ">
                                        <el-option v-for="item in selectedFileDetailsDisplay['selectedColumnsSIMON']" :key="item.remapped" :label="item.original" :value="item" v-bind:class="{
                                                item_danger: item.valid_numeric !== 1,
                                            }">
                                            <el-row>
                                                <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                                    {{ item.original }}
                                                </el-col>
                                                <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right">
                                                    {{ item.valid_10p === 1 ? "*" : "" }}
                                                    {{ item.unique_count }}
                                                    {{ item.na_percentage > 0 ? "NA" : "" }}
                                                </el-col>
                                            </el-row>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="Weights" v-if="['Louvain'].includes(settingsForm.clusterType)">
                                    <el-tooltip placement="top" style="padding-left: 5px">
                                        <div slot="content">
                                            Adjust weights for AUROC, modularity, and silhouette scores when selecting the best cluster.
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                    <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 10px;">
                                        <!-- Row with titles -->
                                        <div style="display: flex; justify-content: space-between; font-size: 12px;">
                                            <span>AUROC ({{ settingsForm.weights.AUROC.toFixed(1) }})</span>
                                            <span>Modularity ({{ settingsForm.weights.modularity.toFixed(1) }})</span>
                                            <span>Silhouette ({{ settingsForm.weights.silhouette.toFixed(1) }})</span>
                                        </div>
                                        <!-- Row with inputs -->
                                        <div style="display: flex; gap: 10px;">
                                            <el-input-number size="mini" v-model="settingsForm.weights.AUROC" :step="0.1" :min="0" :max="1" style="flex: 1;"></el-input-number>
                                            <el-input-number size="mini" v-model="settingsForm.weights.modularity" :step="0.1" :min="0" :max="1" style="flex: 1;"></el-input-number>
                                            <el-input-number size="mini" v-model="settingsForm.weights.silhouette" :step="0.1" :min="0" :max="1" style="flex: 1;"></el-input-number>
                                        </div>
                                    </div>
                                </el-form-item>
                                <el-form-item label="epsQuantile" v-if="['Hierarchical', 'Mclust', 'Density'].includes(settingsForm.clusterType)">
                                    <el-input-number style="float: right" v-model="settingsForm.epsQuantile" :step="0.1" :min="0" :max="1"></el-input-number>
                                    <el-tooltip placement="top" style="padding-left: 5px">
                                        <div slot="content">
                                            Determines the quantile used for setting the eps parameter in DBSCAN, controlling the density threshold for clustering; a higher value increases the neighborhood size.
                                            Lower the quantile used to calculate eps from 0.95 to a smaller value, making the criterion for neighborhood density stricter. This increases the likelihood of points being considered outliers.
                                            Experiment with values to find a balance suitable for your dataset's characteristics.
                                            How eps is calculated?
                                            k_dist Calculation: The kNNdist function calculates the distance to the k-th nearest neighbor for each point in the dataset, where k is one less than minPts. This distance indicates how far you need to go from each point to find a certain number of neighbors, providing a sense of the local density around each point.
                                            Choosing eps with a Quantile: The eps parameter is then chosen based on a quantile (settings$epsQuantile) of these distances. By taking, for example, the 90th percentile (if epsQuantile is 0.9), you set eps to a value where 90% of points have their minPts-1 nearest neighbors within this distance. This quantile approach allows eps to adapt to the spread and density of your dataset, aiming to capture the majority of dense areas while excluding the most sparse outliers.
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                </el-form-item>
                                <el-form-item label="Exclude outliers" v-if="['Hierarchical', 'Mclust'].includes(settingsForm.clusterType)">
                                    <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.excludeOutliers"></el-switch>
                                    <el-tooltip placement="top">
                                        <div slot="content">
                                            Decide whether to include or exclude outliers in the clustering analysis.
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                </el-form-item>
                                <el-form-item label="Cluster groups" v-if="['Hierarchical', 'Mclust'].includes(settingsForm.clusterType)">
                                    <el-input-number style="float: right" v-model="settingsForm.clustGroups" :step="1" :min="2" :max="128"></el-input-number>
                                </el-form-item>
                            </el-collapse-item>
                            <el-collapse-item title="tSNE Settings" name="tSNESettings">
                                <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.perplexity.title')">
                                    <el-slider style="clear: both; width: 100%; float: right" v-model="settingsForm.perplexity" :step="1" :min="0" :max="100" show-input></el-slider>
                                    <el-tooltip placement="top">
                                        <div slot="content">
                                            {{ $t("views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.perplexity.description") }}
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                </el-form-item>
                                <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.exaggeration_factor.title')">
                                    <el-slider style="clear: both; width: 100%; float: right" v-model="settingsForm.exaggeration_factor" :step="4" :min="4" :max="128" show-input></el-slider>
                                    <el-tooltip placement="top">
                                        <div slot="content">
                                            {{ $t("views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.exaggeration_factor.description") }}
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                </el-form-item>
                                <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.theta.title')">
                                    <el-slider style="clear: both; width: 100%; float: right" v-model="settingsForm.theta" :step="0.1" :min="0" :max="10" show-input></el-slider>
                                    <el-tooltip placement="top">
                                        <div slot="content">
                                            {{ $t("views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.theta.description") }}
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                </el-form-item>
                                <!-- Display info messages for t-SNE -->
                                <el-form-item label="Auto t-SNE settings" style="margin-top: 10px">
                                    <el-tooltip placement="top">
                                        <div slot="content">
                                            {{ $t("views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.explain_auto_compute_tsne.description") }}
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                </el-form-item>
                                <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.max_iter.title')">
                                    <el-slider style="clear: both; width: 100%; float: right" v-model="settingsForm.max_iter" :step="1" :min="0" :max="50000" show-input></el-slider>
                                    <el-tooltip placement="top">
                                        <div slot="content">
                                            {{ $t("views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.max_iter.description") }}
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                </el-form-item>
                                <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.eta.title')">
                                    <el-slider style="clear: both; width: 100%; float: right" v-model="settingsForm.eta" :step="1" :min="0" :max="1000" show-input></el-slider>
                                    <el-tooltip placement="top">
                                        <div slot="content">
                                            {{ $t("views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.eta.description") }}
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                </el-form-item>
                            </el-collapse-item>
                            <el-collapse-item title="Dataset Settings" name="datasetSettings">
                                <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.preprocess.title')">
                                    <el-tooltip placement="top">
                                        <div slot="content">
                                            Should we apply preprocessing ("medianImpute", "center", "scale") and remove zero-variance, near-zero-variance and highly correlated features
                                            before any calculation?
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                    <el-select style="float: left; width: 100%" v-model="selectedPreProcess" clearable :placeholder="$t('views.apps.supervised_learning.analysis.components.FileDetails.body.preprocessing.placeholder')" multiple>
                                        <el-option v-for="item in selectedPreProcessOptions" :key="item.value" :value="item.value" :disabled="item.disabled">
                                            <span style="float: left; margin-right: 10px; color: #8492a6; font-size: 13px">{{ item.value }}</span>
                                            <span style="float: right">
                                                {{ $t("views.apps.supervised_learning.analysis.components.FileDetails.body.preprocessing.dropdown." + item.value) }}
                                            </span>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item :label="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.remove_na.title')">
                                    <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.removeNA"></el-switch>
                                    <el-tooltip placement="top">
                                        <div slot="content">
                                            {{ $t("views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.remove_na.description") }}
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                </el-form-item>
                                <el-form-item label="Dataset analysis type">
                                    <br />
                                    <el-select style="float: left; width: 100%" v-model="settingsForm.datasetAnalysisType" placeholder="Select">
                                        <el-option v-for="item in settingsOptions.datasetAnalysisType" :key="item.id" :label="item.label" :value="item.id">
                                            <span>{{ item.label }}</span>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="Grouped display">
                                    <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.datasetAnalysisGrouped"></el-switch>
                                    <el-tooltip placement="top">
                                        <div slot="content">
                                            Should we display mean values of clusters on a heatmap, scale by row, when enabled or column?
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                </el-form-item>
                                <el-form-item label="Remove outliers" v-if="['Hierarchical', 'Mclust', 'Density'].includes(settingsForm.clusterType)">
                                    <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.datasetAnalysisRemoveOutliersDownstream"></el-switch>
                                    <el-tooltip placement="top">
                                        <div slot="content">
                                            Should we remove outlier cluster and data from heatmep display and downstream dataset (ML)?
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                </el-form-item>
                                <el-form-item label="Sort column" v-if="settingsForm.datasetAnalysisType === 'heatmap'">
                                    <br />
                                    <el-select style="float: left; width: 100%" v-model="settingsForm.datasetAnalysisSortColumn" placeholder="Select">
                                        <el-option v-for="item in settingsOptions.datasetAnalysisSortColumn" :key="item.id" :label="item.id" :value="item.id">
                                            <span>{{ item.id }}</span>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="Cluster linkage" v-if="settingsForm.datasetAnalysisType === 'cluster'">
                                    <el-select style="float: right" size="mini" v-model="settingsForm.datasetAnalysisClustLinkage" :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.clust_method.placeholder')">
                                        <el-option v-for="item in settingsOptions.clustLinkage" :key="item.id" :label="$t(['views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.clust_method.options.', item.id].join(''))" :value="item.id">
                                            <span>{{ $t("views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.clust_method.options." + item.id) }}</span>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="Cluster ordering" v-if="settingsForm.datasetAnalysisType === 'cluster'">
                                    <el-select style="float: right" size="mini" v-model="settingsForm.datasetAnalysisClustOrdering" :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.tree_ordering.placeholder')">
                                        <el-option v-for="item in settingsOptions.clustOrdering" :key="item.id" :label="$t(['views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.tree_ordering.options.', item.id].join(''))" :value="item.id">
                                            <span>{{ $t("views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.tree_ordering.options." + item.id) }}</span>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </el-collapse-item>
                            <el-collapse-item title="Theme Settings" name="themeSettings">
                                <el-form-item label="Theme">
                                    <el-select v-model="settingsForm.theme" size="mini" placeholder="Select" style="float: right">
                                        <el-option v-for="item in settingsOptions.theme" :key="item.id" :label="item.name" :value="item.id">
                                            <span style="float: left">{{ item.name }}</span>
                                            <span style="float: right; color: #8492a6; font-size: 13px">
                                                <el-tooltip placement="top">
                                                    <div slot="content" style="text-align: center">
                                                        <img :src="'static/images/plot_styles/' + item.id + '_' + settingsForm.colorPalette + '.svg'" style="height: 125px" />
                                                        <br />
                                                        <span style="max-width: 125px; width: 150px; display: block">{{ item.description }}</span>
                                                    </div>
                                                    <span class="el-icon-info"></span>
                                                </el-tooltip>
                                            </span>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="Color">
                                    <el-select v-model="settingsForm.colorPalette" size="mini" placeholder="Select" style="float: right">
                                        <el-option v-for="item in settingsOptions.colorPalette" :key="item.id" :label="item.value" :value="item.id">
                                            <span style="float: left">{{ item.value }}</span>
                                            <span style="float: right; color: #8492a6; font-size: 13px">
                                                <el-tooltip placement="top">
                                                    <div slot="content" style="text-align: center">
                                                        <img :src="'static/images/plot_styles/' + settingsForm.theme + '_' + item.id + '.svg'" style="height: 125px" />
                                                        <br />
                                                        <span style="max-width: 125px; width: 150px; display: block">colorblind: {{ item.colorblind }}</span>
                                                    </div>
                                                    <span class="el-icon-info"></span>
                                                </el-tooltip>
                                            </span>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="Legend position">
                                    <br />
                                    <el-select style="float: left; width: 100%" v-model="settingsForm.legendPosition" size="mini" placeholder="Select">
                                        <el-option v-for="item in settingsOptions.legendPosition" :key="item.id" :label="item.label" :value="item.id">
                                            <span>{{ item.label }}</span>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="Font size">
                                    <el-input-number style="float: right" v-model="settingsForm.fontSize" :step="1" :min="4" :max="48"></el-input-number>
                                </el-form-item>
                                <el-form-item label="Point size">
                                    <el-input-number style="float: right" v-model="settingsForm.pointSize" :step="0.5" :min="0.1" :max="25"></el-input-number>
                                </el-form-item>
                                <el-form-item label="Ratio">
                                    <el-input-number style="float: right" size="mini" v-model="settingsForm.aspect_ratio" :step="0.1" :max="4" :min="1"></el-input-number>
                                </el-form-item>
                                <el-form-item label="Plot size">
                                    <el-input-number style="float: right" size="mini" v-model="settingsForm.plot_size" :step="1" :max="48" :min="1"></el-input-number>
                                </el-form-item>
                            </el-collapse-item>
                        </el-collapse>
                        <el-row>
                            <el-col :span="12" v-if="plot_data.saveObjectHash !== false">
                                <el-form-item>
                                    <el-tooltip placement="top">
                                        <div slot="content">
                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_r_data.description") }}
                                        </div>
                                        <el-button style="float: left" size="large" type="danger" round @click="downloadRawData({ downloadHash: plot_data.saveObjectHash, filenameAddon: '_tsne_export', action: 'downloadData' })">
                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_r_data.title") }}
                                            <i class="el-icon-download el-icon-right"></i>
                                        </el-button>
                                    </el-tooltip>
                                </el-form-item>
                            </el-col>
                            <el-col :span="plot_data.saveObjectHash !== false ? 12 : 24">
                                <el-form-item>
                                    <el-button type="primary" size="large" round @click="redrawImage" style="float: right">
                                        {{ $t("views.apps.unsupervised_learning.editing.components.tabs.correlationTab.buttons.plot_image") }}
                                    </el-button>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </el-row>
            </el-col>
            <el-col :span="19" :offset="1" style="text-align: center">
                <el-tabs v-model="activeTab" type="border-card" class="tab-container-second">
                    <el-tab-pane label="t-SNE plot(s)" name="tsne_plot" :disabled="isTabDisabled('tsne_plot')">
                        <el-tabs :value="plot_data.tsne_plot.length > 0 || Object.keys(plot_data.tsne_plot).length > 0 ? 'tab_tsne_grouped_0' : null" :tab-position="'right'">
                            <el-tab-pane v-for="(plotData, plotIndex) in plot_data.tsne_plot" :key="'tab_tsne_grouped_' + plotIndex" :label="plotData.name" :name="'tab_tsne_grouped_' + plotIndex">
                                <!-- if color variables display both plots side to side -->
                                <el-row v-if="plotData.colorby.length > 0 || Object.keys(plotData.colorby).length > 0">
                                    <el-tabs :value="
                                            plotData.colorby.length > 0 || Object.keys(plotData.colorby).length > 0
                                                ? 'tab_tsne_grouped_' + plotIndex + '_colorby_' + Object.keys(plotData.colorby)[0]
                                                : null
                                        " :tab-position="'left'" type="card" class="tab-container-third-vertical">
                                        <el-tab-pane v-for="(plotDataColor, plotIndexColor) in plotData.colorby" :key="'tab_tsne_grouped_' + plotIndex + '_colorby_' + plotIndexColor" :label="plotDataColor.name" :name="'tab_tsne_grouped_' + plotIndex + '_colorby_' + plotIndexColor" type="card" class="tab-container-third-vertical">
                                            <el-row>
                                                <el-col :span="12">
                                                    <span class="tab_intro_text_tsne">Graph of individuals colored by: "{{ plotDataColor.name }}".</span>
                                                </el-col>
                                                <el-col :span="12">
                                                    <span class="tab_intro_text_tsne" v-if="plotData.name === 'Main plot'">
                                                        Barnes-Hut t-Distributed Stochastic Neighbor Embedding. t-SNE is a method for constructing a low dimensional embedding of
                                                        high-dimensional data, distances or similarities.
                                                    </span>
                                                    <span class="tab_intro_text_tsne" v-else>Graph of individuals grouped by: "{{ plotData.name }}".</span>
                                                </el-col>
                                            </el-row>
                                            <el-row>
                                                <el-col :span="12" v-if="plotDataColor.png">
                                                    <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                        <div slot="content">
                                                            <el-button type="success" round @click="downloadPlotImage('tsne_plot', plotIndex, plotIndexColor)">
                                                                {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                            </el-button>
                                                        </div>
                                                        <img style="max-width: 100%;" class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plotDataColor.png" fit="scale-down" />
                                                    </el-tooltip>
                                                </el-col>
                                                <el-col v-else :span="12" class="plot-placeholder">
                                                    <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                </el-col>
                                                <el-col :span="12" v-if="plotDataColor.png">
                                                    <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                        <div slot="content">
                                                            <el-button type="success" round @click="downloadPlotImage('tsne_plot', plotIndex)">
                                                                {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                            </el-button>
                                                        </div>
                                                        <img style="max-width: 100%;" class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plotData.png" fit="scale-down" />
                                                    </el-tooltip>
                                                </el-col>
                                                <el-col v-else :span="12" class="plot-placeholder">
                                                    <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                </el-col>
                                            </el-row>
                                        </el-tab-pane>
                                    </el-tabs>
                                </el-row>
                                <!-- we dont have any color variables -->
                                <el-row v-else>
                                    <el-col :span="24">
                                        <span class="tab_intro_text_tsne" v-if="plotData.name === 'Main plot'">
                                            Barnes-Hut t-Distributed Stochastic Neighbor Embedding. t-SNE is a method for constructing a low dimensional embedding of
                                            high-dimensional data, distances or similarities.
                                        </span>
                                        <span class="tab_intro_text_tsne" v-else>Graph of individuals grouped by: "{{ plotData.name }}".</span>
                                    </el-col>
                                    <el-col :span="24" v-if="plotData.png">
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <div slot="content">
                                                <el-button type="success" round @click="downloadPlotImage('tsne_plot', plotIndex)">
                                                    {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                </el-button>
                                            </div>
                                            <img class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plotData.png" fit="scale-down" />
                                        </el-tooltip>
                                    </el-col>
                                    <el-col v-else class="plot-placeholder">
                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                    </el-col>
                                </el-row>
                            </el-tab-pane>
                        </el-tabs>
                    </el-tab-pane>
                    <el-tab-pane label="Clustered t-SNE analysis" name="tsne_cluster_plot" :disabled="isTabDisabled('tsne_cluster_plot')">
                        <el-row v-bind:class="{
                                is_tab_active: isTabDisabled('tsne_cluster_plot'),
                            }">
                            <el-col v-if="plot_data.tsne_cluster_plot_png !== false">
                                <el-row>
                                    <el-col :span="24">
                                        <span class="tab_intro_text_tsne">
                                            Clustered t-SNE plot with clustering method: {{ settingsForm.clusterType }}.
                                            <div v-if="plot_data.avg_silhouette_score" style="font-size: 14px; padding-top: 5px;">
                                                Average silhouette score: <strong>{{ plot_data.avg_silhouette_score }}</strong> (ranges -1 to +1; higher values indicate better cluster fit).
                                            </div>
                                        </span>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="24">
                                        <el-tabs v-model="cTsneActiveTab" :tab-position="'right'" type="card" class="tab-container-third-vertical">
                                            <!-- Clusters Tab -->
                                            <el-tab-pane label="Clusters" name="c_tsne_clusters" v-if="plot_data.tsne_cluster_plot_png">
                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                    <template v-slot:content>
                                                        <el-button type="success" round @click="downloadPlotImage('tsne_cluster_plot')">
                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                        </el-button>
                                                    </template>
                                                    <img class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plot_data.tsne_cluster_plot_png" fit="scale-down" />
                                                </el-tooltip>
                                            </el-tab-pane>
                                            <!-- Features Tab -->
                                            <el-tab-pane label="Features" name="c_tsne_features" v-if="plot_data.cluster_features_means_png">
                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                    <template v-slot:content>
                                                        <el-button type="success" round @click="downloadPlotImage('cluster_features_means')">
                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                        </el-button>
                                                    </template>
                                                    <img class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plot_data.cluster_features_means_png" fit="scale-down" />
                                                </el-tooltip>
                                            </el-tab-pane>
                                            <!-- FoldChange Tab -->
                                            <el-tab-pane label="FoldChange" name="c_tsne_fold_change" v-if="plot_data.cluster_features_means_separated_png">
                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                    <template v-slot:content>
                                                        <el-button type="success" round @click="downloadPlotImage('cluster_features_means_separated')">
                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                        </el-button>
                                                    </template>
                                                    <img class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plot_data.cluster_features_means_separated_png" fit="scale-down" />
                                                </el-tooltip>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-col>
                                </el-row>
                            </el-col>
                            <el-col v-else class="plot-placeholder">
                                <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                    <el-tab-pane label="Dataset Analysis" name="tsne_cluster_heatmap_plot_png" :disabled="isTabDisabled('tsne_cluster_heatmap_plot')">
                        <el-row v-bind:class="{
                                is_tab_active: isTabDisabled('tsne_cluster_heatmap_plot'),
                            }">
                            <el-col v-if="plot_data.tsne_cluster_heatmap_plot !== false">
                                <el-row>
                                    <el-col :span="24">
                                        <span style="float: left">Heatmap of clustered t-SNE on main data</span>
                                        <el-dropdown style="float: right" @command="downloadRawData">
                                            <el-button type="primary" style="font-size: 24px;">
                                                > Actions
                                                <i class="el-icon-arrow-down el-icon--right"></i>
                                            </el-button>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item :command="{ downloadHash: plot_data.saveDatasetHash, 
                                                filenameAddon: '_tsne_' + settingsForm.clusterType, 
                                                action: 'sendToSimon' }" style="font-size: 18px; padding: 15px;">
                                                    Start ML analysis
                                                </el-dropdown-item>
                                                <el-dropdown-item :command="{ downloadHash: plot_data.saveDatasetHash, filenameAddon: '_tsne_export', action: 'downloadData' }" style="font-size: 18px; padding: 15px;">
                                                    Download
                                                </el-dropdown-item>
                                                <el-dropdown-item :command="{ downloadHash: plot_data.saveDatasetHash, filenameAddon: '_tsne_clustered', action: 'sendToWorkspace' }" style="font-size: 18px; padding: 15px;">
                                                    Save to workspace
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </el-col>
                                    <el-col :span="24">
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <div slot="content">
                                                <el-button type="success" round @click="downloadPlotImage('tsne_cluster_heatmap_plot')">
                                                    {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                </el-button>
                                            </div>
                                            <img id="analysis_images_tsne_cluster_heatmap_plot" class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plot_data.tsne_cluster_heatmap_plot_png" fit="scale-down" />
                                        </el-tooltip>
                                    </el-col>
                                </el-row>
                            </el-col>
                            <el-col v-else class="plot-placeholder">
                                <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                </el-tabs>
                <el-row v-if="plot_data.tsne_perplexity !== false" type="flex" justify="center" align="middle" style="margin-bottom: 10px;">
                    <el-col :span="24" style="text-align: center;">
                        <!-- Display t-SNE stats using el-tag components -->
                        <template v-if="plot_data.tsne_perplexity != null">
                            <el-tag type="info" class="tsne-tag">
                                Perplexity: {{ plot_data.tsne_perplexity }}
                            </el-tag>
                        </template>
                        <template v-if="plot_data.tsne_exaggeration_factor != null">
                            <el-tag type="success" class="tsne-tag">
                                Exaggeration Factor: {{ plot_data.tsne_exaggeration_factor }}
                            </el-tag>
                        </template>
                        <template v-if="plot_data.tsne_max_iter != null">
                            <el-tag type="warning" class="tsne-tag">
                                Max Iterations: {{ plot_data.tsne_max_iter }}
                            </el-tag>
                        </template>
                        <template v-if="plot_data.tsne_theta != null">
                            <el-tag type="danger" class="tsne-tag">
                                Theta: {{ plot_data.tsne_theta }}
                            </el-tag>
                        </template>
                        <template v-if="plot_data.tsne_eta != null">
                            <el-tag type="primary" class="tsne-tag">
                                Eta: {{ plot_data.tsne_eta }}
                            </el-tag>
                        </template>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
        <el-dialog title="Select columns for machine learning" :visible.sync="machineLearningDialogVisible" width="30%">
            <el-form ref="machineLearningSettingsForm" :model="machineLearningSettingsForm">
                <el-form-item label="Include Columns (selecting none will include all except excluded ones)">
                    <el-select style="float: left; width: 100%" v-model="machineLearningSettingsForm.selectedColumns" multiple filterable remote default-first-option reserve-keyword value-key="remapped" clearable collapse-tags :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.columns.placeholder')" :remote-method="
                    (userInput) => {
                        querySearch(userInput, 'selectedColumnsML');
                    }
                ">
                        <el-option v-for="item in selectedMLFileDetailsDisplay['selectedColumnsML']" :key="item.remapped" :label="item.original" :value="item">
                            <el-row>
                                <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                    {{ item.original }}
                                </el-col>
                                <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right">
                                    {{ item.valid_10p === 1 ? "*" : "" }}
                                    {{ item.unique_count }}
                                    {{ item.na_percentage > 0 ? "NA" : "" }}
                                </el-col>
                            </el-row>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Exclude columns">
                    <el-select style="float: left; width: 100%" v-model="machineLearningSettingsForm.excludedColumns" multiple filterable remote default-first-option reserve-keyword value-key="remapped" clearable collapse-tags :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.tSNETab.form.columns.placeholder')" :remote-method="
                        (userInput) => {
                            querySearch(userInput, 'excludedColumnsML');
                        }
                    ">
                        <el-option v-for="item in selectedMLFileDetailsDisplay['excludedColumnsML']" :key="item.remapped" :label="item.original" :value="item">
                            <el-row>
                                <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                    {{ item.original }}
                                </el-col>
                                <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right">
                                    {{ item.valid_10p === 1 ? "*" : "" }}
                                    {{ item.unique_count }}
                                    {{ item.na_percentage > 0 ? "NA" : "" }}
                                </el-col>
                            </el-row>
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            ML Prediction outcome is 'pandora_clusters' column (Excluded automatically, do not exclude it here)
            <span slot="footer" class="dialog-footer">
                <el-button @click="machineLearningDialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="startSIMONAnalysis">Confirm</el-button>
            </span>
        </el-dialog>
        <el-aside class="bottom-column-details-bar" :class="{ open: bottomBarOpen }">
            <el-row v-for="(item, index) in reverseSelectedColumns" :key="item.remapped">
                <el-card class="box-card box-column-item animated fadeIn" shadow="never">
                    <div slot="header" class="clearfix">
                        <span>{{ item.original }}</span>
                    </div>
                    <div class="box-column-item-text">
                        <el-tooltip placement="top">
                            <div slot="content">Total unique/distinct values in this column.</div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                        Unique values:
                        <div class="box-column-item-details">{{ item.unique_count }}</div>
                    </div>
                    <div class="box-column-item-text">
                        <el-tooltip placement="top">
                            <div slot="content">
                                Indicates whether the column contains only numeric values. Non-numeric columns will be excluded from PCA and other analyses.
                            </div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                        Valid numeric:
                        <div class="box-column-item-details">{{ item.valid_numeric === 1 ? "Yes" : "No" }}</div>
                    </div>
                    <div class="box-column-item-text">
                        <el-tooltip placement="top">
                            <div slot="content">Indicates if the column has zero variance. Columns with zero variance will be excluded from analyses.</div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                        Zero variance:
                        <div class="box-column-item-details">{{ item.valid_zv === 1 ? "Yes" : "No" }}</div>
                    </div>
                    <div class="box-column-item-text">
                        <el-tooltip placement="top">
                            <div slot="content">
                                Indicates if the column has fewer unique values than 10% of the total observations. Such columns are suitable as grouping variables in PCA and other analyses.
                            </div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                        Unique < 10%: <div class="box-column-item-details">{{ item.valid_10p === 1 ? "Yes" : "No" }}
                    </div>
    </div>
    <div class="box-column-item-text">
        <el-tooltip placement="top">
            <div slot="content">Percentage of missing (NA) values in this column.</div>
            <i class="el-icon-question"></i>
        </el-tooltip>
        NA values (%):
        <div class="box-column-item-details">{{ item.na_percentage }}</div>
    </div>
    </el-card>
    </el-row>
    </el-aside>
    </div>
</template>
<script>
import { getOverViewAavailableColumns, fetchTsnePlot, getDatasetTempPath } from "@/api/plots";
import { uploadTempToWorkspace, getSimonPreAnalysisDetails as ApiGetSimonPreAnalysisDetails } from "@/api/backend";

import Fuse from "fuse.js";

import plotColorPalettes from "@/assets/plots/color_palettes.json";
import plotThemes from "@/assets/plots/themes.json";

import waves from "@/directive/waves";

export default {
    name: "tSNETab",
    directives: {
        waves,
    },
    data() {
        return {
            bottomBarOpen: false,
            activeSections: ['clusteringSettings'],
            // This tab is disabled and we will enable it on initialization if there is no too much data
            tabEnabled: false,
            fuseIndex: null,
            loadingPlot: false,
            activeTab: "tsne_plot",
            cTsneActiveTab: "c_tsne_clusters",

            // ML
            machineLearningDialogVisible: false,
            selectedMLFileDetailsDisplay: {
                "excludedColumnsML": [],
                "selectedColumnsML": []
            },
            selectedFileDetailsDisplay: {
                "selectedColumns": [],
                "excludedColumns": [],
                "groupingVariables": [],
                "colorVariables": [],
                "selectedColumnsSIMON": [],
            },

            selectedPreProcessOptions: [{
                    value: "center",
                    incompatible: [],
                    disabled: false,
                },
                {
                    value: "scale",
                    incompatible: [],
                    disabled: false,
                },
                {
                    value: "knnImpute",
                    incompatible: ["scale", "center"],
                    disabled: false,
                },
                {
                    value: "bagImpute",
                    incompatible: ["medianImpute"],
                    disabled: false,
                },
                {
                    value: "medianImpute",
                    incompatible: ["bagImpute"],
                    disabled: false,
                },
                {
                    value: "corr",
                    incompatible: [],
                    disabled: false,
                },
                {
                    value: "zv",
                    incompatible: [],
                    disabled: false,
                },
                {
                    value: "nzv",
                    incompatible: [],
                    disabled: false,
                }
            ],
            settingsOptions: {
                availableColumns: [],
                theme: plotThemes,
                colorPalette: plotColorPalettes,
                clusterType: [
                    { value: "Louvain", name: "KNN graph and Louvain", description: "KNN graph and Louvain community detection" },
                    { value: "Hierarchical", name: "Hierarchical clustering", description: "Doesnt scale well. High memory usage and computation time when >30K." },
                    { value: "Mclust", name: "Mclust", description: "Can find the best K (number of clusters (although slowly)." },
                    { value: "Density", name: "Density-based clustering", description: "DBSCAN density reachability and connectivity clustering. Generates a density based clustering of arbitrary shape as introduced in Ester et al. (1996)." },
                ],
                clustLinkage: [
                    { id: "single" },
                    { id: "complete" },
                    { id: "average" },
                    { id: "mcquitty" },
                    { id: "median" },
                    { id: "centroid" },
                    { id: "ward.D2" },
                    { id: "ward.D" },
                ],

                epsQuantile: 0.9,
                excludeOutliers: true,

                // Louvain specific parameters
                pickBestClusterMethod: [{
                        value: "SIMON",
                        name: "SIMON",
                        description: "Runs a detailed SIMON analysis using six algorithms, including Random Forest, Regularized Random Forest, Generalized Cross Validation Earth, Conditional Inference Trees, and Naive Bayes. It selects the best clustering based on a weighted average of AUROC, modularity, and silhouette scores. This process can take some time, as it builds models for each combination of Resolution Increments and Minimum Modularity settings, especially with larger datasets."
                    },
                    {
                        value: "Modularity",
                        name: "Modularity",
                        description: "Optimizes clustering based on the modularity score, measuring the strength of division of clusters."
                    },
                    {
                        value: "Silhouette",
                        name: "Silhouette",
                        description: "Evaluates clustering by average silhouette score, indicating the similarity of data points within clusters."
                    },
                    {
                        value: "Overall",
                        name: "Overall",
                        description: "Selects clusters by combining modularity, silhouette, Davies-Bouldin, and Calinski-Harabasz metrics for balanced scoring."
                    }
                ],

                clustOrdering: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],

                datasetAnalysisType: [
                    { id: "heatmap", label: "Heatmap" },
                    { id: "cluster", label: "Clustered Hierarchical Analysis" },
                ],
                datasetAnalysisSortColumn: [],

                legendPosition: [
                    { id: "left", label: "Left" },
                    { id: "right", label: "Right" },
                    { id: "none", label: "None" },
                ],
            },
            plot_data: {
                tsne_plot: [],

                tsne_cluster_plot: false,
                tsne_cluster_plot_png: false,

                cluster_features_means: false,
                cluster_features_means_png: false,

                cluster_features_means_separated: false,
                cluster_features_means_separated_png: false,

                tsne_cluster_heatmap_plot: false,
                tsne_cluster_heatmap_plot_png: false,

                avg_silhouette_score: false,
                tsne_perplexity: false,
                tsne_exaggeration_factor: false,
                tsne_max_iter: false,
                tsne_theta: false,
                tsne_eta: false,

                saveObjectHash: false,
                saveDatasetHash: false,
            },
        };
    },
    computed: {
        activeTabName: {
            get() {
                return this.$store.getters.pandoraExplorationActiveTabName;
            },
            set(value) {
                this.$store.dispatch("setSimonExplorationnActiveTabName", value);
            },
        },
        // Array of selected files from Workspace
        selectedFiles: {
            get() {
                return this.$store.getters.selectedFiles;
            },
            set(value) {
                this.$store.dispatch("setSelectedFiles", value);
            },
        },
        selectedFileDetails: {
            get() {
                return this.$store.getters.selectedFileDetails;
            },
            set(value) {
                this.$store.dispatch("setSelectedFileDetails", value);
            },
        },
        reverseSelectedColumns() {
            return this.selectedColumns.slice().reverse();
        },
        selectedPreProcess: {
            get() {
                return this.$store.getters.pandoraEditingSelectedPreProcess;
            },
            set(value) {
                this.$store.dispatch("setSimonEditingSelectedPreProcess", value);
            },
        },
        machineLearningSettingsForm: {
            get() {
                return this.$store.getters.pandoraEditingMLSettingsForm;
            },
            set(value) {
                this.$store.dispatch("setPandoraEditingMLSettingsForm", value);
            },
        },
        settingsForm: {
            get() {
                return this.$store.getters.pandoraEditingTSNESettingsForm;
            },
            set(value) {
                this.$store.dispatch("setPandoraEditingTSNESettingsForm", value);
            },
        },
        selectedColumns: {
            get() {
                return this.$store.getters.pandoraEditingSelectedColumns;
            },
            set(value) {
                this.$store.dispatch("setPandoraEditingSelectedColumns", value);
            },
        },
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
        console.log(this.settingsForm);

        this.isTabEnabled();
    },
    activated() {
        console.log("activated: " + this.$options.name);
        this.isTabEnabled();
    },
    methods: {
        roundToTenth(value) {
            return Math.round(value * 10) / 10;
        },
        downloadTable() {
            const exportData = this.selectedFileDetails.columns;
            import("@/vendor/Export2Excel").then((excel) => {
                const tHeader = ["Feature", "Remapped", "Unique values", "Numeric", "Zero variance", "10% Unique", "NA percentage"];
                const filterVal = ["original", "remapped", "unique_count", "valid_numeric", "valid_zv", "valid_10p", "na_percentage"];

                excel.export_json_to_excel(tHeader, this.formatJson(filterVal, exportData), "column_info");
            });
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map((v) =>
                filterVal.map((j) => {
                    if (j === "submitted") {
                        return parseTime(v[j]);
                    } else {
                        return v[j];
                    }
                })
            );
        },
        isTabEnabled() {
            if (this.selectedFileDetails.columns.length >= 1 && this.selectedFileDetails.id === this.selectedFiles.map((x) => x.id)[0]) {
                this.tabEnabled = true;
            } else {
                this.tabEnabled = false;
            }

            if (this.tabEnabled === true && this.fuseIndex === null) {
                this.initFuse(this.selectedFileDetails.columns);

                for (let key in this.selectedFileDetailsDisplay) {
                    this.selectedFileDetailsDisplay[key] = this.selectedFileDetails.columns;
                }

            }
        },
        isTabDisabled(tabName) {
            let isDisabled = true;
            if (Array.isArray(this.plot_data[tabName]) === false && this.plot_data[tabName] !== false) {
                isDisabled = false;
            } else if (Array.isArray(this.plot_data[tabName]) === true && this.plot_data[tabName].length === 0) {
                isDisabled = true;
            } else if (typeof this.plot_data[tabName] === "undefined") {
                isDisabled = true;
            } else if (this.plot_data[tabName].length > 0) {
                isDisabled = false;
            } else {
                isDisabled = true;
            }
            return isDisabled;
        },
        redrawImage() {
            if (this.tabEnabled === true) {
                this.fetchRemoteAnalysis();
            }
        },
        downloadRawData(command) {
            if (command.action === "downloadData") {
                // Filename without extension
                const downloadFilename = this.selectedFiles[0].basename.replace(/\.[^/.]+$/, "");

                const downloadLink =
                    this.$store.getters.user_settings_server_address_plots +
                    "/plots/general/download-saved-object?objectHash=" +
                    command.downloadHash +
                    "&downloadFilename=" +
                    downloadFilename +
                    command.filenameAddon;
                window.open(downloadLink, "_blank");
            } else if (command.action === "sendToSimon") {
                this.sendToWorkspace(command, "auto");
            } else {
                this.sendToWorkspace(command);
            }
        },
        startSIMONAnalysis() {
            let datasetDetails = this.machineLearningSettingsForm.dataset;

            if (datasetDetails === null) {
                this.loadingPlot = false;
                return;
            }

            let outcome_column = Object.values(datasetDetails.details.header.formatted)
                .filter(x => x.original === "pandora_cluster");

            let selectedColumns = this.machineLearningSettingsForm.selectedColumns.map(x => x.remapped);
            if (selectedColumns.length > 0) {
                selectedColumns = Object.values(datasetDetails.details.header.formatted)
                    .filter(x => selectedColumns.includes(x.remapped));
            } else {
                selectedColumns = [{
                    "original": "All columns",
                    "position": -1,
                    "remapped": "ALL"
                }];
            }


            let excludedColumns = this.machineLearningSettingsForm.excludedColumns.map(x => x.remapped);
            if (excludedColumns.length > 0) {
                excludedColumns = Object.values(datasetDetails.details.header.formatted)
                    .filter(x => excludedColumns.includes(x.remapped));
            } else {
                excludedColumns = [];
            }

            const submitData = {
                "selectedFiles": [datasetDetails.id],
                "selectedFilesHash": "",
                "selectedFeatures": selectedColumns,
                "excludeFeatures": excludedColumns,
                "selectedOutcome": outcome_column,
                "selectedPreProcess": this.selectedPreProcess,
                "selectedPartitionSplit": 75,
                "modelProcessingTimeLimit": 10,
                "selectedFormula": [],
                "timeSeriesDate": [],
                "selectedClasses": [],
                "selectedPackages": [7, 27, 34, 37, 49, 64, 73, 77, 84, 91, 102, 127, 148, 155, 173, 199],
                "extraction": false,
                "backwardSelection": false,
                "autoStartAnalysis": true
            };

            this.machineLearningDialogVisible = false;

            this.loadingPlot = true;
            ApiGetSimonPreAnalysisDetails(submitData)
                .then((response) => {
                    if (response.data.success === true) {
                        this.$message({
                            message: "Analysis started",
                            type: "success",
                        });
                    } else {
                        this.$message({
                            message: this.$t("globals.errors.request_general"),
                            type: "error",
                        });
                    }
                    this.loadingPlot = false;
                })
                .catch((error) => {
                    this.$message({
                        message: this.$t("globals.errors.request_general"),
                        type: "error",
                    });
                    this.loadingPlot = false;
                });
        },
        sendToWorkspace(command, type = "manual") {
            // Extract filename without extension and append filenameAddon.
            let exportedFilename = `${this.selectedFiles[0].basename.replace(/\.[^/.]+$/, "").toLowerCase()}${command.filenameAddon}`;

            if (type === "auto") {
                this.loadingPlot = true;
                getDatasetTempPath({ objectHash: command.downloadHash })
                    .then((response) => {
                        const localFilePath = response.data.message;
                        // Generate a timestamp
                        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14); // Format: YYYYMMDDHHMMSS
                        // Create new file with the given name.
                        const newFileName = `${exportedFilename}_${timestamp}.csv`;

                        uploadTempToWorkspace(localFilePath, newFileName)
                            .then((response) => {
                                this.loadingPlot = false;
                                if (response.data.success == true) {
                                    this.$message({
                                        message: "Data saved to workspace: " + response.data.message.display_filename,
                                        type: "success",
                                    });

                                    this.machineLearningSettingsForm.dataset = response.data.message;
                                    for (let key in this.selectedMLFileDetailsDisplay) {
                                        this.selectedMLFileDetailsDisplay[key] = this.machineLearningSettingsForm.dataset.details.header.formatted;
                                    }
                                    this.machineLearningDialogVisible = true;
                                } else {
                                    this.$message({
                                        message: this.$t("globals.errors.request_general"),
                                        type: "error",
                                    });
                                }
                            })
                            .catch(() => {
                                this.$message({
                                    message: this.$t("globals.errors.request_general"),
                                    type: "error",
                                });
                                this.loadingPlot = false;
                            });
                    })
                    .catch(() => {
                        this.$message({
                            message: this.$t("globals.errors.request_general"),
                            type: "error",
                        });
                    });

            } else {
                // Prompt user for new filename, defaulting to modified exportedFilename.
                this.$prompt("Please enter new file name", "Datasets name", {
                        confirmButtonText: "OK",
                        cancelButtonText: "Cancel",
                        inputValue: `${exportedFilename}.csv`,
                    })
                    .then(({ value }) => {
                        // Fetch original file path.
                        getDatasetTempPath({ objectHash: command.downloadHash })
                            .then((response) => {
                                const localFilePath = response.data.message;

                                this.loadingPlot = true;
                                // Create new file with the given name.
                                uploadTempToWorkspace(localFilePath, value)
                                    .then(() => {
                                        this.$message({
                                            message: "Dataset saved to Workspace",
                                            type: "success",
                                        });
                                        this.loadingPlot = false;
                                    })
                                    .catch(() => {
                                        this.$message({
                                            message: this.$t("globals.errors.request_general"),
                                            type: "error",
                                        });
                                        this.loadingPlot = false;
                                    });
                            })
                            .catch(() => {
                                this.$message({
                                    message: this.$t("globals.errors.request_general"),
                                    type: "error",
                                });
                            });
                    })
                    .catch(() => {
                        this.$message({
                            type: "info",
                            message: "Dataset export canceled",
                        });
                    });
            }
        },
        fetchRemoteAnalysis() {
            this.loadingPlot = true;

            this.settingsForm.preProcessDataset = this.selectedPreProcess;

            // Clone objects as an simple object
            const settingsForm = JSON.parse(JSON.stringify(this.settingsForm));

            // If any columns are selected get their names
            if (this.selectedColumns.length > 0) {
                const selectedColumns = JSON.parse(JSON.stringify(this.selectedColumns));
                settingsForm.selectedColumns = selectedColumns.map((x) => x.remapped);
            } else {
                settingsForm.selectedColumns = [];
            }

            // Remove any excluded columns from selected columns
            if (settingsForm.excludedColumns !== null && typeof settingsForm.excludedColumns === "object") {
                settingsForm.excludedColumns = this.settingsForm.excludedColumns.map((x) => x.remapped);
                settingsForm.selectedColumns = settingsForm.selectedColumns.filter((x) => !settingsForm.excludedColumns.includes(x));
            }

            if (settingsForm.colorVariables.length > 0) {
                // Map colorVariables to remapped values from the main settings form
                settingsForm.colorVariables = this.settingsForm.colorVariables.map((x) => x.remapped);

                // Add colorVariables to selectedColumns if not already included
                settingsForm.colorVariables.forEach((colorVar) => {
                    if (!settingsForm.selectedColumns.includes(colorVar)) {
                        // Find the item in selectedFileDetails columns based on remapped colorVariable
                        let item = this.selectedFileDetails.columns.find((o) => o.remapped === colorVar);
                        if (item) {
                            // Add to selectedColumns in both the settingsForm and this component’s selectedColumns array
                            this.selectedColumns.push(item);
                            settingsForm.selectedColumns.push(colorVar);

                            // Ensure the item is also added to selectedFileDetailsDisplay['selectedColumns'] if not already present
                            if (!this.selectedFileDetailsDisplay['selectedColumns'].some((col) => col.remapped === item.remapped)) {
                                this.selectedFileDetailsDisplay['selectedColumns'].push(item);
                            }
                            // Notify the user about the addition of this color variable
                            this.$message({
                                message: `Color variable "${item.original}" added to selected columns`,
                                type: "info",
                            });
                        }
                    }
                });
                // Remove colorVariables from excludedColumns to prevent conflicts
                settingsForm.excludedColumns = settingsForm.excludedColumns.filter(
                    (col) => !settingsForm.colorVariables.includes(col)
                );
            }

            // Remove any grouping variable from selected columns
            if (settingsForm.groupingVariables.length > 0) {
                settingsForm.groupingVariables = settingsForm.groupingVariables.map((x) => x.remapped);
                // Remove Grouping variable from selected columns
                settingsForm.selectedColumns = settingsForm.selectedColumns.filter((x) => !settingsForm.groupingVariables.includes(x));
                // Remove Grouping variable from excluded columns
                settingsForm.excludedColumns = settingsForm.excludedColumns.filter((x) => !settingsForm.groupingVariables.includes(x));
                // Remove Grouping variable from colorVariables
                settingsForm.colorVariables = settingsForm.colorVariables.filter((x) => !settingsForm.groupingVariables.includes(x));
            }

            this.settingsForm.anyNAValues = false;
            this.settingsForm.categoricalVariables = false;
            // Loop selectedColumns and groupingVariables to check if any are NA
            settingsForm.groupingVariables.forEach((x) => {
                let item = this.settingsForm.groupingVariables.find((o) => o.remapped === x);

                if (item && item.na_percentage > 0) {
                    this.settingsForm.anyNAValues = true;
                }
            });

            console.log(settingsForm);
            // If the are any NA Values in grouping variables we need to have removeNA option enabled
            if (this.settingsForm.anyNAValues === true) {
                if (this.settingsForm.removeNA === false) {
                    this.$message({
                        message: "NA Values detected in 'grouping variables'. Please enable 'Remove NA' option.",
                        type: "error",
                    });
                    this.loadingPlot = false;
                    return;
                }
            }
            // If the are any NA Values in selectedColumns we need to have removeNA or preProcessDataset option enabled
            settingsForm.selectedColumns.forEach((x) => {
                let item = this.selectedColumns.find((o) => o.remapped === x);
                if (item && item.na_percentage > 0) {
                    this.settingsForm.anyNAValues = true;
                }

                if (item && item.unique_count <= 2) {
                    this.settingsForm.categoricalVariables = true;
                }
            });

            if (this.settingsForm.anyNAValues === true) {
                if (this.settingsForm.removeNA === false && settingsForm.preProcessDataset.length === 0) {
                    this.$message({
                        message: "NA Values detected in 'selected columns'. Please enable 'Remove NA' or 'Pre-process dataset' option.",
                        type: "error",
                    });
                    this.loadingPlot = false;
                    return;
                }
            }

            // If clustering Louvain is selected and Method SIMON add ML columns
            if (settingsForm.clusterType === "Louvain" && settingsForm.pickBestClusterMethod === "SIMON") {
                const selectedColumnsSIMON = JSON.parse(JSON.stringify(this.settingsForm.selectedColumnsSIMON));
                settingsForm.selectedColumnsSIMON = selectedColumnsSIMON.map(x => x.remapped);

                if (settingsForm.selectedColumnsSIMON.length === 0) {
                    this.$message({
                        message: "Please select columns for SIMON cluster analysis",
                        type: "error",
                    });
                    this.loadingPlot = false;
                    return;
                } else {
                    this.machineLearningSettingsForm.selectedColumns = selectedColumnsSIMON;
                    if (this.selectedColumns.length > 0) {
                        this.machineLearningSettingsForm.excludedColumns = JSON.parse(JSON.stringify(this.selectedColumns));
                    }
                }

                // Check if weights sum up to 1 with a small tolerance for floating-point precision
                let weightsSum = 0;
                for (let key in this.settingsForm.weights) {
                    weightsSum += this.settingsForm.weights[key];
                }

                if (Math.abs(weightsSum - 1) > 0.01) { // Using a tolerance of 0.01
                    this.$message({
                        message: "Weights for SIMON analysis should sum up to 1",
                        type: "error",
                    });
                    this.loadingPlot = false;
                    return;
                }

            }

            fetchTsnePlot({
                    selectedFileID: this.selectedFiles[0].id,
                    settings: settingsForm,
                })
                .then((response) => {
                    let respData = response.data.message;
                    this.plot_data["tsne_plot"] = [];
                    // Update the image data.
                    for (let respIndex in respData) {
                        if (typeof this.plot_data[respIndex] !== "undefined") {
                            let respItem = respData[respIndex];
                            if (typeof respItem === "object" && Object.keys(respItem).length === 0) {
                                this.plot_data[respIndex] = false;
                            } else if (typeof respItem === "object") {
                                for (let respItemIndex in respItem) {
                                    let respItemSub = respItem[respItemIndex];
                                    this.plot_data[respIndex].push(respItemSub);
                                }
                            } else {
                                this.plot_data[respIndex] = encodeURIComponent(respItem);
                            }
                        }
                    }
                    this.loadingPlot = false;
                })
                .catch((error) => {
                    this.$message({
                        message: this.$t("globals.errors.request_general"),
                        type: "error",
                    });
                    console.log(error);
                    this.loadingPlot = false;

                    // Loop this.plot_data and set all keys to false
                    for (let plotIndex in this.plot_data) {
                        this.plot_data[plotIndex] = false;
                    }
                });
        },
        initFuse(searchItems) {
            this.fuseIndex = new Fuse(searchItems, {
                shouldSort: true,
                threshold: 0.4,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 0,
                includeScore: false,
                includeMatches: true,
                keys: [{
                        name: "original",
                        weight: 0.7,
                    },
                    {
                        name: "remapped",
                        weight: 0.3,
                    },
                ],
            });
        },
        querySearch(query, inputField) {
            // Validate inputs
            if (typeof query !== 'string') {
                console.error('Query must be a string');
                return;
            }

            if (typeof inputField !== 'string') {
                console.error('Input field must be a string');
                return;
            }

            // Determine the target object based on inputField
            let targetObjectName =
                inputField === 'selectedColumnsML' || inputField === 'excludedColumnsML' ?
                'selectedMLFileDetailsDisplay' :
                'selectedFileDetailsDisplay';

            // Initialize the target object if it doesn't exist
            if (!this[targetObjectName]) {
                this[targetObjectName] = {};
            }

            let targetObject = this[targetObjectName];

            // Initialize the target array if it doesn't exist
            if (!Array.isArray(targetObject[inputField])) {
                targetObject[inputField] = [];
            }

            // Handle the case when query is an empty string
            if (query === '') {
                // Reset to default values
                if (targetObjectName === 'selectedMLFileDetailsDisplay') {
                    targetObject[inputField] = this.machineLearningSettingsForm.dataset.details.header.formatted;
                } else {
                    targetObject[inputField] = this.selectedFileDetails.columns;
                }
                return;
            }

            // Ensure that fuseIndex is properly initialized
            if (!this.fuseIndex || typeof this.fuseIndex.search !== 'function') {
                console.error('Fuse index is not initialized or invalid');
                return;
            }

            let items_found = [];
            try {
                items_found = this.fuseIndex.search(query);
            } catch (error) {
                console.error('Error during fuseIndex search:', error);
                items_found = [];
            }

            // Ensure items_found is an array
            if (!Array.isArray(items_found)) {
                items_found = [];
            }

            // Update the target array based on items_found
            if (items_found.length === 0) {
                targetObject[inputField] = [];
            } else {
                targetObject[inputField] = items_found
                    .map((x) => (x && x.item !== undefined ? x.item : null))
                    .filter((item) => item !== null);
            }
        },
        downloadPlotImage(imageType, itemIndex = null, itemSubIndex = null) {
            if (typeof this.plot_data[imageType] === "undefined") {
                return;
            }

            let svgString = "";
            let downloadName = this.$options.name + "_" + imageType;
            if (itemIndex !== null && itemSubIndex === null) {
                if (typeof this.plot_data[imageType][itemIndex] !== "undefined") {
                    svgString = this.plot_data[imageType][itemIndex].svg;
                    downloadName = downloadName + "_" + this.plot_data[imageType][itemIndex].name;
                }
            } else if (itemIndex !== null && itemSubIndex !== null) {
                if (typeof this.plot_data[imageType][itemIndex] !== "undefined") {
                    if (typeof this.plot_data[imageType][itemIndex]["colorby"][itemSubIndex] !== "undefined") {
                        svgString = this.plot_data[imageType][itemIndex]["colorby"][itemSubIndex].svg;
                        downloadName = downloadName + "_" + itemIndex + "_" + this.plot_data[imageType][itemIndex]["colorby"][itemSubIndex].name;
                    }
                }
            } else {
                svgString = this.plot_data[imageType];
            }
            if (svgString === "") {
                return;
            }

            downloadName = downloadName + ".svg";

            const svgImage = "data:image/svg+xml;base64," + svgString;
            const svgBlob = new Blob([window.atob(decodeURIComponent(svgImage.substring(26))) + "<!-- created by PANDORA: https://atomic-lab.org -->"], {
                type: "image/svg+xml;charset=utf-8",
            });

            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = downloadName;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        },
        resetVariables() {
            this.fuseIndex = null;
            this.plot_data = {
                tsne_plot: false,
                tsne_plot_png: false,

                tsne_cluster_plot: false,
                tsne_cluster_plot_png: false,

                cluster_features_means: false,
                cluster_features_means_png: false,

                cluster_features_means_separated: false,
                cluster_features_means_separated_png: false,

                tsne_cluster_heatmap_plot: false,
                tsne_cluster_heatmap_plot_png: false,
                avg_silhouette_score: false,

                tsne_perplexity: false,
                tsne_exaggeration_factor: false,
                tsne_max_iter: false,
                tsne_theta: false,
                tsne_eta: false,

                saveObjectHash: false,
                saveDatasetHash: false,
            };
        },
    },

    watch: {
        settingsForm: {
            handler(newSettingsForm) {
                // Dispatch the action to update Vuex with the latest settingsForm
                this.$store.dispatch("setPandoraEditingTSNESettingsForm", newSettingsForm);
            },
            deep: true,
        },
        // Watch for changes in machineLearningSettingsForm to keep it in sync with Vuex
        machineLearningSettingsForm: {
            handler(newMLSettingsForm) {
                // Dispatch the action to update Vuex with the latest machineLearningSettingsForm
                this.$store.dispatch("setPandoraEditingMLSettingsForm", newMLSettingsForm);
            },
            deep: true,
        },
        // Watch settingsForm.weights to ensure the total weight is <= 1
        'settingsForm.weights': {
            handler(newVal) {
                let total = newVal.AUROC + newVal.modularity + newVal.silhouette;

                if (total > 1) {
                    // Adjust proportionally to maintain total <= 1
                    const scaleFactor = 1 / total;
                    this.settingsForm.weights.AUROC = this.roundToTenth(newVal.AUROC * scaleFactor);
                    this.settingsForm.weights.modularity = this.roundToTenth(newVal.modularity * scaleFactor);
                    this.settingsForm.weights.silhouette = this.roundToTenth(newVal.silhouette * scaleFactor);
                } else {
                    // Ensure each weight is rounded to one decimal place
                    this.settingsForm.weights.AUROC = this.roundToTenth(newVal.AUROC);
                    this.settingsForm.weights.modularity = this.roundToTenth(newVal.modularity);
                    this.settingsForm.weights.silhouette = this.roundToTenth(newVal.silhouette);
                }
            },
            deep: true
        },

        // Watch for changes in selectedFileDetails
        selectedFileDetails: function(newVal, oldVal) {
            console.log("File selected change detected " + this.$options.name);
            if (newVal.columns.length >= 1) {
                this.tabEnabled = true;
            } else {
                this.tabEnabled = false;
            }
            this.resetVariables();

            if (this.tabEnabled === true) {
                this.initFuse(newVal.columns);
            }
        },
    },
};

</script>
<style rel="stylesheet/scss" lang="scss">
.box-column-item {
    margin-top: 10px;

    .box-column-item-text {
        font-size: 14px;
        padding-top: 5px;

        .box-column-item-details {
            float: right;
        }
    }
}

.tab_intro_text_tsne {
    text-align: left;
    float: left;
    font-size: 16px;
    padding-bottom: 20px;
}

.analysis_images {
    max-width: 50%;
}

#tsne-three {
    width: 100%;
    height: 100vh;
}

#tsnethree-text {
    color: #ffdbe1;
    font-weight: 700;
    font-family: "Roboto Mono";
    letter-spacing: 1.2px;
    text-transform: uppercase;
}

.tsne-tag {
    margin: 5px;
}

.settings-tabpanel-content {
    .el-collapse-item__wrap {
        padding: 5px;
    }
}

</style>
