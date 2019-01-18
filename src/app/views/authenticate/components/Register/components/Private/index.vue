<template>
    <div>
        <el-steps class="steps" :active="currentStep" align-center>
            <el-step @click.native="navigateToStep(0)" title="Step 1" icon="el-icon-edit" description="Create personal account"></el-step>
            <el-step @click.native="navigateToStep(1)" title="Step 2" icon="el-icon-menu" description="Choose your plan"></el-step>
            <el-step title="Step 3" icon="el-icon-view" description="Welcome"></el-step>
        </el-steps>
        <div class="form-container">
            <div v-if="currentStep == 0" class="form-step step-0">
                <h2 class="steps-container-title">Create your personal account</h2>
                <el-row>
                    <el-col :span="14">
                        <el-form class="form" autoComplete="on" :model="userForm" ref="userForm" label-position="top">
                            <div style="width: 100%; float: left;">
                                <el-form-item label="Username" style="width: 49%; float: left;">
                                    <!-- <el-input name="username" type="text" v-model="userForm.username" autoComplete="on" placeholder="Username" /> -->
                                    <el-input name="username" type="text" :value="userForm.username" @input.native="checkFieldAvailability('users', 'username', $event, 'userForm')" autoComplete="on" placeholder="Username">
                                        <i slot="suffix" :class='validation["userForm"].username'></i>
                                    </el-input>
                                    <p class="note">This will be your username. You can add the name of your organization later.</p>
                                </el-form-item>
                                <el-form-item label="Email address" style="width: 49%; float: left; margin-left: 2%;">
                                    <el-input name="email_adress" type="text" :value="userForm.email_adress" @input.native="checkFieldAvailability('users_details', 'email', $event, 'userForm')" autoComplete="on" placeholder="Email address">
                                        <i slot="suffix" :class='validation["userForm"].email'></i>
                                    </el-input>
                                    <p class="note">We'll occasionally send updates about your account to this inbox. We'll never share your email address with anyone.</p>
                                </el-form-item>
                            </div>
                            <el-form-item label="Password">
                                <el-input name="password" :type="passwordType" :value="userForm.password" autoComplete="off" placeholder="Password" @input.native="checkFieldAvailability('users', 'password', $event, 'userForm')">
                                     <i slot="prefix" :class='validation["userForm"].password'></i>
                                </el-input>
                                <span class="show-pwd" @click="showPassword">
                                    <i class="fa fa-icon fa-eye"></i>
                                </span>
                                <p class="note">Please use strong password, of at least 8 characters. (lowercase, uppercase, numeral & special characters)</p>
                            </el-form-item>
                            <div style="width: 100%; float: left;">
                                <el-form-item label="First name" style="width: 49%; float: left;">
                                    <el-input name="firstName" :value="userForm.firstName" type="text" @input.native="checkFieldAvailability('users_details', 'firstName', $event, 'userForm')">
                                        <i slot="suffix" :class='validation["userForm"].firstName'></i>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="Last name" style="width: 49%; float: left; margin-left: 2%;">
                                    <el-input name="lastName" :value="userForm.lastName" type="text" @input.native="checkFieldAvailability('users_details', 'lastName', $event, 'userForm')">
                                        <i slot="suffix" :class='validation["userForm"].lastName'></i>
                                    </el-input>
                                </el-form-item>
                            </div>
                            <div style="width: 100%; float: left;">
                                <el-form-item label="Phone number" style="width: 49%; float: left;">
                                    <el-input name="phoneNumber" :value="userForm.phoneNumber" type="text" @input.native="checkFieldAvailability('users_details', 'phoneNumber', $event, 'userForm')">
                                        <i slot="suffix" :class='validation["userForm"].phoneNumber'></i>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="Account invite code" style="width: 49%; float: left; margin-left: 2%;">
                                    <el-input name="org_invite_code" :value="userForm.org_invite_code" type="text"></el-input>
                                </el-form-item>
                            </div>
                        </el-form>
                    </el-col>
                    <el-col :span="10">
                        <el-card class="box-card" style="width: 90%; float: right; margin-top: 10px">
                            <div slot="header" class="clearfix">
                                <span>You’ll love SIMON</span>
                            </div>
                            <div class="box-card-item">
                                Great <strong>Exploratory</strong> analysis
                            </div>
                            <div class="box-card-item">
                                <strong>Unlimited</strong> Bandwidth
                            </div>
                            <div class="box-card-item">
                                <strong>Automatic</strong> workflows
                            </div>
                            <div class="box-card-item">
                                <strong>Great</strong> distributed computing infrastructure
                            </div>
                            <div class="box-card-item">
                               Seamless <strong>deployments</strong>
                            </div>
                            <div class="box-card-item">
                               <strong>Constant</strong> system updates
                            </div>
                        </el-card>
                    </el-col>
                </el-row>

                <el-row style="margin-top: 25px;">
                    <el-button-group style="float: right;">
                         <el-button type="primary" v-if="$config.name === 'development'" @click="fillDemoData(1)">DEMO</el-button>
                        <el-button type="primary" @click="navigateToStep(1)" :disabled="userForm.validated !== 6">Choose plan<i class="el-icon-arrow-right el-icon-right"></i></el-button>
                    </el-button-group>
                </el-row>

            </div>
            <div v-if="currentStep == 1 && planForm.plan_id == null" class="form-step step-1">
                <div style="width: 100%; position: relative;clear: both;display: inline-block;">
                    <h2 class="steps-container-title" style="position: relative;float: left;margin-top: 25px;margin-bottom: 25px;">Choose your membership plan</h2>
                    <el-switch style="position: relative;  float: right;margin-top: 25px;margin-bottom: 25px;margin-right: 25px;" v-model="billingPeriodSwitch" active-text="Year" inactive-text="Month"></el-switch>
                </div>
                <el-row v-loading="loading.plans">
                    <div v-if="planDetails[billingPeriod].length > 0">
                        <div v-if="planDetails[billingPeriod].length <= 3">
                            <plan v-for="(item, index) in planDetails[billingPeriod]" :plandetails="item" :itemsplit="(24 / planDetails[billingPeriod].length)" :key="item.id" v-on:chage-plan-id="planForm.plan_id = $event" @click.native.prevent="planForm.plan_id = item.id" />
                        </div>
                        <div v-else>
                            <el-carousel height="515px" indicator-position="none" :interval="10000" :autoplay="false" trigger="click" type="card">

                                <el-carousel-item v-for="(plans, index) in planDetailsSplitted" :key="index">
                                    <plan v-for="(item, index) in plans" :plandetails="item" :itemsplit="(24 / plans.length)" :key="item.id" v-on:chage-plan-id="planForm.plan_id = $event" @click.native.prevent="planForm.plan_id = item.id" />
                                </el-carousel-item>

                            </el-carousel>
                        </div>
                    </div>
                    <div v-else>
                        <el-alert title="Sorry! No plans found for selected payment period!" type="error"></el-alert>
                    </div>
                </el-row>
            </div>
            <div v-if="currentStep == 1 && planForm.plan_id !== null" class="form-step step-1">
                <h2 class="steps-container-title">How would you like to pay</h2>
                <el-row>
                    <el-col :span="12" style="float: left;">
                        <el-form class="form" autoComplete="on" label-position="left" label-width="150px">
                            <el-form-item label="Selected plan">
                                <el-input :value="planForm.plan_details.invoice_name" disabled>
                                     <el-button slot="append" icon="el-icon-edit" @click="planForm.plan_id = null"></el-button>
                                </el-input>
                            </el-form-item>

                            <el-form-item label="Payment Type">
                                <el-radio-group v-model="planForm.payment_type" size="small">
                                    <el-radio border label="credit_card">Credit card / PayPal</el-radio>
                                    <el-radio border label="wire">Wire transfer</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item label="Coupon code" v-if="planForm.payment_type == 'wire'">
                                <el-input name="planForm.coupon_code" :value="planForm.coupon_code" type="text" minlength="2" debounce="1000" @input.native="checkFieldAvailability('coupon_code', 'coupon_code', $event, 'planForm')">
                                    <i slot="suffix" :class='validation["planForm"].coupon_code'></i>
                                </el-input>
                            </el-form-item>
                        </el-form>

                        <el-form class="form" label-position="left">
                            <el-form-item label="Billing details">
                                <el-tooltip style="float: right;" content="Copy account details?" placement="top">
                                    <el-switch
                                        v-model="planForm.copy_account_data">
                                    </el-switch>
                                </el-tooltip>
                            </el-form-item>

                            <div style="width: 100%; float: left;">
                                <el-form-item label="First name" style="width: 30%; float: left;">
                                    <el-input name="firstName" :value="planForm.billingAddress.firstName" type="text"></el-input>
                                </el-form-item>
                                <el-form-item label="Last name" style="width: 30%; float: left; margin-left: 5%;">
                                    <el-input name="lastName" :value="planForm.billingAddress.lastName" type="text"></el-input>
                                </el-form-item>
                                <el-form-item label="Phone number" style="width: 30%; float: left; margin-left: 5%;">
                                    <el-input name="phoneNumber" :value="planForm.billingAddress.phoneNumber" type="text"></el-input>
                                </el-form-item>
                            </div>


                            <div style="width: 100%; float: left;">
                                <el-form-item label="Address" style="width: 65%; float: left;">
                                    <el-autocomplete
                                        style="display: block;"
                                        v-model="planForm.billingAddress.line1"
                                        :fetch-suggestions="addressSearch"
                                        placeholder="Start typing"
                                        :trigger-on-focus="false"
                                        :loading="loading.address"
                                        @select="handleAddressSelect">
                                        <i class="el-icon-location-outline el-input__icon" slot="suffix"></i>
                                    </el-autocomplete>

                                </el-form-item>
                                <el-form-item label="City" style="width: 30%; float: left; margin-left: 5%;">
                                    <el-input name="city" :value="planForm.billingAddress.city" type="text"></el-input>
                                </el-form-item>
                            </div>

                           <div style="width: 100%; float: left;">
                                <el-form-item label="State" style="width: 30%; float: left;">
                                    <el-input name="state" :value="planForm.billingAddress.state" type="text"></el-input>
                                </el-form-item>
                                <el-form-item label="ZIP Code" style="width: 30%; float: left; margin-left: 5%;">
                                    <el-input name="zip" :value="planForm.billingAddress.zip" type="text"></el-input>
                                </el-form-item>
                                <el-form-item label="Country" style="width: 30%; float: left; margin-left: 5%;">
                                    <el-select
                                        v-model="planForm.billingAddress.country"
                                        clearable
                                        filterable
                                        remote
                                        reserve-keyword
                                        placeholder="Please select"
                                        :remote-method="countrySearch"
                                        :loading="loading.country">
                                            <el-option
                                                v-for="item in countryFiltered"
                                                :key="item.alpha2Code"
                                                :label="item.name"
                                                :value="item.alpha2Code">
                                                <span style="float: left">{{ item.name }}</span>
                                                <span style="float: right;" :class="'flag-icon flag-icon-' + item.alpha2Code.toLowerCase()"></span>
                                            </el-option>
                                    </el-select>
                                </el-form-item>
                            </div>
                        </el-form>
                    </el-col>
                    <el-col :span="12" style="float: right;" v-if="payment_summary.length > 0">
                        <el-card class="box-card" style="width: 90%; float: right;">
                            <div slot="header" class="clearfix">
                                <span>Account Summary</span>
                            </div>
                            <el-table :data="payment_summary" stripe sum-text="Total" :summary-method="getSummaries" show-summary>
                                <el-table-column type="index" width="65"></el-table-column>
                                <el-table-column prop="item" label="Item"></el-table-column>
                                <el-table-column prop="amount" label="Cost" align="center"></el-table-column>
                            </el-table>
                        </el-card>
                    </el-col>
                </el-row>

                <el-row style="margin-top: 25px;">
                    <el-button-group style="float: right;">
                        <el-button type="primary" icon="el-icon-arrow-left" @click="planForm.plan_id = null">Previous Page</el-button>
                        <el-button type="primary" :loading="loading.account" @click="registerAccount" :disabled="userForm.validated !== 6 || planForm.billingAddress.validated !== 8">
                            Create account<i class="el-icon-arrow-right el-icon-right"></i>
                        </el-button>
                    </el-button-group>
                </el-row>
            </div>
            <div v-if="currentStep == 2" class="form-step step-2">
                 <h2 class="steps-container-title">Welcome to genular {{userForm.firstName}}!</h2>
                <el-row>
                    <el-col :span="24">
                        <p class="welcome_text">
                            <span>Your account is successfully created!</span><br /><br />
                            If you did not already please confirm your email address via email we sent to you.
                        </p>
                        <p class="welcome_text" v-if="checkout.successful == 'paid' || checkout.successful == 'wire'">
                                You should also receive Invoice for your subscription payment via email, but you can also always download Invoices in your user account.
                        </p>
                        <p class="welcome_text" v-if="checkout.successful == 'wire'" style="font-style: italic;">
                                It looks like to chosen "wire transfer" option for your payment. If necessarily all payment details are in Invoice you received by email.<br />
                                After we receive your payment we will process it immediately. Please note this can take up to 5 days.
                        </p>
                        <p class="welcome_text">
                            You can now login to your user interface where you can start exploring. {{checkout.successful}}
                        </p>
                        <div v-if="planForm.payment_type !== 'wire' && checkout.successful == 'unpaid'" style="margin-top: 25px;">
                            <el-alert
                                title="Warning"
                                type="warning"
                                :closable="false"
                                description="It looks like we could not process your payment with details you provided or payment was cancled. Dont worry you can still login and make payment from there."
                                show-icon>
                            </el-alert>
                        </div>
                    </el-col>
                </el-row>

                <el-row style="margin-top: 25px;">
                    <el-button-group style="float: right;">
                        <el-button type="primary" @click="userLogin">
                            login
                            <i class="el-icon-arrow-right el-icon-right"></i>
                        </el-button>
                    </el-button-group>
                </el-row>
            </div>
        </div>
    </div>
