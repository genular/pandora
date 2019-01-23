<template>
    <div class="authenticate-container">
        <vue-particles color="#dedede" :particleOpacity="0.1" :particlesNumber="150" shapeType="polygon" :particleSize="4" linesColor="#dedede" :linesWidth="1" :lineLinked="true" :lineOpacity="0.075" :linesDistance="150" :moveSpeed="0.75" :hoverEffect="false" hoverMode="bubble" :clickEffect="false">
        </vue-particles>
        <!-- <img class="logo" :src="genularLogo" @click="redirectToHomepage()" /> -->
        <lang-select class="set-language"></lang-select>
        <div class="tabs-container">
            <span class="logo-text">genular</span>
            <div class="action-views">
                <div title="Go back to login form" v-if="action != 'login'" class="go-back" @click="navigateTo('login')">x</div>
                <login :action="action" v-if="action === 'login'"></login>
                <register :usertype="usertype" :step="step" :action="action" v-if="action === 'register'"></register>
                <reset :action="action" v-if="action === 'reset'"></reset>
            </div>
        </div>
        <el-dialog title="Unfortunately server is currently temporarily unavailable" :visible.sync="backendServersError" :before-close="redirectToHomepage" center :close-on-click-modal="false">
            <span>Oooops! Sorry we cannot process your request at this moment. Please try again later.</span>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="redirectToHomepage">Go to homepage</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import LangSelect from "@/components/LangSelect";

import { Login, Register, Reset } from "./components";
import genularLogo from "@/assets/logo/svg/white_logo_transparent_notext.svg";

export default {
    name: "authenticate",
    props: {
        action: {
            default: "login",
            type: String
        },
        usertype: {
            default: "",
            type: String
        },
        step: {
            default: 0,
            type: Number
        }
    },
    components: {
        LangSelect,
        Login,
        Register,
        Reset
    },
    data() {
        return {
            loadingWizard: false,
            backendServersError: false,
            genularLogo: genularLogo
        };
    },
    computed: {
        isConfigured: {
            get() {
                return this.$store.getters.is_configured;
            },
            set(value) {
                this.$store.dispatch("setIsConfigured", value);
            }
        }
    },
    created() {
        console.log("created usertype: " + this.usertype);
    },
    mounted() {
        console.log("mounted: authenticate: " + this.action);
        if (this.isConfigured === false) {
            this.configureBackendServers();
        }
    },
    methods: {
        configureBackendServers() {
            this.loadingWizard = true;
            this.$store
                .dispatch("configureBackendServers", this.$config.server.backend)
                .then((status) => {
                    if (status === true) {
                        this.isConfigured = true;
                        this.loadingWizard = false;
                        this.$router.push({
                            path: "/"
                        });
                    } else {
                        this.loadingWizard = false;
                        this.backendServersError = true;
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.loadingWizard = false;
                    this.backendServersError = true;
                });
        },
        navigateTo(action) {
            this.$router.push({
                path: "/authenticate/?action=" + action
            });
        },
        redirectToHomepage() {
            window.location.href = this.$config.server.homepage;
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
@import "~scss_vars";
.authenticate-container {
    position: relative;
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    #particles-js {
        background-size: cover;
        position: fixed;
        width: 100%;
        height: 100%;
    }
    .set-language {
        position: absolute;
        right: 5px;
        font-size: 36px;
        color: #ffffff;
        top: 5px;
        padding-top: 5px;
        z-index: 999;
        cursor: pointer;
    }
    .logo {
        position: absolute;
        left: 5px;
        top: 5px;
        height: 50px;
        color: #ffffff;
        z-index: 999;
        cursor: pointer;
    }
    .logo-text {
        font-family: "Reislust", Helvetica Neue, Helvetica, Arial, sans-serif;
        font-size: 53px;
        color: #ffffff;
    }
    .tabs-container {
        z-index: 999;
        .action-views {
            background-color: rgba(255, 255, 255, 1);
            border-radius: 5px;
            position: relative;
            .go-back {
                font-size: 24px;
                position: absolute;
                right: 10px;
                top: 0;
                color: #b4b4b4;
                font-weight: bold;
                opacity: 0.7;
                cursor: pointer;
            }
        }
    }
}
</style>
