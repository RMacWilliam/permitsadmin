import { ReactNode, useContext, useEffect } from 'react';
import { AppContext } from '@/custom/app-context';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function AuthenticatedPageLayout({ children }: { children?: ReactNode }) {
    const appContext = useContext(AppContext);
    const router = useRouter();

    useEffect(() => {
        if (!appContext.data.isAuthenticated) {
            router.push("/");
        }
    }, [appContext.data.isAuthenticated, router])

    if (!appContext.data.isAuthenticated) {
        return (
            <></>
        )
    }

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <header>
                <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark text-white" style={{ minHeight: 86, maxHeight: 86, overflow: 'hidden' }}>
                    <div className="container-fluid">
                        <div className="d-flex justify-content-between align-items-center w-100" style={{ maxHeight: 70 }}>
                            <div className="d-flex flex-fill">
                                <a className="navbar-brand d-none d-sm-block" href="#">
                                    <img src="ofsc.png" alt="Logo" width="60" height="60" />
                                </a>

                                <div className="d-flex flex-column justify-content-between">
                                    <h5 className="mb-0">Ontario Federation of Snowmobile Clubs</h5>

                                    <div className="d-none d-sm-none d-md-block">
                                        Logged in as {appContext.data.email}.

                                        <span className="btn btn-link align-baseline border-0 ms-2 p-0" onClick={() => doLogout()}>
                                            Logout
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex align-items-center">
                                {appContext.data?.isContactInfoVerified && (
                                    <div className="ms-3 ms-sm-3 pe-2">
                                        <Link className="nav-link position-relative" aria-current="page" href="/cart">
                                            <i className="fa-solid fa-cart-shopping fa-xl"></i>
                                            {appContext.data?.cartItems != undefined && appContext.data.cartItems.length > 0 && (
                                                <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">
                                                    {appContext.data.cartItems.length}
                                                </span>
                                            )}
                                        </Link>
                                    </div>
                                )}

                                <div className="d-block d-sm-block d-md-none ps-3 ps-sm-3">
                                    <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                                        <span className="navbar-toggler-icon"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="collapse navbar-collapse bg-dark text-white px-3 pb-1" id="navbarCollapse">
                    <ul className="navbar-nav me-auto mb-2 mb-md-0 d-block d-sm-block d-md-none">
                        <li className="nav-item">
                            <Link className="nav-link" aria-current="page" href="" onClick={() => { router.push("/home"); }} data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                                <i className="fa-solid fa-house me-2"></i>
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" aria-current="page" href="" onClick={() => { router.push("/contact"); }} data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                                <i className="fa-regular fa-address-card me-2"></i>
                                Contact Information
                            </Link>
                        </li>
                        {appContext.data?.isContactInfoVerified && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" aria-current="page" href="" onClick={() => { router.push("/permits"); }} data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                                        <i className="fa-solid fa-snowflake me-2"></i>
                                        Snowmobiles &amp; Permits
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" aria-current="page" href="" onClick={() => { router.push("/gift-cards"); }} data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                                        <i className="fa-solid fa-gift me-2"></i>
                                        Gift Cards
                                    </Link>
                                </li>
                            </>
                        )}
                        <li>
                            <hr className="dropdown-divider my-2" style={{ backgroundColor: 'white', height: 1 }} />
                        </li>
                        <li className="nav-item">
                            <i className="fa-solid fa-user me-2"></i>
                            Logged in as {appContext.data.email}.
                            <span className="ms-2">
                                <Link className="text-decoration-none" href="" onClick={() => doLogout()}>Logout</Link>
                            </span>
                        </li>
                    </ul>
                </div>

                <div className="nav-scroller bg-body shadow-sm d-none d-sm-none d-md-block">
                    <nav className="nav" aria-label="Secondary navigation">
                        <Link className={`nav-link ${appContext.data.navbarPage === 'home' ? 'active' : ''}`} href="/home">
                            <i className="fa-solid fa-house me-2"></i>
                            Home
                        </Link>
                        <Link className={`nav-link ${appContext.data.navbarPage === 'contact' ? 'active' : ''}`} href="/contact">
                            <i className="fa-regular fa-address-card me-2"></i>
                            Contact Information
                        </Link>
                        {appContext.data?.isContactInfoVerified && (
                            <>
                                <Link className={`nav-link ${appContext.data.navbarPage === 'permits' ? 'active' : ''}`} href="/permits">
                                    <i className="fa-solid fa-snowflake me-2"></i>
                                    Snowmobiles &amp; Permits
                                </Link>
                                <Link className={`nav-link ${appContext.data.navbarPage === 'gift-cards' ? 'active' : ''}`} href="/gift-cards">
                                    <i className="fa-solid fa-gift me-2"></i>
                                    Gift Cards
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-shrink-0 py-3">
                <div className="container-fluid container-lg">
                    {children}
                </div>
            </main>

            <footer className="footer bg-secondary mt-auto py-2">
                <div className="container-fluid" style={{ padding: 0 }}>
                    <div className="text-white text-center">Need help? Contact OFSC at 705-739-7669 or permits@ofsc.on.ca</div>
                    <div className="text-white text-center mt-2">
                        <a href="https://www.facebook.com/pages/The-Ontario-Federation-of-Snowmobile-Clubs-OFSC/125178027502192"><i className="fa-brands fa-facebook-f text-white"></i></a>
                        <a href="https://twitter.com/GoSnowmobiling"><i className="fa-brands fa-twitter ms-4 text-white"></i></a>
                        <a href="https://www.instagram.com/gosnowmobilingontario"><i className="fa-brands fa-instagram ms-4 text-white"></i></a>
                        <a href="https://www.linkedin.com/company/ontario-federation-of-snowmobile-clubs"><i className="fa-brands fa-linkedin-in ms-4 text-white"></i></a>
                        <a href="https://www.youtube.com/user/GoSnowmobiling/videos"><i className="fa-brands fa-youtube ms-4 text-white"></i></a>
                        {/* <span className="d-sm-none">XS</span>
                        <span className="d-none d-sm-block d-md-none">SM</span>
                        <span className="d-none d-md-block d-lg-none">MD</span>
                        <span className="d-none d-lg-block d-xl-none">LG</span>
                        <span className="d-none d-xl-block d-xxl-none">XL</span> */}
                    </div>
                </div>
            </footer>
        </>
    )

    function doLogout() {
        appContext.updater(draft => {
            draft.isAuthenticated = false;
            draft.email = undefined;
            draft.token = undefined;
        });

        router.push("/");
    }
}
