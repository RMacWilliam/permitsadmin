import { ITranslation } from "@/custom/app-context";
import { Translation, getI18n } from "react-i18next";

const WebApiBaseUrl: string = "https://permitsapi.azurewebsites.net/api/";

export const GlobalAppContext: { token?: string, translation?: ITranslation } = { token: "", translation: { t: Translation, i18n: getI18n() } };

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
    static AddGiftCardForUser: string = WebApiBaseUrl + "giftcard/addgiftcardforuser";
    static SaveGiftCardSelectionsForUser: string = WebApiBaseUrl + "giftcard/savegiftcardselectionsforuser";
    static DeleteGiftCard: string = WebApiBaseUrl + "giftcard/deletegiftcard";

    // Permit
    static GetProcessingFee: string = WebApiBaseUrl + "permit/getprocessingfee";
    static GetShippingFees: string = WebApiBaseUrl + "permit/getshippingfees";
}

export class Constants {
    static get PleaseSelect(): string {
        return GlobalAppContext?.translation?.i18n?.language === "fr" ? "(fr)Please select" : "Please select";
    }
}
