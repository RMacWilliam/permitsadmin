import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page"
import { AppContext, IAppContextValues } from "@/custom/app-context";
import Head from "next/head"
import { NextRouter, useRouter } from "next/router";
import { useContext, useState } from "react";

export default function ChangeEmailPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    return (
        <UnauthenticatedPageLayout>
            <ChangeEmail appContext={appContext} router={router}></ChangeEmail>
        </UnauthenticatedPageLayout>
    )
}

function ChangeEmail({ appContext, router }
    : {
        appContext: IAppContextValues,
        router: NextRouter
    }) {

    const t: Function = appContext.translation.t;

    return (
        <>
            <Head>
                <title>{t("ChangeEmail.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h4 className="mb-3">{t("ChangeEmail.Title")}</h4>


        </>
    )
}
