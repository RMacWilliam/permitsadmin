import { useContext, useEffect, useState } from 'react'
import { AppContext, IAppContextValues } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import CartItemsAlert from '@/components/cart-items-alert';

export default function HomePage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "home" });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthenticatedPageLayout showAlert={showAlert}>
            <Home appContext={appContext} router={router} setShowAlert={setShowAlert}></Home>
        </AuthenticatedPageLayout>
    )
}

function Home({ appContext, router, setShowAlert }: { appContext: IAppContextValues, router: NextRouter, setShowAlert: React.Dispatch<React.SetStateAction<boolean>> }) {
    return (
        <>
            <Head>
                <title>Home | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>{appContext.translation?.t("HOME.TITLE")}</h4>

            <CartItemsAlert></CartItemsAlert>

            {!appContext.data?.isContactInfoVerified && (
                <div className="alert alert-primary" role="alert">
                    <div className="d-flex justify-content-between align-items-center flex-wrap flex-sm-wrap flex-md-wrap w-100">
                        <div>
                            <i className="fa-solid fa-comment fa-xl me-2"></i>
                            Please confirm your contact information and preferences to gain full access to your account.
                        </div>
                        <div>
                            <button type="button" className="btn btn-primary btn-sm mt-2 mt-sm-2 mt-md-0" onClick={() => router.push("/contact")}>Go to Contact Information</button>
                        </div>
                    </div>
                </div >
            )}

            <div className="row">
                <div className="col-12 col-md-6 ">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex flex-column justify-content-between h-100">
                                <div className="d-flex">
                                    <div>
                                        <i className="fa-solid fa-snowflake fa-fw fa-xl me-2"></i>
                                    </div>
                                    <div>
                                        <h5>Purchase an Ontario Snowmobile Trail Permit</h5>

                                        <div className="mt-2">
                                            This page will allow you to:
                                            <ul className="mt-2">
                                                <li>Add, edit snowmobiles</li>
                                                <li>Buy a permit</li>
                                                <li>Transfer a permit</li>
                                                <li>Replace a permit</li>
                                                <li>View permit order status</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <button type="button" className="btn btn-primary btn-sm" disabled={!appContext.data?.isContactInfoVerified} onClick={() => purchasePermitClick()}>Purchase a Permit</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 mt-3 mt-md-0">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex flex-column justify-content-between h-100">
                                <div className="d-flex">
                                    <div>
                                        <i className="fa-solid fa-gift fa-fw fa-xl me-2"></i>
                                    </div>
                                    <div>
                                        <div>
                                            <h5>Purchase a Gift Card</h5>

                                            <div className="mt-2">
                                                This page will allow you to:
                                                <ul className="mt-2">
                                                    <li>Buy a gift card</li>
                                                    <li>Update gift card information</li>
                                                    <li>View gift card order status</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button type="button" className="btn btn-primary btn-sm" disabled={!appContext.data?.isContactInfoVerified} onClick={() => purchaseGiftCardClick()}>Purchase a Gift Card</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

    function purchasePermitClick(): void {
        if (appContext.data?.isContactInfoVerified) {
            router.push("/permits");
        }
    }

    function purchaseGiftCardClick(): void {
        if (appContext.data?.isContactInfoVerified) {
            router.push("/gift-cards");
        }
    }
}
