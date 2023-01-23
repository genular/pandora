<template>
    <div>
        <el-steps class="steps" :active="currentStep" align-center>
            <el-step @click.native="navigateToStep(0)" title="Step 1" icon="el-icon-edit" description="Create personal account"></el-step>
            <el-step title="Step 2" icon="el-icon-view" description="Welcome"></el-step>
        </el-steps>
        <div class="form-container">
            <div v-if="currentStep == 0" class="form-step step-0">
                <h2 class="steps-container-title">Please create your account</h2>
                <el-row>
                    <el-col :span="14">
                        <el-form class="form" autoComplete="on" ref="userForm" label-position="top">
                            <div style="width: 100%; float: left">
                                <el-form-item label="Username*" style="width: 49%; float: left">
                                    <el-input
                                        name="username"
                                        type="text"
                                        v-model="userForm.username"
                                        @input.native="checkFieldAvailability('users', 'username', $event, 'userForm')"
                                        autoComplete="on"
                                        placeholder="username"
                                    >
                                        <i slot="suffix" :class="validation['userForm'].username"></i>
                                    </el-input>
                                    <p class="note">This will be your username.</p>
                                </el-form-item>
                                <el-form-item label="Business email address*" style="width: 49%; float: left; margin-left: 2%">
                                    <el-input
                                        name="email"
                                        type="text"
                                        v-model="userForm.email"
                                        @input.native="checkFieldAvailability('users_details', 'email', $event, 'userForm')"
                                        autoComplete="on"
                                        placeholder="Email address"
                                    >
                                        <i slot="suffix" :class="validation['userForm'].email"></i>
                                    </el-input>
                                    <p class="note">Please use university / company email address.</p>
                                    <!-- <p class="note">We'll occasionally send updates about your account to this inbox. We'll never share your email address with anyone.</p> -->
                                </el-form-item>
                            </div>
                            <el-form-item label="Password*">
                                <el-input
                                    name="password"
                                    :type="passwordType"
                                    v-model="userForm.password"
                                    autoComplete="off"
                                    placeholder="password"
                                    @input.native="checkFieldAvailability('users', 'password', $event, 'userForm')"
                                >
                                    <i slot="prefix" :class="validation['userForm'].password"></i>
                                </el-input>
                                <span class="show-pwd" @click="showPassword"><i class="fa fa-icon fa-eye"></i></span>
                                <p class="note">Please use strong password, of at least 8 characters.</p>
                            </el-form-item>
                            <div style="width: 100%; float: left">
                                <el-form-item label="First name*" style="width: 49%; float: left">
                                    <el-input
                                        name="firstName"
                                        v-model="userForm.firstName"
                                        type="text"
                                        placeholder="John"
                                        @input.native="checkFieldAvailability('users_details', 'firstName', $event, 'userForm')"
                                    >
                                        <i slot="suffix" :class="validation['userForm'].firstName"></i>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="Last name*" style="width: 49%; float: left; margin-left: 2%">
                                    <el-input
                                        name="lastName"
                                        v-model="userForm.lastName"
                                        type="text"
                                        placeholder="Doe"
                                        @input.native="checkFieldAvailability('users_details', 'lastName', $event, 'userForm')"
                                    >
                                        <i slot="suffix" :class="validation['userForm'].lastName"></i>
                                    </el-input>
                                </el-form-item>
                            </div>
                            <div style="width: 100%; float: left">
                                <el-form-item label="Phone number" style="width: 49%; float: left">
                                    <el-input
                                        name="phoneNumber"
                                        v-model="userForm.phoneNumber"
                                        type="text"
                                        placeholder="+44750000000"
                                        @input.native="checkFieldAvailability('users_details', 'phoneNumber', $event, 'userForm')"
                                    ></el-input>
                                </el-form-item>
                                <el-form-item label="Account invite code" style="width: 49%; float: left; margin-left: 2%">
                                    <el-input name="org_invite_code" v-model="userForm.org_invite_code" type="text"></el-input>
                                </el-form-item>
                            </div>
                            <div style="width: 100%; float: left; text-align: right">
                                <el-form-item>
                                    <el-checkbox style="opacity: 0.25" name="install_statistics" v-model="userForm.install_statistics">
                                        Install statistics
                                        <el-tooltip
                                            class="item"
                                            effect="dark"
                                            content="Contribute to SIMON! Help us improve future versions of SIMON by allowing us to collect installation statistics."
                                            placement="bottom"
                                        >
                                            <i class="el-icon-question"></i>
                                        </el-tooltip>
                                    </el-checkbox>
                                </el-form-item>
                            </div>
                        </el-form>
                    </el-col>
                    <el-col :span="10">
                        <el-card class="box-card" style="width: 90%; float: right; margin-top: 10px">
                            <div slot="header" class="clearfix">
                                <span style="float: left">SIMON features</span>
                                <span style="float: right"><a href="https://github.com/genular/simon-frontend" target="_blank">star us on github</a></span>
                            </div>
                            <div class="box-card-item">200+ machine learning algorithms to run at once</div>
                            <div class="box-card-item">
                                Visual data and exploratory analysis that supports clustering, correlation graphs and other dimensionality reduction algorithms
                            </div>
                            <div class="box-card-item">in-build data pre-processing (correlation filtering, normalization, imputation...)</div>
                            <div class="box-card-item">model performance comparison and model insights</div>
                        </el-card>
                    </el-col>
                </el-row>

                <el-row style="margin-top: 25px">
                    <el-button-group style="float: right">
                        <el-button type="primary" v-if="$config.name === 'development'" @click="fillDemoData(1)">DEMO</el-button>
                        <el-button type="primary" :loading="loading.account" @click="registerAccount" :disabled="userForm.validated !== 5">
                            Create account
                            <i class="el-icon-arrow-right el-icon-right"></i>
                        </el-button>
                    </el-button-group>
                </el-row>
            </div>

            <div v-if="currentStep == 1" class="form-step step-1">
                <h2 class="steps-container-title">Welcome to genular {{ userForm.firstName }}!</h2>
                <el-row>
                    <el-col :span="24">
                        <p class="welcome_text">
                            <span>Your account is successfully created!</span>
                            <br />
                            <br />
                            If you did not already and if you are using cloud version of SIMON please confirm your email address via email we sent to you.
                        </p>
                        <p class="welcome_text">You can now login to your user interface where you can start exploring.</p>
                    </el-col>
                </el-row>
                <el-row style="margin-top: 25px">
                    <el-button-group style="float: right">
                        <el-button type="primary" @click="userLogin">
                            LOGIN
                            <i class="el-icon-arrow-right el-icon-right"></i>
                        </el-button>
                    </el-button-group>
                </el-row>
            </div>
        </div>
    </div>
