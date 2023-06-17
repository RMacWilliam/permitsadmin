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
            <PaymentApproved appContext={appContext} router={router} setShowAlert={setShowAlert}></PaymentApproved>
        </AuthenticatedPageLayout>
    )
}

function PaymentApproved({ appContext, router, setShowAlert }:
    {
        appContext: IAppContextValues,
        router: NextRouter,
        setShowAlert: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const t: Function = appContext.translation.t;

    return (
        <>
            <Head>
                <title>{t("PaymentApproved.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h4 className="mb-3">{t("PaymentApproved.Title")}</h4>

            {appContext.translation.i18n.language === "en" && (
                <>
                    <p>Thank you for supporting organized snowmobiling in Ontario with your permit purchase(s) this season.</p>

                    <p>Please check your email for purchase confirmation, permit and waiver.</p>
                </>
            )}

            {appContext.translation.i18n.language === "fr" && (
                <>
                    <p>Merci de soutenir la motoneige organisée en Ontario avec votre ou vos achat(s) de permis cette saison.</p>

                    <p>Vérifiez votre courriel pour la confirmation d'achat, l'avis de non-responsabilité et tout permis temporaire ou de plusieurs jours.</p>
                </>
            )}
        </>
    )
}
