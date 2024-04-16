<template>
    <el-menu class="navbar" mode="horizontal">
        <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>
        <breadcrumb class="breadcrumb-container"></breadcrumb>
        <div class="right-menu">
            <!--
                <search id="header-search" class="right-menu-item" />
            -->

            <!-- Selected Files and Exploration IDs -->
            <selected-files class="right-menu-item"></selected-files>
            
            <error-log v-if="errorLogs.length > 0" class="right-menu-item error-logs"></error-log>
            <lang-select class="right-menu-item international "></lang-select>
            <el-dropdown class="avatar-container right-menu-item" size="large" trigger="click">
                <div class="avatar-wrapper">
                    <!-- <img :src="user_settings_server_address_backend + '/backend/user/avatar?id=' + user_id + '&size=64'" /> -->
                    <i class="el-icon-user-solid user-avatar"></i>
                    <i class="el-icon-caret-bottom"></i>
                </div>
                <el-dropdown-menu slot="dropdown">
                    <router-link to="/">
                        <el-dropdown-item>
                            {{ generateRouteTitle("dashboard") }}
                        </el-dropdown-item>
                    </router-link>
                    <router-link to="/settings/?startIndex=1">
                        <el-dropdown-item>
                            {{ generateRouteTitle("settings") }}
                        </el-dropdown-item>
                    </router-link>
                    <el-dropdown-item divided>
                        <span @click="logoutUser" style="display:block;">
                            {{ $t('views.layout.components.Navbar.logout') }}
                        </span>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </el-menu>
</template>
<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import ErrorLog from "@/components/ErrorLog";
import LangSelect from "@/components/LangSelect";
import SelectedFiles from "@/components/SelectedFiles";
import Search from '@/components/HeaderSearch'

import { generateRouteTitle } from "@/utils/i18n";
export default {
    components: {
        Breadcrumb,
        SelectedFiles,
        Hamburger,
        ErrorLog,
        LangSelect,
        Search
    },
    computed: {
        ...mapGetters(["sidebar", "errorLogs", "user_id", "user_settings_server_address_backend"])
    },
    methods: {
        generateRouteTitle,
        toggleSideBar() {
            this.$store.dispatch("toggleSideBar");
        },
        logoutUser() {
            this.$store
                .dispatch("userLogout")
                .then(status => {
                    console.log("userLogout status: " + status);
                    if (status === true) {
                        // In order to re-instantiate the vue-router object to avoid bugs
                        location.reload();
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~scss_vars";
    
.navbar {
    height: 50px;
    line-height: 50px;
    width: 100%;
    float: left;
    border: 0 none;
    background: $ui-background;

    .hamburger-container {
        line-height: 58px;
        height: 50px;
        float: left;
        padding: 0 10px;
    }

    .breadcrumb-container {
        float: left;
    }

    .right-menu {
        float: right;
        height: 100%;
        &:focus {
            outline: none;
        }

        .right-menu-item {
            display: inline-block;
            &:not(:last-child) {
                padding-right: 10px;
            }
        }
        .international {
            vertical-align: top;
            font-size: 20px;
            cursor: pointer;
            width: 40px;
            text-align: center;
        }
        .error-logs {
            color: #E4D04D;
            vertical-align: top;
            font-size: 20px;
            cursor: pointer;
            width: 40px;
            text-align: center;
        }
        .avatar-container {
            height: 50px;
            margin-right: 5px;
            width: 40px;
            margin-left: 0;
            float: right;
            cursor: pointer;
            color: $white;

            .avatar-wrapper {
                margin-top: 5px;
                position: relative;
                .user-avatar {
                    font-size: 24px;
                }
                .el-icon-caret-bottom {
                    position: absolute;
                    top: 15px;
                    font-size: 12px;
                }
            }
        }
    }
}
</style>
