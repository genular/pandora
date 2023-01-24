<template>
    <div class="editing-tsne-tab" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
        <el-row type="flex" align="top" v-if="tabEnabled === false">
            <el-col :span="24">
                <el-alert
                    :title="$t('views.apps.unsupervised_learning.editing.components.tabs.correlationTab.alert.function_disabled.title')"
                    description="Tab is currently disabled. Please try to refresh or choose another file from Workspace."
                    type="warning"
                    style="margin-top: 20px"
                    show-icon
                    :closable="false"
                ></el-alert>
            </el-col>
        </el-row>
        <el-row v-else type="flex" align="top">
            <el-col :span="4">
                <el-row>
                    <el-form ref="settingsForm" :model="settingsForm">
                        <el-form-item label="Columns">
                            <el-button size="mini" class="filter-item" type="success" style="padding: 0" v-waves icon="el-icon-download" @click="downloadTable" round></el-button>
                            <el-tooltip placement="top" style="padding-left: 5px">
                                <div slot="content">Please select columns you wish to analyze and plot. Leaving this empty will take all columns except excluded ones.</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            <br />
                            <el-select
                                style="float: left;width: 100%;"
                                v-model="settingsForm.selectedColumns"
                                multiple
                                filterable
                                remote
                                default-first-option
                                reserve-keyword
                                value-key="remapped"
                                clearable
                                :placeholder="$t('views.apps.pandora.exploration.components.tabs.clusteringTab.form.columns.placeholder')"
                                :remote-method="
                                    (userInput) => {
                                        querySearch(userInput);
                                    }
                                "
                            >
                                <el-option
                                    v-for="item in selectedFileDetailsDisplay"
                                    :key="item.remapped"
                                    :label="item.original"
                                    :value="item"
                                    v-bind:class="{
                                        item_danger: item.valid_numeric !== 1,
                                    }"
                                >
                                    <el-row>
                                        <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                            {{ item.original }}
                                        </el-col>
                                        <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right;">
                                            {{ item.valid_10p === 1 ? "*" : "" }}
                                            {{ item.unique_count }}
                                            {{ item.na_percentage > 0 ? "NA" : "" }}
                                        </el-col>
                                    </el-row>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="First (n) columns">
                            <el-tooltip placement="top" style="padding-left: 5px">
                                <div slot="content">If you have not selected any columns we will take first n columns from your dataset, based on this value.</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            <br />
                            <el-input-number style="float: left;width: 100%;" v-model="settingsForm.cutOffColumnSize" :step="10" :min="2" :max="50000"></el-input-number>
                        </el-form-item>

                        <el-form-item label="Exclude Columns">
                            <el-tooltip placement="top" style="padding-left: 5px">
                                <div slot="content">Please select any columns you wish to exclude from analysis.</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            <br />
                            <el-select
                                style="float: left;width: 100%;"
                                v-model="settingsForm.excludedColumns"
                                multiple
                                filterable
                                remote
                                default-first-option
                                reserve-keyword
                                value-key="remapped"
                                clearable
                                :placeholder="$t('views.apps.pandora.exploration.components.tabs.clusteringTab.form.columns.placeholder')"
                                :remote-method="
                                    (userInput) => {
                                        querySearch(userInput);
                                    }
                                "
                            >
                                <el-option v-for="item in selectedFileDetailsDisplay" :key="item.remapped" :label="item.original" :value="item">
                                    <el-row>
                                        <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                            {{ item.original }}
                                        </el-col>
                                        <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right;">
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
                            <el-select
                                style="float: left;width: 100%;"
                                v-model="settingsForm.groupingVariables"
                                multiple
                                filterable
                                remote
                                default-first-option
                                reserve-keyword
                                value-key="remapped"
                                clearable
                                :placeholder="$t('views.apps.pandora.exploration.components.tabs.clusteringTab.form.columns.placeholder')"
                                :remote-method="
                                    (userInput) => {
                                        querySearch(userInput);
                                    }
                                "
                            >
                                <el-option
                                    v-for="item in selectedFileDetailsDisplay"
                                    :key="item.remapped"
                                    :label="item.original"
                                    :value="item"
                                    :disabled="item.valid_10p !== 1 || item.unique_count < 2"
                                >
                                    <el-row>
                                        <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                            {{ item.original }}
                                        </el-col>
                                        <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right;">
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
                            <el-select
                                style="float: left;width: 100%;"
                                v-model="settingsForm.colorVariables"
                                multiple
                                filterable
                                remote
                                default-first-option
                                reserve-keyword
                                value-key="remapped"
                                clearable
                                :placeholder="$t('views.apps.pandora.exploration.components.tabs.clusteringTab.form.columns.placeholder')"
                                :remote-method="
                                    (userInput) => {
                                        querySearch(userInput);
                                    }
                                "
                            >
                                <el-option
                                    v-for="item in selectedFileDetailsDisplay"
                                    :key="item.remapped"
                                    :label="item.original"
                                    :value="item"
                                    :disabled="item.valid_numeric === 0 || item.unique_count < 2"
                                >
                                    <el-row>
                                        <el-col :span="16" style="float: left; text-overflow: ellipsis; overflow: hidden; white-space: nowrap" :title="item.original">
                                            {{ item.original }}
                                        </el-col>
                                        <el-col :span="8" style="float: left; color: #8492a6; font-size: 13px; text-align: right;">
                                            {{ item.valid_10p === 1 ? "*" : "" }}
                                            {{ item.unique_count }}
                                            {{ item.na_percentage > 0 ? "NA" : "" }}
                                        </el-col>
                                    </el-row>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Clustering alghoritam:">
                            <br />
                            <el-select
                                style="float: left;width: 100%;"
                                v-model="settingsForm.clusterType"
                                filterable
                                default-first-option
                                reserve-keyword
                                :placeholder="$t('views.apps.pandora.exploration.components.tabs.clusteringTab.form.columns.placeholder')"
                            >
                                <el-option v-for="item in settingsOptions.clusterType" :key="item.value" :label="item.name" :value="item.value">
                                    <span style="float: left">
                                        {{ item.name }}
                                    </span>
                                    <el-tooltip placement="top" style="float: right; padding-top: 10px;">
                                        <div slot="content">
                                            {{ item.description }}
                                        </div>
                                        <i class="el-icon-question"></i>
                                    </el-tooltip>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Clustering method" v-if="['Hierarchical'].includes(settingsForm.clusterType)">
                            <el-select
                                style="float: right"
                                v-model="settingsForm.clustLinkage"
                                :placeholder="$t('views.apps.pandora.exploration.components.tabs.clusteringTab.form.clust_method.placeholder')"
                            >
                                <el-option
                                    v-for="item in settingsOptions.clustLinkage"
                                    :key="item.id"
                                    :label="$t(['views.apps.pandora.exploration.components.tabs.clusteringTab.form.clust_method.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.pandora.exploration.components.tabs.clusteringTab.form.clust_method.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>



                        <el-form-item label="K" v-if="['Louvain'].includes(settingsForm.clusterType)">
                            <el-input-number style="float: right" v-model="settingsForm.knn_clusters" :step="1" :min="2" :max="2048"></el-input-number>
                            <el-tooltip placement="top" style="padding-left: 5px">
                                <div slot="content">
                                    Maximum number of nearest neighbors to search.
                                    The optimal K value usually found is the square root of N, where N is the total number of samples.
                                </div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-form-item>

                        <el-form-item label="Cluster groups" v-if="['Hierarchical', 'Mclust'].includes(settingsForm.clusterType)">
                            <el-input-number style="float: right" v-model="settingsForm.clustGroups" :step="1" :min="2" :max="128"></el-input-number>
                        </el-form-item>

                        <el-form-item label="Reachability distance" v-if="['Density'].includes(settingsForm.clusterType)">
                            <el-input-number style="float: right" v-model="settingsForm.reachabilityDistance" :step="1" :min="1" :max="512"></el-input-number>
                        </el-form-item>

                        <el-form-item label="Preprocess">
                            <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.preProcessDataset"></el-switch>
                            <el-tooltip placement="top">
                                <div slot="content">Should we apply preprocessing ("medianImpute", "center", "scale") to dataset before drawing any plots?</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-form-item>

                        <el-form-item label="Remove NA">
                            <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.removeNA"></el-switch>
                            <el-tooltip placement="top">
                                <div slot="content">Should we drop rows with NA values in dataset before any calculation?</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-form-item>

                        <el-form-item label="Perplexity">
                            <el-slider style="clear: both; width: 100%; float: right" v-model="settingsForm.perplexity" :step="1" :min="1" :max="100" show-input></el-slider>
                            <el-tooltip placement="top">
                                <div slot="content">The performance of SNE is fairly robust to changes in the perplexity, and typical values are between 5 and 50.</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-form-item>

                        <el-divider></el-divider>

                        <el-form-item label="Dataset analysis type">
                            <br />
                            <el-select 
                            style="float: left;width: 100%;" 
                            v-model="settingsForm.datasetAnalysisType" 
                            placeholder="Select">
                                <el-option v-for="item in settingsOptions.datasetAnalysisType" :key="item.id" :label="item.label" :value="item.id">
                                    <span>{{ item.label }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Sort column" v-if="settingsForm.datasetAnalysisType === 'heatmap'">
                            <br />
                            <el-select 
                            style="float: left;width: 100%;" 
                            v-model="settingsForm.datasetAnalysisSortColumn"
                            placeholder="Select">
                                <el-option v-for="item in settingsOptions.datasetAnalysisSortColumn" :key="item.id" :label="item.id" :value="item.id">
                                    <span>{{ item.id }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Cluster linkage" v-if="settingsForm.datasetAnalysisType === 'cluster'">
                            <el-select
                                style="float: right"
                                size="mini"
                                v-model="settingsForm.datasetAnalysisClustLinkage"
                                :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.clust_method.placeholder')"
                            >
                                <el-option
                                    v-for="item in settingsOptions.clustLinkage"
                                    :key="item.id"
                                    :label="$t(['views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.clust_method.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.clust_method.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Cluster ordering" v-if="settingsForm.datasetAnalysisType === 'cluster'">
                            <el-select
                                style="float: right"
                                size="mini"
                                v-model="settingsForm.datasetAnalysisClustOrdering"
                                :placeholder="$t('views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.tree_ordering.placeholder')"
                            >
                                <el-option
                                    v-for="item in settingsOptions.clustOrdering"
                                    :key="item.id"
                                    :label="$t(['views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.tree_ordering.options.', item.id].join(''))"
                                    :value="item.id"
                                >
                                    <span>{{ $t("views.apps.unsupervised_learning.editing.components.tabs.clusteringTab.form.tree_ordering.options." + item.id) }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-divider></el-divider>

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
                            <el-select 
                            style="float: left;width: 100%;" 
                            v-model="settingsForm.legendPosition" 
                            size="mini" 
                            placeholder="Select">
                                <el-option v-for="item in settingsOptions.legendPosition" :key="item.id" :label="item.label" :value="item.id">
                                    <span>{{ item.label }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Font size">
                            <el-input-number style="float: right" v-model="settingsForm.fontSize" :step="1" :min="8" :max="48"></el-input-number>
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

                        <el-row>
                            <el-col :span="12" v-if="plot_data.saveObjectHash !== false">
                                <el-form-item>
                                    <el-tooltip placement="top">
                                        <div slot="content">
                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_r_data.description") }}
                                        </div>
                                        <el-button style="float: left" type="danger" round @click="downloadRawData">
                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_r_data.title") }}
                                            <i class="el-icon-download el-icon-right"></i>
                                        </el-button>
                                    </el-tooltip>
                                </el-form-item>
                            </el-col>

                            <el-col :span="plot_data.saveObjectHash !== false ? 12 : 24">
                                <el-form-item>
                                    <el-button type="primary" round @click="redrawImage" style="float: right">
                                        {{ $t("views.apps.unsupervised_learning.editing.components.tabs.correlationTab.buttons.plot_image") }}
                                    </el-button>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </el-row>
                <el-row v-for="(item, index) in reverseSelectedColumns" :key="item.remapped">
                    <el-card class="box-card box-column-item animated fadeIn">
                        <div slot="header" class="clearfix">
                            <span>{{ item.original }}</span>
                        </div>
                        <div class="box-column-item-text">
                            <el-tooltip placement="top">
                                <div slot="content">Total number of unique/distinct values in the column</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            Number of unique values:
                            <div class="box-column-item-details">{{ item.unique_count }}</div>
                        </div>
                        <div class="box-column-item-text">
                            <el-tooltip placement="top">
                                <div slot="content">
                                    Checks if selected column valid numeric one. If it contains anything else than numeric values this check will not pass. Such columns will be
                                    excluded from PCA and other types of analysis.
                                </div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            Valid numeric:
                            <div class="box-column-item-details">{{ item.valid_numeric === 1 ? "Yes" : "No" }}</div>
                        </div>
                        <div class="box-column-item-text">
                            <el-tooltip placement="top">
                                <div slot="content">Checks if selected column is zero variance. Such columns will be excluded from PCA and other types of analysis.</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            Zero variance:
                            <div class="box-column-item-details">{{ item.valid_zv === 1 ? "Yes" : "No" }}</div>
                        </div>
                        <div class="box-column-item-text">
                            <el-tooltip placement="top">
                                <div slot="content">
                                    Checks if number of unique values in the column are less than 10% the number of observations. We would use such columns as Grouping variables in
                                    PCA and other types of analysis.
                                </div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            Unique 10%:
                            <div class="box-column-item-details">{{ item.valid_10p === 1 ? "Yes" : "No" }}</div>
                        </div>
                        <div class="box-column-item-text">
                            <el-tooltip placement="top">
                                <div slot="content">Total percentage of NA values found in selected column.</div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                            Percentage of NA values:
                            <div class="box-column-item-details">{{ item.na_percentage }}</div>
                        </div>
                    </el-card>
                </el-row>
            </el-col>
            <el-col :span="19" :offset="1" class="correlation-svg-container" style="text-align: center">
                <el-tabs v-model="activeTab">
                    <el-tab-pane label="t-SNE plot(s)" name="tsne_plot" :disabled="isTabDisabled('tsne_plot')">
                        <el-tabs :value="plot_data.tsne_plot.length > 0 || Object.keys(plot_data.tsne_plot).length > 0 ? 'tab_tsne_grouped_0' : null" :tab-position="'right'">
                            <el-tab-pane
                                v-for="(plotData, plotIndex) in plot_data.tsne_plot"
                                :key="'tab_tsne_grouped_' + plotIndex"
                                :label="plotData.name"
                                :name="'tab_tsne_grouped_' + plotIndex"
                            >
                                <!-- if color variables display both plots side to side -->
                                <el-row v-if="plotData.colorby.length > 0 || Object.keys(plotData.colorby).length > 0">
                                    <el-tabs
                                        :value="
                                            plotData.colorby.length > 0 || Object.keys(plotData.colorby).length > 0
                                                ? 'tab_tsne_grouped_' + plotIndex + '_colorby_' + Object.keys(plotData.colorby)[0]
                                                : null
                                        "
                                        :tab-position="'left'"
                                    >
                                        <el-tab-pane
                                            v-for="(plotDataColor, plotIndexColor) in plotData.colorby"
                                            :key="'tab_tsne_grouped_' + plotIndex + '_colorby_' + plotIndexColor"
                                            :label="plotDataColor.name"
                                            :name="'tab_tsne_grouped_' + plotIndex + '_colorby_' + plotIndexColor"
                                        >
                                            <el-row>
                                                <el-col :span="12">
                                                    <span class="tab_intro_text">Graph of individuals colored by: "{{ plotDataColor.name }}".</span>
                                                </el-col>
                                                <el-col :span="12">
                                                    <span class="tab_intro_text" v-if="plotData.name === 'Main plot'">
                                                        Barnes-Hut t-Distributed Stochastic Neighbor Embedding. t-SNE is a method for constructing a low dimensional embedding of
                                                        high-dimensional data, distances or similarities.
                                                    </span>
                                                    <span class="tab_intro_text" v-else>Graph of individuals grouped by: "{{ plotData.name }}".</span>
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
                                                        <img
                                                            id="analysis_images_pca"
                                                            class="animated fadeIn analysis_images"
                                                            :src="'data:image/png;base64,' + plotDataColor.png"
                                                            fit="scale-down"
                                                        />
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
                                                        <img
                                                            id="analysis_images_pca"
                                                            class="animated fadeIn analysis_images"
                                                            :src="'data:image/png;base64,' + plotData.png"
                                                            fit="scale-down"
                                                        />
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
                                        <span class="tab_intro_text" v-if="plotData.name === 'Main plot'">
                                            Barnes-Hut t-Distributed Stochastic Neighbor Embedding. t-SNE is a method for constructing a low dimensional embedding of
                                            high-dimensional data, distances or similarities.
                                        </span>
                                        <span class="tab_intro_text" v-else>Graph of individuals grouped by: "{{ plotData.name }}".</span>
                                    </el-col>
                                    <el-col :span="24" v-if="plotData.png">
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <div slot="content">
                                                <el-button type="success" round @click="downloadPlotImage('tsne_plot', plotIndex)">
                                                    {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                </el-button>
                                            </div>
                                            <img id="analysis_images_pca" class="animated fadeIn analysis_images" :src="'data:image/png;base64,' + plotData.png" fit="scale-down" />
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
                        <el-row
                            v-bind:class="{
                                is_tab_active: isTabDisabled('tsne_cluster_plot'),
                            }"
                        >
                            <el-col v-if="plot_data.tsne_cluster_plot_png !== false">
                                <el-row>
                                    <el-col :span="24">
                                        <span>Clustered t-SNE plot, on main data, without grouping and color variables, using: {{ settingsForm.clusterType }}</span>
                                    </el-col>
                                    <el-col :span="24">
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <div slot="content">
                                                <el-button type="success" round @click="downloadPlotImage('tsne_cluster_plot')">
                                                    {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                </el-button>
                                            </div>
                                            <img
                                                id="analysis_images_tsne_clustered_plot"
                                                class="animated fadeIn analysis_images"
                                                :src="'data:image/png;base64,' + plot_data.tsne_cluster_plot_png"
                                                fit="scale-down"
                                            />
                                        </el-tooltip>
                                    </el-col>
                                </el-row>
                            </el-col>
                            <el-col v-else class="plot-placeholder">
                                <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                    <el-tab-pane label="Dataset Analysis" name="tsne_cluster_heatmap_plot_png" :disabled="isTabDisabled('tsne_cluster_heatmap_plot')">
                        <el-row
                            v-bind:class="{
                                is_tab_active: isTabDisabled('tsne_cluster_heatmap_plot'),
                            }"
                        >
                            <el-col v-if="plot_data.tsne_cluster_heatmap_plot !== false">
                                <el-row>
                                    <el-col :span="24">
                                        <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                            <div slot="content">
                                                <el-button type="success" round @click="downloadPlotImage('tsne_cluster_heatmap_plot')">
                                                    {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                </el-button>
                                            </div>
                                            <img
                                                id="analysis_images_tsne_cluster_heatmap_plot"
                                                class="animated fadeIn analysis_images"
                                                :src="'data:image/png;base64,' + plot_data.tsne_cluster_heatmap_plot_png"
                                                fit="scale-down"
                                            />
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
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { getOverViewAavailableColumns, fetchTsnePlot } from "@/api/plots";
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
            // This tab is disabled and we will enable it on initialization if there is no too much data
            tabEnabled: false,
            fuseIndex: null,
            loadingPlot: false,
            activeTab: "tsne_plot",

            selectedFileDetailsDisplay: [],

            settingsOptions: {
                availableColumns: [],
                theme: plotThemes,
                colorPalette: plotColorPalettes,
                clusterType: [
                    { value: "Louvain", name: "KNN graph and Louvain", description: "KNN graph and Louvain community detection" },
                    { value: "Hierarchical", name: "Hierarchical clustering", description: "Doesnt scale well. High memory usage and computation time when >30K." },
                    { value: "Mclust", name: "Mclust", description: "Can find the best K (number of clusters (although slowly)." },
                    { value: "Density", name: "Density-based clustering", description: "Can find clusters with different shapes." },
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
                clustOrdering: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],

                datasetAnalysisType: [
                    { id: "heatmap", label: "Heatmap" },
                    { id: "cluster", label: "Clustered Hierarchical Analysis" },
                ],
                datasetAnalysisSortColumn: [],

                legendPosition: [{ id: "left", label: "Left" }, { id: "right", label: "Right" }, { id: "none", label: "None" }],
            },

            settingsForm: {
                selectedColumns: [],
                excludedColumns: [],
                groupingVariables: [],
                colorVariables: [],
                preProcessDataset: true,

                fontSize: 12,
                pointSize: 1.5,
                theme: "theme_bw",
                colorPalette: "Set1",
                aspect_ratio: 1,
                plot_size: 12,

                clusterType: "Louvain",
                cutOffColumnSize: 50000,
                removeNA: false,
                perplexity: 5,
                knn_clusters: 25,
                clustLinkage: "ward.D2",

                clustGroups: 9,
                reachabilityDistance: 2,
                legendPosition: "right",

                datasetAnalysisClustLinkage: "ward.D2",
                datasetAnalysisType: "heatmap",
                datasetAnalysisSortColumn: "cluster",
                datasetAnalysisClustOrdering: 1,
                anyNAValues: false,
                categoricalVariables: false
            },
            plot_data: {
                tsne_plot: [],

                tsne_cluster_plot: false,
                tsne_cluster_plot_png: false,

                tsne_cluster_heatmap_plot: false,
                tsne_cluster_heatmap_plot_png: false,

                saveObjectHash: false,
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
            return this.settingsForm.selectedColumns.slice().reverse();
        },
    },
    mounted() {
        console.log("mounted: " + this.$options.name);
        this.isTabEnabled();
    },
    activated() {
        console.log("activated: " + this.$options.name);
        this.isTabEnabled();
    },
    methods: {
        downloadTable() {
            const exportData = this.selectedFileDetails.columns;
            import("@/vendor/Export2Excel").then((excel) => {
                const tHeader = ["Feature", "Remapped", "Unique values", "Numeric", "Zero variance", "10% Unique", "NA percentage"];
                const filterVal = ["original", "remapped", "unique_count", "valid_numeric", "valid_zv", "valid_10p", "na_percentage"];

                console.log(tHeader);

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
        downloadRawData() {
            const downloadLink = this.$store.getters.user_settings_server_address_plots + "/plots/general/download-saved-object?objectHash=" + this.plot_data.saveObjectHash;
            window.open(downloadLink, "_blank");
        },
        fetchRemoteAnalysis() {
            this.loadingPlot = true;
            // Clone objects as an simple object
            const settingsForm = JSON.parse(JSON.stringify(this.settingsForm));
            // If any columns are selected get their names
            if (settingsForm.selectedColumns.length > 0) {
                settingsForm.selectedColumns = this.settingsForm.selectedColumns.map((x) => x.remapped);
            }

            // Remove any excluded columns from selected columns
            if (settingsForm.excludedColumns !== null && typeof settingsForm.excludedColumns === "object") {
                settingsForm.excludedColumns = this.settingsForm.excludedColumns.map((x) => x.remapped);
                settingsForm.selectedColumns = settingsForm.selectedColumns.filter((x) => !settingsForm.excludedColumns.includes(x));
            }

            if (settingsForm.colorVariables.length > 0) {
                settingsForm.colorVariables = settingsForm.colorVariables.map((x) => x.remapped);
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
                let item = this.settingsForm.groupingVariables.find(o => o.remapped === x);

                if (item && item.na_percentage > 0) {
                    this.settingsForm.anyNAValues = true;
                }
            });

            // If the are any NA Values in grouping variables we need to have removeNA option enabled
            if(this.settingsForm.anyNAValues === true){
                if(this.settingsForm.removeNA === false){
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
                let item = this.settingsForm.selectedColumns.find(o => o.remapped === x);
                if (item && item.na_percentage > 0) {
                    this.settingsForm.anyNAValues = true;
                }
                if (item.unique_count <= 2) {
                    this.settingsForm.categoricalVariables = true;
                }
            });

            if(this.settingsForm.anyNAValues === true){
                if(this.settingsForm.removeNA === false && this.settingsForm.preProcessDataset === false){
                    this.$message({
                        message: "NA Values detected in 'selected columns'. Please enable 'Remove NA' or 'Pre-process dataset' option.",
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
            this.selectedFileDetailsDisplay = searchItems;

            this.fuseIndex = new Fuse(searchItems, {
                shouldSort: true,
                threshold: 0.4,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 0,
                includeScore: false,
                includeMatches: true,
                keys: [
                    {
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
        querySearch(query) {
            const items_found = this.fuseIndex.search(query);
            this.selectedFileDetailsDisplay = items_found.map((x) => x.item);
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
            const svgBlob = new Blob([window.atob(decodeURIComponent(svgImage.substring(26))) + "<!-- created by PANDORA: https://genular.org -->"], {
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

                tsne_cluster_heatmap_plot: false,
                tsne_cluster_heatmap_plot_png: false,

                saveObjectHash: false,
            };
        },
    },

    watch: {
        selectedFileDetails: function (newVal, oldVal) {
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
        deep: true,
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
.analysis_images {
    max-width: 100%;
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
</style>