</template>
<script>
import { validateUsername, validateEmail, validatePassword } from "@/utils/validate";
import { userRegister, checkDatabaseAvailability, searchAddressSuggest } from "@/api/backend";
import { debounce } from "@/utils/helpers";
import { mapGetters } from "vuex";

import freeEmailDomains from "free-email-domains";

export default {
    name: "Private",
    props: {
        step: {
            default: 0,
            type: Number,
        },
    },
    computed: {
        ...mapGetters(["packageVersion", "packageEnviroment"]),
    },
    data() {
        return {
            currentStep: 0,
            freeEmailDomains: freeEmailDomains,
            validation: {
                userForm: {
                    username: "el-input__icon el-icon-error",
                    email: "el-input__icon el-icon-error",
                    password: "el-input__icon el-icon-error",
                    firstName: "el-input__icon el-icon-error",
                    lastName: "el-input__icon el-icon-error",
                    phoneNumber: "el-input__icon el-icon-error",
                },
            },
            // Loading progress
            loading: {
                country: false,
                address: false,
                account: false,
            },
            userForm: {
                username: "",
                email: "",
                password: "",
                firstName: "",
                lastName: "",
                phoneNumber: "",
                install_statistics: true,
                org_invite_code: Math.random().toString(36).substring(7),
                validated: 0,
                packageVersion: this.packageVersion,
                packageEnviroment: this.packageEnviroment,
                client_info: {
                    timeOpened: new Date(),
                    timezone: new Date().getTimezoneOffset() / 60,
                },
            },
            passwordType: "password",
        };
    },
    created() {
        if (this.step !== 0) {
            if (this.navigateToStep(this.step) === false) {
                this.navigateToStep(0);
            }
        }
    },
    mounted() {
        console.log("mounted: register - Private");
    },
    methods: {
        fillDemoData(dataStep) {
            this.userForm.username = "demouser";
            this.userForm.firstName = "John";
            this.userForm.lastName = "Doe";
            this.userForm.phoneNumber = "+358502818692";
            this.userForm.password = "demouser";
            // Should be 5 to pass, but we don't want to validate email automatically
            this.userForm.validated = 4;
            this.userForm.org_invite_code = Math.random().toString(36).substring(7);
            for (const name in this.validation["userForm"]) {
                if (name !== "email" && this.validation["userForm"].hasOwnProperty(name)) {
                    this.validation["userForm"][name] = "el-input__icon el-icon-success";
                }
            }
        },
        navigateToStep(step) {
            console.log("navigateToStep :" + step);
            if (step > 0) {
                if (this.userForm.validated === 5) {
                    this.currentStep = step;
                    this.$router.push({
                        path: "/authenticate/?action=register&usertype=private&step=" + step,
                    });
                } else {
                    return false;
                }
            } else {
                this.currentStep = step;
                this.$router.push({
                    path: "/authenticate/?action=register&usertype=private&step=" + step,
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
        registerAccount() {
            this.loading.account = true;
            userRegister(this.userForm)
                .then((response) => {
                    console.log("registerAccount");
                    console.log(response);
                    if (response.data.success === true) {
                        this.navigateToStep(1);
                    } else {
                        this.$message({
                            message: "Cannot create account. Please try with different user-name or try again latter.",
                            type: "error",
                            duration: 5000,
                            showClose: true,
                        });
                        console.log(response.data);
                    }
                    this.loading.account = false;
                })
                .catch((error) => {
                    console.log(error);
                    this.$message({
                        message: "Cannot create account. This error is reported, please try again latter.",
                        type: "error",
                        duration: 5000,
                        showClose: true,
                    });
                    this.loading.account = false;
                });
        },
        userLogin() {
            this.loading.account = false;
            this.$store
                .dispatch("userLogin", this.userForm)
                .then(() => {
                    this.$router.push({
                        path: "/",
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
            this.loading.account = false;
        },
        /** On user Input search available Features and suggest some results */
        checkFieldAvailability: debounce(function (validationTable, validationField, event, formName) {
            const validationValue = event.target.value;
            // Checking if a string is blank, null, undefined or shorter than 2 characters:
            if (!validationValue || /^\s*$/.test(validationValue) || validationValue.length < 2) {
                if (this.validation[formName][validationField] !== "el-input__icon el-icon-error") {
                    this.validation[formName][validationField] = "el-input__icon el-icon-error";
                    this[formName].validated -= 1;
                }
                return;
            }
            // Validate some fields separatly
            if (validationField === "username") {
                if (validateUsername(validationValue) === false) {
                    if (this.validation[formName][validationField] !== "el-input__icon el-icon-error") {
                        this.validation[formName][validationField] = "el-input__icon el-icon-error";
                        this[formName].validated -= 1;
                    }
                    return;
                }
            } else if (validationField === "email") {
                let emailDomain = validationValue.substring(validationValue.indexOf("@") + 1);

                if (validateEmail(validationValue) === false || this.freeEmailDomains.includes(emailDomain) === true) {
                    console.log("Cannot validate email: " + validationValue);
                    if (this.validation[formName][validationField] !== "el-input__icon el-icon-error") {
                        this.validation[formName][validationField] = "el-input__icon el-icon-error";
                        this[formName].validated -= 1;
                    }
                    return;
                }
            } else if (validationField === "password") {
                console.log("Validate pass:" + validatePassword(validationValue));
                if (validatePassword(validationValue) === false) {
                    if (this.validation[formName][validationField] !== "el-input__icon el-icon-error") {
                        this.validation[formName][validationField] = "el-input__icon el-icon-error";
                        this[formName].validated -= 1;
                    }
                } else {
                    if (this.validation[formName][validationField] !== "el-input__icon el-icon-success") {
                        this.validation[formName][validationField] = "el-input__icon el-icon-success";
                        this[formName].validated += 1;
                    }
                }
                return;
            } else if (validationField === "firstName" || validationField === "lastName" || validationField === "phoneNumber") {
                if (this.validation[formName][validationField] !== "el-input__icon el-icon-success") {
                    this.validation[formName][validationField] = "el-input__icon el-icon-success";
                    this[formName].validated += 1;
                }
                return;
            }

            checkDatabaseAvailability(validationTable, validationField, validationValue)
                .then((response) => {
                    if (response.data.success === true && response.data.message === false) {
                        this.validation[formName][validationField] = "el-input__icon el-icon-error";
                    } else {
                        console.log(this.validation[formName][validationField]);

                        if (this.validation[formName][validationField] !== "el-input__icon el-icon-success") {
                            this.validation[formName][validationField] = "el-input__icon el-icon-success";
                            this[formName].validated += 1;
                        }
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }, 1000),
    },
};
</script>
<style rel="stylesheet/scss" lang="scss">
.el-icon-error {
    color: red;
}
.el-icon-success {
    color: #35224a;
}
.steps {
    clear: both;
    float: left;
    width: 100%;
    .el-step__icon-inner {
        font-size: 48px !important;
    }
}

.welcome_text {
    font-size: 17px;
    color: #333;
}
.form-container {
    float: left;
    width: 100%;
    max-height: 65vh;
    overflow: auto;
    .box-card {
        margin: 0 auto;
        .box-card-item {
            &:not(:first-child) {
                padding-top: 34px;
            }
        }
    }
    .steps-container-title {
        font-size: 24px;
        font-weight: normal;
        line-height: 1.1;
        letter-spacing: -1px;
        text-align: center;
    }
    .show-pwd {
        position: absolute;
        right: 10px;
        font-size: 16px;
        color: #333;
        cursor: pointer;
    }
    .tos-info {
        margin-top: 15px;
        margin-bottom: 15px;
        border-top: 1px solid #eee;
        border-bottom: 1px solid #eee;
        span {
            line-height: 14px;
            font-size: 12px;
            color: #333333;
        }
    }

    .el-form-item__label {
        padding: 0;
        /* color: #333333; */
        line-height: 24px;
    }
    .note {
        padding: 0;
        margin-bottom: 0;
        line-height: 18px;
        margin-top: 5px;
        color: #333;
        font-size: 12px;
    }
}
</style>
