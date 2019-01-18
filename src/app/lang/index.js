import Vue from "vue";
import VueI18n from "vue-i18n";

import estore from "@/utils/storage/settings";


import elementEnLocale from "element-ui/lib/locale/lang/en"; // element-ui lang
import elementDeLocale from "element-ui/lib/locale/lang/de"; // element-ui lang

import enLocale from "./locale/en";
import deLocale from "./locale/de";

Vue.use(VueI18n);

const messages = {
    en: {
        ...enLocale,
        ...elementEnLocale
    },
    de: {
        ...deLocale,
        ...elementDeLocale
    }
};

const i18n = new VueI18n({
    locale: estore.get("language") || "en", // set locale
    messages // set locale messages
});

export default i18n;
