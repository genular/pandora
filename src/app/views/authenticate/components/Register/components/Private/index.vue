<template>
    <div>
        <el-steps class="steps" :active="currentStep" align-center>
            <el-step @click.native="navigateToStep(0)" title="Step 1" icon="el-icon-edit" description="Create personal account"></el-step>
            <el-step title="Step 2" icon="el-icon-view" description="Welcome"></el-step>
        </el-steps>
        <div class="form-container">
            <div v-if="currentStep == 0" class="form-step step-0">
                <el-row>
                    <el-col :span="24">
                        <el-form class="form" size="large" autoComplete="on" ref="userForm" label-position="top">
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
                                <el-form-item label="Institutional email*" style="width: 49%; float: left; margin-left: 2%">
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
                                <el-form-item label="Phone number" style="width: 49%; float: left; margin-bottom: 0;">
                                    <el-input
                                        name="phoneNumber"
                                        v-model="userForm.phoneNumber"
                                        type="text"
                                        placeholder="+44750000000"
                                        @input.native="checkFieldAvailability('users_details', 'phoneNumber', $event, 'userForm')"
                                    ></el-input>
                                </el-form-item>
                                <el-form-item label="Registration code*" style="width: 49%; float: left; margin-left: 2%; margin-bottom: 0;">
                                    <el-input
                                        name="registration_key"
                                        v-model="userForm.registration_key"
                                        type="text"
                                        placeholder=""
                                        @input.native="checkFieldAvailability('users_details', 'registration_key', $event, 'userForm')"
                                    >
                                        <i slot="suffix" :class="validation['userForm'].registration_key"></i>
                                    </el-input>
                                    <!-- Info Text and Link for Registration Code Request -->
                                    <div>
                                        <span>Don't have a registration code? </span>
                                        <el-link href="https://pandora.atomic-lab.org/request-api-key/" target="_blank" type="primary">Request one here</el-link>
                                    </div>
                                </el-form-item>
                            </div>
                        </el-form>
                    </el-col>
                </el-row>

                <el-row>
                    <el-button-group style="float: right">
                        <el-button type="primary" size="large" :loading="loading.account" @click="registerAccount" :disabled="!isFormValid">
                            Create account
                            <i class="el-icon-arrow-right el-icon-right"></i>
                        </el-button>
                    </el-button-group>
                </el-row>
            </div>

            <div v-if="currentStep == 1" class="form-step step-1">
                <h2 class="steps-container-title">Welcome to PANDORA {{ userForm.firstName }}!</h2>
                <el-row>
                    <el-col :span="24">
                        <p class="welcome_text">
                            <span>Your account is successfully created!</span>
                            <br />
                            <br />
                            You can now login to your account and start exploring.
                        </p>
                    </el-col>
                </el-row>
                <el-row style="margin-top: 25px">
                    <el-button-group style="float: right">
                        <el-button type="primary" size="large" @click="userLogin">
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
        isFormValid() {
            // Count the number of successful validations
            const successCount = Object.values(this.validation.userForm).filter(icon => icon === 'el-input__icon el-icon-success').length;
            // Check if all fields except one are valid
            const isValid = successCount >= Object.keys(this.validation.userForm).length - 1;
            return isValid;
        }
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
                    registration_key: "el-input__icon el-icon-error",
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
                registration_key: "",
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
        navigateToStep(step) {
            console.log("navigateToStep :" + step);
            if (step > 0) {
                if (this.isFormValid) {
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
                }
                return;
            }
            // Validate some fields separatly
            if (validationField === "username") {
                if (validateUsername(validationValue) === false) {
                    if (this.validation[formName][validationField] !== "el-input__icon el-icon-error") {
                        this.validation[formName][validationField] = "el-input__icon el-icon-error";
                    }
                    return;
                }
            } else if (validationField === "email") {
                let emailDomain = validationValue.substring(validationValue.indexOf("@") + 1);

                if (validateEmail(validationValue) === false || this.freeEmailDomains.includes(emailDomain) === true) {
                    console.log("Cannot validate email: " + validationValue);
                    if (this.validation[formName][validationField] !== "el-input__icon el-icon-error") {
                        this.validation[formName][validationField] = "el-input__icon el-icon-error";
                    }
                    return;
                }
            } else if (validationField === "password") {
                if (validatePassword(validationValue) === false) {
                    if (this.validation[formName][validationField] !== "el-input__icon el-icon-error") {
                        this.validation[formName][validationField] = "el-input__icon el-icon-error";
                    }
                } else {
                    if (this.validation[formName][validationField] !== "el-input__icon el-icon-success") {
                        this.validation[formName][validationField] = "el-input__icon el-icon-success";
                    }
                }
                return;
            } else if (validationField === "firstName" || validationField === "lastName" || validationField === "phoneNumber") {
                if (this.validation[formName][validationField] !== "el-input__icon el-icon-success") {
                    this.validation[formName][validationField] = "el-input__icon el-icon-success";
                }
                return;

            } else if (validationField === "registration_key") {
                const isMD5 = /^[a-f0-9]{32}$/i.test(validationValue);

                if(validationValue.toLowerCase() !== atob("YXRvbWljbGFi")){
                    if (!isMD5) {
                        // If not MD5, show error
                        if (this.validation[formName][validationField] !== "el-input__icon el-icon-error") {
                            this.validation[formName][validationField] = "el-input__icon el-icon-error";
                        }
                        return;
                    }
                }
            }

            checkDatabaseAvailability(validationTable, validationField, validationValue)
                .then((response) => {
                    if (response.data.success === true && response.data.message === false) {
                        this.validation[formName][validationField] = "el-input__icon el-icon-error";
                    } else {
                        console.log(this.validation[formName][validationField]);

                        if (this.validation[formName][validationField] !== "el-input__icon el-icon-success") {
                            this.validation[formName][validationField] = "el-input__icon el-icon-success";
                        }
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }, 200),
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

    .el-form-item {
        margin-bottom: 10px;
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
