import UnauthenticatedPage from "@/components/layouts/unauthenticated-page"
import ForgotPasswordPage from "@/components/unauthenticated/forgot-password-page"

export default function ForgotPassword() {
    return (
        <UnauthenticatedPage>
            <ForgotPasswordPage></ForgotPasswordPage>
        </UnauthenticatedPage>
    )
}
