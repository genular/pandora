<template>
    <div class="app-container settings-container" v-loading="requestLoading" :element-loading-text="$t('globals.page_loading')">
        <el-row :gutter="20">
            <!-- AVATAR -->
            <el-col :span="4">
                <el-card>
                    <img :src="user_settings_server_address_backend + '/backend/user/avatar?id=' + user_id + '&size=256'" class="image" style="max-width: 100%; max-height: 100%" />
                </el-card>
            </el-col>
            <!-- ACTION BOXES -->
            <el-col :span="10">
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span>{{ $t("views.settings.account_information.title") }}</span>
                    </div>
                    <div>
                        <el-form size="large" ref="settingsAccountForm" v-model="settingsForm" label-width="120px">
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
                        <div style="text-align: right">
                            <el-button type="primary" size="large" :disabled="this.$config.name == 'production' && this.$config.isDemoServer == true" @click="updateAccount">
                                {{ $t("views.settings.account_information.save_button") }}
                            </el-button>
                        </div>
                    </div>
                </el-card>
                <el-card class="box-card" style="margin-top: 15px">
                    <div slot="header" class="clearfix">
                        <span>{{ $t("views.settings.profile_information.title") }}</span>
                    </div>
                    <div>
                        <el-form size="large" ref="settingsProfileForm" v-model="settingsForm" label-width="120px">
                            <el-form-item :label="$t('views.settings.profile_information.first_name')">
                                <el-input name="first_name" type="text" prop="first_name" v-model="settingsForm.first_name"></el-input>
                            </el-form-item>
                            <el-form-item :label="$t('views.settings.profile_information.last_name')">
                                <el-input name="last_name" type="text" prop="last_name" v-model="settingsForm.last_name"></el-input>
                            </el-form-item>
                            <el-form-item :label="$t('views.settings.profile_information.phone')">
                                <el-input name="phone" type="text" prop="phone" v-model="settingsForm.phone"></el-input>
                            </el-form-item>
                            <el-form-item :label="$t('views.settings.profile_information.openai_api')">
                                <el-input name="openai_api" type="text" prop="openai_api" v-model="settingsForm.openai_api"></el-input>
                            </el-form-item>
                        </el-form>
                        <div style="text-align: right">
                            <el-button size="large" type="primary" :disabled="this.$config.name == 'production' && this.$config.isDemoServer == true" @click="updateProfile">
                                {{ $t("views.settings.profile_information.save_button") }}
                            </el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <!-- ACTION BOXES -->
            <el-col :span="10">
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span>{{ $t("views.settings.profile_picture.title") }}</span>
                    </div>
                    <div>
                        {{ $t("views.settings.profile_picture.description") }}
                    </div>
                </el-card>
                <el-card class="box-card" style="margin-top: 15px">
                    <div slot="header" class="clearfix">
                        <span>{{ $t("views.settings.danger_area.title") }}</span>
                    </div>
                    <div style="text-align: right">
                        <el-button size="large" type="primary" :disabled="this.$config.name == 'production' && this.$config.isDemoServer == true" @click="deleteAccount">
                            {{ $t("views.settings.danger_area.delete_button") }}
                        </el-button>
                    </div>
                </el-card>
                <el-card class="box-card" style="margin-top: 15px">
                    <div slot="header" class="clearfix"><span>System debugging</span></div>
                    <el-row type="flex" class="row-bg" justify="space-between">
                        <el-col :span="6" style="text-align: left">
                            <el-button size="large" type="primary" :disabled="this.$config.isDemoServer == true" @click="systemUpdate">Update</el-button>
                        </el-col>
                        <el-col :span="18" style="text-align: right">
                            <el-button size="large" type="primary" :disabled="this.$config.isDemoServer == true" @click="generateSystemLogFile">System log file</el-button>
                            <el-button size="large" type="primary" :disabled="this.$config.isDemoServer == true" @click="generateBrowserLogFile">Browser log file</el-button>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
        </el-row>
        <el-row style="position: fixed; bottom: 15px; right: 15px">
            <el-col :span="24">
                <div style="color: #781717; font-size: 13px; text-align: right">
                    Version information:
                    <br />
                    PANDORA {{ packageVersion }} ({{ packageEnviroment }})
                    <br />
                    Developed by the
                    <a href="https://atomic-lab.org" target="_blank">aTomic Lab</a>.
                </div>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import NProgress from "nprogress"; // progress bar
import { mapGetters } from "vuex";
import {
    userDetials as ApiBackendUserDetails,
    systemUpdate as ApiSystemUpdate,
    generateSystemLogFileDownloadLink as ApiGenerateSystemLogFileDownloadLink,
    updateUserProfile
} from "@/api/backend";
import { downloadItemsTemplate } from "@/utils/templates.js";

