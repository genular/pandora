<template>
    <div class="reset-tab-container">
        <div class="title">{{ $t("views.authenticate.components.Reset.title") }}</div>
        <div class="lead">{{ $t("views.authenticate.components.Reset.description") }}</div>
        <el-row>
            <el-col>
                <el-form disabled class="reset-tab-form" size="large" autoComplete="on" :model="resetForm" ref="resetForm" label-position="left">
                    <el-form-item>
                        <el-input name="email" type="email" v-model="resetForm.email" autoComplete="on" :placeholder="$t('views.authenticate.components.Reset.placeholder')" />
                    </el-form-item>
                    <el-row>
                        <el-col :span="24">
                            <el-button class="button-reset" :loading="loadingWizard" @click="resetPassword">{{ $t("views.authenticate.components.Reset.reset_button") }}</el-button>
                        </el-col>
                    </el-row>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>
<script>
export default {
    name: "Reset",
    props: {
        action: {
            default: "reset",
            type: String
        }
    },
    data() {
        return {
            resetForm: {
                email: null
            },
            loadingWizard: false
        };
    },
    mounted() {
        console.log("reset-tab-container");
    },
    methods: {
        resetPassword() {
            console.log("resetPassword");
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
.reset-tab-container {
    padding: 25px;
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
    .reset-tab-form {
        padding: 15px;

        .button-reset {
            width: 100%;
            margin-top: 15px;
            margin-bottom: 0;
            margin-left: 0;
            margin-right: 0;
            height: 75px;
            font-size: 18px;
            background-color: #4d4d50;
            border: 3px solid #343436;
            color: #ffffff;
        }
    }
}
</style>
