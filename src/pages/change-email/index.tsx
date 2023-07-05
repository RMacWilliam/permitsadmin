import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page"
import { AppContext, IAppContextValues, IKeyValue } from "@/custom/app-context";
import { checkResponseStatus, getApiErrorMessage, getKeyValueFromSelect, iv, sortArray } from "@/custom/utilities";
import { getLocalizedValue } from "@/localization/i18n";
import Head from "next/head"
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Constants } from "../../../global";
import { IApiGetPermitTypesResult, IApiUpdateEmailRequest, IApiUpdateEmailResult, apiGetPermitTypes, apiUpdateEmail } from "@/custom/api";
import { Observable, Subscription, forkJoin } from "rxjs";

enum ChangeEmailMode {
    Initial = 0,
    Success = 2,
    Failure = 3
}

export default function ChangeEmailPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "change-email" });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <UnauthenticatedPageLayout showAlert={showAlert}>
            <ChangeEmail appContext={appContext} router={router} setShowAlert={setShowAlert}></ChangeEmail>
        </UnauthenticatedPageLayout>
    )
}

function ChangeEmail({ appContext, router, setShowAlert }
    : {
        appContext: IAppContextValues,
        router: NextRouter,
        setShowAlert: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [mode, setMode] = useState(ChangeEmailMode.Initial);

    const [errorMessage, setErrorMessage] = useState("");

    const [oldEmail, setOldEmail] = useState("");
    const [isOldEmailValid, setIsOldEmailValid] = useState<boolean | undefined>(undefined);

    const [newEmail, setNewEmail] = useState("");
    const [isNewEmailValid, setIsNewEmailValid] = useState<boolean | undefined>(undefined);

    const [vin, setVin] = useState("");
    const [isVinValid, setIsVinValid] = useState<boolean | undefined>(undefined);

    const [permitType, setPermitType] = useState<IKeyValue>({ key: "", value: "" });
    const [isPermitTypeValid, setIsPermitTypeValid] = useState<boolean | undefined>(undefined);

    const [recaptchaState, setRecaptchaState] = useState<string | undefined>(undefined);
    const [isRecaptchaValid, setIsRecaptchaValid] = useState(true);

    const [permitTypesData, setPermitTypesData] = useState<IKeyValue[]>([]);

    const t: Function = appContext.translation.t;

    useEffect(() => {
        // Get data from api.
        const batchApi: Observable<any>[] = [
            apiGetPermitTypes()
        ];

        const subscription: Subscription = forkJoin(batchApi).subscribe({
            next: (results: any[]) => {
                // apiGetPermitTypes
                const apiGetPermitTypesResult: IApiGetPermitTypesResult[] = results[0] as IApiGetPermitTypesResult[];

                if (apiGetPermitTypesResult != undefined && apiGetPermitTypesResult.length > 0) {
                    const permitTypes: IKeyValue[] = apiGetPermitTypesResult.map<IKeyValue>(x => ({
                        key: x?.key ?? "",
                        value: x?.value ?? "",
                        valueFr: x?.valueFr ?? ""
                    }));

                    setPermitTypesData(permitTypes);
                }
            },
            error: (error: any) => {
                checkResponseStatus(error);
            },
            complete: () => {
                setShowAlert(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (mode === ChangeEmailMode.Initial) {
        return (
            <>
                <Head>
                    <title>{t("ChangeEmail.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h3 className="mb-3">{t("ChangeEmail.Title")}</h3>

                {appContext.translation.i18n.language === "en" && (
                    <>
                        <p>If you know your password, just log in and you can change your e-mail address in your account profile.</p>

                        <p>If you do not know your password and wish to change your e-mail address, you must enter the VIN of the sled and the permit type of your
                            most recent purchase. If you purchased multiple permits for different sleds at the same time, please enter the details for any one
                            of the machines from your most recent transaction.</p>
                    </>
                )}

                {appContext.translation.i18n.language === "fr" && (
                    <>
                        <p>(fr)If you know your password, just log in and you can change your e-mail address in your account profile.</p>

                        <p>(fr)If you do not know your password and wish to change your e-mail address, you must enter the VIN of the sled and the permit type of your
                            most recent purchase. If you purchased multiple permits for different sleds at the same time, please enter the details for any one
                            of the machines from your most recent transaction.</p>
                    </>
                )}

                <div className="row justify-content-center gap-2 gap-md-0 gx-2 mb-2">
                    <div className="col-12 col-md-6">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isOldEmailValid)}`}>
                                <input type="email" className={`form-control ${iv(isOldEmailValid)}`} id="change-email-old-email" placeholder={t("ChangeEmail.OldEmailAddress")} maxLength={200} aria-describedby="change-email-old-email-validation" value={oldEmail} onChange={(e: any) => setOldEmail(e.target.value)} />
                                <label className="required" htmlFor="change-email-old-email">{t("ChangeEmail.OldEmailAddress")}</label>
                            </div>
                            <div id="change-email-old-email-validation" className="invalid-feedback">{t("ChangeEmail.OldEmailAddress")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center gap-2 gap-md-0 gx-2 mb-2">
                    <div className="col-12 col-md-6">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isNewEmailValid)}`}>
                                <input type="email" className={`form-control ${iv(isNewEmailValid)}`} id="change-email-new-email" placeholder={t("ChangeEmail.NewEmailAddress")} maxLength={200} aria-describedby="change-email-new-email-validation" value={newEmail} onChange={(e: any) => setNewEmail(e.target.value)} />
                                <label className="required" htmlFor="change-email-new-email">{t("ChangeEmail.NewEmailAddress")}</label>
                            </div>
                            <div id="change-email-new-email-validation" className="invalid-feedback">{t("ChangeEmail.NewEmailAddress")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center gap-2 gap-md-0 gx-2 mb-2">
                    <div className="col-12 col-md-6">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isVinValid)}`}>
                                <input type="text" className={`form-control ${iv(isVinValid)}`} id="change-email-vin" placeholder={t("ChangeEmail.Vin")} maxLength={17} aria-describedby="change-email-vin-validation" value={vin} onChange={(e: any) => setVin(e.target.value)} />
                                <label className="required" htmlFor="change-email-vin">{t("ChangeEmail.Vin")}</label>
                            </div>
                            <div id="change-email-vin-validation" className="invalid-feedback">{t("ChangeEmail.Vin")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center gap-2 gap-md-0 gx-2 mb-2">
                    <div className="col-12 col-md-6">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isPermitTypeValid)}`}>
                                <select className={`form-select ${iv(isPermitTypeValid)}`} id="change-email-permit-type" aria-label={t("ChangeEmail.PermitType")} aria-describedby="change-email-permit-type-validation" value={permitType.key} onChange={(e: any) => permitTypeChange(e)}>
                                    <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                    {permitTypesData != undefined && permitTypesData.length > 0 && getPermitTypesData().map(permitTypeData => (
                                        <option value={permitTypeData.key} key={permitTypeData.key}>{getLocalizedValue(permitTypeData)}</option>
                                    ))}
                                </select>
                                <label className="required" htmlFor="change-email-permit-type">{t("ChangeEmail.PermitType")}</label>
                            </div>
                            <div id="change-email-permit-type-validation" className="invalid-feedback">{t("ChangeEmail.PermitType")} {t("Common.Validation.IsRequiredSuffix")}</div>
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
                    <button className="btn btn-primary" onClick={() => changeEmail()}>
                        {t("ChangeEmail.ChangeEmailWithoutPassword")}
                    </button>

                    <button className="btn btn-primary" onClick={() => router.push("/")}>
                        {t("ResetPassword.ReturnLogin")}
                    </button>
                </div>
            </>
        )
    } else if (mode === ChangeEmailMode.Success) {
        return (
            <>
                <Head>
                    <title>{t("ChangeEmail.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h3 className="mb-3">{t("ChangeEmail.Title")}</h3>

                {appContext.translation.i18n.language === "en" && (
                    <>
                        <p>Your e-mail address was updated successfully. Please log in with your new e-mail address.</p>
                    </>
                )}

                {appContext.translation.i18n.language === "fr" && (
                    <>
                        <p>Votre adresse courriel a été mise à jour avec succès. Veuillez vous connecter avec votre nouvelle adresse courriel.</p>
                    </>
                )}

                <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 pt-4">
                    <button className="btn btn-primary" onClick={() => router.push("/")}>
                        {t("ResetPassword.ReturnLogin")}
                    </button>
                </div>
            </>
        )
    } else if (mode === ChangeEmailMode.Failure) {
        return (
            <>
                <Head>
                    <title>{t("ChangeEmail.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h3 className="mb-3">{t("ChangeEmail.Title")}</h3>

                {appContext.translation.i18n.language === "en" && (
                    <>
                        <p>An error occured while attempting to update your e-mail address.</p>

                        <p>{getApiErrorMessage(errorMessage)}</p>

                        <p>{t("Common.ContactCustomerService")}</p>
                    </>
                )}

                {appContext.translation.i18n.language === "fr" && (
                    <>
                        <p>Une erreur est survenue lors de la tentative de mise à jour de votre adresse courriel.</p>

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

    function getPermitTypesData(): IKeyValue[] {
        return sortArray(permitTypesData, ["value"]) || [];
    }

    function permitTypeChange(e: any): void {
        setPermitType(getKeyValueFromSelect(e) ?? { key: "", value: "" });
    }

    function changeEmail(): void {
        if (validate()) {
            const apiUpdateEmailRequest: IApiUpdateEmailRequest = {
                oldEmail: oldEmail,
                newEmail: newEmail,
                vin: vin,
                permitType: Number(permitType?.key),
                recaptcha: recaptchaState
            };

            apiUpdateEmail(apiUpdateEmailRequest).subscribe({
                next: (result: IApiUpdateEmailResult) => {
                    if (result?.isSuccessful && result?.data != undefined) {
                        if (result?.data?.isValid) {
                            setMode(ChangeEmailMode.Success);
                        } else {
                            setErrorMessage(result?.errorMessage ?? "");
                            setMode(ChangeEmailMode.Failure);
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

        if (oldEmail.trim() === "") {
            setIsOldEmailValid(false);
            result = false;
        } else {
            setIsOldEmailValid(true);
        }

        if (newEmail.trim() === "") {
            setIsNewEmailValid(false);
            result = false;
        } else {
            setIsNewEmailValid(true);
        }

        if (vin.trim() === "") {
            setIsVinValid(false);
            result = false;
        } else {
            setIsVinValid(true);
        }

        if (permitType?.key == undefined || permitType.key === "") {
            setIsPermitTypeValid(false);
            result = false;
        } else {
            setIsPermitTypeValid(true);
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
