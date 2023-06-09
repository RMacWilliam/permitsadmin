import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page"
import { AppContext, IAppContextValues } from "@/custom/app-context";
import Head from "next/head"
import { NextRouter, useRouter } from "next/router";
import { useContext } from "react";

export default function CreateAccountPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    return (
        <UnauthenticatedPageLayout>
            <CreateAccount appContext={appContext} router={router}></CreateAccount>
        </UnauthenticatedPageLayout>
    )
}

function CreateAccount({ appContext, router }
    : {
        appContext: IAppContextValues,
        router: NextRouter
    }) {

    const t: Function = appContext.translation.t;

    return (
        <>
            <Head>
                <title>{t("CreateAccount.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h4>{t("CreateAccount.Title")}</h4>
        </>
    )
}
