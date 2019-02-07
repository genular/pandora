<template>
    <el-menu class="navbar" mode="horizontal">
        <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>
        <breadcrumb class="breadcrumb-container"></breadcrumb>
        <div class="right-menu">
            <!-- Selected Files and Exploation IDs -->
            <selected-files class="right-menu-item"></selected-files>
            <error-log v-if="errorLogs.length > 0" class="right-menu-item error-logs"></error-log>
            <lang-select class="right-menu-item international "></lang-select>
            <el-dropdown class="avatar-container right-menu-item" trigger="click">
                <div class="avatar-wrapper">
                    <img class="user-avatar" :src="'https://backend.api.doom.xc/backend/user/avatar?id=' + user_id + '&size=64'" />
                    <i class="el-icon-caret-bottom"></i>
                </div>
                <el-dropdown-menu slot="dropdown">
                    <router-link to="/">
                        <el-dropdown-item>
                            {{ $t("navbar.dashboard") }}
                        </el-dropdown-item>
                    </router-link>
                    <router-link to="/settings/?startIndex=1">
                        <el-dropdown-item>
                            {{ $t("navbar.settings") }}
                        </el-dropdown-item>
                    </router-link>
                    <el-dropdown-item divided>
                        <span @click="logoutUser" style="display:block;">{{ $t("navbar.logOut") }}</span>
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

export default {
    components: {
        Breadcrumb,
        SelectedFiles,
        Hamburger,
        ErrorLog,
        LangSelect
    },
    computed: {
        ...mapGetters(["sidebar", "errorLogs", "user_id"])
    },
    methods: {
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
.navbar {
    height: 50px;
    line-height: 50px;
    width: 100%;
    float: left;
    border-bottom: 0 none;
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
            vertical-align: top;
            font-size: 20px;
            cursor: pointer;
            width: 40px;
            text-align: center;
        }
        .avatar-container {
            height: 50px;
            margin-right: 30px;
            width: 40px;
            margin-left: 0;
            float: right;
            cursor: pointer;

            .avatar-wrapper {
                margin-top: 5px;
                position: relative;
                .user-avatar {
                    width: 40px;
                    height: 40px;
                }
                .el-icon-caret-bottom {
                    position: absolute;
                    right: -20px;
                    top: 15px;
                    font-size: 12px;
                }
            }
        }
    }
}
</style>
