<template>
    <div class="app-container">
        <div v-if="selectedFiles.length > 0">
            <file-details></file-details>
            <package-selection></package-selection>
            <start-button></start-button>
        </div>
        <el-dialog :title="$t('views.apps.simon.analysis.index.dialog.title')" :visible.sync="errorDialogVisible" width="30%" center :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
            <span v-html="errorDialogMessage"></span>
            <span slot="footer" class="dialog-footer">
                    <div v-if="errorDialogType === 'server_error'">
                    <el-button @click="cancelInitFeatures">{{ $t('views.apps.simon.analysis.index.dialog.buttons.cancel') }}</el-button>
                    <el-button type="primary" @click="reinitializeInitFeatures">{{ $t('views.apps.simon.analysis.index.dialog.buttons.try_again') }}</el-button>
                </div>
                <div v-else-if="errorDialogType === 'general_error'">
                    <el-button @click="errorDialogVisible = false">{{ $t('views.apps.simon.analysis.index.dialog.buttons.select_another') }}</el-button>
                </div>
                <div v-else>
                    undefined error
                </div>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import { createHashFromArrayID } from "@/utils/helpers";
import { FileDetails, PackageSelection, StartButton } from "./components";
import { htmlentities } from "@/utils/3rdparty/htmlentities";

