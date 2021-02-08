<template>
    <div class="app-container settings-container" v-loading="requestLoading" :element-loading-text="$t('globals.page_loading')">
        <el-row :gutter="20">
            <!-- AVATAR -->
            <el-col :span="4">
                <el-card>
                    <img :src="user_settings_server_address_backend + '/backend/user/avatar?id=' + user_id + '&size=256'" class="image" style="max-width: 100%; max-height: 100%;" />
                </el-card>
            </el-col>
            <!-- ACTION BOXES -->
            <el-col :span="10">
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span>{{ $t("views.settings.account_information.title") }}</span>
                    </div>
                    <div>
                        <el-form ref="settingsAccountForm" v-model="settingsForm" label-width="120px">
                            <el-form-item :label="$t('views.settings.account_information.username')">
                                <el-input name="username" type="text" prop="username" v-model="settingsForm.username"></el-input>
                            </el-form-item>
                            <el-form-item :label="$t('views.settings.account_information.email_address')">
                                <el-input name="email_adress" type="text" prop="email" v-model="settingsForm.email"></el-input>
                            </el-form-item>
                            <el-form-item :label="$t('views.settings.account_information.password')">
                                <el-input name="password" type="password" value="" disabled></el-input>
                            </el-form-item>
                        </el-form>
                        <div style="text-align: right;">
                            <el-button type="primary" :disabled="this.$config.name == 'production' && this.$config.isDemoServer == true">{{
                                $t("views.settings.account_information.save_button")
                            }}</el-button>
                        </div>
                    </div>
                </el-card>
                <el-card class="box-card" style="margin-top: 15px;">
                    <div slot="header" class="clearfix">
                        <span>{{ $t("views.settings.profile_information.title") }}</span>
                    </div>
                    <div>
                        <el-form ref="settingsProfileForm" v-model="settingsForm" label-width="120px">
                            <el-form-item :label="$t('views.settings.profile_information.first_name')">
                                <el-input name="first_name" type="text" prop="first_name" v-model="settingsForm.first_name"></el-input>
                            </el-form-item>
                            <el-form-item :label="$t('views.settings.profile_information.last_name')">
                                <el-input name="last_name" type="text" prop="last_name" v-model="settingsForm.last_name"></el-input>
                            </el-form-item>
                            <el-form-item :label="$t('views.settings.profile_information.phone')">
                                <el-input name="phone" type="text" prop="phone" v-model="settingsForm.phone"></el-input>
                            </el-form-item>
                        </el-form>
                        <div style="text-align: right;">
                            <el-button type="primary" :disabled="this.$config.name == 'production' && this.$config.isDemoServer == true">{{
                                $t("views.settings.profile_information.save_button")
                            }}</el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <!-- ACTION BOXES -->
            <el-col :span="10">
                <el-card class="box-card">
                    <div slot="header" class="clearfix"><span>{{ $t("views.settings.profile_picture.title") }}</span></div>
                    <div>
                        {{ $t("views.settings.profile_picture.description") }}
                    </div>
                </el-card>
                <el-card class="box-card" style="margin-top: 15px;">
                    <div slot="header" class="clearfix"><span>{{ $t("views.settings.danger_area.title") }}</span></div>
                    <div style="text-align: right;">
                        <el-button type="danger" :disabled="this.$config.name == 'production' && this.$config.isDemoServer == true">
                            {{ $t("views.settings.danger_area.delete_button") }}
                        </el-button>
                    </div>
                </el-card>
                <el-card class="box-card" style="margin-top: 15px;">
                    <div slot="header" class="clearfix"><span>System debugging</span></div>
                    <el-row type="flex" class="row-bg" justify="space-between">
                        <el-col :span="6">
                            <el-button type="success" :disabled="this.$config.isDemoServer == true" @click="updateSimonVersion">
                                Update minor SIMON version
                            </el-button>
                        </el-col>
                        <el-col :span="6">
                            <el-button type="success" :disabled="this.$config.isDemoServer == true" @click="generateSystemLogFile">
                                Generate system log file
                            </el-button>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
        </el-row>

        <el-row style="position: fixed;bottom: 15px;right: 15px;">
            <el-col :span="24">
                <div style="color: #781717;font-size: 13px;text-align: right;">
                    Version information:<br />
                    genular {{ packageVersion }} ({{ packageEnviroment }})<br />
                    Developed by the genular community.
                </div>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import NProgress from "nprogress"; // progress bar
import { mapGetters } from "vuex";
import { userDetials as ApiBackendUserDetails, generateSystemLogFileDownloadLink as ApiGenerateSystemLogFileDownloadLink } from "@/api/backend";
import { downloadItemsTemplate } from "@/utils/templates.js";

export default {
    name: "UserSettings",
    props: {
        startIndex: {
            default: 0,
            type: [Number, String]
        }
    },
    components: {},
    data() {
        return {
            requestLoading: false,
            settingsForm: {
                username: null,
                email_status: null,
                created: null,
                first_name: null,
                last_name: null,
                email: null,
                phone: null,
                profile_picture: null,
                account_type: null,
                oid: null
            }
        };
    },
    mounted() {
        console.log("mounted: settings");

        if (this.settingsForm.username === null) {
            this.getUserDetails();
        }
    },
    computed: {
        ...mapGetters(["packageVersion", "packageEnviroment", "user_id", "user_settings_server_address_backend"])
    },
    methods: {
        getUserDetails() {
            this.requestLoading = true;
            ApiBackendUserDetails()
                .then(response => {
                    if (response.data.success === true) {
                        this.settingsForm = response.data.message;
                    } else {
                        console.log("Could not get user details. Please try again latter.");
                    }
                    this.requestLoading = false;
                })
                .catch(error => {
                    console.log(error);
                    this.requestLoading = false;
                });
        },
        generateSystemLogFile() {
            this.requestLoading = true;
            ApiGenerateSystemLogFileDownloadLink({  })
                .then(response => {
                    if (response.data.success === true && response.data.message.length > 0) {
                        this.$alert(downloadItemsTemplate(response.data.message), "Download links", {
                            dangerouslyUseHTMLString: true,
                            callback: action => {}
                        });
                    }
                    this.requestLoading = false;
                })
                .catch(error => {
                    console.log(error);
                    this.requestLoading = false;
                });
        },
        updateSimonVersion(){
            this.$confirm('This can permanently destroy all your SIMON data and settings. Continue?', 'Update minor SIMON version', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                this.$message({
                    type: 'info',
                    message: 'Update canceled'
                }); 
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: 'Update canceled'
                });          
            });
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
.settings-settings {
}
</style>
