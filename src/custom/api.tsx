import { Observable } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { IKeyValue, IParentKeyValue } from "./app-context";
import { GlobalAppContext, WebApi } from "../../global";

const WebApiGlobalQueryParams: any = {
    asOfDate: "2023-01-01"
};

function httpFetch<T>(method: "GET" | "POST" | "DELETE", url: string, params?: any, body?: any, isAuthenticated: boolean = true): Observable<T> {
    let headers: any = undefined;

    if (isAuthenticated) {
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + (GlobalAppContext?.data?.token ?? "")
        };
    } else {
        headers = {
            "Content-Type": "application/json"
        };
    }

    const init = {
        method: method,
        headers: headers,
        body: method === 'GET' ? undefined : JSON.stringify(body),
        selector: (response: Response) => {
            // Update application token with token received from response header.
            if (GlobalAppContext.updater != undefined) {
                // Don't update application token if the logout api was called.
                const newToken: string | undefined = response.headers.get("NewToken") ?? undefined;

                if (newToken != undefined) {
                    GlobalAppContext.updater(draft => {
                        draft.token = newToken;
                    });
                }
            }

            if (response.ok) {
                return response.json();
            } else {
                throw response;
            }
        }
    };

    const queryParams: string[] = [];

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
    return httpFetch<T>("GET", url, params, undefined, isAuthenticated);
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

export interface IApiValidateUserRequest {
    email: string;
    password: string;
}

export interface IApiValidateUserResultData {
    isValid?: boolean;
    isFirstLoginOfSeason?: boolean;
    token?: string;
    email?: string;
    firstName?: string;
    initial?: string;
    lastName?: string;
    message?: string;
}

export interface IApiValidateUserResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiValidateUserResultData;
}

export function apiValidateUser(body?: any, params: any = undefined): Observable<IApiValidateUserResult> {
    return httpPost<IApiValidateUserResult>(WebApi.ValidateUser, params, body, false);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiLogout
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiLogoutRequest {

}

export interface IApiLogoutResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: any;
}

export function apiLogout(body?: any, params: any = undefined): Observable<IApiLogoutResult> {
    return httpPost<IApiLogoutResult>(WebApi.Logout, params, body);
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

export interface IApiSaveUserDetailsResultData extends IApiUserDetails {

}

export interface IApiSaveUserDetailsResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiSaveUserDetailsResultData;
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
    correspondenceLanguage?: string;
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
    correspondenceLanguage?: string;
}

export interface IApiSaveUserPreferencesResultData extends IApiUserPreferences {

}

export interface IApiSaveUserPreferencesResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiSaveUserPreferencesResultData;
}