export default {
    name: "UserSettings",
    props: {
        startIndex: {
            default: 0,
            type: [Number, String],
        },
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
                openai_api: null,
                profile_picture: null,
                account_type: null,
                oid: null,
            },
        };
    },
    mounted() {
        console.log("mounted: settings");

        if (this.settingsForm.username === null) {
            this.getUserDetails();
        }
    },
    computed: {
        ...mapGetters(["packageVersion", "packageEnviroment", "user_id", "user_settings_server_address_backend"]),
    },
    methods: {
        downloadText(filename, text, type = "text/plain") {
            // Create an invisible A element
            const a = document.createElement("a");
            a.style.display = "none";
            document.body.appendChild(a);

            // Set the HREF to a Blob representation of the data to be downloaded
            a.href = window.URL.createObjectURL(new Blob([text], { type }));

            // Use download attribute to set set desired file name
            a.setAttribute("download", filename);

            // Trigger the download by simulating click
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(a.href);
            document.body.removeChild(a);
        },
        getUserDetails() {
            this.requestLoading = true;
            ApiBackendUserDetails()
                .then((response) => {
                    if (response.data.success === true) {
                        this.settingsForm = response.data.message;
                    } else {
                        console.log("Could not get user details. Please try again latter.");
                    }
                    this.requestLoading = false;
                })
                .catch((error) => {
                    console.log(error);
                    this.requestLoading = false;
                });
        },
        deleteAccount() {
            this.$message({
                type: "info",
                message: "Not available in this version",
            });
        },
        async updateProfile() {
            try {
                this.requestLoading = true;

                // Call updateUserProfile API function with form data
                const response = await updateUserProfile(
                    this.settingsForm.first_name,
                    this.settingsForm.last_name,
                    this.settingsForm.phone,
                    this.settingsForm.openai_api
                );

                // Handle response
                if (response.data.success) {
                    this.$message({
                        type: "success",
                        message: "Profile updated successfully!",
                    });
                } else {
                    this.$message({
                        type: "error",
                        message: "Failed to update profile: " + response.data.message,
                    });
                }
            } catch (error) {
                console.error("Error updating profile:", error);
                this.$message({
                    type: "error",
                    message: "An error occurred while updating your profile.",
                });
            } finally {
                this.requestLoading = false;
            }
        },
        updateAccount() {
            this.$message({
                type: "info",
                message: "Not available in this version",
            });
        },
        generateSystemLogFile() {
            this.requestLoading = true;
            ApiGenerateSystemLogFileDownloadLink({})
                .then((response) => {
                    if (response.data.success === true && response.data.message.length > 0) {
                        this.$alert(downloadItemsTemplate(response.data.message), "Download links", {
                            dangerouslyUseHTMLString: true,
                            callback: (action) => {},
                        });
                    }
                    this.requestLoading = false;
                })
                .catch((error) => {
                    console.log(error);
                    this.requestLoading = false;
                });
        },
        generateBrowserLogFile() {
            if (typeof console.everything !== "undefined") {
                if (console.everything.length > 0) {
                    let browserLog = JSON.stringify(console.everything);
                    this.downloadText("browser.log", browserLog);
                } else {
                    this.$message({
                        type: "info",
                        message: "not empty",
                    });
                }
            } else {
                this.$message({
                    type: "info",
                    message: "not found",
                });
            }
        },
        systemUpdate() {
            this.$confirm(
                "This can permanently destroy all your data and settings. Continue?",
                "Update minor PANDORA version", {
                    confirmButtonText: "OK",
                    cancelButtonText: "Cancel",
                    type: "warning",
                    beforeClose: (action, instance, done) => {
                        if (action === 'confirm') {
                            this.requestLoading = true;
                            ApiSystemUpdate()
                                .then(response => {
                                    console.log("System update initiated:", response);

                                    // Check for success status in the response data
                                    if (response.data.success) {
                                        this.$message({
                                            type: "success",
                                            message: response.data.message || 'Update completed successfully.',
                                        });
                                    } else {
                                        this.$message({
                                            type: "error",
                                            message: response.data.message || 'Update failed with an unknown error.',
                                        });
                                    }
                                    this.requestLoading = false;
                                    // Refresh the page to apply the changes after 2 seconds
                                    setTimeout(() => window.location.reload(), 2000);
                                    done();
                                })
                                .catch(error => {
                                    console.error("System update failed:", error);
                                    this.$message({
                                        type: "error",
                                        message: error.message || "System update failed due to an unexpected error.",
                                    });
                                    this.requestLoading = false;
                                    done();
                                });
                        } else {
                            done(); // Ensure to call done() to close the dialog in case of 'cancel' or any other non-confirm action
                        }
                    }
                }
            ).catch(() => {
                // This block is executed if the user cancels the update
                this.$message({
                    type: "info",
                    message: "Update canceled",
                });
            });
        }

    }
};

</script>
<style rel="stylesheet/scss" lang="scss">
.settings-settings {}

</style>