export default {
    name: "layout",
    components: {
        FileDetails,
        PackageSelection,
        StartButton
    },
    data() {
        return {
            loadingInstance: null,
            errorDialogVisible: false,
            errorDialogMessage: "",
            errorDialogType: "server_error"
        };
    },
    computed: {
        avaliablePackages: {
            get() {
                return this.$store.getters.simonAvaliablePackages;
            },
            set(value) {
                this.$store.dispatch("setSimonAvaliablePackages", value);
            }
        },
        selectedPackages: {
            get() {
                return this.$store.getters.simonSelectedPackages;
            },
            set(value) {
                this.$store.dispatch("setSimonSelectedPackages", value);
            }
        },
        selectedFiles: {
            get() {
                return this.$store.getters.selectedFiles;
            },
            set(value) {
                this.$store.dispatch("setSelectedFiles", value);
            }
        },
        selectedFilesHash: {
            get() {
                return this.$store.getters.simonAnalysisSelectedFileHash;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedFileHash", value);
            }
        },
        /** Current Selected Outcome */
        selectedOutcome: {
            get() {
                return this.$store.getters.simonAnalysisSelectedOutcome;
            },
            set(value) {
                this.$store.dispatch("setSimonAnalysisSelectedOutcome", value);
            }
        }
    },
    mounted() {
        console.log("mounted: analysis");
        this.initFeatures();

    },
    methods: {
        loadingStart() {
            this.loadingInstance = this.$loading({
                lock: true,
                text: "Loading...",
                spinner: "el-icon-loading",
                fullscreen: true,
                customClass: "loading-api",
                background: "rgba(0, 0, 0, 0.7)"
            });
        },
        loadingEnd() {
            if (this.loadingInstance !== null) {
                this.loadingInstance.close();
            }
        },
        cancelInitFeatures() {
            this.errorDialogVisible = false;
            this.errorDialogMessage = "";
            this.$router.push({
                path: "/workspace/index"
            });
        },
        reinitializeInitFeatures() {
            this.errorDialogVisible = false;
            this.errorDialogMessage = "";
            this.initFeatures();
        },
        initPackages() {
            /** Get packages needed in PackageSelection sub-component but only if we didn't got them already */
            // if (this.avaliablePackages.length === 0 && this.selectedPackages.length === 0) {
            this.loadingStart();
            this.$store.dispatch("setSimonAvailablePackages", this.selectedFiles).then(
                response => {
                    this.loadingEnd();

                    // Check if we have any packages loaded / returned from R backend
                    if(this.avaliablePackages.length < 1){
                        this.errorDialogVisible = true;
                        this.errorDialogMessage = this.$t('views.apps.simon.analysis.index.dialog.messages.error_server');
                        this.errorDialogType = "server_error";
                    }else{
                        this.checkIsValidOutcome(this.selectedOutcome);
                    }
                },
                error => {
                    console.log("Error Response: ", error);
                    this.loadingEnd();
                    this.errorDialogVisible = true;
                    this.errorDialogMessage = this.$t('views.apps.simon.analysis.index.dialog.messages.error_server');
                    this.errorDialogType = "server_error";
                }
            );
            // }
        },
        initFeatures() {
            this.initPackages();

            const selectedFilesHash = createHashFromArrayID(this.selectedFiles);
            /** Get selected CSV file Details needed in FileDetails sub-component */
            if (this.selectedFilesHash !== selectedFilesHash) {
                console.log("read new features: " + this.selectedFilesHash);
                this.loadingStart();

                this.$store.dispatch("setSimonAnalysisSelectedFileHash", selectedFilesHash);
                /** Get Features for selected file from back-end */
                this.$store.dispatch("setSimonAnalysisFeatures", this.selectedFiles).then(
                    response => {
                        this.loadingEnd();
                        if (Array.isArray(response)) {
                            let sliceEnd = 5;
                            if (response.length < 5) {
                                sliceEnd = response.length;
                            }
                            // Array of invalid features
                            const featuresExample = htmlentities(response.slice(0, sliceEnd).join(", "));

                            this.errorDialogVisible = true;
                            this.errorDialogMessage = this.$t('views.apps.simon.analysis.index.dialog.messages.error_format') + featuresExample;
                            this.errorDialogType = "server_error";
                        }
                    },
                    error => {
                        console.log("Error Response: ", error);
                        this.loadingEnd();
                        this.selectedFilesHash = "";
                        this.errorDialogVisible = true;
                        this.errorDialogMessage = this.$t('views.apps.simon.analysis.index.dialog.messages.error_read');
                        this.errorDialogType = "server_error";
                    }
                );
            }
        },
        checkIsValidOutcome(selectedOutcomes){
            console.log("checkIsValidOutcome:");
            console.log(selectedOutcomes);
            let unique_count = 0;
            if(selectedOutcomes.length > 0) {

                for (let i in selectedOutcomes) {

                    if(typeof selectedOutcomes[i].unique_count !== "undefined") {
                        if(selectedOutcomes[i].unique_count !== false){
                            unique_count = selectedOutcomes[i].unique_count;        
                        }else{
                            // Fall-back for old versions where this is not calculated
                            unique_count = 2;  
                        }
                    }else{
                        // Fall-back for old versions where this is not calculated
                        unique_count = 2;  
                    }
                    

                    console.log("Total unique outcome variables: " + unique_count);

                    if(unique_count < 2){
                        this.errorDialogVisible = true;
                        this.errorDialogMessage = this.$t('views.apps.simon.analysis.index.dialog.messages.error_classification');
                        this.errorDialogType = "general_error";
                        this.selectedOutcome = [];
                        break;
                    }
                }
            }

            this.filterPackages(unique_count);
        },
        filterPackages(unique_count){
            console.log("Enabling packages based on selection: " + unique_count);

            for (let i in this.avaliablePackages) {

                if(unique_count < 2){
                    this.avaliablePackages[i].disabled = true;
                }

                if(unique_count === 2){
                    if (this.avaliablePackages[i].classification === true) {
                        this.avaliablePackages[i].disabled = false;
                    }
                }
                // Disable Two class models
                if(unique_count > 2 && unique_count <= 702){
                    if (this.avaliablePackages[i].classification === true) {
                        if (Array.isArray(this.avaliablePackages[i].tags) && this.avaliablePackages[i].tags.includes('Two Class Only') === true) {
                            this.avaliablePackages[i].disabled = true;
                        }else{
                            this.avaliablePackages[i].disabled = false;
                        }
                    }
                }
            }
        }
    },
    watch: {
        "selectedOutcome": function(selectedOutcomes) {
            this.checkIsValidOutcome(selectedOutcomes);
        }
    }
};
</script>
