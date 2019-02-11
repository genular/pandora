/*
 * @Author: LogIN-
 * @Date:   2018-10-31 11:23:36
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2019-02-11 09:48:01
 */
import Vue from "vue";
import VueI18n from "vue-i18n";
import estore from "@/utils/storage/settings";

import elementEnLocale from "element-ui/lib/locale/lang/en";
import translations from "@/translations/files/translated/en.json";


Vue.use(VueI18n);
const i18n = new VueI18n({
	locale: estore.get("main-language") || window.navigator.language || window.navigator.userLanguage || "en",
	fallbackLocale: "en",
	messages: { "en": { ...translations, ...elementEnLocale }}
});

export default i18n;
