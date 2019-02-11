/*
 * @Author: LogIN-
 * @Date:   2018-10-31 11:23:36
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2019-02-11 07:57:15
 */
import Vue from "vue";
import VueI18n from "vue-i18n";

import estore from "@/utils/storage/settings";

import elementEnLocale from "element-ui/lib/locale/lang/en"; // element-ui lang
import elementDeLocale from "element-ui/lib/locale/lang/de"; // element-ui lang

// import supportedLocales from "./supported-locales.json";
// import translations from "./compiled/translated-messages.json";

Vue.use(VueI18n);

const languages = {};

// TODO: load translations on request
// https://medium.com/hypefactors/add-i18n-and-manage-translations-of-a-vue-js-powered-website-73b4511ca69c
// 
for (let locIndex in supportedLocales) {
	if (supportedLocales.hasOwnProperty(locIndex)) {
		let locale = supportedLocales[locIndex];
		if (!(locale in languages)) {
			languages[locale] = { ...translations[locale], ...elementEnLocale };
		}
	}
}
const messages = Object.assign(languages);
const i18n = new VueI18n({
	locale: estore.get("main-language") || window.navigator.language || window.navigator.userLanguage || "en-US",
	fallbackLocale: "en-US",
	messages
});

export default i18n;
