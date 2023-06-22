import AuthenticatedPageLayout from "@/components/layouts/authenticated-page"
import { AppContext, IAppContextValues } from "@/custom/app-context";
import { getQueryParam } from "@/custom/utilities";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

export default function PaymentDeclinedPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "declined" });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthenticatedPageLayout showAlert={showAlert}>
            <PaymentDeclined appContext={appContext} router={router} setShowAlert={setShowAlert}></PaymentDeclined>
        </AuthenticatedPageLayout>
    )
}

function PaymentDeclined({ appContext, router, setShowAlert }:
    {
        appContext: IAppContextValues,
        router: NextRouter,
        setShowAlert: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [orderId, setOrderId] = useState(undefined as string | undefined);

    const t: Function = appContext.translation.t;

    useEffect(() => {
        setOrderId(getQueryParam("orderId", router));
    }, [router.query]);

    return (
        <>
            <Head>
                <title>{t("PaymentDeclined.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h4 className="mb-3">{t("PaymentDeclined.Title")}</h4>


            {appContext.translation.i18n.language === "en" && (
                <>
                    <p>Your credit card was declined. Please try again.</p>
                </>
            )}

            {appContext.translation.i18n.language === "fr" && (
                <>
                    <p>(fr)Votre carte de crédit a été refusée. Please try again.</p>
                </>
            )}

            <div className="card">
                <div className="card-body text-center">
                    <button className="btn btn-primary" onClick={() => router.push("/payment")}>
                        {t("PaymentDeclined.TryAgain")}
                    </button>
                </div>
            </div>
        </>
    )
}
