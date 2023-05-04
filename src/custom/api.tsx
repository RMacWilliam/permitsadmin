import { Observable } from "rxjs";
import { fromFetch } from "rxjs/fetch";

export const WebApiAppContextData: any = { data: undefined };

export class WebApi {
    private static BaseUrl: string = "https://permitsapi.azurewebsites.net/api";

    static LoginUrl: string = this.BaseUrl + "/user/validateuser";
}

export function httpFetch<T>(method: "GET" | "POST", url: string, body?: any, isAuthenticated: boolean = true): Observable<T> {
    console.log(JSON.stringify(WebApiAppContextData.data.token));
    console.log(JSON.stringify(body));

    let headers: any = undefined;

    if (isAuthenticated) {
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + WebApiAppContextData.data.token
        };
    } else {
        headers = {
            "Content-Type": "application/json"
        };
    }

    let init = {
        method: method,
        headers: headers,
        body: method === 'POST' ? JSON.stringify(body) : undefined,
        selector: (response: Response) => response.json()
    };

    return fromFetch<T>(url, init);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiLogin
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiLoginRequest {
    email: string;
    password: string;
}

export interface IApiLoginResult {
    isValid: boolean;
    isFirstLoginOfSeason: boolean;
    token: string;
}

export function apiLogin(email: string, password: string): Observable<IApiLoginResult> {
    let body: IApiLoginRequest = {
        email: email,
        password: password
    };

    return httpFetch<IApiLoginResult>("POST", WebApi.LoginUrl, body, false);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

