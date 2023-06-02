import { Observable } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { IKeyValue, IParentKeyValue } from "./app-context";
import { GlobalAppContext, WebApi } from "../../constants";

const WebApiGlobalQueryParams: any = {
    asOfDate: "2023-01-01"
};

function httpFetch<T>(method: "GET" | "POST" | "DELETE", url: string, params?: any, body?: any, isAuthenticated: boolean = true): Observable<T> {
    let headers: any = undefined;

    if (isAuthenticated) {
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + GlobalAppContext.token
        };
    } else {
        headers = {
            "Content-Type": "application/json"
        };
    }

    let init = {
        method: method,
        headers: headers,
        body: method === 'GET' ? undefined : JSON.stringify(body),
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

function httpDelete<T>(url: string, params?: any, body?: any, isAuthenticated: boolean = true): Observable<T> {
    return httpFetch<T>("DELETE", url, params, body, isAuthenticated);
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

export function apiLogin(body?: any, params: any = undefined): Observable<IApiLoginResult> {
    return httpPost<IApiLoginResult>(WebApi.LoginUrl, params, body, false);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiLogout
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiLogoutRequest {

}

export interface IApiLogoutResult {

}

export function apiLogout(body?: any, params: any = undefined): Observable<IApiLogoutResult> {
    return httpPost<IApiLogoutResult>(WebApi.LogoutUrl, params, body);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User Details Interfaces
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiUserDetails {
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
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetUserDetails
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetUserDetailsRequest {

}

export interface IApiGetUserDetailsResult extends IApiUserDetails {

}

export function apiGetUserDetails(params?: any): Observable<IApiGetUserDetailsResult> {
    return httpGet<IApiGetUserDetailsResult>(WebApi.GetUserDetails, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiSaveUserDetails
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiSaveUserDetailsRequest {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    countryId?: string;
    email?: string;
    postalCode?: string;
    provinceId?: string;
    telephone?: string;
}

export interface IApiSaveUserDetailsUserDetails extends IApiUserDetails {

}

export interface IApiSaveUserDetailsResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiSaveUserDetailsUserDetails;
}

export function apiSaveUserDetails(body?: any, params: any = undefined): Observable<IApiSaveUserDetailsResult> {
    return httpPost<IApiSaveUserDetailsResult>(WebApi.SaveUserDetails, params, body);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User Preferences Interfaces
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiUserPreferences {
    ofscContactPermission?: number;
    riderAdvantage?: number;
    volunteering?: number;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetUserPreferences
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetUserPreferencesRequest {

}

export interface IApiGetUserPreferencesResult extends IApiUserPreferences {

}

export function apiGetUserPreferences(params?: any): Observable<IApiGetUserPreferencesResult> {
    return httpGet<IApiGetUserPreferencesResult>(WebApi.GetUserPreferences, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiSaveUserPreferences
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiSaveUserPreferencesRequest {
    ofscContactPermission?: number;
    riderAdvantage?: number;
    volunteering?: number;
}

export interface IApiSaveUserPreferencesUserPreferences extends IApiUserPreferences {

}

export interface IApiSaveUserPreferencesResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiSaveUserPreferencesUserPreferences;
}

export function apiSaveUserPreferences(body?: any, params: any = undefined): Observable<IApiSaveUserPreferencesResult> {
    return httpPost<IApiSaveUserPreferencesResult>(WebApi.SaveUserPreferences, params, body);
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

export function apiGetProvinces(params?: any): Observable<IApiGetProvincesResult[]> {
    return httpGet<IApiGetProvincesResult[]>(WebApi.GetProvinces, params);
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

export function apiGetCountries(params?: any): Observable<IApiGetCountriesResult[]> {
    return httpGet<IApiGetCountriesResult[]>(WebApi.GetCountries, params);
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

export function apiGetClubs(params?: any): Observable<IApiGetClubsResult[]> {
    return httpGet<IApiGetClubsResult[]>(WebApi.GetClubs, params);
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

export function apiGetVehicleMakes(params?: any): Observable<IApiGetVehicleMakesResult[]> {
    return httpGet<IApiGetVehicleMakesResult[]>(WebApi.GetVehicleMakes, params);
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
// apiDeleteVehicle
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiDeleteVehicleRequest {
    oVehicleId?: string;
}

export interface IApiDeleteVehicleResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: any;
}

export function apiDeleteVehicle(body?: any, params: any = undefined): Observable<IApiDeleteVehicleResult> {
    return httpDelete<IApiDeleteVehicleResult>(WebApi.DeleteVehicle, params, body);
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
    asOfDate?: string; // 2023-01-01
}

export interface IApiGetGiftcardsForCurrentSeasonForUserResult {
    giftcardProductId?: number;
    oVoucherId?: string;
    orderId?: string;
    transactionDate?: Date;
    recipientLastName?: string;
    recipientPostal?: string;
    redemptionCode?: string;
    purchaserEmail?: string;
    isRedeemed?: boolean;
    isPurchased?: boolean;
    useShippingAddress?: boolean;
    shippingOption?: string;
    clubId?: number;
    permitId?: number;
    isClassic?: boolean;
    isTrackedShipping?: boolean;
    trackedShippingAmount?: number;
    amount?: number;
    displayName?: string;
    frenchDisplayName?: string;
}

export function apiGetGiftcardsForCurrentSeasonForUser(params?: any): Observable<IApiGetGiftcardsForCurrentSeasonForUserResult[]> {
    return httpGet<IApiGetGiftcardsForCurrentSeasonForUserResult[]>(WebApi.GetGiftcardsForCurrentSeasonForUser, params);
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
    giftcardProductId?: number;
    isTrackedShipping?: boolean;
    trackedShippingAmount?: number;
}

export function apiGetAvailableGiftCards(params?: any): Observable<IApiGetAvailableGiftCardsResult[]> {
    return httpGet<IApiGetAvailableGiftCardsResult[]>(WebApi.GetAvailableGiftCards, params);
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
// apiAddGiftCardForUser
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiAddGiftCardForUserRequest {
    asOfDate?: string;
}

export interface IApiAddGiftCardForUserGiftCardSelections {
    giftcardProductId?: number;
    oVoucherId?: string;
    orderId?: string;
    transactionDate?: Date;
    recipientLastName?: string;
    recipientPostal?: string;
    redemptionCode?: string;
    purchaserEmail?: string;
    isRedeemed?: boolean;
    isPurchased?: boolean;
    useShippingAddress?: boolean;
    shippingOption?: string;
    clubId?: number;
    permitId?: number;
    isClassic?: boolean;
    isTrackedShipping?: boolean;
    trackedShippingAmount?: number;
    amount?: number;
    displayName?: string;
    frenchDisplayName?: string;
}

export interface IApiAddGiftCardForUserResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiAddGiftCardForUserGiftCardSelections;
}

export function apiAddGiftCardForUser(body?: any, params?: any): Observable<IApiAddGiftCardForUserResult> {
    return httpPost<IApiAddGiftCardForUserResult>(WebApi.AddGiftCardForUser, params, body);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiSaveGiftCardSelectionsForUser
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiSaveGiftCardSelectionsForUserRequest {
    asOfDate?: string;

    oVoucherId?: string;
    giftcardProductId?: number;
    recipientLastName?: string;
    recipientPostal?: string;
}

export interface IApiSaveGiftCardSelectionsForUserGiftCardSelections {
    giftcardProductId?: number;
    oVoucherId?: string;
    orderId?: string;
    transactionDate?: Date;
    recipientLastName?: string;
    recipientPostal?: string;
    redemptionCode?: string;
    purchaserEmail?: string;
    isRedeemed?: boolean;
    isPurchased?: boolean;
    useShippingAddress?: boolean;
    shippingOption?: string;
    clubId?: number;
    permitId?: number;
    isClassic?: boolean;
    isTrackedShipping?: boolean;
    trackedShippingAmount?: number;
    amount?: number;
    displayName?: string;
    frenchDisplayName?: string;
}

export interface IApiSaveGiftCardSelectionsForUserResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiSaveGiftCardSelectionsForUserGiftCardSelections;
}

export function apiSaveGiftCardSelectionsForUser(body?: any, params?: any): Observable<IApiSaveGiftCardSelectionsForUserResult> {
    return httpPost<IApiSaveGiftCardSelectionsForUserResult>(WebApi.SaveGiftCardSelectionsForUser, params, body);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiDeleteGiftCard
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiDeleteGiftCardRequest {
    oVoucherId?: string;
}

export interface IApiDeleteGiftCardResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: any;
}

export function apiDeleteGiftCard(body?: any, params?: any): Observable<IApiDeleteGiftCardResult> {
    return httpDelete<IApiDeleteGiftCardResult>(WebApi.DeleteGiftCard, params, body);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetProcessingFee
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetProcessingFeeRequest {

}

export interface IApiGetProcessingFeeResult {
    fee?: number;
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

export function apiGetShippingFees(params?: any): Observable<IApiGetShippingFeesResult[]> {
    return httpGet<IApiGetShippingFeesResult[]>(WebApi.GetShippingFees, params);
}
