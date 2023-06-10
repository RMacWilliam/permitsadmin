import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources_en } from './i18n-en';
import { resources_fr } from './i18n-fr';
import { IKeyValue, IParentKeyValue } from "@/custom/app-context";
import { GlobalAppContext } from "../../constants";

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
    let result: string = "";

    if (obj != undefined) {
        if (GlobalAppContext != undefined && GlobalAppContext?.translation != undefined && GlobalAppContext.translation?.i18n != undefined) {
            result = (GlobalAppContext.translation.i18n.language === "fr" ? obj?.valueFr : obj?.value) ?? "";
        }
    }

    return result;
}
