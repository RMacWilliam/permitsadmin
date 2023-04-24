import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page"
import Head from "next/head"

export default function ForgotPasswordPage() {
    return (
        <UnauthenticatedPageLayout>
            <ForgotPassword></ForgotPassword>
        </UnauthenticatedPageLayout>
    )
}

function ForgotPassword() {
    return (
        <>
            <Head>
                <title>Forgot Password | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>Forgot Password</h4>
        </>
    )
}
