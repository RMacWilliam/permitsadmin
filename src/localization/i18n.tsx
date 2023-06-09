import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources_en } from './i18n-en';
import { resources_fr } from './i18n-fr';
import { IKeyValue, IParentKeyValue } from "@/custom/app-context";
import { GlobalAppContext } from "../../global";

export default i18n
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

export function getLocalizedValue(obj: IKeyValue | IParentKeyValue | undefined): string {
    return (GlobalAppContext?.translation?.i18n?.language === "fr" ? obj?.valueFr : obj?.value) ?? "";
}

export function getLocalizedValue2(value: string | undefined, valueFr: string | undefined): string {
    return (GlobalAppContext?.translation?.i18n?.language === "fr" ? valueFr : value) ?? "";
}