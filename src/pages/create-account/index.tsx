import UnauthenticatedPage from "@/components/layouts/unauthenticated-page"
import CreateAccountPage from "@/components/unauthenticated/create-account-page"

export default function CreateAccount() {
    return (
        <UnauthenticatedPage>
            <CreateAccountPage></CreateAccountPage>
        </UnauthenticatedPage>
    )
}
