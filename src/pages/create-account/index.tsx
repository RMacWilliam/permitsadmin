import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page"
import { IApiGetCorrespondenceLanguagesResult, IApiGetCountriesResult, IApiGetProvincesResult, apiGetCorrespondenceLanguages, apiGetCountries, apiGetProvinces } from "@/custom/api";
import { AppContext, IAppContextValues, IKeyValue, IParentKeyValue } from "@/custom/app-context";
import { getKeyValueFromSelect, getParentKeyValueFromSelect, sortArray } from "@/custom/utilities";
import { getLocalizedValue } from "@/localization/i18n";
import Head from "next/head"
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Observable, Subscription, forkJoin } from "rxjs";

export default function CreateAccountPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(true);

    return (
        <UnauthenticatedPageLayout showAlert={showAlert}>
            <CreateAccount appContext={appContext} router={router} setShowAlert={setShowAlert}></CreateAccount>
        </UnauthenticatedPageLayout>
    )
}

function CreateAccount({ appContext, router, setShowAlert }
    : {
        appContext: IAppContextValues,
        router: NextRouter,
        setShowAlert: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [firstName, setFirstName] = useState("");
    const [isFirstNameValid, setIsFirstNameValid] = useState(true);

    const [middleInitial, setMiddleInitial] = useState("");
    const [isMiddleInitialValid, setIsMiddleInitialValid] = useState(true);

    const [lastName, setLastName] = useState("");
    const [isLastNameValid, setIsLastNameValid] = useState(true);

    const [addressLine1, setAddressLine1] = useState("");
    const [isAddressLine1Valid, setIsAddressLine1Valid] = useState(true);

    const [addressLine2, setAddressLine2] = useState("");
    const [isAddressLine2Valid, setIsAddressLine2Valid] = useState(true);

    const [city, setCity] = useState("");
    const [isCityValid, setIsCityValid] = useState(true);

    const [province, setProvince] = useState({ parent: "", key: "", value: "" });
    const [isProvinceValid, setIsProvinceValid] = useState(true);

    const [country, setCountry] = useState({ key: "", value: "" });
    const [isCountryValid, setIsCountryValid] = useState(true);

    const [postalCode, setPostalCode] = useState("");
    const [isPostalCodeValid, setIsPostalCodeValid] = useState(true);

    const [telephone, setTelephone] = useState("");
    const [isTelephoneValid, setIsTelephoneValid] = useState(true);

    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(true);

    const [password, setPassword] = useState("");
    const [isPasswordValid, setIsPasswordValid] = useState(true);

    const [confirmPassword, setConfirmPassword] = useState("");
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

    const [ofscContactPermission, setOfscContactPermission] = useState(-1);
    const [isOfscContactPermissionValid, setIsOfscContactPermissionValid] = useState(true);

    const [riderAdvantage, setRiderAdvantage] = useState(-1);
    const [isRiderAdvantageValid, setIsRiderAdvantageValid] = useState(true);

    const [volunteering, setVolunteering] = useState(-1);
    const [isVolunteeringValid, setIsVolunteeringValid] = useState(true);

    const [correspondenceLanguage, setCorrespondenceLanguage] = useState("");
    const [isCorrespondenceLanguageValid, setIsCorrespondenceLanguageValid] = useState(true);

    const [provincesData, setProvincesData] = useState([] as IParentKeyValue[]);
    const [countriesData, setCountriesData] = useState([] as IKeyValue[]);
    const [correspondenceLanguagesData, setCorrespondenceLanguagesData] = useState([] as IKeyValue[]);

    const t: Function = appContext.translation.t;

    useEffect(() => {
        // Get data from api.
        const batchApi: Observable<any>[] = [
            apiGetProvinces(),
            apiGetCountries(),
            apiGetCorrespondenceLanguages()
        ];

        const subscription: Subscription = forkJoin(batchApi).subscribe({
            next: (results: any[]) => {
                // apiGetProvinces
                const apiGetProvincesResult: IApiGetProvincesResult[] = results[0] as IApiGetProvincesResult[];

                if (apiGetProvincesResult != undefined && apiGetProvincesResult.length > 0) {
                    const provinces: IParentKeyValue[] = apiGetProvincesResult.map<IParentKeyValue>(x => ({
                        parent: x?.parent ?? "",
                        key: x?.key ?? "",
                        value: x?.value ?? "",
                        valueFr: x?.valueFr ?? ""
                    }));

                    setProvincesData(provinces);
                }

                // apiGetCountries
                const apiGetCountriesResult: IApiGetCountriesResult[] = results[1] as IApiGetCountriesResult[];

                if (apiGetCountriesResult != undefined && apiGetCountriesResult.length > 0) {
                    const countries: IKeyValue[] = apiGetCountriesResult.map<IKeyValue>(x => ({
                        key: x?.key ?? "",
                        value: x?.value ?? "",
                        valueFr: x?.valueFr ?? ""
                    }));

                    setCountriesData(countries);
                }

                // apiGetCorrespondenceLanguages
                const apiGetCorrespondenceLanguagesResult: IApiGetCorrespondenceLanguagesResult[] = results[2] as IApiGetCorrespondenceLanguagesResult[];

                if (apiGetCorrespondenceLanguagesResult != undefined && apiGetCorrespondenceLanguagesResult.length > 0) {
                    const correspondenceLanguages: IKeyValue[] = apiGetCorrespondenceLanguagesResult.map<IKeyValue>(x => ({
                        key: x?.key ?? "",
                        value: x?.value ?? "",
                        valueFr: x?.valueFr ?? ""
                    }));

                    setCorrespondenceLanguagesData(correspondenceLanguages);
                }
            },
            error: (error: any) => {
                //checkResponseStatus(error);
            },
            complete: () => {
                setShowAlert(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Head>
                <title>{t("CreateAccount.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h4 className="mb-3">{t("CreateAccount.Title")}</h4>

            <p>{t("CreateAccount.PleaseCompleteInformationBelow")}</p>

            <div className="card mb-3">
                <h5 className="card-header bg-success-subtle">
                    {t("CreateAccount.ContactInfo.Title")}
                </h5>

                <div className="card-body">
                    <div className="row">
                        <div className="col-12">
                            <div className="form-floating mb-2">
                                <input type="email" className={`form-control ${isEmailValid ? "" : "is-invalid"}`} id="contact-info-email" placeholder={t("CreateAccount.ContactInfo.EmailAddress")} maxLength={200} value={email} onChange={(e: any) => setEmail(e.target.value)} />
                                <label className="required" htmlFor="contact-info-email">{t("CreateAccount.ContactInfo.EmailAddress")}</label>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 col-md-6">
                            <div className="form-floating mb-2 mb-md-0">
                                <input type="text" className={`form-control ${isPasswordValid ? "" : "is-invalid"}`} id="contact-info-password" placeholder={t("CreateAccount.ContactInfo.Password")} maxLength={200} value={password} onChange={(e: any) => setPassword(e.target.value)} />
                                <label className="required" htmlFor="contact-info-password">{t("CreateAccount.ContactInfo.Password")}</label>
                            </div>
                        </div>

                        <div className="col-12 col-md-6">
                            <div className="form-floating">
                                <input type="text" className={`form-control ${isConfirmPasswordValid ? "" : "is-invalid"}`} id="contact-info-confirm-password" placeholder={t("CreateAccount.ContactInfo.ConfirmPassword")} maxLength={200} value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} />
                                <label className="required" htmlFor="contact-info-confirm-password">{t("CreateAccount.ContactInfo.ConfirmPassword")}</label>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <hr />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 col-md-4">
                            <div className="form-floating mb-2">
                                <input type="text" className={`form-control ${isFirstNameValid ? "" : "is-invalid"}`} id="contact-info-first-name" placeholder={t("CreateAccount.ContactInfo.FirstName")} maxLength={150} value={firstName} onChange={(e: any) => setFirstName(e.target.value)} />
                                <label className="required" htmlFor="contact-info-first-name">{t("CreateAccount.ContactInfo.FirstName")}</label>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="form-floating mb-2">
                                <input type="text" className={`form-control ${isMiddleInitialValid ? "" : "is-invalid"}`} id="contact-info-middle-initial" placeholder={t("CreateAccount.ContactInfo.MiddleInitial")} maxLength={1} value={middleInitial} onChange={(e: any) => setMiddleInitial(e.target.value)} />
                                <label htmlFor="contact-info-middle-initial">{t("CreateAccount.ContactInfo.MiddleInitial")}</label>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="form-floating mb-2">
                                <input type="text" className={`form-control ${isLastNameValid ? "" : "is-invalid"}`} id="contact-info-last-name" placeholder={t("CreateAccount.ContactInfo.LastName")} maxLength={150} value={lastName} onChange={(e: any) => setLastName(e.target.value)} />
                                <label className="required" htmlFor="contact-info-last-name">{t("CreateAccount.ContactInfo.LastName")}</label>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 col-md-6">
                            <div className="form-floating mb-2">
                                <input type="text" className={`form-control ${isAddressLine1Valid ? "" : "is-invalid"}`} id="contact-info-address-line-1" placeholder={t("CreateAccount.ContactInfo.AddressLine1")} maxLength={30} value={addressLine1} onChange={(e: any) => setAddressLine1(e.target.value)} />
                                <label className="required" htmlFor="contact-info-address-line-1">{t("CreateAccount.ContactInfo.AddressLine1")}</label>
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="form-floating mb-2">
                                <input type="text" className={`form-control ${isAddressLine2Valid ? "" : "is-invalid"}`} id="contact-info-address-line-2" placeholder={t("CreateAccount.ContactInfo.AddressLine2")} maxLength={30} value={addressLine2} onChange={(e: any) => setAddressLine2(e.target.value)} />
                                <label htmlFor="contact-info-address-line-2">{t("CreateAccount.ContactInfo.AddressLine2")}</label>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 col-md-4">
                            <div className="form-floating mb-2">
                                <input type="text" className={`form-control ${isCityValid ? "" : "is-invalid"}`} id="contact-info-city" placeholder={t("CreateAccount.ContactInfo.CityTownOrVillage")} maxLength={30} value={city} onChange={(e: any) => setCity(e.target.value)} />
                                <label className="required" htmlFor="contact-info-city">{t("CreateAccount.ContactInfo.CityTownOrVillage")}</label>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="form-floating mb-2">
                                <select className={`form-select ${isProvinceValid ? "" : "is-invalid"}`} id="contact-info-province" aria-label={t("CreateAccount.ContactInfo.ProvinceState")} value={getSelectedProvinceStateOption()} onChange={(e: any) => provinceChange(e)}>
                                    <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                    {provincesData != undefined && provincesData.length > 0 && getProvinceData().map(provinceData => (
                                        <option value={`${country.key}|${provinceData.key}`} key={`${country.key}|${provinceData.key}`}>{getLocalizedValue(provinceData)}</option>
                                    ))}
                                </select>
                                <label className="required" htmlFor="contact-info-province">{t("CreateAccount.ContactInfo.ProvinceState")}</label>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="form-floating mb-2">
                                <select className={`form-select ${isCountryValid ? "" : "is-invalid"}`} id="contact-info-country" aria-label={t("CreateAccount.ContactInfo.Country")} value={country.key} onChange={(e: any) => countryChange(e)}>
                                    <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                    {countriesData != undefined && countriesData.length > 0 && getCountriesData().map(countryData => (
                                        <option value={countryData.key} key={countryData.key}>{getLocalizedValue(countryData)}</option>
                                    ))}
                                </select>
                                <label className="required" htmlFor="contact-info-country">{t("CreateAccount.ContactInfo.Country")}</label>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 col-md-6">
                            <div className="form-floating mb-2 mb-md-0">
                                <input type="text" className={`form-control ${isPostalCodeValid ? "" : "is-invalid"}`} id="contact-info-postal-code" placeholder={t("CreateAccount.ContactInfo.PostalZipCode")} maxLength={7} value={postalCode} onChange={(e: any) => setPostalCode(e.target.value)} />
                                <label className="required" htmlFor="contact-info-postal-code">{t("CreateAccount.ContactInfo.PostalZipCode")}</label>
                            </div>
                        </div>

                        <div className="col-12 col-md-6">
                            <div className="form-floating">
                                <input type="text" className={`form-control ${isTelephoneValid ? "" : "is-invalid"}`} id="contact-info-telephone" placeholder={t("CreateAccount.ContactInfo.Telephone")} maxLength={10} value={telephone} onChange={(e: any) => setTelephone(e.target.value)} />
                                <label className="required" htmlFor="contact-info-telephone">{t("CreateAccount.ContactInfo.Telephone")}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb-3">
                <h5 className="card-header bg-success-subtle">
                    {t("CreateAccount.Preferences.Title")}
                </h5>

                <div className="card-body">
                    <div className="row">
                        <div className="col-12 mb-2">
                            <label htmlFor="account-preferences-ofsc-contact-permission" className="form-label required">{t("CreateAccount.Preferences.OfscConsent")}</label>
                            <label htmlFor="account-preferences-ofsc-contact-permission" className="form-label">{t("CreateAccount.Preferences.OfscConsentMore")}</label>
                            <select className={`form-select ${isOfscContactPermissionValid ? "" : "is-invalid"}`} id="account-preferences-ofsc-contact-permission" aria-label={t("CreateAccount.Preferences.OfscConsent")} value={ofscContactPermission.toString()} onChange={(e: any) => setOfscContactPermission(Number(e.target.value))}>
                                <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                                <option value="1">{t("Common.Yes")}</option>
                                <option value="0">{t("Common.No")}</option>
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 mb-2">
                            <label htmlFor="account-preferences-rider-advantage" className="form-label required">{t("CreateAccount.Preferences.RiderAdvantage")}</label>
                            <select className={`form-select ${isRiderAdvantageValid ? "" : "is-invalid"}`} id="account-preferences-rider-advantage" aria-label={t("CreateAccount.Preferences.RiderAdvantage")} value={riderAdvantage.toString()} onChange={(e: any) => setRiderAdvantage(Number(e.target.value))}>
                                <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                                <option value="1">{t("Common.Yes")}</option>
                                <option value="0">{t("Common.No")}</option>
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 mb-2">
                            <label htmlFor="account-preferences-volunteering" className="form-label required">{t("CreateAccount.Preferences.Volunteering")}</label>
                            <select className={`form-select ${isVolunteeringValid ? "" : "is-invalid"}`} id="account-preferences-volunteering" aria-label={t("CreateAccount.Preferences.Volunteering")} value={volunteering.toString()} onChange={(e: any) => setVolunteering(Number(e.target.value))}>
                                <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                                <option value="0">{t("CreateAccount.Preferences.NoIAmNotInterestedInVolunteering")}</option>
                                <option value="1">{t("CreateAccount.Preferences.YesIAlreadyVolunteer")}</option>
                                <option value="2">{t("CreateAccount.Preferences.YesIdLikeToVolunteer")}</option>
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <label htmlFor="account-preferences-correspondence-language" className="form-label required">{t("CreateAccount.Preferences.CorrespondenceLanguage")}</label>
                            <select className={`form-select ${isCorrespondenceLanguageValid ? "" : "is-invalid"}`} id="account-preferences-correspondence-language" aria-label={t("CreateAccount.Preferences.CorrespondenceLanguage")} value={correspondenceLanguage} onChange={(e: any) => setCorrespondenceLanguage(e.target.value)}>
                                <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                {correspondenceLanguagesData != undefined && correspondenceLanguagesData.length > 0 && getCorrespondenceLanguagesData().map(correspondenceLanguageData => (
                                    <option value={correspondenceLanguageData.key} key={correspondenceLanguageData.key}>{getLocalizedValue(correspondenceLanguageData)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <span className="text-danger me-1">*</span> = {t("CreateAccount.ContactInfo.MandatoryField")}
                </div>
            </div>
        </>
    )

    function getSelectedProvinceStateOption(): string {
        let result: string = "";

        if (country != undefined && country?.key != undefined && country.key !== ""
            && province != undefined && province?.key != undefined && province.key !== "") {

            result = country?.key + "|" + province?.key
        }

        return result;
    }

    function provinceChange(e: any): void {
        setProvince(getParentKeyValueFromSelect(e) ?? { parent: "", key: "", value: "" });
    }

    function getProvinceData(): IParentKeyValue[] {
        let result: IParentKeyValue[] = [];

        if (provincesData != undefined && provincesData.length > 0) {
            if (appContext.translation.i18n.language === "fr") {
                result = sortArray(provincesData.filter(x => x.parent === country.key), ["valueFr"]);
            } else {
                result = sortArray(provincesData.filter(x => x.parent === country.key), ["value"]);
            }
        }

        return result;
    }

    function countryChange(e: any): void {
        setCountry(getKeyValueFromSelect(e) ?? { key: "", value: "" });
        setProvince({ parent: "", key: "", value: "" });
    }

    function getCountriesData(): IKeyValue[] {
        return countriesData?.filter(x => x?.key !== 'OT');
    }

    function getCorrespondenceLanguagesData(): IKeyValue[] {
        return correspondenceLanguagesData;
    }

    function getCorrespondenceLanguage(key?: string): IKeyValue | undefined {
        let result: IKeyValue | undefined = undefined;

        if (key != undefined) {
            result = correspondenceLanguagesData?.filter(x => x?.key === key)[0];
        }

        return result;
    }


}
