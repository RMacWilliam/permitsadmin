import { ITranslation } from "@/custom/app-context";
import { Translation, getI18n } from "react-i18next";

export const GlobalAppContext: { token?: string, translation?: ITranslation } = { token: "", translation: { t: Translation, i18n: getI18n() } };

export class WebApi {
    static BaseUrl: string = "https://permitsapi.azurewebsites.net/api/";

    // User
    static LoginUrl: string = WebApi.BaseUrl + "user/validateuser";
    static LogoutUrl: string = WebApi.BaseUrl + "............................";
    static GetUserDetails: string = WebApi.BaseUrl + "user/getuserdetails";
    static SaveUserDetails: string = WebApi.BaseUrl + "user/saveuserdetails";
    static GetUserPreferences: string = WebApi.BaseUrl + "user/getuserpreferences";
    static SaveUserPreferences: string = WebApi.BaseUrl + "user/saveuserpreferences";

    // Utils
    static GetProvinces: string = WebApi.BaseUrl + "utils/getprovinces";
    static GetCountries: string = WebApi.BaseUrl + "utils/getcountries";
    static GetClubs: string = WebApi.BaseUrl + "utils/getclubs";

    // Vehicle
    static GetVehiclesAndPermitsForUser: string = WebApi.BaseUrl + "vehicle/getvehiclesandpermitsforuser";
    static GetVehicleMakes: string = WebApi.BaseUrl + "vehicle/getvehiclemakes";
    static AddVehicleForUser: string = WebApi.BaseUrl + "vehicle/addvehicleforuser";
    static UpdateVehicle: string = WebApi.BaseUrl + "vehicle/updatevehicle";
    static DeleteVehicle: string = WebApi.BaseUrl + "vehicle/deletevehicle";
    static SavePermitSelectionForVehicle: string = WebApi.BaseUrl + "vehicle/savepermitselectionforvehicle";

    // GiftCard
    static GetGiftcardsForCurrentSeasonForUser: string = WebApi.BaseUrl + "giftcard/getgiftcardsforcurrentseasonforuser";
    static GetAvailableGiftCards: string = WebApi.BaseUrl + "giftcard/getavailablegiftcards";
    static GetRedeemableGiftCardsForUser: string = WebApi.BaseUrl + "giftcard/getredeemablegiftcardsforuser";
    static AddGiftCardForUser: string = WebApi.BaseUrl + "giftcard/addgiftcardforuser";
    static SaveGiftCardSelectionsForUser: string = WebApi.BaseUrl + "giftcard/savegiftcardselectionsforuser";
    static DeleteGiftCard: string = WebApi.BaseUrl + "giftcard/deletegiftcard";

    // Permit
    static GetProcessingFee: string = WebApi.BaseUrl + "permit/getprocessingfee";
    static GetShippingFees: string = WebApi.BaseUrl + "permit/getshippingfees";
}

export class Constants {
    static MaxClassicYear: number = 1999;
    
    static get PleaseSelect(): string {
        return GlobalAppContext?.translation?.i18n?.language === "fr" ? "(fr)Please select" : "Please select";
    }

    static MtoWaiverPdf: string = "MTO Waiver ENG-FRE 2022-09-22.pdf";
    static OfscWaiverPdfEn: string = "OFSC PS Waiver July 2022-23.pdf";
    static OfscWaiverPdfFr: string = "OFSC PS Waiver July 2022-23 FR.pdf";
}
