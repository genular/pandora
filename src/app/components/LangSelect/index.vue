<template>
    <el-dropdown trigger="click" class="international" @command="handleSetLanguage">
        <i class="fa fa-globe" aria-hidden="true"></i>
        <el-dropdown-menu slot="dropdown" class="language-dropdown">
            <el-dropdown-item v-for="lang in getLanguages()" :key="lang" :command="lang" :disabled="language === lang">
                {{ $t("components.LangSelect.language." + lang) }}
            </el-dropdown-item>
        </el-dropdown-menu>
    </el-dropdown>
</template>
<script>
import { sortAlphaNum } from "@/utils/helpers.js";
/**
 * This file is auto-generated via webpack plug-in:
 * src/app/translations/plugins/prepareMessagesPlugin.js
 */
import supportedLocales from "@/translations/files/langs.json";

export default {
    computed: {
        language() {
            return this.$store.getters.language;
        },
    },
    mounted() {
        console.log("Detected languages: " + this.getLanguages());
        console.log("Detected user language: " + this.language);
        this.initUserLanguage();
    },
    methods: {
        initUserLanguage() {
            const loadedLanguages = Object.keys(this.$i18n.messages);
            if (!loadedLanguages.includes(this.language)) {
                this.handleSetLanguage(this.language);
            }
        },
        getLanguages() {
            return supportedLocales.filter((lang) => lang !== "ach");
        },
        setI18nLanguage(lang) {
            this.$i18n.locale = lang;
            document.querySelector("html").setAttribute("lang", lang);
            this.$store.dispatch("setLanguage", lang);

            this.$message({
                message: this.$t("components.LangSelect.language_changed"),
                type: "success",
            });
        },
        handleSetLanguage(lang) {
            if (!Object.keys(this.$i18n.messages).includes(lang)) {
                import(/*   webpackMode:      "lazy",
                                webpackChunkName: "language-`${lang}`" */ `@/translations/files/translated/${lang}.json`).then(
                    (msgs) => {
                        this.$i18n.setLocaleMessage(lang, msgs.default);

                        this.setI18nLanguage(lang);
                    }
                );
            } else {
                this.setI18nLanguage(lang);
            }
        },
    },
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.international:hover {
    i {
        color: #000000;
    }
}
.language-dropdown {
    max-height: 300px;
    overflow: scroll;
    overflow-x: scroll;
    overflow-x: hidden;
    > li:hover {
        color: #35224a;
    }
}
</style>
