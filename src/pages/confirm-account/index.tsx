import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page";
import { IApiVerifyAccountRequest, IApiVerifyAccountResult, apiVerifyAccount } from "@/custom/api";
import { AppContext, IAppContextValues } from "@/custom/app-context";
import { checkResponseStatus, getApiErrorMessage, getQueryParam } from "@/custom/utilities";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

enum ConfirmAccountMode {
    Verifying = 0,
    Success = 1,
    Failure = 2
}

export default function ConfirmAccountPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(true);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "confirm-account" });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <UnauthenticatedPageLayout showAlert={showAlert}>
            <ConfirmAccount appContext={appContext} router={router} setShowAlert={setShowAlert}></ConfirmAccount>
        </UnauthenticatedPageLayout>
    )
}

function ConfirmAccount({ appContext, router, setShowAlert }:
    {
        appContext: IAppContextValues,
        router: NextRouter,
        setShowAlert: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [mode, setMode] = useState(ConfirmAccountMode.Verifying);

    const [code, setCode] = useState<string | undefined>("");

    const [errorMessage, setErrorMessage] = useState("");

    const t: Function = appContext.translation.t;

    useEffect(() => {
        setCode(getQueryParam("code", router));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query]);

    useEffect(() => {
        if (code != undefined && code !== "") {
            const apiVerifyAccountRequest: IApiVerifyAccountRequest = {
                code: code
            };

            setShowAlert(true);

            apiVerifyAccount(apiVerifyAccountRequest).subscribe({
                next: (result: IApiVerifyAccountResult) => {
                    if (result?.isSuccessful && result?.data != undefined) {
                        if (result?.data?.isValid) {
                            setMode(ConfirmAccountMode.Success);
                        } else {
                            setErrorMessage(result?.data?.message ?? "");
                            setMode(ConfirmAccountMode.Failure);
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
    }, [code]);

    if (mode === ConfirmAccountMode.Verifying) {
        return (
            <>
                <Head>
                    <title>{t("ConfirmAccount.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h3 className="mb-3">{t("ConfirmAccount.Title")}</h3>

                {appContext.translation.i18n.language === "en" && (
                    <>
                        <p>Please wait while we verify your account.</p>
                    </>
                )}

                {appContext.translation.i18n.language === "fr" && (
                    <>
                        <p>Veuillez patienter pendant que nous vérifions votre compte.</p>
                    </>
                )}
            </>
        )
    } else if (mode === ConfirmAccountMode.Success) {
        return (
            <>
                <Head>
                    <title>{t("ConfirmAccount.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h3 className="mb-3">{t("ConfirmAccount.Title")}</h3>

                {appContext.translation.i18n.language === "en" && (
                    <>
                        <p>Thank you for verifying your account.</p>
                    </>
                )}

                {appContext.translation.i18n.language === "fr" && (
                    <>
                        <p>Merci d'avoir vérifié votre compte.</p>
                    </>
                )}

                <div className="card">
                    <div className="card-body text-center">
                        <button className="btn btn-primary" onClick={() => router.push("/")}>
                            {t("ConfirmAccount.ReturnLogin")}
                        </button>
                    </div>
                </div>
            </>
        )
    } else if (mode === ConfirmAccountMode.Failure) {
        return (
            <>
                <Head>
                    <title>{t("ConfirmAccount.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h3 className="mb-3">{t("ConfirmAccount.Title")}</h3>

                {appContext.translation.i18n.language === "en" && (
                    <>
                        <p>An error occurred while verifying your account.</p>

                        <p>{getApiErrorMessage(errorMessage)}</p>

                        <p>{t("Common.ContactCustomerService")}</p>
                    </>
                )}

                {appContext.translation.i18n.language === "fr" && (
                    <>
                        <p>Une erreur est survenue lors de la vérification de votre compte.</p>

                        <p>{getApiErrorMessage(errorMessage)}</p>

                        <p>{t("Common.ContactCustomerService")}</p>
                    </>
                )}

                <div className="card">
                    <div className="card-body text-center">
                        <button className="btn btn-primary" onClick={() => router.push("/")}>
                            {t("ConfirmAccount.ReturnLogin")}
                        </button>
                    </div>
                </div>
            </>
        )
    }
}
