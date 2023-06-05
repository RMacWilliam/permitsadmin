import { NextRouter, useRouter } from "next/router";
import { AppContext, IAppContextValues } from "./app-context";
import { IApiLoginResult } from "./api";
import { ReactNode, useContext, useRef } from "react";
import { GlobalAppContext } from "../../constants";

export default function RouteGuard({ children }: { children: ReactNode }) {
    const appContext = useContext(AppContext);
    const router = useRouter();

    const isAuthenticated = useRef(false);
    const isAuthorized = useRef(false);
    const redirectRoute = useRef("");

    // Set WebApi token.
    GlobalAppContext.token = appContext.data?.token;

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
    let path: string = router.asPath;

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
        } else if (path === "/create-account") {
            isAuthorized.current = true;
        }

        // Authenticated paths.
        else if (isAuthenticated.current) {
            if (appContext.data?.isContactInfoVerified) {
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
                }
                // Everything else (like admin pages that a regular user should not see).
                else {
                    isAuthorized.current = false;
                    redirectRoute.current = "/home";
                }
            } else {
                if (path === "/contact") {
                    isAuthorized.current = true;
                } else {
                    isAuthorized.current = false;
                    redirectRoute.current = "/contact";
                }
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

export function login(router: NextRouter, appContext: IAppContextValues, apiLoginResult: IApiLoginResult): void {
    appContext.updater(draft => {
        draft.isAuthenticated = true;
        draft.email = apiLoginResult.email;
        draft.token = apiLoginResult.token;

        draft.language = draft.language ?? "en";

        draft.isFirstLoginOfSeason = apiLoginResult.isFirstLoginOfSeason;
        draft.isContactInfoVerified = false;

        draft.cartItems = undefined;

        draft.navbarPage = "contact";

        draft.contactInfo = undefined;
        draft.accountPreferences = undefined;

        draft.snowmobiles = undefined;

        draft.giftCards = undefined;
    });

    router.push("/contact");
}

export function logout(router: NextRouter, appContext: IAppContextValues): void {
    appContext.updater(draft => {
        draft.isAuthenticated = false;
        draft.email = undefined;
        draft.token = undefined;

        draft.isFirstLoginOfSeason = undefined;
        draft.isContactInfoVerified = undefined;

        draft.cartItems = undefined;

        draft.navbarPage = undefined;

        draft.contactInfo = undefined;
        draft.accountPreferences = undefined;

        draft.snowmobiles = undefined;

        draft.giftCards = undefined;
    });

    if (window.localStorage) {
        window.localStorage.removeItem("data");
    }

    router.push("/");
}
