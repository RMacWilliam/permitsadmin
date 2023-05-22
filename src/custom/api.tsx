import { Observable } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { IKeyValue, IParentKeyValue } from "./app-context";

export const WebApiAppContextData: any = { data: undefined, token: undefined };

const WebApiGlobalQueryParams: any = {
    asOfDate: "2023-01-01"
};

class WebApi {
    private static BaseUrl: string = "https://permitsapi.azurewebsites.net/api/";

    // User
    static LoginUrl: string = this.BaseUrl + "user/validateuser";
    static LogoutUrl: string = this.BaseUrl + "............................";
    static GetUserDetails: string = this.BaseUrl + "user/getuserdetails";
    static GetUserPreferences: string = this.BaseUrl + "user/getuserpreferences";

    // Utils
    static GetProvinces: string = this.BaseUrl + "utils/getprovinces";
    static GetCountries: string = this.BaseUrl + "utils/getcountries";
    static GetClubs: string = this.BaseUrl + "utils/getclubs";

    // Vehicle
    static GetVehiclesAndPermitsForUser: string = this.BaseUrl + "vehicle/getvehiclesandpermitsforuser";
    static GetVehicleMakes: string = this.BaseUrl + "vehicle/getvehiclemakes";
    static AddVehicleForUser: string = this.BaseUrl + "vehicle/addvehicleforuser";
    static UpdateVehicle: string = this.BaseUrl + "vehicle/updatevehicle";
    static SavePermitSelectionForVehicle: string = this.BaseUrl + "vehicle/savepermitselectionforvehicle";

    // GiftCard
    static GetGiftcardsForCurrentSeasonForUser: string = this.BaseUrl + "giftcard/getgiftcardsforcurrentseasonforuser";
    static GetAvailableGiftCards: string = this.BaseUrl + "giftcard/getavailablegiftcards";
    static GetRedeemableGiftCardsForUser: string = this.BaseUrl + "giftcard/getredeemablegiftcardsforuser";

    // Permit
    static GetProcessingFee: string = this.BaseUrl + "permit/getprocessingfee";
    static GetShippingFees: string = this.BaseUrl + "permit/getshippingfees";
}

function httpFetch<T>(method: "GET" | "POST", url: string, params?: any, body?: any, isAuthenticated: boolean = true): Observable<T> {
    let headers: any = undefined;

    if (isAuthenticated) {
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + WebApiAppContextData.token
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
        selector: (response: Response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw response;
            }
        }
    };

    let queryParams: string[] = [];

    queryParams.push(
        ...Object.entries(WebApiGlobalQueryParams).map(([prop, propValue]) => (`${prop}=${encodeURIComponent(propValue as string)}`))
    );

    if (params != undefined) {
        queryParams.push(
            ...Object.entries(params).map(([prop, propValue]) => (`${prop}=${encodeURIComponent(propValue as string)}`))
        );
    }

    if (queryParams.length > 0) {
        url += "?" + queryParams.join("&");
    }

    return fromFetch<T>(url, init);
}

function httpGet<T>(url: string, params?: any, isAuthenticated: boolean = true): Observable<T> {
    return httpFetch<T>("GET", url, params, isAuthenticated);
}

