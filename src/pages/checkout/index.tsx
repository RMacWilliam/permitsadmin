import AuthenticatedPageLayout from "@/components/layouts/authenticated-page";
import { AppContext, IAppContextValues } from "@/custom/app-context";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext } from "react";

export default function CheckoutPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    return (
        <AuthenticatedPageLayout>
            <Checkout appContext={appContext} router={router}></Checkout>
        </AuthenticatedPageLayout>
    )
}

function Checkout({ appContext, router }: { appContext: IAppContextValues, router: NextRouter }) {
    return (
        <>
            <Head>
                <title>Checkout | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>{appContext.translation?.t("CHECKOUT.TITLE")}</h4>
        </>
    )
}