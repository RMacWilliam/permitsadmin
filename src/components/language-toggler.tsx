import { AppContext } from "@/custom/app-context";
import { useContext } from "react";

export default function LanguageToggler({ isTextShort, className }: { isTextShort: boolean, className: string }) {
    const appContext = useContext(AppContext);

    return (
        <span className={`fw-semibold ${className}`} style={{ cursor: "pointer" }} onClick={() => toggleLanguage()}>
            {isTextShort && getLanguageTextShort()}
            {!isTextShort && getLanguageTextLong()}
        </span>
    )

    function getLanguageTextLong(): string {
        let result: string = "Français";

        result = appContext.translation.i18n.language === "en" ? "Français" : "English";

        return result;
    }

    function getLanguageTextShort(): string {
        let result: string = "FR";

        result = appContext.translation.i18n.language === "en" ? "FR" : "EN";

        return result;
    }

    function toggleLanguage(): void {
        if (appContext.translation.i18n != undefined) {
            const currentLanguage: string = appContext.translation.i18n.language ?? "en";
            const newLanguage: string = currentLanguage === "en" ? "fr" : "en";

            appContext.translation.i18n.changeLanguage(newLanguage);

            appContext.updater(draft => {
                draft.language = newLanguage;
            });
        }
    }
}