function httpPost<T>(url: string, params?: any, body?: any, isAuthenticated: boolean = true): Observable<T> {
    return httpFetch<T>("POST", url, params, body, isAuthenticated);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiLogin
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiLoginRequest {
    email: string;
    password: string;
}

export interface IApiLoginResult {
    isValid?: boolean;
    isFirstLoginOfSeason?: boolean;
    token?: string;
    email?: string;
}

export function apiLogin(email: string, password: string): Observable<IApiLoginResult> {
    let body: IApiLoginRequest = {
        email: email,
        password: password
    };

    return httpPost<IApiLoginResult>(WebApi.LoginUrl, undefined, body, false);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiLogout
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiLogoutRequest {

}

export interface IApiLogoutResult {

}

export function apiLogout(): Observable<IApiLogoutResult> {
    return httpPost<IApiLogoutResult>(WebApi.LogoutUrl);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetUserDetails
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetUserDetailsRequest {

}

export interface IApiGetUserDetailsResult {
    personId?: string; // (obfuscated)
    firstName?: string;
    initial?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    province?: IParentKeyValue;
    postalCode?: string;
    country?: IKeyValue;
    telephone?: string;
    email?: string;

    adminUser?: boolean;

    verified?: boolean;
    contactConsent?: boolean;
    volunteerStatus?: number; // TODO: Is the type correct?    
}

export function apiGetUserDetails(params?: any): Observable<IApiGetUserDetailsResult> {
    return httpGet<IApiGetUserDetailsResult>(WebApi.GetUserDetails, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetUserPreferences
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetUserPreferencesRequest {

}

export interface IApiGetUserPreferencesResult {
    ofscContactPermission?: number;
    riderAdvantage?: number;
    volunteering?: number;
}

export function apiGetUserPreferences(params?: any): Observable<IApiGetUserPreferencesResult> {
    return httpGet<IApiGetUserPreferencesResult>(WebApi.GetUserPreferences, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetProvinces
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetProvincesRequest {

}

export interface IApiGetProvincesResult {
    parent?: string;
    key?: string;
    value?: string;
}

export function apiGetProvinces(params?: any): Observable<IApiGetProvincesResult> {
    return httpGet<IApiGetProvincesResult>(WebApi.GetProvinces, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetCountries
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetCountriesRequest {

}

export interface IApiGetCountriesResult {
    key?: string;
    value?: string;
}

export function apiGetCountries(params?: any): Observable<IApiGetCountriesResult> {
    return httpGet<IApiGetCountriesResult>(WebApi.GetCountries, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetClubs
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetClubsRequest {

}

export interface IApiGetClubsResult {
    key?: string;
    value?: string;
}

export function apiGetClubs(params?: any): Observable<IApiGetClubsResult> {
    return httpGet<IApiGetClubsResult>(WebApi.GetClubs, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Vehicle Interfaces
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiVehiclePermit {
    oPermitId?: string;
    permitType?: IKeyValue;
    ofscNumber?: number; // TODO: Correct type?
    linkedPermit?: string;
    seasonId?: number;
    purchaseDate?: Date;
    club?: IKeyValue;
    origPermitId?: string; // guid
    associationId?: number; // TODO: Correct type?
    trackingNumber?: string;
    isReplacement?: boolean;
    effectiveDate?: Date;
    tempPermitDownloaded?: boolean;
    refunded?: boolean;
    cancelled?: boolean;
    manualReset?: boolean;
    isaVoucher?: boolean;
    encryptedReference?: string;
    isMostRecent?: boolean;
    isExpired?: boolean;
}

export interface IApiVehiclePermitSelections {
    oPermitId?: string;
    permitOptionId?: number;
    dateStart?: Date;
    dateEnd?: Date;
    clubId?: number;
}

export interface IApiVehiclePermitOption {
    productId?: number;
    name?: string;
    displayName?: string;
    frenchDisplayName?: string;
    amount?: number;
    testAmount?: number;
    classic?: boolean;
    multiDayUpgrade?: boolean;
    isMultiDay?: boolean;
    isSpecialEvent?: boolean;
    eventDate?: Date;
    eventName?: string; // TODO: Correct type?
    eventClubId?: number; // TODO: Correct type?
    csrOnly?: boolean;
    permitDays?: number;
    canBuyGiftCard?: boolean;
}

export interface IApiVehicle {
    oVehicleId?: string;
    vehicleMake?: IKeyValue;
    model?: string;
    vin?: string;
    licensePlate?: string;
    vehicleYear?: string;
    origVehicleId?: number; // TODO: Is the type correct?
    isClassic?: boolean;
    isEditable?: boolean;
    permits?: IApiVehiclePermit[];
    permitOptions?: IApiVehiclePermitOption[];
    permitSelections?: IApiVehiclePermitSelections;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetVehiclesAndPermitsForUser
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetVehiclesAndPermitsForUserRequest {
    email?: string;
    asOfDate: string;
}

export interface IApiGetVehiclesAndPermitsForUserPermit extends IApiVehiclePermit {

}

export interface IApiGetVehiclesAndPermitsForUserPermitSelections extends IApiVehiclePermitSelections {

}

export interface IApiGetVehiclesAndPermitsForUserPermitOption extends IApiVehiclePermitOption {

}

export interface IApiGetVehiclesAndPermitsForUserResult extends IApiVehicle {

}

export function apiGetVehiclesAndPermitsForUser(params?: any): Observable<IApiGetVehiclesAndPermitsForUserResult[]> {
    return httpGet<IApiGetVehiclesAndPermitsForUserResult[]>(WebApi.GetVehiclesAndPermitsForUser, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetVehicleMakes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetVehicleMakesRequest {

}

export interface IApiGetVehicleMakesResult {
    key?: string;
    value?: string;
}

export function apiGetVehicleMakes(params?: any): Observable<IApiGetVehicleMakesResult> {
    return httpGet<IApiGetVehicleMakesResult>(WebApi.GetVehicleMakes, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiAddVehicleForUser
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiAddVehicleForUserRequest {
    oVehicleId?: string;
    makeId?: number;
    model?: string;
    vin?: string;
    licensePlate?: string;
    vehicleYear?: string;
}

export interface IApiAddVehicleForUserData extends IApiVehicle {

}

export interface IApiAddVehicleForUserResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiAddVehicleForUserData;
}

export function apiAddVehicleForUser(body?: any, params: any = undefined): Observable<IApiAddVehicleForUserResult> {
    return httpPost<IApiAddVehicleForUserResult>(WebApi.AddVehicleForUser, params, body);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiUpdateVehicle
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiUpdateVehicleRequest {
    oVehicleId?: string;
    makeId?: number;
    model?: string;
    vin?: string;
    licensePlate?: string;
    vehicleYear?: string;
}

export interface IApiUpdateVehicleData extends IApiVehicle {

}

export interface IApiUpdateVehicleResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiUpdateVehicleData;
}

export function apiUpdateVehicle(body?: any, params: any = undefined): Observable<IApiUpdateVehicleResult> {
    return httpPost<IApiUpdateVehicleResult>(WebApi.UpdateVehicle, params, body);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiSavePermitSelectionForVehicle
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiSavePermitSelectionForVehicleRequest extends IApiVehiclePermitSelections {
    oVehicleId?: string;
}

export interface IApiSavePermitSelectionForVehicleData extends IApiVehiclePermitSelections {
    oVehicleId?: string;
}

export interface IApiSavePermitSelectionForVehicleResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiSavePermitSelectionForVehicleData;
}

export function apiSavePermitSelectionForVehicle(body?: any, params: any = undefined): Observable<IApiSavePermitSelectionForVehicleResult> {
    return httpPost<IApiSavePermitSelectionForVehicleResult>(WebApi.SavePermitSelectionForVehicle, params, body);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetGiftcardsForCurrentSeasonForUser
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetGiftcardsForCurrentSeasonForUserRequest {
    email?: string;
}

export interface IApiGetGiftcardsForCurrentSeasonForUserResult {
    oVoucherId?: string;
    orderId?: string;
    transactionDate?: Date;
    recipientLastName?: string;
    recipientPostal?: string;
    redemptionCode?: string;
    purchaserEmail?: string;
    productId?: number;
    isRedeemed?: boolean;
    isPurchased?: boolean;
    useShippingAddress?: boolean;
    shippingOption?: string;
    clubId?: number;
    permitId?: number;
}

export function apiGetGiftcardsForCurrentSeasonForUser(params?: any): Observable<IApiGetGiftcardsForCurrentSeasonForUserResult> {
    return httpGet<IApiGetGiftcardsForCurrentSeasonForUserResult>(WebApi.GetGiftcardsForCurrentSeasonForUser, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetAvailableGiftCards
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetAvailableGiftCardsRequest {
    asOfDate?: string;
}

export interface IApiGetAvailableGiftCardsResult {
    productId?: number;
    name?: string;
    displayName?: string;
    frenchDisplayName?: string;
    amount?: number;
    testAmount?: number;
    classic?: boolean;
    multiDayUpgrade?: boolean;
    isMultiDay?: boolean;
    isSpecialEvent?: boolean;
    eventDate?: Date;
    eventName?: string;
    eventClubId?: number;
    csrOnly?: boolean;
    permitDays: number;
    canBuyGiftCard?: boolean;
}

export function apiGetAvailableGiftCards(params?: any): Observable<IApiGetAvailableGiftCardsResult> {
    return httpGet<IApiGetAvailableGiftCardsResult>(WebApi.GetAvailableGiftCards, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetRedeemableGiftCardsForUser
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetRedeemableGiftCardsForUserRequest {
    asOfDate?: string;
}

export interface IApiGetRedeemableGiftCardsForUserResult {
    seasonalGiftCards?: number;
    classicGiftCards?: number;
}

export function apiGetRedeemableGiftCardsForUser(params?: any): Observable<IApiGetRedeemableGiftCardsForUserResult> {
    return httpGet<IApiGetRedeemableGiftCardsForUserResult>(WebApi.GetRedeemableGiftCardsForUser, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetProcessingFee
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetProcessingFeeRequest {

}

export interface IApiGetProcessingFeeResult {
    fee: number;
}

export function apiGetProcessingFee(params?: any): Observable<IApiGetProcessingFeeResult> {
    return httpGet<IApiGetProcessingFeeResult>(WebApi.GetProcessingFee, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetShippingFees
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetShippingFeesRequest {

}

export interface IApiGetShippingFeesResult {
    id?: string;
    name?: string;
    price?: number;
    showConfirmation?: boolean;
}

export function apiGetShippingFees(params?: any): Observable<IApiGetShippingFeesResult> {
    return httpGet<IApiGetShippingFeesResult>(WebApi.GetShippingFees, params);
}
