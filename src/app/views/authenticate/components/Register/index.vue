<template>
    <div class="register-tab-container">
        <div class="title">New user registration</div>
        <div class="lead">PANDORA - Data Science Knowledge Discovery platform</div>
        <el-row class="register-options-container" v-if="registrationType == null">
            <el-col :span="12">
                <div class="register-options-user" @click.prevent.stop="navigateTo('private')">
                    <i class="fa fa-user" aria-hidden="true"></i>
                    <div>Join as private user</div>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="register-options-oganization" @click.prevent.stop="navigateTo('organization')">
                    <i class="fa fa-building" aria-hidden="true"></i>
                    <div>Join as Organization</div>
                </div>
            </el-col>
        </el-row>
        <div class="steps-container">
            <private :step="step" v-if="registrationType == 'private'"></private>
            <organization :step="step" v-if="registrationType == 'organization'"></organization>
        </div>
    </div>
</template>
<script>
import { isvalidUsername } from "@/utils/validate";
import { Private, Organization } from "./components";
export default {
    name: "Register",
    props: {
        action: {
            default: "register",
            type: String,
        },
        usertype: {
            default: "",
            type: String,
        },
        step: {
            default: 0,
            type: Number,
        },
    },
    components: {
        Private,
        Organization,
    },
    data() {
        return {
            registrationType: null,
        };
    },
    created() {
        if (this.usertype !== "") {
            this.registrationType = this.usertype;
        }
    },
    methods: {
        navigateTo(usertype) {
            this.$router.push({
                path: "/authenticate/?action=" + this.action + "&usertype=" + usertype + "&step=0",
            });
            this.registrationType = usertype;
        },
    },
};
</script>
<style rel="stylesheet/scss" lang="scss">
@import "~scss_vars";
.register-tab-container {
    padding: 25px;
    max-height: 100vh;
    overflow: hidden;
    max-width: 1000px;
    min-width: 600px;
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
    .register-options-container {
        text-align: center;
        margin-top: 30px;
        .register-options-user {
            cursor: pointer;
            div {
                margin-top: 15px;
                font-size: 24px;
            }
        }
        .register-options-oganization {
            cursor: pointer;
            div {
                margin-top: 15px;
                font-size: 24px;
            }
        }
        i {
            font-size: 72px;
            margin-top: 25px;
        }
    }
    .steps-container {
        margin-top: 25px;
        margin-bottom: 15px;
    }
}
</style>
