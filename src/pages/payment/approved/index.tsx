import AuthenticatedPageLayout from "@/components/layouts/authenticated-page"
import { AppContext, IAppContextValues } from "@/custom/app-context";
import { getQueryParam } from "@/custom/utilities";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

export default function PaymentApprovedPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "approved" });

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

    const [orderId, setOrderId] = useState("" as string | undefined);

    const t: Function = appContext.translation.t;

    useEffect(() => {
        setOrderId(getQueryParam("orderId", router));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query]);

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

            <div className="card">
                <div className="card-body text-center">
                    <button className="btn btn-primary" onClick={() => router.push("/home")}>
                        {t("PaymentApproved.ReturnHome")}
                    </button>
                </div>
            </div>
        </>
    )
}