</template>
<script>
import _ from "lodash";

import { validateUsername, validateEmail, validatePassword } from "@/utils/validate";

import {
    userRegister,
    checkDatabaseAvailability,
    retrieveAllActivePlans,
    searchAddressSuggest,
    searchAddressDetails,
    searchCountry
} from "@/api/backend";

import { Plan } from "./components";

const countries = require("@/assets/countries.json");

export default {
    name: "Private",
    props: {
        step: {
            default: 0,
            type: Number
        }
    },
    components: {
        Plan
    },
    computed: {
        planDetailsSplitted: function() {
            const plans = this.planDetails[this.billingPeriod];
            const planDetailsSplitted = [];
            const size = 1;
            for (let i = 0; i < plans.length; i += size) {
                planDetailsSplitted.push(plans.slice(i, i + size));
            }
            return planDetailsSplitted;
        }
    },
    data() {
        return {
            currentStep: 0,

            billingPeriodSwitch: true,
            billingPeriod: "year",
            // chargebee JS instance
            cbInstance: null,

            validation: {
                userForm: {
                    username: "el-input__icon el-icon-error",
                    email: "el-input__icon el-icon-error",
                    password: "el-input__icon el-icon-error",
                    firstName: "el-input__icon el-icon-error",
                    lastName: "el-input__icon el-icon-error",
                    phoneNumber: "el-input__icon el-icon-error"
                },
                planForm: {
                    coupon_code: ""
                }
            },
            // Loading progress
            loading: {
                plans: false,
                country: false,
                address: false,
                account: false
            },

            countryFiltered: [],
            // List containing all available plans for current user group
            planDetails: {
                month: [],
                year: []
            },

            userForm: {
                username: "",
                email_adress: "",
                password: "",
                firstName: "",
                lastName: "",
                phoneNumber: "",
                org_invite_code: Math.random().toString(36).substring(7),
                validated: 0
            },
            planForm: {
                // Selected Plan ID
                plan_id: null,
                // Selected Plan Details
                plan_details: null,
                payment_type: "credit_card",
                // Any coupon code to apply?
                coupon_code: "",
                coupon_details: null,
                copy_account_data: false,
                // Needed for VAT collection
                billingAddress: {
                    firstName: "",
                    lastName: "",
                    phoneNumber: "",
                    line1: "",
                    city: "",
                    state: "",
                    zip: "",
                    country: "",
                    validated: 0
                }
            },
            passwordType: "password",
            // Display of Summery table on checkout
            payment_summary: [],
            // Final Checkout details
            checkout: {
                // paid, wire or unpaid
                successful: "unpaid"
            }
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
        if (this.planDetails.year.length < 1) {
            this.getRemotePlans();
        }
        if (this.cbInstance === null) {
            this.cbInstance = Chargebee.getInstance();
            if (this.cbInstance === null) {
                this.cbInstance = Chargebee.init({
                    site: this.$config.api.chargebee_site_name
                });
            }
        }
        /** Just a placeholder with demo coupon code */
        if (this.$config.name === "development") {
            this.planForm.payment_type = "wire";
            this.planForm.coupon_code = "COLLABORATION";
            this.planForm.coupon_details = {
                name: "COLLABORATION",
                discount_percentage: 100
            }
        }
    },
    methods: {
        fillDemoData(dataStep) {
            this.userForm.username = "demouser";
            this.userForm.email_adress = "";
            this.userForm.firstName = "John";
            this.userForm.lastName = "Doe"; 
            this.userForm.phoneNumber = "+358502818692";
            this.userForm.password = "demouser";
            // Should be 6 to pass, but we don't want to validate email automatically
            this.userForm.validated = 5;
            this.userForm.org_invite_code = Math.random().toString(36).substring(7);
            for (const name in this.validation["userForm"]) {
                if (name !== "email" && this.validation["userForm"].hasOwnProperty(name)) {
                    this.validation["userForm"][name] = "el-input__icon el-icon-success";
                }
            }
            this.planForm.billingAddress.line1 = "Demo address 3";
            this.planForm.billingAddress.city = "San Francisco";
            this.planForm.billingAddress.state = "CA";
            this.planForm.billingAddress.zip = "94102";
            this.countryFiltered = [{ alpha2Code: "US", name: "United States of America" }];
            this.planForm.billingAddress.country = "US";
            this.planForm.billingAddress.validated = 8;

            for (const name in this.validation["userForm"]) {
                if (name !== "coupon_code") {
                    if (this.validation["planForm"].hasOwnProperty(name)) {
                        this.validation["planForm"][name] = "el-input__icon el-icon-success";
                    }
                }
            }
        },
        /** Calculate payment summary based on user choices 
        TODO: implement https://apidocs.chargebee.com/docs/api/estimates */
        getSummaries(param) {
            const { data } = param;
            const sums = [];

            sums[0] = "Total";

            sums[1] = "";
            sums[2] = "";
            sums[3] = 0;

            data.forEach((item, index) => {
                let value = 0;

                if (item.type === "plan") {
                    value = this.$accounting.unformat(item.amount);
                    if (value > 0) {
                        sums[3] += value;
                    }

                } else if (item.type === "coupon") {
                    value = parseInt(item.amount);
                    if (value > 0) {
                        sums[3] = sums[3] - sums[3] * (value / 100);
                    }
                }

            });
            console.log(sums);

            sums[3] = this.$accounting.formatMoney(sums[3], "€");
            return sums;
        },
        getRemotePlans() {
            this.loading.plans = true;
            retrieveAllActivePlans("private")
                .then(response => {
                    this.planDetails.month = response.data.message.month;
                    this.planDetails.year = response.data.message.year;

                    this.loading.plans = false;
                })
                .catch(error => {
                    console.log("==> Cannot get retrieveAllActivePlans: " + error);
                    setTimeout(() => {
                        // start the timer again
                        this.getRemotePlans();
                    }, 5000);
                });
        },
        addressSearch(queryString, cb) {
            if (queryString.length > 3) {
                this.loading.address = true;
                searchAddressSuggest(queryString)
                    .then(response => {
                        if (response.data.suggestions.length > 0) {
                            const result = response.data.suggestions.map(item => ({ value: item }));
                            cb(result);
                        }
                        this.loading.address = false;
                    })
                    .catch(error => {
                        console.log(error);
                        this.loading.address = false;
                        cb([]);
                    });
            } else {
                cb([]);
            }
        },
        handleAddressSelect(item) {
            searchAddressDetails(item.value)
                .then(response => {
                    if (typeof response.data === "object" && typeof response.data.response === "object") {
                        if (
                            typeof response.data.response.view[0] === "object" &&
                            typeof response.data.response.view[0].result[0] === "object"
                        ) {
                            const itemDetails = response.data.response.view[0].result[0].location.address;
                            this.planForm.billingAddress.line1 = [itemDetails.street, itemDetails.houseNumber].join(
                                " "
                            );
                            this.planForm.billingAddress.city = itemDetails.city;
                            this.planForm.billingAddress.state = itemDetails.county;
                            this.planForm.billingAddress.zip = itemDetails.postalCode;
                            this.countrySearch(itemDetails.country, true);
                        }
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        },
        countrySearch(queryString, autoselect = false) {
            console.log("countrySearch");

            if (queryString !== "") {
                this.loading.country = true;

                searchCountry(queryString)
                    .then(response => {
                        if (response.data.length > 0) {
                            this.countryFiltered = response.data;
                            if (autoselect === true) {
                                this.planForm.billingAddress.country = response.data[0].alpha2Code;
                            }
                        }
                        this.loading.country = false;
                    })
                    .catch(error => {
                        console.log(error);
                        this.countryFiltered = queryString
                            ? countries.filter(this.countryFilter(queryString))
                            : countries;
                        this.loading.country = false;
                    });
            }
        },
        countryFilter(queryString) {
            return country => {
                return country.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
            };
        },
        navigateToStep(step) {
            if (step > 0) {
                if (this.userForm.validated === 6) {
                    this.currentStep = step;
                    this.$router.push({
                        path: "/authenticate/?action=register&usertype=private&step=" + step
                    });
                } else {
                    return false;
                }
            } else {
                this.currentStep = step;
                this.$router.push({
                    path: "/authenticate/?action=register&usertype=private&step=" + step
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
        openCheckout(hosted_page) {
            this.cbInstance.openCheckout({
                hostedPage: () => {
                    return new Promise((resolve, reject) => {
                        resolve(hosted_page);
                    });
                },
                loaded: () => {
                    console.log("Checkout page is loaded!");
                },
                error: error => {
                    console.log("Checkout error:");
                    console.log(error);
                },
                step: step => {
                    console.log("Checkout step: ", step);
                    if (step === "thankyou_screen") {
                        this.checkout.successful = "paid";
                    }
                },
                success: hostedPageId => {
                    console.log("Checkout hostedPageId: ", hostedPageId);
                    this.checkout.successful = "paid";
                },
                close: () => {
                    console.log("Checkout close");
                    this.loading.account = false;
                    if (this.checkout.successful === "paid") {
                        this.navigateToStep(2);
                    } else {
                        this.$message({
                            message: "Unfortunately we cannot process your payment with details you provided.",
                            type: "error",
                            duration: 5000,
                            showClose: true
                        });
                        this.navigateToStep(2);
                    }
                }
            });
        },
        registerAccount() {
            this.loading.account = true;
            userRegister(this.userForm, this.planForm)
                .then(response => {
                    if (response.data.success === true) {
                        response.data.message.forEach((item, index) => {
                            if (item.object === "hosted_page") {
                                this.openCheckout(item);
                            } else if (item.object === "subscription") {
                                this.checkout.successful = "wire";
                                this.navigateToStep(2);
                            }
                        });
                    } else {
                        this.$message({
                            message: "Cannot create account. Please try with different user-name or try again latter.",
                            type: "error",
                            duration: 5000,
                            showClose: true
                        });
                        this.loading.account = false;
                        console.log(response.data);
                    }
                })
                .catch(error => {
                    console.log(error);
                    this.$message({
                        message: "Cannot create account. This error is reported, please try again latter.",
                        type: "error",
                        duration: 5000,
                        showClose: true
                    });
                    this.loading.account = false;
                });
        },
        userLogin() {
            this.$store
                .dispatch("userLogin", this.userForm)
                .then(() => {
                    this.loading.account = false;
                    this.$router.push({
                        path: "/"
                    });
                })
                .catch(error => {
                    console.log(error);
                    this.loading.account = false;
                });
        },
        checkFieldAvailability(validationTable, validationField, event, formName) {
            const validationValue = event.target.value;
            // Checking if a string is blank, null, undefined or shorter than 2 characters:
            if (!validationValue || /^\s*$/.test(validationValue) || validationValue.length < 2) {
                if (validationTable === "coupon_code") {
                    this.validation[formName][validationField] = "";
                    this[formName].coupon_details = null;
                } else {
                    if (this.validation[formName][validationField] !== "el-input__icon el-icon-error") {
                        this.validation[formName][validationField] = "el-input__icon el-icon-error";
                        this[formName].validated -= 1;
                    }
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
                if (validateEmail(validationValue) === false) {
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
            } else if (
                validationField === "firstName" ||
                validationField === "lastName" ||
                validationField === "phoneNumber"
            ) {
                if (this.validation[formName][validationField] !== "el-input__icon el-icon-success") {
                    this.validation[formName][validationField] = "el-input__icon el-icon-success";
                    this[formName].validated += 1;
                }
                return;
            }
            checkDatabaseAvailability(validationTable, validationField, validationValue)
                .then(response => {
                    if (response.data.success === true && response.data.message === true) {
                        this.validation[formName][validationField] = "el-input__icon el-icon-error";
                    } else {
                        if (validationTable === "coupon_code") {
                            if (response.data.message !== true && typeof response.data.message === "object") {
                                if (this.validation[formName][validationField] !== "el-input__icon el-icon-success") {
                                    this.validation[formName][validationField] = "el-input__icon el-icon-success";
                                    this[formName].validated += 1;
                                }
                                // Save Coupon code details
                                this[formName].coupon_details = response.data.message;
                            } else {
                                if (this.validation[formName][validationField] !== "el-input__icon el-icon-error") {
                                    this.validation[formName][validationField] = "el-input__icon el-icon-error";
                                    this[formName].validated -= 1;
                                }
                                this[formName].coupon_details = null;
                            }
                        } else {
                            if (this.validation[formName][validationField] !== "el-input__icon el-icon-success") {
                                this.validation[formName][validationField] = "el-input__icon el-icon-success";
                                this[formName].validated += 1;
                            }
                        }
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }
    },
    watch: {
        billingPeriodSwitch(value) {
            if (value === true) {
                this.billingPeriod = "year";
            } else {
                this.billingPeriod = "month";
            }
        },
        // Plan change event!
        "planForm.plan_id": function(newVal, oldVal) {
            if (newVal !== this.planForm.plan_details) {
                this.planForm.copy_account_data = true;
                for (var i = 0; i < this.planDetails[this.billingPeriod].length; i++) {
                    if (this.planDetails[this.billingPeriod][i]["id"] === newVal) {
                        this.planForm.plan_details = this.planDetails[this.billingPeriod][i];

                        const summary_item = {
                            item: this.planForm.plan_details.invoice_name,
                            type: "plan",
                            amount: this.$accounting.formatMoney(this.planForm.plan_details.price, "€")
                        };
                        this.payment_summary = [];
                        this.payment_summary.push(summary_item);
                    }
                }
            } else {
                this.planForm.copy_account_data = false;
            }
        },
        "planForm.coupon_details": function(newVal, oldVal) {
            // find target index (using lodash)
            const itemIndex = _.findIndex(this.payment_summary, {
                type: "coupon"
            });
            console.log(itemIndex);
            if (itemIndex !== -1) {
                this.payment_summary.splice(itemIndex, 1);
            }

            if (newVal !== null) {
                const summary_item = {
                    item: newVal.name,
                    type: "coupon",
                    amount: newVal.discount_percentage + "%"
                };
                this.payment_summary.push(summary_item);
            }
        },
        "planForm.copy_account_data": function(value) {
            if (value === true) {
                this.planForm.billingAddress.firstName = this.userForm.firstName;
                this.planForm.billingAddress.lastName = this.userForm.lastName;
                this.planForm.billingAddress.phoneNumber = this.userForm.phoneNumber;
            } else {
                this.planForm.billingAddress.firstName = "";
                this.planForm.billingAddress.lastName = "";
                this.planForm.billingAddress.phoneNumber = "";
            }
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
.steps {
    clear: both;
    float: left;
    width: 100%;
    .el-step__icon-inner {
        font-size: 48px !important;
    }
    .is-process {
        color: red !important;
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
        color: #333333;
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
