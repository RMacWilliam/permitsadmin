import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page";
import { AppContext, IAppContextValues } from "@/custom/app-context";
import { getQueryParam } from "@/custom/utilities";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

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

    const [code, setCode] = useState<string | undefined>("");

    const t: Function = appContext.translation.t;

    useEffect(() => {
        setCode(getQueryParam("code", router));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query]);

    return (
        <>
            <Head>
                <title>{t("ResetPassword.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h3 className="mb-3">{t("ResetPassword.Title")}</h3>

            {appContext.translation.i18n.language === "en" && (
                <>
                    <p>asdf</p>
                </>
            )}

            {appContext.translation.i18n.language === "fr" && (
                <>
                    <p>asdf</p>
                </>
            )}

            <div className="card">
                <div className="card-body text-center">
                    <button className="btn btn-primary" onClick={() => router.push("/")}>
                        {t("ResetPassword.ReturnLogin")}
                    </button>
                </div>
            </div>
        </>
    )
}
