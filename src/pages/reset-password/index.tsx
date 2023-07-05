import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page";
import { IApiUpdatePasswordRequest, IApiUpdatePasswordResult, apiUpdatePassword } from "@/custom/api";
import { AppContext, IAppContextValues } from "@/custom/app-context";
import { checkResponseStatus, getApiErrorMessage, getQueryParam, iv, validatePassword } from "@/custom/utilities";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Constants } from "../../../global";

enum ResetPasswordMode {
    Initial = 0,
    Success = 1,
    Failure = 2
}

export default function ResetPasswordPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "reset-password" });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <UnauthenticatedPageLayout showAlert={showAlert}>
            <ResetPassword appContext={appContext} router={router} setShowAlert={setShowAlert}></ResetPassword>
        </UnauthenticatedPageLayout>
    )
}

function ResetPassword({ appContext, router, setShowAlert }:
    {
        appContext: IAppContextValues,
        router: NextRouter,
        setShowAlert: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [mode, setMode] = useState(ResetPasswordMode.Initial);

    const [code, setCode] = useState<string | undefined>("");

    const [errorMessage, setErrorMessage] = useState("");

    const [password, setPassword] = useState("");
    const [isPasswordValid, setIsPasswordValid] = useState<boolean | undefined>(undefined);
    const [isPasswordFormatValid, setIsPasswordFormatValid] = useState<boolean | undefined>(undefined);

    const [confirmPassword, setConfirmPassword] = useState("");
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState<boolean | undefined>(undefined);
    const [isConfirmPasswordMatchValid, setIsConfirmPasswordMatchValid] = useState<boolean | undefined>(undefined);

    const [recaptchaState, setRecaptchaState] = useState<string | undefined>(undefined);
    const [isRecaptchaValid, setIsRecaptchaValid] = useState(true);

    const t: Function = appContext.translation.t;

    useEffect(() => {
        setCode(getQueryParam("code", router));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query]);

    if (mode === ResetPasswordMode.Initial) {
        return (
            <>
                <Head>
                    <title>{t("ResetPassword.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h3 className="mb-3">{t("ResetPassword.Title")}</h3>

                {appContext.translation.i18n.language === "en" && (
                    <>
                        <p>Please enter your new password.</p>
                    </>
                )}

                {appContext.translation.i18n.language === "fr" && (
                    <>
                        <p>(fr)Please enter your new password.</p>
                    </>
                )}

                <div className="row justify-content-center gap-2 gap-md-0 gx-2 mb-2">
                    <div className="col-12 col-md-6">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isPasswordValid && isPasswordFormatValid)}`}>
                                <input type="text" className={`form-control ${iv(isPasswordValid && isPasswordFormatValid)}`} id="reset-password-password" placeholder={t("ResetPassword.Password")} maxLength={200} aria-describedby="reset-password-password-validation" value={password} onChange={(e: any) => setPassword(e.target.value)} />
                                <label className="required" htmlFor="reset-password-password">{t("ResetPassword.Password")}</label>
                            </div>
                            <div id="reset-password-password-validation" className="invalid-feedback">
                                {!isPasswordValid && (
                                    <>
                                        {t("ResetPassword.Password")} {t("Common.Validation.IsRequiredSuffix")}
                                    </>
                                )}

                                {isPasswordValid && !isPasswordFormatValid && (
                                    <>
                                        {t("ResetPassword.InvalidPassword")}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center gap-2 gap-md-0 gx-2 mb-2">
                    <div className="col-12 col-md-6">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isConfirmPasswordValid && isConfirmPasswordMatchValid)}`}>
                                <input type="text" className={`form-control ${iv(isConfirmPasswordValid && isConfirmPasswordMatchValid)}`} id="reset-password-confirm-password" placeholder={t("ResetPassword.ConfirmPassword")} maxLength={200} aria-describedby="reset-password-confirm-password-validation" value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} />
                                <label className="required" htmlFor="reset-password-confirm-password">{t("ResetPassword.ConfirmPassword")}</label>
                            </div>
                            <div id="reset-password-confirm-password-validation" className="invalid-feedback">
                                {!isConfirmPasswordValid && (
                                    <>
                                        {t("ResetPassword.ConfirmPassword")} {t("Common.Validation.IsRequiredSuffix")}
                                    </>
                                )}
                                {isConfirmPasswordValid && !isConfirmPasswordMatchValid && (
                                    <>
                                        {t("ResetPassword.InvalidPasswordMatch")}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center gap-2 gap-md-0 gx-2">
                    <div className="col-12 col-md-6">
                        <div className="input-group has-validation">
                            <ReCAPTCHA className={iv(isRecaptchaValid)} sitekey={Constants.CaptchaSiteKey} hl={appContext.data?.language === "fr" ? "fr-CA" : "en"}
                                aria-describedby="reset-password-recaptcha-validation" onChange={(e: any) => setRecaptchaState(e)} />
                            <div id="reset-password-recaptcha-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 pt-4">
                    <button className="btn btn-primary" onClick={() => savePassword()}>
                        {t("ResetPassword.SavePassword")}
                    </button>

                    <button className="btn btn-primary" onClick={() => router.push("/")}>
                        {t("ResetPassword.ReturnLogin")}
                    </button>
                </div>
            </>
        )
    } else if (mode === ResetPasswordMode.Success) {
        return (
            <>
                <Head>
                    <title>{t("ResetPassword.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h3 className="mb-3">{t("ResetPassword.Title")}</h3>

                {appContext.translation.i18n.language === "en" && (
                    <>
                        <p>Password successfully updated. Please log in with your new password.</p>
                    </>
                )}

                {appContext.translation.i18n.language === "fr" && (
                    <>
                        <p>Le mot de passe a été mis à jour avec succès. Veuillez accéder à votre compte à l'aide de votre nouveau mot de passe.</p>
                    </>
                )}

                <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 pt-4">
                    <button className="btn btn-primary" onClick={() => router.push("/")}>
                        {t("ResetPassword.ReturnLogin")}
                    </button>
                </div>
            </>
        )
    } else if (mode === ResetPasswordMode.Failure) {
        return (
            <>
                <Head>
                    <title>{t("ResetPassword.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h3 className="mb-3">{t("ResetPassword.Title")}</h3>

                {appContext.translation.i18n.language === "en" && (
                    <>
                        <p>An error occured when attempting to reset your password.</p>

                        <p>{getApiErrorMessage(errorMessage)}</p>

                        <p>{t("Common.ContactCustomerService")}</p>
                    </>
                )}

                {appContext.translation.i18n.language === "fr" && (
                    <>
                        <p>Une erreur est survenue lors de la tentative de réinitialisation de votre mot de passe.</p>

                        <p>{getApiErrorMessage(errorMessage)}</p>

                        <p>{t("Common.ContactCustomerService")}</p>
                    </>
                )}

                <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 pt-4">
                    <button className="btn btn-primary" onClick={() => router.push("/")}>
                        {t("ResetPassword.ReturnLogin")}
                    </button>
                </div>
            </>
        )
    }

    function savePassword(): void {
        if (validate()) {
            const apiUpdatePasswordRequest: IApiUpdatePasswordRequest = {
                code: code,
                password: password,
                recaptcha: recaptchaState
            };

            setShowAlert(true);

            apiUpdatePassword(apiUpdatePasswordRequest).subscribe({
                next: (result: IApiUpdatePasswordResult) => {
                    if (result?.isSuccessful && result?.data != undefined) {
                        if (result?.data?.isValid) {
                            setMode(ResetPasswordMode.Success);
                        } else {
                            setErrorMessage(result?.data?.message ?? "");
                            setMode(ResetPasswordMode.Failure);
                        }
                    } else {
                        // TODO: What do we do?
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

        if (password.trim() === "") {
            setIsPasswordValid(false);
            result = false;
        } else {
            setIsPasswordValid(true);
        }

        if (!validatePassword(password.trim())) {
            setIsPasswordFormatValid(false);
            result = false;
        } else {
            setIsPasswordFormatValid(true);
        }

        if (confirmPassword.trim() === "") {
            setIsConfirmPasswordValid(false);
            result = false;
        } else {
            setIsConfirmPasswordValid(true);
        }

        if (password.trim() !== confirmPassword.trim()) {
            setIsConfirmPasswordMatchValid(false);
            result = false;
        } else {
            setIsConfirmPasswordMatchValid(true);
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
