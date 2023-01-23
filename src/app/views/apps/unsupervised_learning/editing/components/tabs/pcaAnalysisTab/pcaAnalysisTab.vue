<template>
    <div class="editing-pca-tab" v-loading.fullscreen.lock="loadingPlot" :element-loading-text="$t('globals.page_loading')">
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
                <el-form ref="settingsForm" :model="settingsForm">
                    <el-form-item label="Columns:">
                        <el-tooltip placement="top">
                            <div slot="content">
                                Please select columns you wish to analyze and plot. Leaving this empty will take all valid numerical columns except excluded ones.
                                <br />
                                To remove rows with NA values please make sure that "Remove NA" option is enabled.
                                Variables with zero variance are automatically excluded when "Preprocess" option is enabled and NA values are median imputed.
                            </div>
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
                                    querySearch(userInput, 'columns_all');
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

                    <el-form-item label="First (n) columns">
                        <el-tooltip placement="top" style="padding-left: 5px">
                            <div slot="content">If you have not selected any columns we will take first n columns from your dataset, based on this value.</div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                        <br />
                        <el-input-number style="float: left;width: 100%;" v-model="settingsForm.cutOffColumnSize" :step="100" :min="2" :max="50000"></el-input-number>
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

                    <el-form-item label="Remove by unique">
                        <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.cutOffUnique"></el-switch>
                        <el-tooltip placement="top">
                            <div slot="content">Remove any columns that have less than defined unique values.</div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                    </el-form-item>

                    <el-form-item v-if="settingsForm.cutOffUnique === true" label="Remove by unique treshold">
                        <br />
                        <el-input-number style="float: left;width: 100%;" size="mini" v-model="settingsForm.cutOffUniqueSize" :step="1" :max="10000" :min="1"></el-input-number>
                    </el-form-item>

                    <el-form-item label="Remove < 10%">
                        <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.remove_less_10p"></el-switch>
                        <el-tooltip placement="top">
                            <div slot="content">Remove any columns that have number of unique values less than 10% of total number of observations.</div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                    </el-form-item>

                    <el-form-item label="Grouping variable:">
                        <el-tooltip placement="top">
                            <div slot="content">
                                Grouping variables are not taken in consideration when calculation PCA. Preprocessing is also not applied to them.
                                <br />
                                They are used only for plotting and displaying PCA results.
                                <br />
                                Only variables where the number of unique values is less than 10% of the total number of observations are shown here.
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
                                    querySearch(userInput, 'columns_grouping');
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

                    <el-form-item label="X axis:">
                        <el-select
                            style="float: right"
                            v-model="settingsForm.selectedComponentsX"
                            filterable
                            default-first-option
                            :placeholder="$t('views.apps.pandora.exploration.components.tabs.clusteringTab.form.columns.placeholder')"
                            :remote-method="
                                (userInput) => {
                                    querySearch(userInput, 'pca_components');
                                }
                            "
                        >
                            <el-option v-for="item in selectedOptions.pca_components_x" :key="item" :label="item" :value="item">
                                <span style="float: left">{{ item }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="Y axis:">
                        <el-select
                            style="float: right"
                            v-model="settingsForm.selectedComponentsY"
                            filterable
                            default-first-option
                            :placeholder="$t('views.apps.pandora.exploration.components.tabs.clusteringTab.form.columns.placeholder')"
                            :remote-method="
                                (userInput) => {
                                    querySearch(userInput, 'pca_components');
                                }
                            "
                        >
                            <el-option v-for="item in selectedOptions.pca_components_y" :key="item" :label="item" :value="item">
                                <span style="float: left">{{ item }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="Preprocess">
                        <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.preProcessDataset"></el-switch>
                        <el-tooltip placement="top">
                            <div slot="content">
                                Should we apply preprocessing ("medianImpute", "center", "scale") and remove "near-zero-variance" features before any calculation?
                            </div>
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

                    <el-form-item label="KMO/Berlett column limit">
                        <el-tooltip placement="top">
                            <div slot="content">If we have more columns than in this limit we will skip calculation of Bartlett (1951) and his contrast Kaiser, Meyer, Olkin test.</div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                        <br />
                         <el-input-number style="float: left;width: 100%;" size="mini" v-model="settingsForm.kmo_bartlett_limit" :step="100" :max="100000" :min="1"></el-input-number>
                    </el-form-item>

                    <el-form-item label="Analysis method">
                        <br />
                        <el-select v-model="settingsForm.analysis_method" size="mini" placeholder="Select" style="float: left;width: 100%;">
                            <el-option v-for="item in selectedOptions.analysis_method" :key="item.id" :label="item.name" :value="item.id">
                                <span style="float: left">{{ item.name }}</span>
                                <span style="float: right; color: #8492a6; font-size: 13px">
                                    <el-tooltip placement="top">
                                        <div slot="content" style="text-align: center">
                                            {{ item.description }}
                                        </div>
                                        <span class="el-icon-info"></span>
                                    </el-tooltip>
                                </span>
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-divider></el-divider>

                    <el-form-item label="Display Loadings">
                        <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.displayLoadings"></el-switch>
                    </el-form-item>

                    <el-form-item label="Theme">
                        <el-select v-model="settingsForm.theme" size="mini" placeholder="Select" style="float: right">
                            <el-option v-for="item in selectedOptions.theme" :key="item.id" :label="item.name" :value="item.id">
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
                            <el-option v-for="item in selectedOptions.colorPalette" :key="item.id" :label="item.value" :value="item.id">
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

                    <el-form-item label="Font size">
                        <el-input-number style="float: right" v-model="settingsForm.fontSize" :step="1" :min="8" :max="24"></el-input-number>
                    </el-form-item>

                    <el-form-item label="Point size">
                        <el-input-number style="float: right" v-model="settingsForm.pointSize" :step="0.5" :min="0.1" :max="25"></el-input-number>
                    </el-form-item>

                    <el-form-item label="Label size">
                        <el-input-number style="float: right" v-model="settingsForm.labelSize" :step="1" :min="1" :max="25"></el-input-number>
                    </el-form-item>

                    <el-form-item label="Ellipse Alpha">
                        <el-input-number style="float: right" v-model="settingsForm.ellipseAlpha" :step="0.01" :min="0" :max="1"></el-input-number>
                    </el-form-item>

                    <el-form-item label="Remove Ellipse">
                        <el-switch style="float: right; padding-top: 10px" v-model="settingsForm.addEllipses"></el-switch>
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
                                    {{ $t("views.apps.pandora.exploration.components.tabs.correlationTab.buttons.plot_image") }}
                                </el-button>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </el-col>
            <el-col :span="19" :offset="1" class="correlation-svg-container" style="text-align: center">
                <el-row>
                    <el-tabs v-model="activePCATabName">
                        <el-tab-pane label="Bartlett's sphericity" name="bartlett" :disabled="isTabDisabled('plot_scree')">
                            <el-row
                                v-bind:class="{
                                    is_tab_active: isTabDisabled('plot_scree'),
                                }"
                            >
                                <el-col :span="24" v-if="details.bartlett !== false">
                                    <div class="code-output">
                                        <div class="code-header">
                                            Among SPSS users, these tests are considered to provide some guidelines on the suitability of the data for a principal components
                                            analysis. However, they may be safely ignored in favor of common sense. Variables with zero variance are excluded.
                                            <br />
                                            Here is the output of Bartlett's sphericity test. Bartlett's test of sphericity tests whether the data comes from multivariate normal
                                            distribution with zero covariances. If p > 0.05 then PCA may not be very informative
                                        </div>
                                        <div class="highlight_code">
                                            {{ details.bartlett }}
                                        </div>
                                    </div>
                                    <div class="code-output">
                                        <div class="code-header">
                                            Here is the output of the Kaiser-Meyer-Olkin (KMO) index test. The overall measure varies between 0 and 1, and values closer to 1 are
                                            better. A value of 0.6 is a suggested minimum.
                                        </div>
                                        <div class="highlight_code">
                                            {{ details.kmo }}
                                        </div>
                                    </div>
                                </el-col>
                                <el-col v-else class="plot-placeholder">
                                    <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                </el-col>
                            </el-row>
                        </el-tab-pane>

                        <el-tab-pane label="Eigenvalues / Variances" name="tab_eigenvalues" :disabled="isTabDisabled('plot_scree')">
                            <el-row
                                v-bind:class="{
                                    is_tab_active: isTabDisabled('plot_scree'),
                                }"
                            >
                                <el-col v-if="plot_data.plot_scree !== false">
                                    <el-tabs :value="'tab_eigenvalues_scree_plot'" :tab-position="'left'">
                                        <el-tab-pane label="Scree Plot" name="tab_eigenvalues_scree_plot">
                                            <el-row>
                                                <el-col :span="24">
                                                    <span class="tab_intro_text">
                                                        Eigenvalues measure the amount of variation retained by each principal component. Eigenvalues are large for the first PCs
                                                        and small for the subsequent PCs. That is, the first PCs corresponds to the directions with the maximum amount of variation
                                                        in the data set.
                                                        <br />
                                                        <br />
                                                        Eigenvalues can be used to determine the number of principal components to retain after PCA (Kaiser 1961).
                                                        <el-tooltip placement="top">
                                                            <div slot="content">
                                                                Henry F Kaiser. A note on guttman's lower bound for the number of common factors 1. British Journal of Statistical
                                                                Psychology, 14(1):1--2, 1961.
                                                                <br />
                                                            </div>

                                                            <i class="el-icon-question"></i>
                                                        </el-tooltip>
                                                        A more data driven result is known as the Guttman-Kaiser {Guttman (1954), Kaiser (1960), Kaiser (1961)} criterion.
                                                        <el-tooltip placement="top">
                                                            <div slot="content">
                                                                Louis Guttman. Some necessary conditions for common-factor analysis. Psychometrika, 19(2):149--161, 1954.
                                                                <br />
                                                                Henry F Kaiser. The application of electronic computers to factor analysis. Educational and psychological
                                                                measurement, 20(1):141--151, 1960.
                                                                <br />
                                                                Henry F Kaiser. A note on guttman's lower bound for the number of common factors 1. British Journal of Statistical
                                                                Psychology, 14(1):1--2, 1961.
                                                                <br />
                                                            </div>
                                                            <i class="el-icon-question"></i>
                                                        </el-tooltip>
                                                        <br />
                                                        <br />
                                                        The number of component is determined at the point, beyond which the remaining eigenvalues are all relatively small and of
                                                        comparable size (Jollife 2002, Peres-Neto, Jackson, and Somers (2005)).
                                                        <el-tooltip placement="top">
                                                            <div slot="content">
                                                                Jollife, I.T. 2002. Principal Component Analysis. 2nd ed. New York: Springer-Verlag. https://bit.ly/3lrxHK2
                                                                <br />
                                                                Peres-Neto, Pedro R., Donald A. Jackson, and Keith M. Somers. 2005. “How Many Principal Components? Stopping Rules
                                                                for Determining the Number of Non-Trivial Axes Revisited.” British Journal of Statistical Psychology 49: 974–97.
                                                                <br />
                                                            </div>
                                                            <i class="el-icon-question"></i>
                                                        </el-tooltip>
                                                        <br />
                                                        An eigenvalue > 1 indicates that PCs account for more variance than accounted by one of the original variables in
                                                        standardized data. This is commonly used as a cutoff point for which PCs are retained. This holds true only when the data
                                                        are standardized.
                                                        <br />
                                                        <br />
                                                        You can also limit the number of component to that number that accounts for a certain fraction of the total variance. For
                                                        example, if you are satisfied with 70% of the total variance explained then use the number of components to achieve that.
                                                        More about Eigenvectors
                                                        <a href="https://stats.stackexchange.com/a/143949" target="_blank" rel="noopener noreferrer">here</a>
                                                        ,
                                                        <a href="https://stats.stackexchange.com/a/35653" target="_blank" rel="noopener noreferrer">here</a>
                                                        &
                                                        <a
                                                            href="https://web.archive.org/web/20210221232219/http://www.sthda.com/english/articles/31-principal-component-methods-in-r-practical-guide/112-pca-principal-component-analysis-essentials/"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            here
                                                        </a>
                                                        .
                                                    </span>
                                                </el-col>

                                                <el-col :span="24">
                                                    <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                        <div slot="content">
                                                            <el-button type="success" round @click="downloadPlotImage('plot_scree')">
                                                                {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                            </el-button>
                                                        </div>
                                                        <img
                                                            id="analysis_images_pca"
                                                            class="animated fadeIn analysis_images"
                                                            :src="'data:image/png;base64,' + plot_data.plot_scree_png"
                                                            fit="scale-down"
                                                        />
                                                    </el-tooltip>
                                                </el-col>
                                            </el-row>
                                        </el-tab-pane>
                                        <el-tab-pane label="Eigenvalues" name="tab_eigenvalues_table">
                                            <el-row>
                                                <el-col :span="24">
                                                    <div class="code-output">
                                                        <div class="code-header">
                                                            The sum of all the eigenvalues give a total variance of 10. The proportion of variation explained by each eigenvalue is
                                                            given in the second column. For example, 4.124 divided by 10 equals 0.4124, or, about 41.24% of the variation is
                                                            explained by this first eigenvalue. The cumulative percentage explained is obtained by adding the successive proportions
                                                            of variation explained to obtain the running total. For instance, 41.242% plus 18.385% equals 59.627%, and so forth.
                                                            Therefore, about 59.627% of the variation is explained by the first two eigenvalues together.
                                                        </div>
                                                        <div class="highlight_code">
                                                            {{ details.eig }}
                                                        </div>
                                                    </div>
                                                </el-col>
                                            </el-row>
                                        </el-tab-pane>
                                    </el-tabs>
                                </el-col>
                                <el-col v-else class="plot-placeholder">
                                    <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                </el-col>
                            </el-row>
                        </el-tab-pane>

                        <el-tab-pane label="Variables" name="tab_variables" :disabled="isTabDisabled('plot_var_cos2_correlation')">
                            <el-row
                                v-bind:class="{
                                    is_tab_active: isTabDisabled('plot_var_cos2_correlation'),
                                }"
                            >
                                <el-col :span="24">
                                    <el-tabs :value="'tab_variables_correlation_circle'" :tab-position="'left'">
                                        <el-tab-pane label="Correlation circle(s)" name="tab_variables_correlation_circle">
                                            <el-tabs :value="'tab_variables_correlation_circle_correlation_plot'" :tab-position="'top'">
                                                <el-tab-pane label="Correlation plot" name="tab_variables_correlation_circle_correlation_plot">
                                                    <el-col v-if="plot_data.plot_var_cos2_correlation !== false">
                                                        <el-row>
                                                            <el-col :span="24">
                                                                <span class="tab_intro_text">
                                                                    The correlation between a variable and a principal component (PC) is used as the coordinates of the variable on
                                                                    the PC. The representation of variables differs from the plot of the observations: The observations are
                                                                    represented by their projections, but the variables are represented by their correlations (Abdi and Williams
                                                                    2010).
                                                                    <br />
                                                                    The plot below is also known as variable correlation plots. It shows the relationships between all variables. It
                                                                    can be interpreted as follow:
                                                                    <br />
                                                                    Positively correlated variables are grouped together.
                                                                    <br />
                                                                    Negatively correlated variables are positioned on opposite sides of the plot origin (opposed quadrants).
                                                                    <br />
                                                                    The distance between variables and the origin measures the quality of the variables on the factor map. Variables
                                                                    that are away from the origin are well represented on the factor map.
                                                                </span>
                                                            </el-col>
                                                            <el-col :span="24">
                                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                    <div slot="content">
                                                                        <el-button type="success" round @click="downloadPlotImage('plot_var_cos2_correlation')">
                                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                                        </el-button>
                                                                    </div>
                                                                    <img
                                                                        id="analysis_images_pca"
                                                                        class="animated fadeIn analysis_images"
                                                                        :src="'data:image/png;base64,' + plot_data.plot_var_cos2_correlation_png"
                                                                        fit="scale-down"
                                                                    />
                                                                </el-tooltip>
                                                            </el-col>
                                                        </el-row>
                                                    </el-col>
                                                    <el-col v-else class="plot-placeholder">
                                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                    </el-col>
                                                </el-tab-pane>
                                                <el-tab-pane label="Correlation plot clustered" name="tab_variables_correlation_circle_correlation_plot_clustered">
                                                    <el-col v-if="plot_data.plot_var_cos2_correlation_cluster !== false">
                                                        <el-row>
                                                            <el-col :span="24">
                                                                <span class="tab_intro_text">
                                                                    Following plot shows classified coordinates variable into 3 groups using the kmeans clustering algorithm.
                                                                    <br />
                                                                    We use the clusters returned by the kmeans algorithm to color variables.
                                                                </span>
                                                            </el-col>
                                                            <el-col :span="24">
                                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                    <div slot="content">
                                                                        <el-button type="success" round @click="downloadPlotImage('plot_var_cos2_correlation')">
                                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                                        </el-button>
                                                                    </div>
                                                                    <img
                                                                        id="analysis_images_pca"
                                                                        class="animated fadeIn analysis_images"
                                                                        :src="'data:image/png;base64,' + plot_data.plot_var_cos2_correlation_cluster_png"
                                                                        fit="scale-down"
                                                                    />
                                                                </el-tooltip>
                                                            </el-col>
                                                        </el-row>
                                                    </el-col>
                                                    <el-col v-else class="plot-placeholder">
                                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                    </el-col>
                                                </el-tab-pane>
                                            </el-tabs>
                                        </el-tab-pane>
                                        <el-tab-pane label="Quality of representation" name="tab_variables_quality">
                                            <el-tabs :value="'tab_variables_quality_correlation'" :tab-position="'top'">
                                                <el-tab-pane label="Correlation plot" name="tab_variables_quality_correlation">
                                                    <el-col v-if="plot_data.plot_var_cos2_corrplot !== false">
                                                        <el-row>
                                                            <el-col :span="24">
                                                                <span class="tab_intro_text">
                                                                    The quality of representation of the variables on factor map is called cos2 (square cosine, squared
                                                                    coordinates).
                                                                </span>
                                                            </el-col>
                                                            <el-col :span="24">
                                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                    <div slot="content">
                                                                        <el-button type="success" round @click="downloadPlotImage('plot_var_cos2_corrplot')">
                                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                                        </el-button>
                                                                    </div>
                                                                    <img
                                                                        id="analysis_images_pca"
                                                                        class="animated fadeIn analysis_images"
                                                                        :src="'data:image/png;base64,' + plot_data.plot_var_cos2_corrplot_png"
                                                                        fit="scale-down"
                                                                    />
                                                                </el-tooltip>
                                                            </el-col>
                                                        </el-row>
                                                    </el-col>
                                                    <el-col v-else class="plot-placeholder">
                                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                    </el-col>
                                                </el-tab-pane>
                                                <el-tab-pane label="Bar plot" name="tab_variables_quality_bar">
                                                    <el-col v-if="plot_data.plot_var_bar_plot !== false">
                                                        <el-row>
                                                            <el-col :span="24">
                                                                <span class="tab_intro_text">
                                                                    A high cos2 indicates a good representation of the variable on the principal component. In this case the
                                                                    variable is positioned close to the circumference of the correlation circle.
                                                                    <br />
                                                                    A low cos2 indicates that the variable is not perfectly represented by the PCs. In this case the variable is
                                                                    close to the center of the circle.
                                                                    <br />
                                                                    For a given variable, the sum of the cos2 on all the principal components is equal to one.
                                                                </span>
                                                            </el-col>
                                                            <el-col :span="24">
                                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                    <div slot="content">
                                                                        <el-button type="success" round @click="downloadPlotImage('plot_var_bar_plot')">
                                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                                        </el-button>
                                                                    </div>
                                                                    <img
                                                                        id="analysis_images_pca"
                                                                        class="animated fadeIn analysis_images"
                                                                        :src="'data:image/png;base64,' + plot_data.plot_var_bar_plot_png"
                                                                        fit="scale-down"
                                                                    />
                                                                </el-tooltip>
                                                            </el-col>
                                                        </el-row>
                                                    </el-col>
                                                    <el-col v-else class="plot-placeholder">
                                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                    </el-col>
                                                </el-tab-pane>
                                            </el-tabs>
                                        </el-tab-pane>
                                        <el-tab-pane label="Contributions of variables to PCs" name="tab_variables_contributions">
                                            <el-tabs :tab-position="'top'" :value="'tab_variables_contributions_correlation'">
                                                <el-tab-pane label="Correlation plot" name="tab_variables_contributions_correlation">
                                                    <el-col v-if="plot_data.plot_var_contrib_corrplot !== false">
                                                        <el-row>
                                                            <el-col :span="24">
                                                                <span class="tab_intro_text">
                                                                    The contributions of variables in accounting for the variability in a given principal component are expressed in
                                                                    percentage.
                                                                    <br />
                                                                    Variables that are correlated with PC1 (i.e., Dim.1) and PC2 (i.e., Dim.2) are the most important in explaining
                                                                    the variability in the data set.
                                                                    <br />
                                                                    Variables that do not correlated with any PC or correlated with the last dimensions are variables with low
                                                                    contribution and might be removed to simplify the overall analysis.
                                                                </span>
                                                            </el-col>
                                                            <el-col :span="24">
                                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                    <div slot="content">
                                                                        <el-button type="success" round @click="downloadPlotImage('plot_var_contrib_corrplot')">
                                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                                        </el-button>
                                                                    </div>
                                                                    <img
                                                                        id="analysis_images_pca"
                                                                        class="animated fadeIn analysis_images"
                                                                        :src="'data:image/png;base64,' + plot_data.plot_var_contrib_corrplot_png"
                                                                        fit="scale-down"
                                                                    />
                                                                </el-tooltip>
                                                            </el-col>
                                                        </el-row>
                                                    </el-col>
                                                    <el-col v-else class="plot-placeholder">
                                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                    </el-col>
                                                </el-tab-pane>
                                                <el-tab-pane label="Bar plot" name="tab_variables_contributions_bar">
                                                    <el-col v-if="plot_data.plot_var_contrib_bar_plot !== false">
                                                        <el-row>
                                                            <el-col :span="24">
                                                                <span class="tab_intro_text">
                                                                    Bar plot of variable contributions. The graph below shows the top 10 variables contributing to the principal
                                                                    components:
                                                                </span>
                                                            </el-col>
                                                            <el-col :span="24">
                                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                    <div slot="content">
                                                                        <el-button type="success" round @click="downloadPlotImage('plot_var_contrib_bar_plot')">
                                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                                        </el-button>
                                                                    </div>
                                                                    <img
                                                                        id="analysis_images_pca"
                                                                        class="animated fadeIn analysis_images"
                                                                        :src="'data:image/png;base64,' + plot_data.plot_var_contrib_bar_plot_png"
                                                                        fit="scale-down"
                                                                    />
                                                                </el-tooltip>
                                                            </el-col>
                                                        </el-row>
                                                    </el-col>
                                                    <el-col v-else class="plot-placeholder">
                                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                    </el-col>
                                                </el-tab-pane>
                                                <el-tab-pane label="Correlation Circle" name="tab_variables_contributions_correlation_circle">
                                                    <el-col v-if="plot_data.plot_var_contrib_correlation !== false">
                                                        <el-row>
                                                            <el-col :span="24">
                                                                <span style="text-align: left"></span>
                                                            </el-col>
                                                            <el-col :span="24">
                                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                    <div slot="content">
                                                                        <el-button type="success" round @click="downloadPlotImage('plot_var_contrib_correlation')">
                                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                                        </el-button>
                                                                    </div>
                                                                    <img
                                                                        id="analysis_images_pca"
                                                                        class="animated fadeIn analysis_images"
                                                                        :src="'data:image/png;base64,' + plot_data.plot_var_contrib_correlation_png"
                                                                        fit="scale-down"
                                                                    />
                                                                </el-tooltip>
                                                            </el-col>
                                                        </el-row>
                                                    </el-col>
                                                    <el-col v-else class="plot-placeholder">
                                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                    </el-col>
                                                </el-tab-pane>
                                                <el-tab-pane label="Dimension description" name="tab_variables_contributions_dimension">
                                                    <el-col v-if="details.desc_dim_1 !== false">
                                                        <el-row>
                                                            <el-col :span="24">
                                                                <div class="code-output">
                                                                    <div class="code-header">
                                                                        In the output below, we can see results for quantitative variables. Note that, variables are sorted by the
                                                                        p-value of the correlation. They are also rounded to 4 digits. For more details inspect raw data file under
                                                                        "data$res.desc$Dim.1"
                                                                        <br />
                                                                        <br />
                                                                        Dimension 1:
                                                                    </div>
                                                                    <div class="highlight_code">
                                                                        {{ details.desc_dim_1 }}
                                                                    </div>
                                                                </div>
                                                            </el-col>
                                                            <el-col :span="24">
                                                                <div class="code-output">
                                                                    <div class="code-header">Dimension 2:</div>
                                                                    <div class="highlight_code">
                                                                        {{ details.desc_dim_2 }}
                                                                    </div>
                                                                </div>
                                                            </el-col>
                                                        </el-row>
                                                    </el-col>
                                                    <el-col v-else class="plot-placeholder">
                                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                    </el-col>
                                                </el-tab-pane>
                                            </el-tabs>
                                        </el-tab-pane>
                                    </el-tabs>
                                </el-col>
                            </el-row>
                        </el-tab-pane>

                        <el-tab-pane label="Individuals" name="tab_individuals" :disabled="isTabDisabled('plot_ind_cos2_correlation')">
                            <el-row
                                v-bind:class="{
                                    is_tab_active: isTabDisabled('plot_ind_cos2_correlation'),
                                }"
                            >
                                <el-col :span="24">
                                    <el-tabs :tab-position="'left'" :value="'tab_individuals_correlation_circle'">
                                        <el-tab-pane label="Correlation circle(s)" name="tab_individuals_correlation_circle">
                                            <el-tabs :value="'tab_individuals_correlation_circle_original'" :tab-position="'top'">
                                                <el-tab-pane label="Circle" name="tab_individuals_correlation_circle_original">
                                                    <el-col v-if="plot_data.plot_ind_cos2_correlation !== false">
                                                        <el-row>
                                                            <el-col :span="24">
                                                                <span class="tab_intro_text">Graph of individuals.</span>
                                                            </el-col>
                                                            <el-col :span="24">
                                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                    <div slot="content">
                                                                        <el-button type="success" round @click="downloadPlotImage('plot_ind_cos2_correlation')">
                                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                                        </el-button>
                                                                    </div>
                                                                    <img
                                                                        id="analysis_images_pca"
                                                                        class="animated fadeIn analysis_images"
                                                                        :src="'data:image/png;base64,' + plot_data.plot_ind_cos2_correlation_png"
                                                                        fit="scale-down"
                                                                    />
                                                                </el-tooltip>
                                                            </el-col>
                                                        </el-row>
                                                    </el-col>
                                                    <el-col v-else class="plot-placeholder">
                                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                    </el-col>
                                                </el-tab-pane>
                                                <el-tab-pane
                                                    label="Grouped"
                                                    name="tab_individuals_correlation_circle_grouped"
                                                    :disabled="plot_data.plot_ind_cos2_correlation_grouped.length === 0"
                                                >
                                                    <el-tabs
                                                        :value="plot_data.plot_ind_cos2_correlation_grouped.length > 0 ? 'tab_individuals_correlation_circle_grouped_0' : null"
                                                        :tab-position="'right'"
                                                    >
                                                        <el-tab-pane
                                                            v-for="(plotData, plotIndex) in plot_data.plot_ind_cos2_correlation_grouped"
                                                            :key="'tab_individuals_correlation_circle_grouped_' + plotIndex"
                                                            :label="plotData.name"
                                                            :name="'tab_individuals_correlation_circle_grouped_' + plotIndex"
                                                        >
                                                            <el-row>
                                                                <el-col :span="24">
                                                                    <span class="tab_intro_text">
                                                                        Graph of individuals colored by group "{{ plotData.name }}". Additionally, we added concentration ellipses
                                                                        and confidence ellipses by groups.
                                                                    </span>
                                                                </el-col>
                                                                <el-col :span="24" v-if="true === true">
                                                                    <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                        <div slot="content">
                                                                            <el-button
                                                                                type="success"
                                                                                round
                                                                                @click="downloadPlotImage('plot_ind_cos2_correlation_grouped', plotIndex)"
                                                                            >
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
                                                                <el-col v-else class="plot-placeholder">
                                                                    <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                                </el-col>
                                                            </el-row>
                                                        </el-tab-pane>
                                                    </el-tabs>
                                                </el-tab-pane>
                                                <el-tab-pane
                                                    label="Biplot"
                                                    name="tab_individuals_correlation_circle_biplot"
                                                    :disabled="plot_data.plot_ind_cos2_correlation_grouped_biplot.length === 0"
                                                >
                                                    <el-tabs
                                                        :value="
                                                            plot_data.plot_ind_cos2_correlation_grouped_biplot.length > 0 ? 'tab_individuals_correlation_circle_biplot_0' : null
                                                        "
                                                        :tab-position="'right'"
                                                    >
                                                        <el-tab-pane
                                                            v-for="(plotData, plotIndex) in plot_data.plot_ind_cos2_correlation_grouped_biplot"
                                                            :key="'tab_individuals_correlation_circle_biplot_' + plotIndex"
                                                            :label="plotData.name"
                                                            :name="'tab_individuals_correlation_circle_biplot_' + plotIndex"
                                                        >
                                                            <el-row>
                                                                <el-col :span="24">
                                                                    <span class="tab_intro_text">
                                                                        Color individuals by group "{{ plotData.name }}" (discrete color) and variables by their contributions to
                                                                        the principal components (gradient colors). Additionally, we’ll change the transparency of variables by
                                                                        their contributions.
                                                                    </span>
                                                                </el-col>
                                                                <el-col :span="24" v-if="true === true">
                                                                    <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                        <div slot="content">
                                                                            <el-button
                                                                                type="success"
                                                                                round
                                                                                @click="downloadPlotImage('plot_ind_cos2_correlation_grouped_biplot', plotIndex)"
                                                                            >
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
                                                                <el-col v-else class="plot-placeholder">
                                                                    <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                                </el-col>
                                                            </el-row>
                                                        </el-tab-pane>
                                                    </el-tabs>
                                                </el-tab-pane>
                                            </el-tabs>
                                        </el-tab-pane>
                                        <el-tab-pane label="Quality of representation">
                                            <el-tabs :tab-position="'top'">
                                                <el-tab-pane label="Correlation plot">
                                                    <el-col v-if="plot_data.plot_ind_cos2_corrplot !== false">
                                                        <el-row>
                                                            <el-col :span="24">
                                                                <span class="tab_intro_text">
                                                                    The quality of representation of the variables on factor map is called cos2 (square cosine, squared
                                                                    coordinates).
                                                                </span>
                                                            </el-col>
                                                            <el-col :span="24">
                                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                    <div slot="content">
                                                                        <el-button type="success" round @click="downloadPlotImage('plot_ind_cos2_corrplot')">
                                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                                        </el-button>
                                                                    </div>
                                                                    <img
                                                                        id="analysis_images_pca"
                                                                        class="animated fadeIn analysis_images"
                                                                        :src="'data:image/png;base64,' + plot_data.plot_ind_cos2_corrplot_png"
                                                                        fit="scale-down"
                                                                    />
                                                                </el-tooltip>
                                                            </el-col>
                                                        </el-row>
                                                    </el-col>
                                                    <el-col v-else class="plot-placeholder">
                                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                    </el-col>
                                                </el-tab-pane>
                                                <el-tab-pane label="Bar plot">
                                                    <el-col v-if="plot_data.plot_ind_bar_plot !== false">
                                                        <el-row>
                                                            <el-col :span="24">
                                                                <span class="tab_intro_text">
                                                                    A high cos2 indicates a good representation of the variable on the principal component. In this case the
                                                                    variable is positioned close to the circumference of the correlation circle.
                                                                    <br />
                                                                    A low cos2 indicates that the variable is not perfectly represented by the PCs. In this case the variable is
                                                                    close to the center of the circle.
                                                                    <br />
                                                                    For a given variable, the sum of the cos2 on all the principal components is equal to one.
                                                                </span>
                                                            </el-col>
                                                            <el-col :span="24">
                                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                    <div slot="content">
                                                                        <el-button type="success" round @click="downloadPlotImage('plot_ind_bar_plot')">
                                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                                        </el-button>
                                                                    </div>
                                                                    <img
                                                                        id="analysis_images_pca"
                                                                        class="animated fadeIn analysis_images"
                                                                        :src="'data:image/png;base64,' + plot_data.plot_ind_bar_plot_png"
                                                                        fit="scale-down"
                                                                    />
                                                                </el-tooltip>
                                                            </el-col>
                                                        </el-row>
                                                    </el-col>
                                                    <el-col v-else class="plot-placeholder">
                                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                    </el-col>
                                                </el-tab-pane>
                                            </el-tabs>
                                        </el-tab-pane>
                                        <el-tab-pane label="Contributions of variables to PCs">
                                            <el-tabs :tab-position="'top'">
                                                <el-tab-pane label="Correlation plot">
                                                    <el-col v-if="plot_data.plot_ind_contrib_corrplot !== false">
                                                        <el-row>
                                                            <el-col :span="24">
                                                                <span class="tab_intro_text">
                                                                    The contributions of variables in accounting for the variability in a given principal component are expressed in
                                                                    percentage.
                                                                    <br />
                                                                    Variables that are correlated with PC1 (i.e., Dim.1) and PC2 (i.e., Dim.2) are the most important in explaining
                                                                    the variability in the data set.
                                                                    <br />
                                                                    Variables that do not correlated with any PC or correlated with the last dimensions are variables with low
                                                                    contribution and might be removed to simplify the overall analysis.
                                                                </span>
                                                            </el-col>
                                                            <el-col :span="24">
                                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                    <div slot="content">
                                                                        <el-button type="success" round @click="downloadPlotImage('plot_ind_contrib_corrplot')">
                                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                                        </el-button>
                                                                    </div>
                                                                    <img
                                                                        id="analysis_images_pca"
                                                                        class="animated fadeIn analysis_images"
                                                                        :src="'data:image/png;base64,' + plot_data.plot_ind_contrib_corrplot_png"
                                                                        fit="scale-down"
                                                                    />
                                                                </el-tooltip>
                                                            </el-col>
                                                        </el-row>
                                                    </el-col>
                                                    <el-col v-else class="plot-placeholder">
                                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                    </el-col>
                                                </el-tab-pane>
                                                <el-tab-pane label="Bar plot">
                                                    <el-col v-if="plot_data.plot_ind_contrib_bar_plot !== false">
                                                        <el-row>
                                                            <el-col :span="24">
                                                                <span class="tab_intro_text">
                                                                    Bar plot of variable contributions. The graph below shows the top 10 variables contributing to the principal
                                                                    components:
                                                                </span>
                                                            </el-col>
                                                            <el-col :span="24">
                                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                    <div slot="content">
                                                                        <el-button type="success" round @click="downloadPlotImage('plot_ind_contrib_bar_plot')">
                                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                                        </el-button>
                                                                    </div>
                                                                    <img
                                                                        id="analysis_images_pca"
                                                                        class="animated fadeIn analysis_images"
                                                                        :src="'data:image/png;base64,' + plot_data.plot_ind_contrib_bar_plot_png"
                                                                        fit="scale-down"
                                                                    />
                                                                </el-tooltip>
                                                            </el-col>
                                                        </el-row>
                                                    </el-col>
                                                    <el-col v-else class="plot-placeholder">
                                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                    </el-col>
                                                </el-tab-pane>
                                                <el-tab-pane label="Other">
                                                    <el-col v-if="plot_data.plot_ind_contrib_correlation !== false">
                                                        <el-row>
                                                            <el-col :span="24">
                                                                <span style="text-align: left"></span>
                                                            </el-col>
                                                            <el-col :span="24">
                                                                <el-tooltip effect="light" placement="top-end" popper-class="download_tooltip">
                                                                    <div slot="content">
                                                                        <el-button type="success" round @click="downloadPlotImage('plot_ind_contrib_correlation')">
                                                                            {{ $t("views.apps.unsupervised_learning.editing.index.button.download_svg_plot.title") }}
                                                                        </el-button>
                                                                    </div>
                                                                    <img
                                                                        id="analysis_images_pca"
                                                                        class="animated fadeIn analysis_images"
                                                                        :src="'data:image/png;base64,' + plot_data.plot_ind_contrib_correlation_png"
                                                                        fit="scale-down"
                                                                    />
                                                                </el-tooltip>
                                                            </el-col>
                                                        </el-row>
                                                    </el-col>
                                                    <el-col v-else class="plot-placeholder">
                                                        <i class="fa fa-line-chart animated flipInX" aria-hidden="true"></i>
                                                    </el-col>
                                                </el-tab-pane>
                                            </el-tabs>
                                        </el-tab-pane>
                                    </el-tabs>
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                        <el-tab-pane label="PCA Output" name="tab_pca_details" :disabled="isTabDisabled('plot_var_cos2_correlation')">
                            <el-row
                                v-bind:class="{
                                    is_tab_active: isTabDisabled('plot_var_cos2_correlation'),
                                }"
                            >
                                <el-col :span="24" v-if="details.pca !== false">
                                    <div class="code-output">
                                        <div class="highlight_code">
                                            {{ details.pca }}
                                        </div>
                                    </div>
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                    </el-tabs>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { fetchEditingPcaAnalysisPlot, getPCAavailableColumns } from "@/api/plots";
import { md5String } from "@/utils";
import { debounce } from "@/utils/helpers";

