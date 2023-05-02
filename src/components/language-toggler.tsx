import { AppContext } from "@/custom/app-context";
import { useContext } from "react";

export default function LanguageToggler({ isTogglerItem, isTextShort, className }: { isTogglerItem: boolean, isTextShort: boolean, className: string }) {
    const appContext = useContext(AppContext);

    if (isTogglerItem) {
        return (
            <span style={{ cursor: "pointer" }} onClick={() => toggleLanguage()}>
                {getLanguageTextLong()}
            </span>
        )
    } else {
        return (
            <div className={className}>
                <span className="fw-semibold" style={{ cursor: "pointer" }} onClick={() => toggleLanguage()}>
                    {isTextShort && getLanguageTextShort()}
                    {!isTextShort && getLanguageTextLong()}
                </span>
            </div>
        )
    }

    function getLanguageTextLong(): string {
        let result: string = "Français";

        result = (appContext?.translation?.i18n?.language ?? "en") === "en" ? "Français" : "English";

        return result;
    }

    function getLanguageTextShort(): string {
        let result: string = "FR";

        result = (appContext?.translation?.i18n?.language ?? "en") === "en" ? "FR" : "EN";

        return result;
    }

    function toggleLanguage(): void {
        if (appContext?.translation?.i18n != undefined) {
            let currentLanguage: string = appContext.translation.i18n?.language ?? "en";
            let newLanguage: string = currentLanguage === "en" ? "fr" : "en";

            appContext.translation.i18n.changeLanguage(newLanguage);

            appContext.updater(draft => {
                draft.language = newLanguage;
            });
        }
    }
}