/*
 * @Author: LogIN-
 * @Date:   2018-10-31 11:23:36
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2019-01-22 14:22:27
 */
import Vue from "vue";
import VueI18n from "vue-i18n";

import estore from "@/utils/storage/settings";

import elementEnLocale from "element-ui/lib/locale/lang/en"; // element-ui lang
import elementDeLocale from "element-ui/lib/locale/lang/de"; // element-ui lang

import supportedLocales from "./supported-locales.json";

import translations from "./translated-messages.json";

Vue.use(VueI18n);

const messages = {};

for (let locIndex in supportedLocales) {
	if (supportedLocales.hasOwnProperty(locIndex)) {
		let locale = supportedLocales[locIndex];
		console.log("Looping: " + locale);

		if (!(locale in messages)) {
			messages[locale] = { ...translations[locale], ...elementEnLocale };
			console.log("add locale: " + locale);
		}
	}
}

const i18n = new VueI18n({
	// locale: estore.get("language") || "en-US",
	locale: "en-US",
	messages: messages
});

export default i18n;
