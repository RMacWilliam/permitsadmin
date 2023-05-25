import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page"
import Head from "next/head"
import { useState } from "react";

export default function ForgotPasswordPage() {
    return (
        <UnauthenticatedPageLayout>
            <ForgotPassword></ForgotPassword>
        </UnauthenticatedPageLayout>
    )
}

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(true);

    return (
        <>
            <Head>
                <title>Forgot Password | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>Forgot Password</h4>

            <p>
                If you are unable to login to your account, please try resetting your password and an email will be sent to you to change your password.
                For all other issues, please contact Permit customer service at 705-739-7669 or send an email
                to <a href="mailto:permits@ofsc.on.ca">permits@ofsc.on.ca</a>.
            </p>

            <div className="form-floating mb-2">
                <input type="email" className={`form-control ${isEmailValid ? "" : "is-invalid"}`} id="forgot-password-email" placeholder="name@example.com" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                <label className="required" htmlFor="forgot-password-email">Enter your email address</label>
            </div>

            <button className="btn btn-primary" onClick={() => resetPasswordClick()} disabled={email.trim().length === 0}>Reset Password</button>
        </>
    )

    function resetPasswordClick(): void {

    }
}
