<template>
    <el-dropdown trigger="click" class='international' @command="handleSetLanguage">
        <div>
            <i class="fa fa-globe" aria-hidden="true"></i>
        </div>
        <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="lang in languages" :key="lang" :command="lang" :disabled="language===lang">
                {{$t('language.' + lang)}}
            </el-dropdown-item>
        </el-dropdown-menu>
    </el-dropdown>
</template>
<script>
export default {
    computed: {
        languages() {
            return Object.keys(this.$i18n.messages);
        },
        language() {
            return this.$store.getters.language;
        }
    },
    mounted() {
        console.log("Detected languages: " + this.languages);
    },
    methods: {
        handleSetLanguage(lang) {
            this.$i18n.locale = lang;
            this.$store.dispatch("setLanguage", lang);

            this.$message({
                message: this.$t("language.changed"),
                type: "success"
            });
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.international-icon {
    font-size: 20px;
    cursor: pointer;
    vertical-align: -5px !important;
    cursor: pointer;
}
</style>
