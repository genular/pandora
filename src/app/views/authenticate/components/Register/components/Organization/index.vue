<template>
    <div>
        <el-steps class="steps" :active="currentStep" align-center>
            <el-step title="Step 1" icon="el-icon-edit" description="Set up a personal account"></el-step>
            <el-step title="Step 2" icon="el-icon-edit" description="Set up the organization"></el-step>
            <el-step title="Step 3" icon="el-icon-edit" description="Invite team members"></el-step>
        </el-steps>
        <div class="form-container">
            <div v-if="currentStep == 0" class="form-step step-0">
                <h2>Create your personal account</h2>
                <el-form class="form" autoComplete="on" :model="userRegisterForm" ref="userRegisterForm" label-position="top">
                    <el-form-item prop="username" label="Username">
                        <el-input name="username" type="text" v-model="userRegisterForm.username" autoComplete="on" placeholder="Username" />
                        <p class="note">This will be your username. You can add the name of your organization later.</p>
                    </el-form-item>
                    <el-form-item prop="email_adress" label="Email address">
                        <el-input name="email_adress" type="text" v-model="userRegisterForm.email_adress" autoComplete="on" placeholder="Email address" />
                        <p class="note">We'll occasionally send updates about your account to this inbox. We'll never share your email address with anyone.</p>
                    </el-form-item>
                    <el-form-item prop="password" label="Password">
                        <el-input name="password" :type="passwordType" @keyup.enter.native="handleLogin" v-model="userRegisterForm.password" autoComplete="on" placeholder="Password" />
                        <span class="show-pwd" @click="showPassword">
                            <i class="fa fa-icon fa-eye"></i>
                        </span>
                        <p class="note">Use at least one lowercase letter, one numeral, and seven characters.</p>
                    </el-form-item>
                    <el-row>
                        <el-col :span="24">
                            By clicking “Create an account” below, you agree to our terms of service and privacy statement. We’ll occasionally send you account related emails.
                        </el-col>
                        <el-col :span="24">
                            <el-button class="button-login" :loading="loadingWizard" @click.native.prevent="handleLogin">Create an account</el-button>
                        </el-col>
                    </el-row>
                </el-form>
            </div>
            <div v-if="currentStep == 1" class="form-step step-1">
                <h2>Create an organization account</h2>
                <el-form class="form" autoComplete="on" :model="organizationRegisterForm" ref="organizationRegisterForm" label-position="top">
                    <el-form-item prop="orgName" label="Organization name">
                        <el-input name="orgName" type="text" v-model="organizationRegisterForm.orgName" autoComplete="on" placeholder="Organization name" />
                        <p class="note">This will be your organization name on https://github.com/.</p>
                    </el-form-item>
                    <el-form-item prop="billing_email_adress" label="Billing Email">
                        <el-input name="billing_email_adress" type="text" v-model="organizationRegisterForm.billing_email_adress" autoComplete="on" placeholder="Billing email" />
                        <p class="note">We'll send receipts to this inbox.</p>
                    </el-form-item>
                    <el-row>
                        <el-col :span="24">
                            By clicking on "Create organization" below, you are agreeing to the Terms of Service and the Privacy Policy.
                        </el-col>
                        <el-col :span="24">
                            <el-button class="button-login" :loading="loadingWizard" @click.native.prevent="handleLogin">Create organization</el-button>
                        </el-col>
                    </el-row>
                </el-form>
            </div>
            <div v-if="currentStep == 2" class="form-step step-2">
                <h2>Create your personal account</h2>
            </div>
        </div>
    </div>
</template>
<script>
import { isvalidUsername } from "@/utils/validate";

export default {
    name: "Organization",
    props: {
        step: {
            default: 0,
            type: Number
        }
    },
    data() {
        return {
            currentStep: 1,
            userRegisterForm: {
                username: "",
                email_adress: "",
                password: ""
            },
            organizationRegisterForm: {
                orgName: "",
                billing_email_adress: ""
            },
            passwordType: "password",
            loadingWizard: false
        };
    },
    methods: {
        showPassword() {
            if (this.passwordType === "password") {
                this.passwordType = "";
            } else {
                this.passwordType = "password";
            }
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
</style>
