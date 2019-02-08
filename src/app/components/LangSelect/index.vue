<template>
    <el-dropdown trigger="click" class="international" @command="handleSetLanguage">
        <i class="fa fa-globe" aria-hidden="true"></i>
        <el-dropdown-menu slot="dropdown" class="language-dropdown">
            <el-dropdown-item v-for="lang in languages" :key="lang" :command="lang" :disabled="language === lang">
                {{ $t("components.LangSelect.language." + lang) }}
            </el-dropdown-item>
        </el-dropdown-menu>
    </el-dropdown>
</template>
<script>
import { sortAlphaNum } from "@/utils/helpers.js";
export default {
    computed: {
        languages() {
            return Object.keys(this.$i18n.messages).sort(sortAlphaNum);
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
                message: this.$t("components.LangSelect.language_changed"),
                type: "success"
            });
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.international:hover {
    > i {
        color: #35224a;
    }
}
.language-dropdown {
    top: 40px !important;
    max-height: 300px;
    overflow: scroll;
    overflow-x: scroll;
    overflow-x: hidden;
    > li:hover {
        color: #35224a;
    }
}
</style>
