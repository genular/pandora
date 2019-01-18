<template>
    <div class="dashboard-editor-container">
        <div class=" clearfix">
            <pan-thumb style="float: left" :image="avatar"> Your roles:
                <span class="pan-info-roles" :key='item' v-for="item in user_roles">{{item}}</span>
            </pan-thumb>
            <div class="info-container">
                <span class="display_name">{{user_username}}</span>
                <span style="font-size:20px;padding-top:20px;display:inline-block;">editor : dashboard</span>
            </div>
        </div>
        <div>
            <img class="emptyGif" :src="emptyGif">
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import PanThumb from "@/components/PanThumb";

export default {
    name: "dashboard-editor",
    components: {
        PanThumb
    },
    data() {
        return {
            emptyGif:
                "https://wpimg.wallstcn.com/0e03b7da-db9e-4819-ba10-9016ddfdaed3"
        };
    },
    computed: {
        ...mapGetters(["user_username", "avatar", "user_roles"])
    }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "~scss_vars";
.emptyGif {
    display: block;
    width: 45%;
    margin: 0 auto;
}

.dashboard-editor-container {
    background-color: $ui-icon-inactive;
    padding: 50px;
    .pan-info-roles {
        font-size: 12px;
        font-weight: 700;
        color: #333;
        display: block;
    }
    .info-container {
        position: relative;
        margin-left: 190px;
        height: 150px;
        line-height: 200px;
        .display_name {
            font-size: 48px;
            line-height: 48px;
            color: #212121;
            position: absolute;
            top: 25px;
        }
    }
}
</style>
