import UnauthenticatedPageLayout from "@/components/layouts/unauthenticated-page"
import { IApiCreateUserRequest, IApiCreateUserResult, IApiGetCorrespondenceLanguagesResult, IApiGetCountriesResult, IApiGetProvincesResult, apiCreateUser, apiGetCorrespondenceLanguages, apiGetCountries, apiGetProvinces } from "@/custom/api";
import { AppContext, IAppContextValues, IKeyValue, IParentKeyValue } from "@/custom/app-context";
import { checkResponseStatus, getKeyValueFromSelect, getParentKeyValueFromSelect, validatePostalCode, iv, sortArray, validatePassword, validateZipCode } from "@/custom/utilities";
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

    const [step, setStep] = useState(0);

    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(undefined as boolean | undefined);

    const [password, setPassword] = useState("");
    const [isPasswordValid, setIsPasswordValid] = useState(undefined as boolean | undefined);
    const [isPasswordFormatValid, setIsPasswordFormatValid] = useState(undefined as boolean | undefined);

    const [confirmPassword, setConfirmPassword] = useState("");
    const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(undefined as boolean | undefined);
    const [isConfirmPasswordMatchValid, setIsConfirmPasswordMatchValid] = useState(undefined as boolean | undefined);

    const [firstName, setFirstName] = useState("");
    const [isFirstNameValid, setIsFirstNameValid] = useState(undefined as boolean | undefined);

    const [middleInitial, setMiddleInitial] = useState("");
    const [isMiddleInitialValid, setIsMiddleInitialValid] = useState(undefined as boolean | undefined);

    const [lastName, setLastName] = useState("");
    const [isLastNameValid, setIsLastNameValid] = useState(undefined as boolean | undefined);

    const [addressLine1, setAddressLine1] = useState("");
    const [isAddressLine1Valid, setIsAddressLine1Valid] = useState(undefined as boolean | undefined);

    const [addressLine2, setAddressLine2] = useState("");
    const [isAddressLine2Valid, setIsAddressLine2Valid] = useState(undefined as boolean | undefined);

    const [city, setCity] = useState("");
    const [isCityValid, setIsCityValid] = useState(undefined as boolean | undefined);

    const [province, setProvince] = useState({ parent: "", key: "", value: "" });
    const [isProvinceValid, setIsProvinceValid] = useState(undefined as boolean | undefined);

    const [country, setCountry] = useState({ key: "", value: "" });
    const [isCountryValid, setIsCountryValid] = useState(undefined as boolean | undefined);

    const [postalCode, setPostalCode] = useState("");
    const [isPostalCodeValid, setIsPostalCodeValid] = useState(undefined as boolean | undefined);
    const [isPostalCodeFormatValid, setIsPostalCodeFormatValid] = useState(undefined as boolean | undefined);

    const [telephone, setTelephone] = useState("");
    const [isTelephoneValid, setIsTelephoneValid] = useState(undefined as boolean | undefined);

    const [ofscContactPermission, setOfscContactPermission] = useState(-1);
    const [isOfscContactPermissionValid, setIsOfscContactPermissionValid] = useState(undefined as boolean | undefined);

    const [riderAdvantage, setRiderAdvantage] = useState(-1);
    const [isRiderAdvantageValid, setIsRiderAdvantageValid] = useState(undefined as boolean | undefined);

    const [volunteering, setVolunteering] = useState(-1);
    const [isVolunteeringValid, setIsVolunteeringValid] = useState(undefined as boolean | undefined);

    const [correspondenceLanguage, setCorrespondenceLanguage] = useState("");
    const [isCorrespondenceLanguageValid, setIsCorrespondenceLanguageValid] = useState(undefined as boolean | undefined);

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

    if (step === 0) {
        return (
            <>
                <Head>
                    <title>{t("CreateAccount.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h4 className="mb-3">{t("CreateAccount.Title")}</h4>

                <p>{t("CreateAccount.PleaseCompleteInformationBelow")}</p>

                <div className="row">
                    <div className="col-12 mb-2">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isEmailValid)}`}>
                                <input type="email" className={`form-control ${iv(isEmailValid)}`} id="create-account-contact-info-email" placeholder={t("CreateAccount.ContactInfo.EmailAddress")} maxLength={200} aria-describedby="create-account-contact-info-email-validation" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                                <label className="required" htmlFor="create-account-contact-info-email">{t("CreateAccount.ContactInfo.EmailAddress")}</label>
                            </div>
                            <div id="create-account-contact-info-email-validation" className="invalid-feedback">{t("CreateAccount.ContactInfo.EmailAddress")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 col-md-6 mb-2 mb-md-0">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isPasswordValid && isPasswordFormatValid)}`}>
                                <input type="text" className={`form-control ${iv(isPasswordValid && isPasswordFormatValid)}`} id="create-account-contact-info-password" placeholder={t("CreateAccount.ContactInfo.Password")} maxLength={200} aria-describedby="create-account-contact-info-password-validation" value={password} onChange={(e: any) => setPassword(e.target.value)} />
                                <label className="required" htmlFor="create-account-contact-info-password">{t("CreateAccount.ContactInfo.Password")}</label>
                            </div>
                            <div id="create-account-contact-info-password-validation" className="invalid-feedback">
                                {!isPasswordValid && (
                                    <>
                                        {t("CreateAccount.ContactInfo.Password")} {t("Common.Validation.IsRequiredSuffix")}
                                    </>
                                )}

                                {isPasswordValid && !isPasswordFormatValid && (
                                    <>
                                        {t("CreateAccount.ContactInfo.InvalidPassword")}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 mb-2">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isConfirmPasswordValid && isConfirmPasswordMatchValid)}`}>
                                <input type="text" className={`form-control ${iv(isConfirmPasswordValid && isConfirmPasswordMatchValid)}`} id="create-account-contact-info-confirm-password" placeholder={t("CreateAccount.ContactInfo.ConfirmPassword")} maxLength={200} aria-describedby="create-account-contact-info-confirm-password-validation" value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} />
                                <label className="required" htmlFor="create-account-contact-info-confirm-password">{t("CreateAccount.ContactInfo.ConfirmPassword")}</label>
                            </div>
                            <div id="create-account-contact-info-confirm-password-validation" className="invalid-feedback">
                                {!isConfirmPasswordValid && (
                                    <>
                                        {t("CreateAccount.ContactInfo.ConfirmPassword")} {t("Common.Validation.IsRequiredSuffix")}
                                    </>
                                )}
                                {isConfirmPasswordValid && !isConfirmPasswordMatchValid && (
                                    <>
                                        {t("CreateAccount.ContactInfo.InvalidPasswordMatch")}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-3">
                    <div className="col-12 col-md-4 mb-2">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isFirstNameValid)}`}>
                                <input type="text" className={`form-control ${iv(isFirstNameValid)}`} id="create-account-contact-info-first-name" placeholder={t("CreateAccount.ContactInfo.FirstName")} maxLength={150} aria-describedby="create-account-contact-info-first-name-validation" value={firstName} onChange={(e: any) => setFirstName(e.target.value)} />
                                <label className="required" htmlFor="create-account-contact-info-first-name">{t("CreateAccount.ContactInfo.FirstName")}</label>
                            </div>
                            <div id="create-account-contact-info-first-name-validation" className="invalid-feedback">{t("CreateAccount.ContactInfo.FirstName")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4 mb-2">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isMiddleInitialValid)}`}>
                                <input type="text" className={`form-control ${iv(isMiddleInitialValid)}`} id="create-account-contact-info-middle-initial" placeholder={t("CreateAccount.ContactInfo.MiddleInitial")} maxLength={1} aria-describedby="create-account-contact-info-middle-initial-validation" value={middleInitial} onChange={(e: any) => setMiddleInitial(e.target.value)} />
                                <label htmlFor="create-account-contact-info-middle-initial">{t("CreateAccount.ContactInfo.MiddleInitial")}</label>
                            </div>
                            <div id="create-account-contact-info-middle-initial-validation" className="invalid-feedback">{t("CreateAccount.ContactInfo.MiddleInitial")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4 mb-2">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isLastNameValid)}`}>
                                <input type="text" className={`form-control ${iv(isLastNameValid)}`} id="create-account-contact-info-last-name" placeholder={t("CreateAccount.ContactInfo.LastName")} maxLength={150} aria-describedby="create-account-contact-info-last-name-validation" value={lastName} onChange={(e: any) => setLastName(e.target.value)} />
                                <label className="required" htmlFor="create-account-contact-info-last-name">{t("CreateAccount.ContactInfo.LastName")}</label>
                            </div>
                            <div id="create-account-contact-info-last-name-validation" className="invalid-feedback">{t("CreateAccount.ContactInfo.LastName")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 col-md-6 mb-2">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isAddressLine1Valid)}`}>
                                <input type="text" className={`form-control ${iv(isAddressLine1Valid)}`} id="create-account-contact-info-address-line-1" placeholder={t("CreateAccount.ContactInfo.AddressLine1")} maxLength={30} aria-describedby="create-account-contact-info-address-line-1-validation" value={addressLine1} onChange={(e: any) => setAddressLine1(e.target.value)} />
                                <label className="required" htmlFor="create-account-contact-info-address-line-1">{t("CreateAccount.ContactInfo.AddressLine1")}</label>
                            </div>
                            <div id="create-account-contact-info-address-line-1-validation" className="invalid-feedback">{t("CreateAccount.ContactInfo.AddressLine1")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 mb-2">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isAddressLine2Valid)}`}>
                                <input type="text" className={`form-control ${iv(isAddressLine2Valid)}`} id="create-account-contact-info-address-line-2" placeholder={t("CreateAccount.ContactInfo.AddressLine2")} maxLength={30} aria-describedby="create-account-contact-info-address-line-2-validation" value={addressLine2} onChange={(e: any) => setAddressLine2(e.target.value)} />
                                <label htmlFor="create-account-contact-info-address-line-2">{t("CreateAccount.ContactInfo.AddressLine2")}</label>
                            </div>
                            <div id="create-account-contact-info-address-line-2-validation" className="invalid-feedback">{t("CreateAccount.ContactInfo.AddressLine2")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 col-md-4 mb-2">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isCityValid)}`}>
                                <input type="text" className={`form-control ${iv(isCityValid)}`} id="create-account-contact-info-city" placeholder={t("CreateAccount.ContactInfo.CityTownOrVillage")} maxLength={30} aria-describedby="create-account-contact-info-city-validation" value={city} onChange={(e: any) => setCity(e.target.value)} />
                                <label className="required" htmlFor="create-account-contact-info-city">{t("CreateAccount.ContactInfo.CityTownOrVillage")}</label>
                            </div>
                            <div id="create-account-contact-info-city-validation" className="invalid-feedback">{t("CreateAccount.ContactInfo.CityTownOrVillage")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4 mb-2">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isCountryValid)}`}>
                                <select className={`form-select ${iv(isCountryValid)}`} id="create-account-contact-info-country" aria-label={t("CreateAccount.ContactInfo.Country")} aria-describedby="create-account-contact-info-country-validation" value={country.key} onChange={(e: any) => countryChange(e)}>
                                    <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                    {countriesData != undefined && countriesData.length > 0 && getCountriesData().map(countryData => (
                                        <option value={countryData.key} key={countryData.key}>{getLocalizedValue(countryData)}</option>
                                    ))}
                                </select>
                                <label className="required" htmlFor="create-account-contact-info-country">{t("CreateAccount.ContactInfo.Country")}</label>
                            </div>
                            <div id="create-account-contact-info-country-validation" className="invalid-feedback">{t("CreateAccount.ContactInfo.Country")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4 mb-2">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isProvinceValid)}`}>
                                <select className={`form-select ${iv(isProvinceValid)}`} id="create-account-contact-info-province" aria-label={t("CreateAccount.ContactInfo.ProvinceState")} aria-describedby="create-account-contact-info-province-validation" value={getSelectedProvinceStateOption()} onChange={(e: any) => provinceChange(e)}>
                                    <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                    {provincesData != undefined && provincesData.length > 0 && getProvinceData().map(provinceData => (
                                        <option value={`${country.key}|${provinceData.key}`} key={`${country.key}|${provinceData.key}`}>{getLocalizedValue(provinceData)}</option>
                                    ))}
                                </select>
                                <label className="required" htmlFor="create-account-contact-info-province">{t("CreateAccount.ContactInfo.ProvinceState")}</label>
                            </div>
                            <div id="create-account-contact-info-province-validation" className="invalid-feedback">{t("CreateAccount.ContactInfo.ProvinceState")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 col-md-6 mb-2 mb-md-0">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isPostalCodeValid && isPostalCodeFormatValid)}`}>
                                <input type="text" className={`form-control ${iv(isPostalCodeValid && isPostalCodeFormatValid)}`} id="create-account-contact-info-postal-code" placeholder={t("CreateAccount.ContactInfo.PostalZipCode")} maxLength={7} aria-describedby="create-account-contact-info-postal-code-validation" value={postalCode} onChange={(e: any) => setPostalCode(e.target.value)} />
                                <label className="required" htmlFor="create-account-contact-info-postal-code">{t("CreateAccount.ContactInfo.PostalZipCode")}</label>
                            </div>
                            <div id="create-account-contact-info-postal-code-validation" className="invalid-feedback">
                                {!isPostalCodeValid && (
                                    <>
                                        {t("CreateAccount.ContactInfo.PostalZipCode")} {t("Common.Validation.IsRequiredSuffix")}
                                    </>
                                )}
                                {isPostalCodeValid && !isPostalCodeFormatValid && (
                                    <>
                                        {t("CreateAccount.ContactInfo.InvalidPostalCodeFormat")}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 mb-2">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isTelephoneValid)}`}>
                                <input type="text" className={`form-control ${iv(isTelephoneValid)}`} id="create-account-contact-info-telephone" placeholder={t("CreateAccount.ContactInfo.Telephone")} maxLength={10} aria-describedby="create-account-contact-info-telephone-validation" value={telephone} onChange={(e: any) => setTelephone(e.target.value)} />
                                <label className="required" htmlFor="create-account-contact-info-telephone">{t("CreateAccount.ContactInfo.Telephone")}</label>
                            </div>
                            <div id="create-account-contact-info-telephone-validation" className="invalid-feedback">{t("CreateAccount.ContactInfo.Telephone")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                </div>

                <div className="row mt-3">
                    <div className="col-12">
                        <label htmlFor="create-account-account-preferences-ofsc-contact-permission" className="form-label required">{t("CreateAccount.Preferences.OfscConsent")}</label>
                        <label htmlFor="create-account-account-preferences-ofsc-contact-permission" className="form-label">{t("CreateAccount.Preferences.OfscConsentMore")}</label>
                        <select className={`form-select ${iv(isOfscContactPermissionValid)}`} id="create-account-account-preferences-ofsc-contact-permission" aria-label={t("CreateAccount.Preferences.OfscConsent")} aria-describedby="create-account-account-preferences-ofsc-contact-permission-validation" value={ofscContactPermission.toString()} onChange={(e: any) => setOfscContactPermission(Number(e.target.value))}>
                            <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                            <option value="1">{t("Common.Buttons.Yes")}</option>
                            <option value="0">{t("Common.Buttons.No")}</option>
                        </select>
                        <div id="create-account-account-preferences-ofsc-contact-permission-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                    </div>
                </div>

                <div className="row mt-3">
                    <div className="col-12">
                        <label htmlFor="create-account-account-preferences-rider-advantage" className="form-label required">{t("CreateAccount.Preferences.RiderAdvantage")}</label>
                        <select className={`form-select ${iv(isRiderAdvantageValid)}`} id="create-account-account-preferences-rider-advantage" aria-label={t("CreateAccount.Preferences.RiderAdvantage")} aria-describedby="create-account-account-preferences-rider-advantage-validation" value={riderAdvantage.toString()} onChange={(e: any) => setRiderAdvantage(Number(e.target.value))}>
                            <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                            <option value="1">{t("Common.Buttons.Yes")}</option>
                            <option value="0">{t("Common.Buttons.No")}</option>
                        </select>
                        <div id="create-account-account-preferences-rider-advantage-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                    </div>
                </div>

                <div className="row mt-3">
                    <div className="col-12">
                        <label htmlFor="create-account-account-preferences-volunteering" className="form-label required">{t("CreateAccount.Preferences.Volunteering")}</label>
                        <select className={`form-select ${iv(isVolunteeringValid)}`} id="create-account-account-preferences-volunteering" aria-label={t("CreateAccount.Preferences.Volunteering")} aria-describedby="create-account-account-preferences-volunteering-validation" value={volunteering.toString()} onChange={(e: any) => setVolunteering(Number(e.target.value))}>
                            <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                            <option value="0">{t("CreateAccount.Preferences.NoIAmNotInterestedInVolunteering")}</option>
                            <option value="1">{t("CreateAccount.Preferences.YesIAlreadyVolunteer")}</option>
                            <option value="2">{t("CreateAccount.Preferences.YesIdLikeToVolunteer")}</option>
                        </select>
                        <div id="create-account-account-preferences-volunteering-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                    </div>
                </div>

                <div className="row mt-3">
                    <div className="col-12 mb-2">
                        <label htmlFor="create-account-account-preferences-correspondence-language" className="form-label required">{t("CreateAccount.Preferences.CorrespondenceLanguage")}</label>
                        <select className={`form-select ${iv(isCorrespondenceLanguageValid)}`} id="create-account-account-preferences-correspondence-language" aria-label={t("CreateAccount.Preferences.CorrespondenceLanguage")} aria-describedby="create-account-account-preferences-correspondence-language-validation" value={correspondenceLanguage} onChange={(e: any) => setCorrespondenceLanguage(e.target.value)}>
                            <option value="" disabled>{t("Common.PleaseSelect")}</option>

                            {correspondenceLanguagesData != undefined && correspondenceLanguagesData.length > 0 && getCorrespondenceLanguagesData().map(correspondenceLanguageData => (
                                <option value={correspondenceLanguageData.key} key={correspondenceLanguageData.key}>{getLocalizedValue(correspondenceLanguageData)}</option>
                            ))}
                        </select>
                        <div id="create-account-account-preferences-correspondence-language-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                    </div>
                </div>

                <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-3">
                    <button className="btn btn-primary" onClick={() => createAccountClick()}>
                        {t("CreateAccount.CreateAccount")}
                    </button>

                    <button className="btn btn-primary" onClick={() => router.push("/")}>
                        {t("Common.Buttons.Cancel")}
                    </button>
                </div>
            </>
        )
    } else if (step === 1) {
        return (
            <>
                <Head>
                    <title>{t("CreateAccount.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h4 className="mb-3">{t("CreateAccount.Title")}</h4>

                <p>{t("CreateAccount.ThankYouForCreatingYourAccount")}</p>

                <p>{t("CreateAccount.VerificationEmailHasBeenSent")}</p>

                <div className="card">
                    <div className="card-body text-center">
                        <button className="btn btn-primary" onClick={() => router.push("/")}>
                            {t("CreateAccount.ReturnLogin")}
                        </button>
                    </div>
                </div>
            </>
        )
    }

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

    function createAccountClick(): void {
        const validateContactInfo: boolean = validateContactInfoDialog();
        const validateAccountPreferences: boolean = validateAccountPreferencesDialog();

        if (validateContactInfo && validateAccountPreferences) {
            const apiCreateAccountRequest: IApiCreateUserRequest = {
                email: email?.trim()?.substring(0, 200),
                password: password?.trim()?.substring(0, 200),
                firstName: firstName?.trim()?.substring(0, 150),
                initial: middleInitial?.trim()?.substring(0, 1),
                lastName: lastName?.trim()?.substring(0, 150),
                addressLine1: addressLine1?.trim()?.substring(0, 30),
                addressLine2: addressLine2?.trim()?.substring(0, 30),
                city: city?.trim()?.substring(0, 30),
                provinceId: province?.key,
                countryId: country?.key,
                postalCode: postalCode?.trim()?.substring(0, 7),
                telephone: telephone?.trim()?.substring(0, 10),
                ofscContactPermission: ofscContactPermission ?? -1,
                riderAdvantage: riderAdvantage ?? -1,
                volunteering: volunteering ?? -1,
                correspondenceLanguage: correspondenceLanguage ?? ""
            };

            setShowAlert(true);

            apiCreateUser(apiCreateAccountRequest).subscribe({
                next: (result: IApiCreateUserResult) => {
                    if (result?.isSuccessful && result?.data != undefined) {
                        setStep(1);
                    } else {

                    }
                },
                error: (error: any) => {
                    checkResponseStatus(error);
                },
                complete: () => {
                    setShowAlert(false);
                }
            });
        }
    }

    function validateContactInfoDialog(): boolean {
        let result: boolean = true;

        if (email.trim() === "") {
            setIsEmailValid(false);
            result = false;
        } else {
            setIsEmailValid(true);
        }

        if (password.trim() === "") {
            setIsPasswordValid(false);
            result = false;
        } else {
            setIsPasswordValid(true);
        }

        if (!validatePassword(password.trim())) {
            setIsPasswordFormatValid(false);
            result = false;
        } else {
            setIsPasswordFormatValid(true);
        }

        if (confirmPassword.trim() === "") {
            setIsConfirmPasswordValid(false);
            result = false;
        } else {
            setIsConfirmPasswordValid(true);
        }

        if (password.trim() !== confirmPassword.trim()) {
            setIsConfirmPasswordMatchValid(false);
            result = false;
        } else {
            setIsConfirmPasswordMatchValid(true);
        }

        if (firstName.trim() === "") {
            setIsFirstNameValid(false);
            result = false;
        } else {
            setIsFirstNameValid(true);
        }

        setIsMiddleInitialValid(true);

        if (lastName.trim() === "") {
            setIsLastNameValid(false);
            result = false;
        } else {
            setIsLastNameValid(true);
        }

        if (addressLine1.trim() === "") {
            setIsAddressLine1Valid(false);
            result = false;
        } else {
            setIsAddressLine1Valid(true);
        }

        setIsAddressLine2Valid(true);

        if (city.trim() === "") {
            setIsCityValid(false);
            result = false;
        } else {
            setIsCityValid(true);
        }

        if (province?.key == undefined || province.key === "") {
            setIsProvinceValid(false);
            result = false;
        } else {
            setIsProvinceValid(true);
        }

        if (country?.key == undefined || country.key === "") {
            setIsCountryValid(false);
            result = false;
        } else {
            setIsCountryValid(true);
        }

        if (postalCode.trim() === "") {
            setIsPostalCodeValid(false);
            result = false;
        } else {
            setIsPostalCodeValid(true);
        }

        if (country?.key === "CA") {
            if (!validatePostalCode(postalCode.trim())) {
                setIsPostalCodeFormatValid(false);
                result = false;
            } else {
                setIsPostalCodeFormatValid(true);
            }
        } else if (country?.key === "US") {
            if (!validateZipCode(postalCode.trim())) {
                setIsPostalCodeFormatValid(false);
                result = false;
            } else {
                setIsPostalCodeFormatValid(true);
            }
        }

        if (telephone.trim() === "") {
            setIsTelephoneValid(false);
            result = false;
        } else {
            setIsTelephoneValid(true);
        }

        return result;
    }

    function validateAccountPreferencesDialog(): boolean {
        let result: boolean = true;

        if (ofscContactPermission === -1) {
            setIsOfscContactPermissionValid(false);
            result = false;
        } else {
            setIsOfscContactPermissionValid(true);
        }

        if (riderAdvantage === -1) {
            setIsRiderAdvantageValid(false);
            result = false;
        } else {
            setIsRiderAdvantageValid(true);
        }

        if (volunteering === -1) {
            setIsVolunteeringValid(false);
            result = false;
        } else {
            setIsVolunteeringValid(true);
        }

        if (correspondenceLanguage === "") {
            setIsCorrespondenceLanguageValid(false);
            result = false;
        } else {
            setIsCorrespondenceLanguageValid(true);
        }

        return result;
    }
}
