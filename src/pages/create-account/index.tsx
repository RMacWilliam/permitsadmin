import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page"
import Head from "next/head"

export default function CreateAccountPage() {
    return (
        <UnauthenticatedPageLayout>
            <CreateAccount></CreateAccount>
        </UnauthenticatedPageLayout>
    )
}

function CreateAccount() {
    return (
        <>
            <Head>
                <title>Create Account | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>Create Account</h4>
        </>
    )
}
