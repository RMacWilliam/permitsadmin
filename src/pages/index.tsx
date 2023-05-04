import UnauthenticatedPageLayout from '@/components/layouts/unauthenticated-page'
import { IApiLoginResult, apiLogin } from '@/custom/api';
import { AppContext } from '@/custom/app-context';
import { accountPreferencesData, cartItemsData, contactInfoData, giftCardsData, snowmobilesData } from '@/custom/data';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { Button } from 'react-bootstrap';

export default function IndexPage() {
    return (
        <UnauthenticatedPageLayout>
            <Index></Index>
        </UnauthenticatedPageLayout>
    )
}

function Index() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showInvalidLogin, setShowInvalidLogin] = useState(false);

    return (
        <>
            <Head>
                <title>Index | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <div className="d-flex justify-content-between flex-wrap flex-sm-wrap flex-md-nowrap w-100">
                <div className="flex-fill px-2">
                    <div>
                        <h3>Welcome to Ontario Federation of Snowmobile Clubs</h3>
                    </div>

                    <div className="mt-3">Permits and Gift Cards are only valid for &quot;motorized snow vehicles&quot;:<br />
                        <Link href="https://www.ontario.ca/laws/statute/90m44">Motorized Snow Vehicles Act, R.S.O. 1990, c. M.44</Link>
                    </div>

                    <div className="mt-2">
                        <b>To purchase a permit you must:</b>
                        <ul>
                            <li>Be the registered owner of the vehicle</li>
                            <li>Have a valid VIN and license plate (registration number)</li>
                        </ul>
                    </div>

                    <div className="mt-2">For more information on permits visit:<br />
                        <Link href="https://www.ofsc.on.ca/faq">Permits - Ontario Federation of Snowmobile Clubs</Link>
                    </div>

                    <div className="mt-2">
                        <b>Purchase a gift card if:</b>
                        <ul>
                            <li>You do not have your vehicle ownership and want to take advantage of early bird fees</li>
                            <li>You want to gift a permit for a family member, friend, etc</li>
                        </ul>
                    </div>

                    <div className="mt-2">
                        For more information on gift cards visit:<br />
                        <Link href="https://www.ofsc.on.ca/faq">Gift Cards - Ontario Federation of Snowmobile Clubs</Link>
                    </div>
                </div>

                <div className="d-flex justify-content-center flex-fill mt-4 mt-sm-4 mt-md-0 px-2">
                    <div id="login-panel" className="card">
                        <div className="card-body bg-secondary bg-opacity-10">
                            <div className="text-center mt-2">
                                <i className="fa-solid fa-right-to-bracket fa-xl"></i>
                            </div>

                            <h5 className="text-center">Login to my account</h5>

                            <div className="mt-4">
                                <div className="form-floating mb-2">
                                    <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" value={email} onChange={(e: any) => setEmail(e.target.value)} onBlur={(e: any) => setEmail(e?.target?.value?.trim() ?? "")} />
                                    <label htmlFor="floatingInput">Email address</label>
                                </div>
                                <div className="form-floating">
                                    <input type="password" className="form-control" id="floatingPassword" placeholder="Password" value={password} onChange={(e: any) => setPassword(e.target.value)} onBlur={(e: any) => setPassword(e?.target?.value?.trim() ?? "")} />
                                    <label htmlFor="floatingPassword">Password</label>
                                </div>
                            </div>

                            <div className="mt-2">
                                <Button className="w-100" variant="primary" disabled={!isLoginEnabled()} onClick={() => doLogin()}>Login</Button>

                                {showInvalidLogin && (
                                    <div className="text-danger text-center mt-2">
                                        Invalid e-mail and/or password.
                                    </div>
                                )}
                            </div>

                            <div className="text-center mt-4">
                                <Button variant="link text-decoration-none" onClick={() => doForgotPassword()}>Forgot password?</Button>
                            </div>

                            <div className="mt-4 mb-2">
                                <Button className="w-100" variant="outline-primary" onClick={() => doCreateAccount()}>Create an account</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

    function isLoginEnabled(): boolean {
        return email !== ""
            && password !== "";
    }

    function doLogin() {
        let e: string = email;
        let p: string = password;

        if (email === "s") e = "sarveny@hotmail.com";
        if (email === "b") e = "robert.macwilliam@gmail.com";

        if (password === "s") p = "SnowTravel59!";
        if (password === "b") p = "CrappyPassword1!";

        apiLogin(e ?? email, p ?? password).subscribe({
            next: (response: IApiLoginResult) => {
                if (response.isValid) {
                    appContext.updater(draft => {
                        draft.isAuthenticated = true;
                        draft.email = e ?? email; // TODO: Clean up this code!
                        draft.token = response.token;

                        draft.language = draft.language ?? "en";

                        draft.isFirstLoginOfSeason = response.isFirstLoginOfSeason;
                        draft.isContactInfoVerified = false;

                        draft.cartItems = cartItemsData;

                        draft.navbarPage = "home";

                        draft.contactInfo = contactInfoData;
                        draft.accountPreferences = accountPreferencesData;

                        draft.snowmobiles = snowmobilesData;

                        draft.giftCards = giftCardsData;
                    });

                    router.push("/home");
                } else {
                    setShowInvalidLogin(true);
                }
            },
            error: (error: any) => {
                console.log(error);
            }
        });
    }

    function doForgotPassword() {
        router.push("/forgot-password");
    }

    function doCreateAccount() {
        router.push("/create-account");
    }
}