import plotColorPalettes from "@/assets/plots/color_palettes.json";
import plotThemes from "@/assets/plots/themes.json";

import Fuse from "fuse.js";

export default {
    name: "pcaAnalysisTab",
    data() {
        return {
            fuseIndex: null,
            // This tab is disabled and we will enable it on initialization if there is no too much data
            tabEnabled: false,
            loadingOptions: true,

            loadingPlot: false,

            activePCATabName: "bartlett",

            plot_data: {
                plot_scree: false,
                plot_scree_png: false,

                plot_var_cos2_correlation: false,
                plot_var_cos2_correlation_png: false,

                plot_var_cos2_correlation_cluster: false,
                plot_var_cos2_correlation_cluster_png: false,

                plot_var_cos2_corrplot: false,
                plot_var_cos2_corrplot_png: false,

                plot_var_bar_plot: false,
                plot_var_bar_plot_png: false,

                plot_var_contrib_correlation: false,
                plot_var_contrib_correlation_png: false,

                plot_var_contrib_corrplot: false,
                plot_var_contrib_corrplot_png: false,

                plot_var_contrib_bar_plot: false,
                plot_var_contrib_bar_plot_png: false,

                plot_ind_cos2_correlation: false,
                plot_ind_cos2_correlation_png: false,

                // Here we can have multiple plots based on how many grouping variables are selected
                plot_ind_cos2_correlation_grouped: [],
                plot_ind_cos2_correlation_grouped_biplot: [],

                plot_ind_cos2_corrplot: false,
                plot_ind_cos2_corrplot_png: false,

                plot_ind_bar_plot: false,
                plot_ind_bar_plot_png: false,

                plot_ind_contrib_correlation: false,
                plot_ind_contrib_correlation_png: false,

                plot_ind_contrib_corrplot: false,
                plot_ind_contrib_corrplot_png: false,

                plot_ind_contrib_bar_plot: false,
                plot_ind_contrib_bar_plot_png: false,

                saveObjectHash: false,
            },

            selectedFileDetailsDisplay: [],

            details: {
                pca: false,
                bartlett: false,
                kmo: false,
                eig: false,
                desc_dim_1: false,
                desc_dim_2: false,
            },
            // Placeholder for dropdown columns - not used in this case
            selectedFileDetailsDisplay: [],

            selectedOptions: {
                analysis_method: [{id: "PCA", name: "PCA", description: "Principal Component Analysis (When variables are numericals)"}, {id: "MCA", name: "MCA", description: "Multiple Correspondence Analysis (When individuals are described by a set of categorical variables)"}],
                pca_components_x: [],
                pca_components_y: [],
                theme: plotThemes,
                colorPalette: plotColorPalettes,
            },
            settingsForm: {
                analysis_method: "PCA",
                selectedColumns: [],
                cutOffColumnSize: 50000,

                cutOffUnique: true,
                cutOffUniqueSize: 5,
                remove_less_10p: false,

                excludedColumns: [],
                pcaComponentsDisplayX: [],
                pcaComponentsDisplayY: [],

                preProcessDataset: true,
                removeNA: true,
                kmo_bartlett_limit: 1000,

                groupingVariables: [],
                displayLoadings: true,
                fontSize: 12,
                pointSize: 2,
                labelSize: 4,
                ellipseAlpha: 0.05,
                addEllipses: true,
                theme: "theme_bw",
                colorPalette: "Set1",
                aspect_ratio: 1,
                plot_size: 12,
                anyNAValues: false,
                categoricalVariables: false
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
        redrawImage() {
            if (this.tabEnabled === true) {
                this.fetchRemoteAnalysis();
            }
        },
        downloadRawData() {
            const downloadLink = this.$store.getters.user_settings_server_address_plots + "/plots/general/download-saved-object?objectHash=" + this.plot_data.saveObjectHash;
            window.open(downloadLink, "_blank");
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
        downloadPlotImage(imageType, itemIndex = null) {

            if (typeof this.plot_data[imageType] === "undefined" || this.plot_data[imageType].length < 25) {
                return;
            }
            let svgString = "";
            let downloadName = this.$options.name + "_" + imageType;
            if (itemIndex !== null) {
                if (typeof this.plot_data[imageType][itemIndex] !== "undefined") {
                    svgString = this.plot_data[imageType][itemIndex].svg;
                    downloadName = downloadName + "_" + itemIndex;
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
        fetchRemoteAnalysis() {
            this.loadingPlot = true;

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

            // Remove any grouping variables from selected columns
            if (settingsForm.groupingVariables.length > 0) {
                settingsForm.groupingVariables = settingsForm.groupingVariables.map((x) => x.remapped);
                // Remove Grouping variable from selected columns
                settingsForm.selectedColumns = settingsForm.selectedColumns.filter((x) => !settingsForm.groupingVariables.includes(x));
                // Remove Grouping variable from excluded columns
                settingsForm.excludedColumns = settingsForm.excludedColumns.filter((x) => !settingsForm.groupingVariables.includes(x));
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

            if(this.settingsForm.analysis_method === "PCA" && this.settingsForm.categoricalVariables === true){
                this.$message({
                    message: "Seems like all selected variables are categorical. Please use different analysis method.",
                    type: "error",
                });
                this.loadingPlot = false;
                return;
            }

            if(this.settingsForm.categoricalVariables === true && (this.settingsForm.cutOffUnique === true || this.settingsForm.remove_less_10p === true)){
                this.$message({
                    message: "Categorical variables detected please disable Remove by unique and Remove < 10% configuration options.",
                    type: "error",
                });
                this.loadingPlot = false;
                return;
            }

            fetchEditingPcaAnalysisPlot({
                selectedFileID: this.selectedFiles[0].id,
                settings: settingsForm,
            })
                .then((response) => {
                    const respData = response.data.message;
                    const details = response.data.details;
                    // Reset multiple plots arrays
                    this.plot_data["plot_ind_cos2_correlation_grouped"] = [];
                    this.plot_data["plot_ind_cos2_correlation_grouped_biplot"] = [];

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
                    // Update the details data.
                    for (let respIndex in details) {
                        if (typeof this.details[respIndex] !== "undefined") {
                            this.details[respIndex] = false;
                            let respItem = details[respIndex];
                            if (typeof respItem === "object" || respItem.length < 15) {
                                this.details[respIndex] = false;
                            } else {
                                this.details[respIndex] = window.atob(respItem);
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
        resetVariables() {
            this.fuseIndex = null;
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
.tab_intro_text {
    text-align: left;
    float: left;
    font-size: 16px;
    padding: 20px;
}
</style>
