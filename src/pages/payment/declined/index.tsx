import AuthenticatedPageLayout from "@/components/layouts/authenticated-page"
import { AppContext, IAppContextValues, IGiftCard, ISnowmobile } from "@/custom/app-context";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Subscription } from "rxjs";
import $ from 'jquery';
import { IApiMonerisCompleteRequest, IApiMonerisCompleteResult, IApiSavePrePurchaseDataRequest, IApiSavePrePurchaseDataResult, IApiSavePrePurchaseDataResultData, apiMonerisComplete, apiSavePrePurchaseData } from "@/custom/api";
import { checkResponseStatus } from "@/custom/utilities";

declare var monerisCheckout: any;

export default function PaymentPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "payment" });

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

    const t: Function = appContext.translation.t;

    return (
        <>
            <Head>
                <title>{t("PaymentDeclined.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h4 className="mb-3">{t("PaymentDeclined.Title")}</h4>


            {appContext.translation.i18n.language === "en" && (
                <>
                    <p>Your credit card was declined. Please be advised that after 3 unsuccessful attempts, you will not be able to access your account. If this occurs, please contact permits@ofsc.on.ca.</p>
                </>
            )}

            {appContext.translation.i18n.language === "fr" && (
                <>
                    <p>(fr)Votre carte de crédit a été refusée. Please be advised that after 3 unsuccessful attempts, you will not be able to access your account. If this occurs, please contact permits@ofsc.on.ca.</p>
                </>
            )}
        </>
    )
}
