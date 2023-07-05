import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page"
import { AppContext, IAppContextValues } from "@/custom/app-context";
import Head from "next/head"
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Constants } from "../../../global";
import { checkResponseStatus, getApiErrorMessage, iv } from "@/custom/utilities";
import { IApiPasswordResetRequest, IApiPasswordResetResult, apiPasswordReset } from "@/custom/api";

enum ForgotPasswordMode {
    Initial = 0,
    Success = 1
}

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

    const [mode, setMode] = useState<ForgotPasswordMode>(ForgotPasswordMode.Initial);

    const [errorMessage, setErrorMessage] = useState("");

    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState<boolean | undefined>(undefined);

    const [recaptchaState, setRecaptchaState] = useState<string | undefined>(undefined);
    const [isRecaptchaValid, setIsRecaptchaValid] = useState(true);

    const t: Function = appContext.translation.t;

    if (mode === ForgotPasswordMode.Initial) {
        return (
            <>
                <Head>
                    <title>{t("ForgotPassword.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                {errorMessage !== "" && (
                    <div className="">
                        <div className="col-12">
                            <div className="alert alert-danger" role="alert">
                                {getApiErrorMessage(errorMessage)}
                            </div>
                        </div>
                    </div>
                )}

                <h3 className="mb-3">{t("ForgotPassword.Title")}</h3>

                {appContext.translation.i18n.language === "en" && (
                    <>
                        <p>If you are unable to login to your account, please try resetting your password. An e-mail will be sent to you to change your password.</p>

                        <p>{t("Common.ContactCustomerService")}</p>
                    </>
                )}

                {appContext.translation.i18n.language === "fr" && (
                    <>
                        <p>Si vous êtes incapable d'accéder à votre compte, veuillez essayer de réinitialiser votre mot de passe. Un courriel vous sera envoyé pour que vous puissiez changer votre mot de passe.</p>

                        <p>{t("Common.ContactCustomerService")}</p>
                    </>
                )}

                <div className="row justify-content-center gap-2 gap-md-0 gx-2 mb-2">
                    <div className="col-12 col-md-6">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isEmailValid)}`}>
                                <input type="email" className={`form-control ${iv(isEmailValid)}`} id="forgot-password-email" placeholder={t("ForgotPassword.EmailAddress")} maxLength={200} aria-describedby="forgot-password-email-validation" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                                <label className="required" htmlFor="forgot-password-email">{t("ForgotPassword.EmailAddress")}</label>
                            </div>
                            <div id="forgot-password-email-validation" className="invalid-feedback">{t("ForgotPassword.EmailAddress")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center gap-2 gap-md-0 gx-2">
                    <div className="col-12 col-md-6">
                        <div className="input-group has-validation">
                            <ReCAPTCHA className={iv(isRecaptchaValid)} sitekey={Constants.CaptchaSiteKey} hl={appContext.data?.language === "fr" ? "fr-CA" : "en"}
                                aria-describedby="forgot-password-recaptcha-validation" onChange={(e: any) => setRecaptchaState(e)} />
                            <div id="forgot-password-recaptcha-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-4">
                    <button className="btn btn-primary" onClick={() => resetPasswordClick()}>
                        {t("ForgotPassword.ResetPasswordButton")}
                    </button>

                    <button className="btn btn-primary" onClick={() => router.push("/")}>
                        {t("Common.Buttons.Cancel")}
                    </button>
                </div>
            </>
        )
    } else if (mode === ForgotPasswordMode.Success) {
        return (
            <>
                <Head>
                    <title>{t("ForgotPassword.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h3 className="mb-3">{t("ForgotPassword.Title")}</h3>

                {appContext.translation.i18n.language === "en" && (
                    <>
                        <p>A request to reset your password was submitted successfully.</p>

                        <p>If the specified account is valid, then an e-mail will be sent with
                            instructions to reset your password.</p>
                    </>
                )}

                {appContext.translation.i18n.language === "fr" && (
                    <>
                        <p>Une demande de réinitialisation de votre mot de passe a été soumise avec succès.</p>

                        <p>Si le compte spécifié est valide, un e-mail sera envoyé avec des instructions pour réinitialiser votre mot de passe.</p>
                    </>
                )}

                <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-4">
                    <button className="btn btn-primary" onClick={() => router.push("/")}>
                        {t("ResetPassword.ReturnLogin")}
                    </button>
                </div>
            </>
        )
    }

    function resetPasswordClick(): void {
        setErrorMessage("");

        if (validate()) {
            const apiPasswordResetRequest: IApiPasswordResetRequest | undefined = {
                email: email,
                recaptcha: recaptchaState
            };

            setShowAlert(true);

            apiPasswordReset(apiPasswordResetRequest).subscribe({
                next: (result: IApiPasswordResetResult) => {
                    if (result?.isSuccessful) {
                        setMode(1);
                    } else {
                        setErrorMessage(result?.errorMessage ?? "");
                    }
                },
                error: (error: any) => {
                    checkResponseStatus(error);
                },
                complete: () => {
                    setShowAlert(false);
                }
            });
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
