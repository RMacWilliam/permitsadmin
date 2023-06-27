import { useRouter } from "next/router";
import { AppContext } from "./app-context";
import { IApiLogoutResult, IApiValidateUserResult, apiLogout } from "./api";
import { ReactNode, useContext, useRef } from "react";
import { GlobalAppContext, WebApi } from "../../global";

export default function RouteGuard({ children }: { children: ReactNode }): any {
    const appContext = useContext(AppContext);
    const router = useRouter();

    const isAuthenticated = useRef(false);
    const isAuthorized = useRef(false);
    const redirectRoute = useRef("");

    // Reset variables otherwise they will have previous values.
    isAuthenticated.current = false;
    isAuthorized.current = false;
    redirectRoute.current = "";

    // Get user authentication.
    if (appContext == undefined || appContext.data == undefined || !appContext.data.isAuthenticated) {
        isAuthenticated.current = false;
    } else {
        isAuthenticated.current = true;
    }

    // Get user authorization.
    const path: string = router.asPath?.split("?")[0];

    // Admin users have full access.
    if (appContext.data?.contactInfo?.adminUser) {
        isAuthorized.current = true;
    }

    // Check regular user access to requested page.
    else {
        // Unauthenticated paths.
        if (path === "/") {
            isAuthorized.current = true;
        } else if (path === "/forgot-password") {
            isAuthorized.current = true;
        } else if (path === "/reset-password") {
            isAuthorized.current = true;
        } else if (path === "/create-account") {
            isAuthorized.current = true;
        } else if (path === "/confirm-account") {
            isAuthorized.current = true;
        } else if (path === "/change-email") {
            isAuthorized.current = true;
        }

        // Authenticated paths.
        else if (isAuthenticated.current) {
            if (appContext.data?.isFirstLoginOfSeason) {
                if (!appContext.data?.videoWatched) {
                    if (path === "/first-login-of-season") {
                        isAuthorized.current = true;
                    } else {
                        isAuthorized.current = false;
                        redirectRoute.current = "/first-login-of-season";
                    }
                } else {
                    if (path === "/contact") {
                        isAuthorized.current = true;
                    } else {
                        isAuthorized.current = false;
                        redirectRoute.current = "/contact";
                    }
                }
            } else if (!appContext.data?.isContactInfoVerified) {
                if (path === "/contact") {
                    isAuthorized.current = true;
                } else {
                    isAuthorized.current = false;
                    redirectRoute.current = "/contact";
                }
            } else if (appContext.data?.isContactInfoVerified) {
                if (path === "/home") {
                    isAuthorized.current = true;
                } else if (path === "/contact") {
                    isAuthorized.current = true;
                } else if (path === "/permits") {
                    isAuthorized.current = true;
                } else if (path === "/gift-cards") {
                    isAuthorized.current = true;
                } else if (path === "/cart") {
                    isAuthorized.current = true;
                } else if (path === "/checkout") {
                    isAuthorized.current = true;
                } else if (path === "/payment") {
                    isAuthorized.current = true;
                } else if (path === "/payment/approved") {
                    isAuthorized.current = true;
                } else if (path === "/payment/declined") {
                    isAuthorized.current = true;
                } else {
                    isAuthorized.current = false;
                    redirectRoute.current = "/home";
                }
            } else {
                isAuthorized.current = false;
                redirectRoute.current = "/home";
            }
        }

        // Everything else not specified above.
        else {
            isAuthorized.current = false;
            redirectRoute.current = "/";
        }
    }

    //console.log("isAuthenticated: ", isAuthenticated.current, "isAuthorized: ", isAuthorized.current, "path: ", path, "redirectRoute: ", redirectRoute.current);

    if (redirectRoute.current === "") {
        return (
            <>{children}</>
        )
    } else {
        if (redirectRoute.current === path) {
            return (
                <>{children}</>
            )
        } else {
            router.push(redirectRoute.current);
            return null;
        }
    }
}

export function loginAndInitializeAppContext(apiLoginResult: IApiValidateUserResult): void {
    if (GlobalAppContext != undefined && GlobalAppContext?.updater != undefined && GlobalAppContext?.router != undefined) {
        // TODO: Remove
        apiLoginResult.isFirstLoginOfSeason = true;
        //////////////////////////////////////////////////////////////////////

        GlobalAppContext.updater(draft => {
            draft.isAuthenticated = true;
            draft.token = apiLoginResult?.token;

            draft.email = apiLoginResult?.email;
            draft.firstName = apiLoginResult?.firstName;
            draft.lastName = apiLoginResult?.lastName;

            draft.language = draft.language ?? "en";

            draft.isFirstLoginOfSeason = apiLoginResult?.isFirstLoginOfSeason;
            draft.videoWatched = false;
            draft.isContactInfoVerified = false;

            draft.cart = undefined;
            draft.cartItems = undefined;

            draft.navbarPage = "contact";

            draft.contactInfo = undefined;
            draft.accountPreferences = undefined;

            draft.snowmobiles = undefined;

            draft.giftCards = undefined;

            draft.monerisBaseUrl = WebApi.MonerisComplete;
        });

        if (apiLoginResult?.isFirstLoginOfSeason) {
            GlobalAppContext.router.push("/first-login-of-season");
        } else {
            GlobalAppContext.router.push("/contact");
        }
    }
}

export function logoutAndCleanupAppContext(): void {
    if (GlobalAppContext != undefined && GlobalAppContext?.updater != undefined && GlobalAppContext?.router != undefined) {
        GlobalAppContext.updater(draft => {
            draft.isAuthenticated = false;
            draft.email = undefined;
            draft.token = undefined;

            draft.isFirstLoginOfSeason = undefined;
            draft.videoWatched = undefined;
            draft.isContactInfoVerified = undefined;

            draft.cart = undefined;
            draft.cartItems = undefined;

            draft.navbarPage = undefined;

            draft.contactInfo = undefined;
            draft.accountPreferences = undefined;

            draft.snowmobiles = undefined;

            draft.giftCards = undefined;

            draft.monerisBaseUrl = undefined;
        });

        // if (window.localStorage) {
        //     window.localStorage.removeItem("data");
        // }

        //GlobalAppContext.router.push("/");

        apiLogout().subscribe({
            next: (apiLogoutResult: IApiLogoutResult) => {
                if (apiLogoutResult?.isSuccessful) {

                } else {

                }
            },
            error: (error: any) => {
                console.log(error);
            },
            complete: () => {
                if (GlobalAppContext?.updater != undefined) {
                    GlobalAppContext.updater(draft => {
                        draft.token = undefined;
                    });
                }
            }
        });
    }
}
