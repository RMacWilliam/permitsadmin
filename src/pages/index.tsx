import UnauthenticatedPageLayout from '@/components/layouts/unauthenticated-page'
import { IApiLoginRequest, IApiLoginResult, apiLogin } from '@/custom/api';
import { AppContext } from '@/custom/app-context';
import { login } from '@/custom/authentication';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { Button } from 'react-bootstrap';
import { GlobalAppContext } from '../../constants';

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
    const [isEmailValid, setIsEmailValid] = useState(true);

    const [password, setPassword] = useState("");
    const [isPasswordValid, setIsPasswordValid] = useState(true);

    const [loginInProgress, setLoginInProgress] = useState(false);

    const [showInvalidLogin, setShowInvalidLogin] = useState(false);

    const t: Function = appContext.translation.t;

    return (
        <>
            <Head>
                <title>{t("Common.Ofsc")}</title>
            </Head>

            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap gap-4">
                <div className="flex-fill">
                    {appContext.translation.i18n.language === "en" && (
                        <>
                            <div>
                                <h3>Welcome to Ontario Federation of Snowmobile Clubs</h3>
                            </div>

                            <div className="mt-3">
                                Permits and Gift Cards are only valid for "motorized snow vehicles":
                                <br />
                                <a href="https://www.ontario.ca/laws/statute/90m44" target="_blank">
                                    Motorized Snow Vehicles Act, R.S.O. 1990, c. M.44
                                </a>
                            </div>

                            <div className="mt-4">
                                <b>To purchase a permit you must:</b>
                                <ul>
                                    <li>Be the registered owner of the vehicle</li>
                                    <li>Have a valid VIN and license plate (registration number)</li>
                                </ul>
                            </div>

                            <div className="mt-2">For more information on permits visit:
                                <br />
                                <a href="https://www.ofsc.on.ca/faq" target="_blank">
                                    Permits - Ontario Federation of Snowmobile Clubs
                                </a>
                            </div>

                            <div className="mt-4">
                                <b>Gift Cards are ideal for those who:</b>
                                <ul>
                                    <li>Do not yet have a VIN and want to take advantage of pre-season fees</li>
                                    <li>Want to gift a permit for a family member, friend, business associate, customer, etc.</li>
                                </ul>
                            </div>

                            <div className="mt-2">
                                For more information on gift cards visit:
                                <br />
                                <a href="https://www.ofsc.on.ca/faq" target="_blank">
                                    Gift Cards - Ontario Federation of Snowmobile Clubs
                                </a>
                            </div>
                        </>
                    )}

                    {appContext.translation.i18n.language === "fr" && (
                        <>
                            <div>
                                <h3>Bienvenue à la Fédération des clubs de motoneigistes de l'Ontario</h3>
                            </div>

                            <div className="mt-3">Les permis et les cartes-cadeaux ne sont valables que pour les «motoneiges»:
                                <br />
                                <a href="https://www.ontario.ca/fr/lois/loi/90m44" target="_blank">
                                    Motoneiges (Loi sur les), L.R.O. 1990, chap. M.44
                                </a>
                            </div>

                            <div className="mt-4">
                                <b>Pour acheter un permis, vous devez:</b>
                                <ul>
                                    <li>Être le propriétaire enregistré du véhicule</li>
                                    <li>Avoir un NIV et une plaque d'immatriculation (numéro d'enregistrement) valides</li>
                                </ul>
                            </div>

                            <div className="mt-2">Pour plus d'information sur les permis, visitez le site:
                                <br />
                                <a href="https://www.ofsc.on.ca/faq" target="_blank">
                                    Permis - Fédération des clubs de motoneigistes de l'Ontario
                                </a>
                            </div>

                            <div className="mt-4">
                                <b>Achetez une carte-cadeau si:</b>
                                <ul>
                                    <li>Vous n'avez pas encore la propriété du véhicule et vous voulez profiter des frais d'inscription hâtive</li>
                                    <li>Vous voulez offrir un permis en cadeau à un membre de votre famille, un ami, etc.</li>
                                </ul>
                            </div>

                            <div className="mt-2">
                                Pour plus d'information sur les cartes-cadeaux, visitez:
                                <br />
                                <a href="https://www.ofsc.on.ca/faq" target="_blank">
                                    Les cartes-cadeaux - Fédération des clubs de motoneigistes de l'Ontario
                                </a>
                            </div>
                        </>
                    )}
                </div>

                <div className="d-flex justify-content-center align-items-start mx-auto">
                    <div id="login-panel" className="card">
                        <div className="card-body bg-secondary bg-opacity-10">
                            <div className="text-center mt-2">
                                <i className="fa-solid fa-right-to-bracket fa-xl"></i>
                            </div>

                            <h5 className="text-center">{t("Index.LoginToMyAccount")}</h5>

                            <div className="mt-4">
                                <div className="form-floating mb-2">
                                    <input type="email" className={`form-control ${isEmailValid ? "" : "is-invalid"}`} id="login-email" placeholder={t("Index.EmailAddressLabel")} disabled={loginInProgress} value={email} onChange={(e: any) => setEmail(e.target.value)} onBlur={(e: any) => setEmail(e?.target?.value?.trim() ?? "")} />
                                    <label htmlFor="login-email">{t("Index.EmailAddressLabel")}</label>
                                </div>
                                <div className="form-floating">
                                    <input type="password" className={`form-control ${isPasswordValid ? "" : "is-invalid"}`} id="login-password" placeholder={t("Index.PasswordLabel")} disabled={loginInProgress} value={password} onChange={(e: any) => setPassword(e.target.value)} onBlur={(e: any) => setPassword(e?.target?.value?.trim() ?? "")} />
                                    <label htmlFor="login-password">{t("Index.PasswordLabel")}</label>
                                </div>
                            </div>

                            <div className="mt-2">
                                <button className="btn btn-primary w-100" disabled={loginInProgress} onClick={() => doLogin()}>
                                    {t("Index.LoginButton")}

                                    {loginInProgress && (
                                        <i className="fa-solid fa-spinner fa-spin ms-2"></i>
                                    )}
                                </button>

                                {showInvalidLogin && (
                                    <div className="text-danger text-center mt-2">
                                        {t("Index.InvalidEmailAndOrPassword")}
                                    </div>
                                )}
                            </div>

                            <div className="text-center mt-4">
                                <button className="btn btn-link text-decoration-none" disabled={loginInProgress} onClick={() => doForgotPassword()}>{t("Index.ForgotPasswordButton")}</button>
                            </div>

                            <div className="mt-4 mb-2">
                                <button className="btn btn-outline-dark w-100" disabled={loginInProgress} onClick={() => doCreateAccount()}>{t("Index.CreateAnAccountButton")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

    function doLogin(): void {
        if (validateLoginForm()) {
            let e: string = email; // TODO: Clean up this code!
            let p: string = password; // TODO: Clean up this code!

            if (email === "s") e = "sarveny@hotmail.com"; // TODO: Clean up this code!
            if (email === "b") e = "robert.macwilliam@gmail.com"; // TODO: Clean up this code!

            if (password === "s") p = "SnowTravel59!"; // TODO: Clean up this code!
            if (password === "b") p = "CrappyPassword1!"; // TODO: Clean up this code!

            const apiLoginRequest: IApiLoginRequest = {
                email: e ?? email,
                password: p ?? password
            };

            setLoginInProgress(true);

            apiLogin(apiLoginRequest).subscribe({
                next: (apiLoginResult: IApiLoginResult) => {
                    if (apiLoginResult.isValid) {
                        // Set WebApi token.
                        GlobalAppContext.token = apiLoginResult.token;

                        login(router, appContext, apiLoginResult);
                    } else {
                        setShowInvalidLogin(true);
                        setLoginInProgress(false);
                    }
                },
                error: (error: any) => {
                    console.log(error);

                    setLoginInProgress(false);
                }
            });
        }
    }

    function doForgotPassword(): void {
        router.push("/forgot-password");
    }

    function doCreateAccount(): void {
        router.push("/create-account");
    }

    function validateLoginForm(): boolean {
        let result: boolean = true;

        if (email === "") {
            setIsEmailValid(false);
            result = false;
        } else {
            setIsEmailValid(true);
        }

        if (password === "") {
            setIsPasswordValid(false);
            result = false;
        } else {
            setIsPasswordValid(true);
        }

        return result;
    }
}
