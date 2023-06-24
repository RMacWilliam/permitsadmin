import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page"
import { AppContext, IAppContextValues } from "@/custom/app-context";
import Head from "next/head"
import { NextRouter, useRouter } from "next/router";
import { useContext, useState } from "react";

export default function ForgotPasswordPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    return (
        <UnauthenticatedPageLayout>
            <ForgotPassword appContext={appContext} router={router}></ForgotPassword>
        </UnauthenticatedPageLayout>
    )
}

function ForgotPassword({ appContext, router }
    : {
        appContext: IAppContextValues,
        router: NextRouter
    }) {

    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(true);

    const t: Function = appContext.translation.t;

    return (
        <>
            <Head>
                <title>{t("ForgotPassword.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h4 className="mb-3">{t("ForgotPassword.Title")}</h4>

            <p>{t("ForgotPassword.Section1")}</p>

            <p>{t("ForgotPassword.Section2")}</p>

            <div className="form-floating mb-2">
                <input type="email" className={`form-control ${isEmailValid ? "" : "is-invalid"}`} id="forgot-password-email" placeholder={t("ForgotPassword.EmailAddressLabel")} value={email} onChange={(e: any) => setEmail(e.target.value)} />
                <label className="required" htmlFor="forgot-password-email">{t("ForgotPassword.EmailAddressLabel")}</label>
            </div>

            <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-3">
                <button className="btn btn-primary" onClick={() => resetPasswordClick()}>
                    {t("ForgotPassword.ResetPasswordButton")}
                </button>

                <button className="btn btn-primary" onClick={() => router.push("/")}>
                    {t("Common.Buttons.Cancel")}
                </button>
            </div>
        </>
    )

    function resetPasswordClick(): void {

    }
}
