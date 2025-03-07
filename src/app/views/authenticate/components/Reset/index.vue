<template>
    <div class="reset-tab-container">
        <div class="title">{{ $t("views.authenticate.components.Reset.title") }}</div>
        <div class="lead">{{ $t("views.authenticate.components.Reset.description") }}</div>
        <el-row>
            <el-col>
                <el-form class="reset-tab-form" size="large" autoComplete="on" :model="resetForm" ref="resetForm" label-position="left">
                    <el-form-item>
                        <el-input name="email" type="email" v-model="resetForm.email" autoComplete="on" :placeholder="$t('views.authenticate.components.Reset.email')" />
                    </el-form-item>
                    <el-form-item>
                        <el-input name="password" type="password" v-model="resetForm.password" autoComplete="on" :placeholder="$t('views.authenticate.components.Reset.password')" />
                    </el-form-item>
                    <el-form-item>
                        <el-input
                            name="registration_key"
                            type="registration_key"
                            v-model="resetForm.registration_key"
                            autoComplete="on"
                            :placeholder="$t('views.authenticate.components.Reset.registration_key')"
                        />
                        <!-- Info Text and Link for Registration Code Request -->
                        <div>
                            <span>Forgot registration code? </span>
                            <el-link href="https://pandora.atomic-lab.org/request-api-key/" target="_blank" type="primary">Retrieve it here</el-link>
                        </div>
                    </el-form-item>
                    <el-row>
                        <el-col :span="24">
                            <el-button class="button-reset" :loading="loadingWizard" @click="resetPassword">{{ $t("views.authenticate.components.Reset.reset_button") }}</el-button>
                        </el-col>
                    </el-row>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "Reset",
    props: {
        action: {
            default: "reset",
            type: String,
        },
    },
    data() {
        return {
            resetForm: {
                email: null,
                password: null,
                registration_key: null,
            },
            loadingWizard: false,
        };
    },
    mounted() {
        console.log("reset-tab-container");
    },
    methods: {
        resetPassword() {
            this.$refs.resetForm.validate((valid) => {
                if (valid) {
                    this.loadingWizard = true;
                    this.$store
                        .dispatch("userPasswordReset", this.resetForm)
                        .then((response) => {
                            this.loadingWizard = false;

                            // Check if backend responded with success
                            if (response && response.success === true) {
                                // Display success message
                                this.$message({
                                    type: "success",
                                    message: this.$t("views.authenticate.components.Reset.success_message") || 
                                             "Password reset successful! Redirecting to login...",
                                    duration: 3000 // 3 seconds
                                });

                                // Redirect to login after 3 seconds
                                setTimeout(() => {
                                    this.$router.push({ name: "login" }); 
                                    // or this.$router.push("/login")
                                }, 3000);

                            } else {
                                // Show an error message if not successful
                                this.$message({
                                    type: "error",
                                    message: response.message || 
                                             this.$t("views.authenticate.components.Reset.error_message") ||
                                             "Password reset failed.",
                                });
                            }
                        })
                        .catch((error) => {
                            this.loadingWizard = false;
                            console.log(error);
                            // Show a generic error message
                            this.$message({
                                type: "error",
                                message: this.$t("views.authenticate.components.Reset.error_message") ||
                                         "An unexpected error occurred.",
                            });
                        });
                } else {
                    // Form validation failed
                    return false;
                }
            });
        },
    },
};
</script>
<style rel="stylesheet/scss" lang="scss">
.reset-tab-container {
    padding: 25px;
    .title {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 32px;
        font-weight: normal;
        line-height: 1.1;
        letter-spacing: -1px;
    }
    .lead {
        margin-top: 2px;
        margin-bottom: 0;
        font-size: 16px;
    }
    .reset-tab-form {
        padding: 15px;

        .button-reset {
            width: 100%;
            margin-top: 15px;
            margin-bottom: 0;
            margin-left: 0;
            margin-right: 0;
            height: 75px;
            font-size: 18px;
            background-color: #4d4d50;
            border: 3px solid #343436;
            color: #ffffff;
        }
    }
}
</style>
