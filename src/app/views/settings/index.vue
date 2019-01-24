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
                                <el-input
                                    name="phone"
                                    type="text"
                                    value=""
                                    placeholder="unavaliable"
                                    disabled
                                ></el-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-card>
            </el-col>
            <!-- ACTION BOXES -->
            <el-col :span="10">
                <el-card class="box-card">
                    <div slot="header" class="clearfix"><span>Change profile picture </span></div>
                    <div>
                        Your Gravatar is an image that follows you from site to site appearing beside your name when you
                        do things like comment or post on a blog.
                    </div>
                </el-card>
                <el-card class="box-card" style="margin-top: 15px;">
                    <div slot="header" class="clearfix"><span>Danger area</span></div>
                    <div>
                        <el-button
                            :disabled="this.$config.name == 'production' && this.$config.isDemoServer == true"
                            type="error"
                            >Delete your account</el-button
                        >
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row>
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
            requestLoading: false
        };
    },
    mounted() {
        console.log("mounted: settings");
    },
    computed: {
        ...mapGetters(["user_avatar", "packageVersion", "packageEnviroment"])
    },
    methods: {},
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
