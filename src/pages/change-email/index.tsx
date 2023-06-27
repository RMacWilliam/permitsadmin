import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page"
import { AppContext, IAppContextValues } from "@/custom/app-context";
import Head from "next/head"
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

export default function ChangeEmailPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(true);

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

    const t: Function = appContext.translation.t;

    return (
        <>
            <Head>
                <title>{t("ChangeEmail.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h3 className="mb-3">{t("ChangeEmail.Title")}</h3>


        </>
    )
}
