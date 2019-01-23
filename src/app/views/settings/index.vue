<template>
    <div class="app-container settings-container" :loading="requestLoading">
        <el-row :gutter="20">
            <!-- AVATAR -->
            <el-col :span="4">
                <el-card>
                    <img :src="user_avatar + '?s=250'" class="image" style="max-width: 100%; max-height: 100%;" />
                </el-card>
            </el-col>
            <!-- ACTION BOXES -->
            <el-col :span="10">
                <el-card class="box-card">
                    <div slot="header" class="clearfix"><span>Account information</span></div>
                    <div>
                        <el-form ref="settingsAccountForm" label-width="120px">
                            <el-form-item label="Email address">
                                <el-input
                                    name="email_adress"
                                    type="text"
                                    value=""
                                    placeholder="unavaliable"
                                    disabled
                                ></el-input>
                            </el-form-item>
                            <el-form-item label="Password">
                                <el-input
                                    name="password"
                                    type="password"
                                    value=""
                                    placeholder="unavaliable"
                                    disabled
                                ></el-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-card>
                <el-card class="box-card" style="margin-top: 15px;">
                    <div slot="header" class="clearfix"><span>Profile information</span></div>
                    <div>
                        <el-form ref="settingsProfileForm" label-width="120px">
                            <el-form-item label="First name">
                                <el-input
                                    name="first_name"
                                    type="text"
                                    value=""
                                    placeholder="unavaliable"
                                    disabled
                                ></el-input>
                            </el-form-item>
                            <el-form-item label="Last name">
                                <el-input
                                    name="last_name"
                                    type="text"
                                    value=""
                                    placeholder="unavaliable"
                                    disabled
                                ></el-input>
                            </el-form-item>
                            <el-form-item label="Email address">
                                <el-input
                                    name="email_adress"
                                    type="text"
                                    value=""
                                    placeholder="unavaliable"
                                    disabled
                                ></el-input>
                            </el-form-item>
                            <el-form-item label="Phone">
                                <el-input name="phone" type="text" value="" placeholder="unavaliable" disabled></el-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-card>
            </el-col>
            <!-- ACTION BOXES -->
            <el-col :span="10">
                <el-card class="box-card">
                    <div slot="header" class="clearfix"><span>Subscription</span></div>
                    <div>
                        <el-button type="primary" :disabled="this.$config.name == 'production' && this.$config.isDemoServer == true" @click="generatePortalSession">Manage your subscription</el-button>
                    </div>
                </el-card>
                <el-card class="box-card" style="margin-top: 15px;">
                    <div slot="header" class="clearfix"><span>Change profile picture </span></div>
                    <div>
                        Your Gravatar is an image that follows you from site to site appearing beside your name when you
                        do things like comment or post on a blog.
                    </div>
                </el-card>
                <el-card class="box-card" style="margin-top: 15px;">
                    <div slot="header" class="clearfix"><span>Danger area</span></div>
                    <div><el-button :disabled="this.$config.name == 'production' && this.$config.isDemoServer == true" type="error">Delete your account</el-button></div>
                </el-card>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="24">
                <div style="color: #781717;font-size: 13px;text-align: right;">
                    Version information:<br />
                    genular {{packageVersion}} ({{packageEnviroment}})<br />
                    Developed by the genular community.
                </div>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import NProgress from "nprogress"; // progress bar
import { mapGetters } from "vuex";

import { userGeneratePortalSession as ApiBackendUserGeneratePortalSession } from "@/api/backend";

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
            // chargebee JS instance
            cbInstance: null,
            cbPortal: null
        };
    },
    mounted() {
        console.log("mounted: settings");

        if (this.cbInstance === null) {
            this.cbInstance = Chargebee.getInstance();
            if (this.cbInstance === null) {
                this.cbInstance = Chargebee.init({
                    site: this.$config.api.chargebee_site_name
                });
            }
        }
    },
    computed: {
        ...mapGetters(["user_avatar", "packageVersion", "packageEnviroment"])
    },
    methods: {
        openPortal() {
            this.cbPortal = this.cbInstance.createChargebeePortal();

            this.cbPortal.open({
                loaded: function() {
                    console.log("cbPortal loaded");
                    // Optional
                    // called when chargebee portal is loaded
                },
                close: function() {
                    console.log("cbPortal close");
                    // Optional
                    // called when chargebee portal is closed
                },
                visit: function(sectionName) {
                    console.log("cbPortal visit: ", sectionName);
                    // Optional
                    // called whenever the customer navigates across different sections in portal
                },
                paymentSourceAdd: function() {
                    console.log("cbPortal paymentSourceAdd");
                    // Optional
                    // called whenever a new payment source is added in portal
                },
                paymentSourceUpdate: function() {
                    console.log("cbPortal paymentSourceUpdate");
                    // Optional
                    // called whenever a payment source is updated in portal
                },
                paymentSourceRemove: function() {
                    console.log("cbPortal paymentSourceRemove");
                    // Optional
                    // called whenever a payment source is removed in portal.
                },
                subscriptionChanged: function(data) {
                    console.log("cbPortal subscriptionChanged: ", data);
                    // Optional
                    // called whenever a subscription is changed
                    // data.subscription.id will give you the subscription id
                    // Make sure you whitelist your domain in the checkout settings page
                },
                subscriptionCancelled: function(data) {
                    console.log("cbPortal subscriptionCancelled: ", data);
                    // Optional
                    // called when a subscription is cancelled
                    // data.subscription.id will give you the subscription id
                    // Make sure you whitelist your domain in the checkout settings page
                }
            });
        },
        setPortalSession(cbPortalSession) {
            this.cbInstance.setPortalSession(() => {
                return new Promise((resolve, reject) => {
                    resolve(cbPortalSession);
                });
            });
        },
        generatePortalSession() {
            this.requestLoading = true;

            ApiBackendUserGeneratePortalSession()
                .then(response => {
                    this.requestLoading = false;
                    if (response.data.success === true) {
                        response.data.message.forEach((item, index) => {
                            if (item.object === "portal_session") {
                                this.setPortalSession(item);
                                this.openPortal(item);
                            }
                        });
                    }
                })
                .catch(error => {
                    console.log(error);
                    this.requestLoading = false;
                });
        }
    },
    watch: {
        requestLoading(value) {
            if (value === true) {
                NProgress.start();
            } else {
                NProgress.done();
            }
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
.settings-settings {
}
</style>
