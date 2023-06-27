import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page"
import { AppContext, IAppContextValues } from "@/custom/app-context";
import Head from "next/head"
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Constants } from "../../../global";
import { iv } from "@/custom/utilities";

export default function ForgotPasswordPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "forgot-password" });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <UnauthenticatedPageLayout showAlert={showAlert}>
            <ForgotPassword appContext={appContext} router={router} setShowAlert={setShowAlert}></ForgotPassword>
        </UnauthenticatedPageLayout>
    )
}

function ForgotPassword({ appContext, router, setShowAlert }:
    {
        appContext: IAppContextValues,
        router: NextRouter,
        setShowAlert: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState<boolean | undefined>(undefined);

    const [recaptchaState, setRecaptchaState] = useState<string | undefined>(undefined);
    const [isRecaptchaValid, setIsRecaptchaValid] = useState(true);

    const t: Function = appContext.translation.t;

    return (
        <>
            <Head>
                <title>{t("ForgotPassword.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h3 className="mb-3">{t("ForgotPassword.Title")}</h3>

            <p>{t("ForgotPassword.Section1")}</p>

            <p>{t("ForgotPassword.Section2")}</p>

            <div className="row gap-2 gap-md-0 gx-2 mb-4">
                <div className="col-12">
                    <div className="input-group has-validation">
                        <div className={`form-floating ${iv(isEmailValid)}`}>
                            <input type="email" className={`form-control ${iv(isEmailValid)}`} id="forgot-password-email" placeholder={t("ForgotPassword.EmailAddress")} maxLength={200} aria-describedby="forgot-password-email-validation" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                            <label className="required" htmlFor="forgot-password-email">{t("ForgotPassword.EmailAddress")}</label>
                        </div>
                        <div id="forgot-password-email-validation" className="invalid-feedback">{t("ForgotPassword.EmailAddress")} {t("Common.Validation.IsRequiredSuffix")}</div>
                    </div>
                </div>
            </div>

            <div className="row gap-2 gap-md-0 gx-2 mb-2">
                <div className="col-12">
                    <div className="input-group has-validation">
                        <ReCAPTCHA className={iv(isRecaptchaValid)} sitekey={Constants.CaptchaSiteKey} hl={appContext.data?.language === "fr" ? "fr-CA" : "en"}
                            onChange={(e: any) => setRecaptchaState(e)}
                        />
                        <div id="recaptcha-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-3">
                <button className="btn btn-primary" onClick={() => resetPasswordClick()}>
                    {t("ForgotPassword.ResetPasswordButton")}
                </button>

                <button className="btn btn-primary" onClick={() => router.push("/")}>
                    {t("Common.Buttons.Cancel")}
                </button>
            </div>
        </>
    )

    function resetPasswordClick(): void {
        if (validate()) {

        }
    }

    function validate(): boolean {
        let result: boolean = true;

        if (email.trim() === "") {
            setIsEmailValid(false);
            result = false;
        } else {
            setIsEmailValid(true);
        }

        if (recaptchaState == undefined || recaptchaState === "") {
            setIsRecaptchaValid(false);
            result = false;
        } else {
            setIsRecaptchaValid(true);
        }

        return result;
    }
}
