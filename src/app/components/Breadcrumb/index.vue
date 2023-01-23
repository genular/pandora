<template>
    <el-breadcrumb class="app-breadcrumb" separator="/">
        <transition-group name="breadcrumb">
            <el-breadcrumb-item v-for="(item,index)  in levelList" :key="item.path" v-if='item.meta.title'>
                <span v-if='item.redirect==="noredirect"||index==levelList.length-1' class="no-redirect">{{generateRouteTitle(item.meta.title)}}</span>
                <router-link v-else :to="item.redirect||item.path">{{generateRouteTitle(item.meta.title)}}</router-link>
            </el-breadcrumb-item>
        </transition-group>
    </el-breadcrumb>
</template>
<script>
import { generateRouteTitle } from "@/utils/i18n";

export default {
    created() {
        this.getBreadcrumb();
    },
    data() {
        return {
            levelList: null
        };
    },
    watch: {
        $route() {
            this.getBreadcrumb();
        }
    },
    methods: {
        generateRouteTitle,
        getBreadcrumb() {
            let matched = this.$route.matched.filter(item => item.name);
            const first = matched[0];
            if (first && first.name !== "dashboard") {
                matched = [
                    {
                        path: "/dashboard",
                        meta: {
                            title: "dashboard"
                        }
                    }
                ].concat(matched);
            }
            this.levelList = matched;
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {

    display: inline-block;
    font-size: 14px;
    line-height: 50px;
    margin-left: 10px;

    .no-redirect {
        color: #C0C4CC;
        cursor: text;
    }

    .el-breadcrumb__inner.is-link, .el-breadcrumb__inner a {
        color: #FFFFFF;
    }
}

</style>
