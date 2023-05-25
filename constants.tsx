const WebApiBaseUrl: string = "https://permitsapi.azurewebsites.net/api/";

export class WebApi {
    // User
    static LoginUrl: string = WebApiBaseUrl + "user/validateuser";
    static LogoutUrl: string = WebApiBaseUrl + "............................";
    static GetUserDetails: string = WebApiBaseUrl + "user/getuserdetails";
    static SaveUserDetails: string = WebApiBaseUrl + "user/saveuserdetails";
    static GetUserPreferences: string = WebApiBaseUrl + "user/getuserpreferences";
    static SaveUserPreferences: string = WebApiBaseUrl + "user/saveuserpreferences";

    // Utils
    static GetProvinces: string = WebApiBaseUrl + "utils/getprovinces";
    static GetCountries: string = WebApiBaseUrl + "utils/getcountries";
    static GetClubs: string = WebApiBaseUrl + "utils/getclubs";

    // Vehicle
    static GetVehiclesAndPermitsForUser: string = WebApiBaseUrl + "vehicle/getvehiclesandpermitsforuser";
    static GetVehicleMakes: string = WebApiBaseUrl + "vehicle/getvehiclemakes";
    static AddVehicleForUser: string = WebApiBaseUrl + "vehicle/addvehicleforuser";
    static UpdateVehicle: string = WebApiBaseUrl + "vehicle/updatevehicle";
    static DeleteVehicle: string = WebApiBaseUrl + "vehicle/deletevehicle";
    static SavePermitSelectionForVehicle: string = WebApiBaseUrl + "vehicle/savepermitselectionforvehicle";

    // GiftCard
    static GetGiftcardsForCurrentSeasonForUser: string = WebApiBaseUrl + "giftcard/getgiftcardsforcurrentseasonforuser";
    static GetAvailableGiftCards: string = WebApiBaseUrl + "giftcard/getavailablegiftcards";
    static GetRedeemableGiftCardsForUser: string = WebApiBaseUrl + "giftcard/getredeemablegiftcardsforuser";

    // Permit
    static GetProcessingFee: string = WebApiBaseUrl + "permit/getprocessingfee";
    static GetShippingFees: string = WebApiBaseUrl + "permit/getshippingfees";
}