"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import Button from 'react-bootstrap/Button'
import { AppContext } from '@/app/AppContext';

export default function LoginPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="d-flex justify-content-between flex-wrap flex-sm-wrap flex-md-nowrap w-100">
            <div className="flex-fill px-2">
                <div>
                    <h3>Welcome to Ontario Federation of Snowmobile Clubs</h3>
                </div>

                <div className="mt-3">Permits and Gift Cards are only valid for &quot;motorized snow vehicles&quot;:<br />
                    <Link href="https://www.ontario.ca/laws/statute/90m44">https://www.ontario.ca/laws/statute/90m44</Link>
                </div>

                <div className="mt-2">
                    <b>To purchase a permit you must:</b>
                    <ul>
                        <li>Be the registered owner of the vehicle</li>
                        <li>Have a valid VIN and license plate (registration number)</li>
                    </ul>
                </div>

                <div className="mt-2">For more information on permits visit:<br />
                    <Link href="https://www.ofsc.on.ca/faq">Permits - Ontario Federation of Snowmobile Clubs (ofsc.on.ca)</Link>
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
                    <Link href="https://www.ofsc.on.ca/faq">Gift Cards - Ontario Federation of Snowmobile Clubs (ofsc.on.ca)</Link>
                </div>
            </div>

            <div className="d-flex justify-content-center flex-fill mt-4 mt-sm-4 mt-md-0 px-2">
                <div className="card" style={{ width: 350 }}>
                    <div className="card-body bg-secondary bg-opacity-10">
                        <div className="text-center mt-2">
                            <i className="fa-solid fa-right-to-bracket fa-xl"></i>
                        </div>

                        <h5 className="text-center">Login to my account</h5>

                        <div className="mt-4">
                            <div className="form-floating mb-2">
                                <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                                <label htmlFor="floatingInput">Email address</label>
                            </div>
                            <div className="form-floating">
                                <input type="password" className="form-control" id="floatingPassword" placeholder="Password" value={password} onChange={(e: any) => setPassword(e.target.value)} />
                                <label htmlFor="floatingPassword">Password</label>
                            </div>
                        </div>

                        <div className="mt-2">
                            <Button className="w-100" variant="primary" onClick={e => doLogin()}>Login</Button>
                        </div>

                        <div className="text-center mt-4">
                            <Button variant="link text-decoration-none" onClick={e => doForgotPassword()}>Forgot password?</Button>
                        </div>

                        <div className="mt-4 mb-2">
                            <Button className="w-100" variant="outline-primary" onClick={e => doCreateAccount()}>Create an account</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    function doLogin() {
        appContext.updater(draft => {
            draft.isAuthenticated = true;
            draft.email = email;
            draft.token = '12345';
        });

        router.push('/home');
    }

    function doForgotPassword() {
        router.push('/forgot-password')
    }

    function doCreateAccount() {
        router.push('/create-account');
    }
}