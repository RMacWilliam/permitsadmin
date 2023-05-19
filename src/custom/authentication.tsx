import { NextRouter } from "next/router";
import { IAppContextValues } from "./app-context";
import { IApiLoginResult } from "./api";

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

export function isUserAuthenticated(router: NextRouter, appContext: IAppContextValues, redirectUnauthenticated: boolean = true): boolean {
    let result: boolean = false;

    let redirectRoute: string | undefined = undefined;

    if (appContext == undefined || appContext.data == undefined) {
        redirectRoute = "/";
    } else if (!appContext.data.isAuthenticated) {
        redirectRoute = "/";
    } else {
        // User is authenticated.
        result = true;
    }

    if (redirectUnauthenticated && router != undefined && redirectRoute != undefined) {
        router.push(redirectRoute);
    }

    return result;
}

export function isRoutePermitted(router: NextRouter, appContext: IAppContextValues, navbarPage: string, redirectUnpermitted: boolean = true): boolean {
    let result: boolean = false;

    let redirectRoute: string | undefined = undefined;

    if (appContext == undefined || appContext.data == undefined) {
        redirectRoute = "/";
    } else if (!appContext.data.isAuthenticated) {
        redirectRoute = "/";
    } else if (!appContext.data?.isContactInfoVerified && navbarPage !== "contact") {
        redirectRoute = "/contact";
    } else {
        // Route is permitted.
        result = true;
    }

    if (redirectUnpermitted && router != undefined && redirectRoute != undefined) {
        router.push(redirectRoute);
    }

    return result;
}