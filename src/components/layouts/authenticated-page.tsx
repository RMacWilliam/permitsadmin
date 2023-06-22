import { ReactNode, useContext } from 'react';
import { AppContext } from '@/custom/app-context';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import LanguageToggler from '../language-toggler';
import ModalProcessingAlert, { IShowAlert } from '../modal-processing-alert';
import { logoutAndCleanupAppContext } from '@/custom/authentication';
import $ from 'jquery';
import { Images } from '../../../global';

export interface IShowHoverButton {
    showHoverButton?: boolean;
    getButtonText: Function;
    action?: Function;
}

export default function AuthenticatedPageLayout({ children, showAlert, showHoverButton }
    : {
        children?: ReactNode,
        showAlert?: boolean | IShowAlert,
        showHoverButton?: IShowHoverButton
    }) {

    const appContext = useContext(AppContext);
    const router = useRouter();

    const t: Function = appContext.translation.t;

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {showHoverButton?.showHoverButton && (
                <div id="hover-button" className="dropdown position-fixed bottom-0 end-0 z-10000 me-4 mb-2 bd-mode-toggle">
                    <button className="btn btn-warning dropdown-toggle py-2" type="button" data-bs-toggle="dropdown" data-bs-auto-close="true" aria-expanded="false"
                        aria-label={t("Common.HoverButton")} disabled={!isHoverButtonEnabled()}>

                        <i className="fa-solid fa-plus me-1"></i>
                        <span className="visually-hidden" id="hover-button-label">{t("Common.HoverButton")}</span>
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="hover-button-label">
                        <li>
                            <button type="button" className="dropdown-item d-flex align-items-center" aria-pressed="false" onClick={() => hoverButtonItemClick()}>
                                {showHoverButton.getButtonText()}
                            </button>
                        </li>
                    </ul>
                </div>
            )}

            <header>
                <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark text-white" style={{ minHeight: 86 }}>
                    <div className="container-fluid" style={{ minHeight: 70, maxHeight: 70 }}>
                        <div className="d-flex justify-content-between align-items-center w-100" style={{ minHeight: 70, maxHeight: 70 }}>
                            <div className="d-flex flex-fill justify-content-start align-items-center">
                                <a className="navbar-brand d-none d-md-block" href="#">
                                    <img src={Images.Ofsc} alt="Logo" width="65" height="70" />
                                </a>

                                <div className="flex-column justify-content-center justify-content-md-between">
                                    <h3 className="mb-0 d-none d-md-block">{t("Common.Ofsc")}</h3>
                                    <h5 className="mb-0 d-none d-sm-block d-md-none">{t("Common.Ofsc")}</h5>
                                    <h6 className="mb-0 d-sm-none">{t("Common.Ofsc")}</h6>

                                    <div className="d-none d-md-block">
                                        {t("Header.LoggedInAs")} {appContext.data?.contactInfo?.firstName} {appContext.data?.contactInfo?.lastName}.

                                        <span className="text-decoration-underline ms-2" style={{ cursor: "pointer" }} onClick={() => logoutClick()}>
                                            {t("Common.Logout")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end align-items-center">
                                <LanguageToggler isTextShort={false} className="fw-semibold ms-3 d-none d-sm-none d-md-block"></LanguageToggler>

                                {appContext.data?.isContactInfoVerified && (
                                    <div className="ms-3 me-2">
                                        <Link className="nav-link position-relative" aria-current="page" aria-label="Cart" href="/cart">
                                            <div className="d-md-none">
                                                <i className="fa-solid fa-cart-shopping fa-xl"></i>
                                                {appContext.data?.cartItems != undefined && appContext.data.cartItems.length > 0 && (
                                                    <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">
                                                        {appContext.data.cartItems.length}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="d-none d-md-block">
                                                <i className="fa-solid fa-cart-shopping fa-2xl"></i>
                                                {appContext.data?.cartItems != undefined && appContext.data.cartItems.length > 0 && (
                                                    <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">
                                                        {appContext.data.cartItems.length}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    </div>
                                )}

                                <div className="d-block d-sm-block d-md-none ms-3">
                                    <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                                        <span className="navbar-toggler-icon"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="collapse navbar-collapse bg-dark text-white px-3 px-md-0" id="navbarCollapse">
                        <ul className="navbar-nav me-auto mb-2 mb-md-0 d-block d-sm-block d-md-none">
                            {appContext.data?.isContactInfoVerified && (
                                <li className="nav-item">
                                    <Link className="nav-link text-white" aria-current="page" aria-label={t("Home.MenuTitle")} href="" onClick={() => { router.push("/home"); }} data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                                        <i className="fa-solid fa-house fa-fw me-2"></i>
                                        {t("Home.MenuTitle")}
                                    </Link>
                                </li>
                            )}
                            <li className="nav-item">
                                <Link className="nav-link text-white" aria-current="page" aria-label={t("ContactInfo.MenuTitle")} href="" onClick={() => { router.push("/contact"); }} data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                                    <i className="fa-solid fa-address-card fa-fw me-2"></i>
                                    {t("ContactInfo.MenuTitle")}
                                </Link>
                            </li>
                            {appContext.data?.isContactInfoVerified && (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link text-white" aria-current="page" aria-label={t("Permits.MenuTitle")} href="" onClick={() => { router.push("/permits"); }} data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                                            <i className="fa-solid fa-snowflake fa-fw me-2"></i>
                                            {t("Permits.MenuTitle")}
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link text-white" aria-current="page" aria-label={t("GiftCards.MenuTitle")} href="" onClick={() => { router.push("/gift-cards"); }} data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                                            <i className="fa-solid fa-gift fa-fw me-2"></i>
                                            {t("GiftCards.MenuTitle")}
                                        </Link>
                                    </li>
                                </>
                            )}
                            <li>
                                <hr className="dropdown-divider my-2" style={{ backgroundColor: "white", height: 1 }} />
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link text-white" aria-current="page" aria-label="" href="" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                                    <i className="fa-solid fa-globe fa-fw me-2"></i>
                                    <LanguageToggler isTextShort={false}></LanguageToggler>
                                </Link>
                            </li>
                            <li>
                                <hr className="dropdown-divider my-2" style={{ backgroundColor: "white", height: 1 }} />
                            </li>
                            <li className="nav-item">
                                <i className="fa-solid fa-user fa-fw me-2"></i>
                                {appContext.data?.contactInfo?.firstName} {appContext.data?.contactInfo?.lastName}
                                <span className="ms-2">
                                    <Link className="text-decoration-underline text-white" href="" onClick={() => logoutClick()}>Logout</Link>
                                </span>
                            </li>
                        </ul>
                    </div>
                </nav>

                <div className="nav-scroller bg-body shadow-sm d-none d-sm-none d-md-block">
                    <nav className="nav justify-content-center" aria-label="Secondary navigation">
                        {appContext.data?.isContactInfoVerified && (
                            <Link className={`nav-link fs-6 ${appContext.data.navbarPage === "home" ? "active" : ""}`} href="/home" aria-label={t("Home.MenuTitle")}>
                                <i className="fa-solid fa-house me-2"></i>
                                {t("Home.MenuTitle")}
                            </Link>
                        )}

                        {appContext.data?.isFirstLoginOfSeason && (
                            <Link className={`nav-link fs-6 ${appContext.data.navbarPage === "first-login-of-season" ? "active" : ""}`} href="/first-login-of-season" aria-label={t("FirstLoginOfSeason.MenuTitle")}>
                                <i className="fa-solid fa-video me-2"></i>
                                {t("FirstLoginOfSeason.MenuTitle")}
                            </Link>
                        )}

                        {!appContext.data?.isFirstLoginOfSeason && (
                            <Link className={`nav-link fs-6 ${appContext.data.navbarPage === "contact" ? "active" : ""}`} href="/contact" aria-label={t("ContactInfo.MenuTitle")}>
                                <i className="fa-solid fa-address-card me-2"></i>
                                {t("ContactInfo.MenuTitle")}
                            </Link>
                        )}

                        {appContext.data?.isContactInfoVerified && (
                            <>
                                <Link className={`nav-link fs-6 ${appContext.data.navbarPage === "permits" ? "active" : ""}`} href="/permits" aria-label={t("Permits.MenuTitle")}>
                                    <i className="fa-solid fa-snowflake me-2"></i>
                                    {t("Permits.MenuTitle")}
                                </Link>

                                <Link className={`nav-link fs-6 ${appContext.data.navbarPage === "gift-cards" ? "active" : ""}`} href="/gift-cards" aria-label={t("GiftCards.MenuTitle")}>
                                    <i className="fa-solid fa-gift me-2"></i>
                                    {t("GiftCards.MenuTitle")}
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-shrink-0 py-3">
                <div className="container-fluid container-lg h-100">
                    {children}
                </div>
            </main>

            <footer className="footer bg-secondary mt-auto py-2">
                <div className="container-fluid" style={{ padding: 0 }}>
                    <div className="text-white text-center">{t("Footer.Message")}</div>

                    <div className="text-white text-center mt-2">
                        <a href="https://www.facebook.com/pages/The-Ontario-Federation-of-Snowmobile-Clubs-OFSC/125178027502192" title="OFSC Facebook" aria-label="OFSC Facebook">
                            <i className="fa-brands fa-facebook-f text-white"></i>
                        </a>
                        <a href="https://twitter.com/GoSnowmobiling" title="OFSC Twitter" aria-label="OFSC Twitter">
                            <i className="fa-brands fa-twitter ms-4 text-white"></i>
                        </a>
                        <a href="https://www.instagram.com/gosnowmobilingontario" title="OFSC Instagram" aria-label="OFSC Instagram">
                            <i className="fa-brands fa-instagram ms-4 text-white"></i>
                        </a>
                        <a href="https://www.linkedin.com/company/ontario-federation-of-snowmobile-clubs" title="OFSC LinkedIn" aria-label="OFSC LinkedIn">
                            <i className="fa-brands fa-linkedin-in ms-4 text-white"></i>
                        </a>
                        <a href="https://www.youtube.com/user/GoSnowmobiling/videos" title="OFSC YouTube" aria-label="OFSC YouTube">
                            <i className="fa-brands fa-youtube ms-4 text-white"></i>
                        </a>
                        (<span className="d-sm-none">XS</span>
                        <span className="d-none d-sm-inline d-md-none">SM</span>
                        <span className="d-none d-md-inline d-lg-none">MD</span>
                        <span className="d-none d-lg-inline d-xl-none">LG</span>
                        <span className="d-none d-xl-inline d-xxl-none">XL</span>)
                    </div>
                </div>
            </footer>

            <ModalProcessingAlert showAlert={showAlert}></ModalProcessingAlert>
        </>
    )

    function logoutClick() {
        logoutAndCleanupAppContext();
    }

    function isHoverButtonEnabled(): boolean {
        let result: boolean = false;

        if (showAlert != undefined) {
            if (typeof showAlert === "boolean") {
                result = !showAlert;
            } else {
                result = !showAlert?.showAlert;
            }
        }

        return result;
    }

    function hoverButtonItemClick(): void {
        if (showHoverButton?.action != undefined) {
            showHoverButton.action();
        }

        // Clean up hover button popup state.
        $("#hover-button button").first()
            .removeClass("show")
            .attr("aria-expanded", "false");

        $("#hover-button ul").first()
            .removeClass("show")
            .removeAttr("style")
            .removeAttr("data-popper-placement");
    }
}
