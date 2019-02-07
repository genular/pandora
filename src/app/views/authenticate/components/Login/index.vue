<template>
    <div class="login-tab-container">
        <el-row>
            <el-col>
                <el-form class="login-tab-form" autoComplete="on" :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left">
                    <el-form-item prop="username">
                        <el-input name="username" type="text" v-model="loginForm.username" autoComplete="on" placeholder="Username" />
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input name="password" :type="passwordType" @keyup.enter.native="handleLogin" v-model="loginForm.password" autoComplete="on" placeholder="Password" />
                        <span class="show-pwd" @click="showPassword">
                            <i class="fa fa-icon fa-eye"></i>
                        </span>
                    </el-form-item>
                    <el-row>
                        <el-col :span="24">
                            <el-button style="float:right;" round @click.prevent.stop="navigateTo('reset')">Forgot password</el-button>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="24">
                            <el-button class="button-login" :loading="loadingWizard" @click.native.prevent="handleLogin">Sign in</el-button>
                        </el-col>
                    </el-row>
                </el-form>
                <el-row class="bottom-info">
                    <el-col :span="24" class="info-button">
                        <el-button class="button-register" style="height: 40px;" @click.prevent.stop="navigateTo('register&usertype=private&step=0')">Sign up now</el-button>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { isValidUsername, isValidPassword } from "@/utils/validate/forms";

export default {
    name: "Login",
    props: {
        action: {
            default: "login",
            type: String
        }
    },
    data() {
        return {
            loginForm: {
                username: "",
                password: ""
            },
            loginRules: {
                username: [
                    {
                        required: true,
                        trigger: "blur",
                        validator: isValidUsername
                    }
                ],
                password: [
                    {
                        required: true,
                        trigger: "blur",
                        validator: isValidPassword
                    }
                ]
            },
            passwordType: "password",
            loadingWizard: false
        };
    },
    mounted() {
        if (this.$config.name === "development") {
            console.log(this.$config);
        }
        if (this.$config.name === "development" || this.$config.isDemoServer) {
            this.loginForm.username = "demouser";
            this.loginForm.password = "demouser";
        }
    },
    methods: {
        navigateTo(action) {
            if (!this.$config.isDemoServer) {
                this.$router.push({
                    path: "/authenticate/?action=" + action
                });
            } else {
                this.$message({
                    type: "warning",
                    message: "This function is disabled on demo server"
                });
            }
        },
        showPassword() {
            if (this.passwordType === "password") {
                this.passwordType = "";
            } else {
                this.passwordType = "password";
            }
        },

        handleLogin() {
            this.$refs.loginForm.validate(valid => {
                if (valid) {
                    this.loadingWizard = true;
                    this.$store
                        .dispatch("userLogin", this.loginForm)
                        .then(status => {
                            this.loadingWizard = false;
                            this.$router.push({
                                path: "/"
                            });
                        })
                        .catch(error => {
                            console.log(error);
                            this.$message({
                                message: "Username password combination is not correct!",
                                type: "error",
                                duration: 2500,
                                showClose: true
                            });
                            this.loadingWizard = false;
                        });
                } else {
                    return false;
                }
            });
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
.login-tab-container {
    min-width: 400px;

    @media only screen and (max-width: 768px) {
        min-width: 100%;
    }

    .login-tab-form {
        padding: 15px;
        .button-login {
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
    .bottom-info {
        background-color: #1d1f20;
        padding: 15px;
        vertical-align: middle;
        height: 70px;
        .info-text {
            text-align: left;
            height: 40px;
            line-height: 40px;
            color: #ffffff;
        }
        .info-button {
            text-align: right;
            height: 40px;
            line-height: 40px;
            .button-register {
                background-color: #4d4d50;
                color: #ffffff;
            }
        }
    }
    .el-form-item {
        margin-bottom: 30px;
    }

    .el-form-item__error {
        padding-left: 5px;
    }
    .show-pwd {
        position: absolute;
        right: 10px;
        font-size: 16px;
        color: #333;
        cursor: pointer;
    }
}
</style>