export function apiSaveUserPreferences(body?: any, params: any = undefined): Observable<IApiSaveUserPreferencesResult> {
    return httpPost<IApiSaveUserPreferencesResult>(WebApi.SaveUserPreferences, params, body);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetProvinces
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetProvincesRequest {

}

export interface IApiGetProvincesResult extends IParentKeyValue {

}

export function apiGetProvinces(params?: any): Observable<IApiGetProvincesResult[]> {
    return httpGet<IApiGetProvincesResult[]>(WebApi.GetProvinces, params, false);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetCountries
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetCountriesRequest {

}

export interface IApiGetCountriesResult extends IKeyValue {

}

export function apiGetCountries(params?: any): Observable<IApiGetCountriesResult[]> {
    return httpGet<IApiGetCountriesResult[]>(WebApi.GetCountries, params, false);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetCorrespondenceLanguages
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetCorrespondenceLanguagesRequest {

}

export interface IApiGetCorrespondenceLanguagesResult extends IKeyValue {

}

export function apiGetCorrespondenceLanguages(params?: any): Observable<IApiGetCorrespondenceLanguagesResult[]> {
    return httpGet<IApiGetCorrespondenceLanguagesResult[]>(WebApi.GetCorrespondenceLanguages, params, false);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiCreateUser
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiCreateUserRequest {
    email?: string;
    password?: string;
    firstName?: string;
    initial?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    provinceId?: string;
    countryId?: string;
    postalCode?: string;
    telephone?: string;
    ofscContactPermission?: number;
    riderAdvantage?: number;
    volunteering?: number;
    correspondenceLanguage?: string;
    recaptcha?: string;
}

export interface IApiCreateUserResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: any;
}

export function apiCreateUser(body?: any, params?: any): Observable<IApiCreateUserResult> {
    return httpPost<IApiCreateUserResult>(WebApi.CreateUser, params, body, false);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiPasswordReset
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiPasswordResetRequest {
    email?: string;
    recaptcha?: string;
}

export interface IApiPasswordResetResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: any;
}

export function apiPasswordReset(body?: any, params?: any): Observable<IApiPasswordResetResult> {
    return httpPost<IApiPasswordResetResult>(WebApi.PasswordReset, params, body, false);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiVerifyAccount
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiVerifyAccountRequest {
    code?: string;
}

export interface IApiVerifyAccountResultData {
    isValid?: boolean;
    message?: string;
}

export interface IApiVerifyAccountResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiVerifyAccountResultData;
}

export function apiVerifyAccount(body?: any, params?: any): Observable<IApiVerifyAccountResult> {
    return httpPost<IApiVerifyAccountResult>(WebApi.VerifyAccount, params, body, false);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiUpdatePassword
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiUpdatePasswordRequest {
    code?: string;
    password?: string;
    recaptcha?: string;
}

export interface IApiUpdatePasswordResultData {
    isValid?: boolean;
    message?: string;
}

export interface IApiUpdatePasswordResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiUpdatePasswordResultData;
}

export function apiUpdatePassword(body?: any, params?: any): Observable<IApiUpdatePasswordResult> {
    return httpPost<IApiUpdatePasswordResult>(WebApi.UpdatePassword, params, body, false);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetClubs
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetClubsRequest {

}

export interface IApiGetClubsResult extends IKeyValue {

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
    dateStart?: Date;
    dateEnd?: Date;
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

export interface IApiGetVehicleMakesResult extends IKeyValue {

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

export interface IApiAddVehicleForUserResultData extends IApiVehicle {

}

export interface IApiAddVehicleForUserResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiAddVehicleForUserResultData;
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

export interface IApiUpdateVehicleResultData extends IApiVehicle {

}

export interface IApiUpdateVehicleResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiUpdateVehicleResultData;
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

export interface IApiSavePermitSelectionForVehicleResultData extends IApiVehiclePermitSelections {
    oVehicleId?: string;
}

export interface IApiSavePermitSelectionForVehicleResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiSavePermitSelectionForVehicleResultData;
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

export interface IApiAddGiftCardForUserResultData {
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
    data?: IApiAddGiftCardForUserResultData;
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
    isPurchased?: boolean;
    giftcardProductId?: number;
    recipientLastName?: string;
    recipientPostal?: string;
}

export interface IApiSaveGiftCardSelectionsForUserResultData {
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
    data?: IApiSaveGiftCardSelectionsForUserResultData;
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
// apiGetIsValidRedemptionCodeForVehicle
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetIsValidRedemptionCodeForVehicleRequest {
    oVehicleId?: string;
    redemptionCode?: string;
}

export interface IApiGetIsValidRedemptionCodeForVehicleResultData {
    isValid?: boolean;
    message?: string;
    trackedShippingAmount?: number;
}

export interface IApiGetIsValidRedemptionCodeForVehicleResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiGetIsValidRedemptionCodeForVehicleResultData;
}

export function apiGetIsValidRedemptionCodeForVehicle(body?: any, params?: any): Observable<IApiGetIsValidRedemptionCodeForVehicleResult> {
    return httpPost<IApiGetIsValidRedemptionCodeForVehicleResult>(WebApi.GetIsValidRedemptionCodeForVehicle, params, body);
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
    id?: number;
    name?: string;
    nameFr?: string;
    price?: number;
    showConfirmation?: boolean;
    isTracked?: boolean;
}

export function apiGetShippingFees(params?: any): Observable<IApiGetShippingFeesResult[]> {
    return httpGet<IApiGetShippingFeesResult[]>(WebApi.GetShippingFees, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiGetGoogleMapKey
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiGetGoogleMapKeyRequest {

}

export interface IApiGetGoogleMapKeyResultData {
    key?: string;
}

export interface IApiGetGoogleMapKeyResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiGetGoogleMapKeyResultData;
}

export function apiGetGoogleMapKey(params?: any): Observable<IApiGetGoogleMapKeyResult[]> {
    return httpGet<IApiGetGoogleMapKeyResult[]>(WebApi.GetGoogleMapKey, params);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiSavePrePurchaseData
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiSavePrePurchaseDataRequest {
    language?: string,
    permits?: {
        oVehicleId?: string,
        redemptionCode?: string,
        productId?: number,
        dateStart?: Date,
        dateEnd?: Date,
        clubId?: string
    }[];
    giftCards?: {
        oVoucherId?: string,
        giftcardProductId?: number;
        recipientLastName?: string;
        recipientPostal?: string;
    }[],
    trackedShipping?: boolean,
    shippingTo?: number, // 0=primary, 1=alternate
    alternateAddress?: {
        addressLine1?: string,
        addressLine2?: string,
        city?: string,
        postalCode?: string,
        province?: string, // key: ON
        country?: string // key: CA
    }
}

export interface IApiSavePrePurchaseDataResultData {
    ticket?: string;
    orderId?: string;
    environment?: string;
    amount?: number;
}

export interface IApiSavePrePurchaseDataResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: IApiSavePrePurchaseDataResultData;
}

export function apiSavePrePurchaseData(body?: any, params?: any): Observable<IApiSavePrePurchaseDataResult> {
    return httpPost<IApiSavePrePurchaseDataResult>(WebApi.SavePrePurchaseData, params, body);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiSendGiftCardPdf
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiSendGiftCardPdfRequest {
    orderId?: string;
}

export interface IApiSendGiftCardPdfResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: any;
}

export function apiSendGiftCardPdf(body?: any, params?: any): Observable<IApiSendGiftCardPdfResult> {
    return httpPost<IApiSendGiftCardPdfResult>(WebApi.SendGiftCardPdf, params, body);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// apiMonerisComplete
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IApiMonerisCompleteRequest {
    message?: string;
}

export interface IApiMonerisCompleteResult {
    isSuccessful?: boolean;
    errorMessage?: string;
    data?: any;
}

export function apiMonerisComplete(body?: any, params?: any, url: string = ""): Observable<IApiMonerisCompleteResult> {
    return httpPost<IApiMonerisCompleteResult>(url /*WebApi.MonerisComplete*/, params, body);
}
