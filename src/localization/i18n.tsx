import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources_en } from './i18n-en';
import { resources_fr } from './i18n-fr';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: resources_en,
            fr: resources_fr
        },

        lng: "en",
        fallbackLng: "en",
        supportedLngs: ["en", "fr"],
        //defaultNS: "fr",

        interpolation: {
            escapeValue: false
        },

        react: {
            useSuspense: false
        }
    });

export default i18n;