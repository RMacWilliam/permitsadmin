import { useContext, useEffect, useState } from 'react'
import { AppContext, IAppContextValues, IKeyValue, IParentKeyValue } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import Modal from 'react-bootstrap/Modal';
import { checkResponseStatus, getApiErrorMessage, getGuid, getKeyValueFromSelect, getParentKeyValueFromSelect, iv, sortArray, validatePostalCode, validateZipCode } from '@/custom/utilities';
import { NextRouter, useRouter } from 'next/router';
import CartItemsAlert from '@/components/cart-items-alert';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { IApiGetCorrespondenceLanguagesResult, IApiGetCountriesResult, IApiGetProvincesResult, IApiGetUserDetailsResult, IApiGetUserPreferencesResult, IApiSaveUserDetailsRequest, IApiSaveUserDetailsResult, IApiSaveUserPreferencesRequest, IApiSaveUserPreferencesResult, IApiUpdateVehicleResult, apiGetCorrespondenceLanguages, apiGetCountries, apiGetProvinces, apiGetUserDetails, apiGetUserPreferences, apiSaveUserDetails, apiSaveUserPreferences } from '@/custom/api';
import { getLocalizedValue, getLocalizedValue2 } from '@/localization/i18n';
import Loading from '@/components/loading';

enum ContactPageMode {
    Unknown = 0,
    Regular = 1,
    FirstLoginOfSeason = 2
}

export default function ContactPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(true);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "contact" });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthenticatedPageLayout showAlert={showAlert}>
            <Contact appContext={appContext} router={router} setShowAlert={setShowAlert}></Contact>
        </AuthenticatedPageLayout>
    )
}

function Contact({ appContext, router, setShowAlert }
    : {
        appContext: IAppContextValues,
        router: NextRouter,
        setShowAlert: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [pageLoaded, setPageLoaded] = useState(false);

    const [mode, setMode] = useState(ContactPageMode.Unknown);

    const [showContactInfoDialog, setShowContactInfoDialog] = useState(false);
    const [contactInfoDialogErrorMessage, setContactInfoDialogErrorMessage] = useState("");

    const [firstLoginOfSeasonErrorMessages, setFirstLoginOfSeasonErrorMessages] = useState<string[]>([]);

    const [firstName, setFirstName] = useState("");
    const [isFirstNameValid, setIsFirstNameValid] = useState<boolean | undefined>(undefined);

    const [middleInitial, setMiddleInitial] = useState("");
    const [isMiddleInitialValid, setIsMiddleInitialValid] = useState<boolean | undefined>(undefined);

    const [lastName, setLastName] = useState("");
    const [isLastNameValid, setIsLastNameValid] = useState<boolean | undefined>(undefined);

    const [addressLine1, setAddressLine1] = useState("");
    const [isAddressLine1Valid, setIsAddressLine1Valid] = useState<boolean | undefined>(undefined);

    const [addressLine2, setAddressLine2] = useState("");
    const [isAddressLine2Valid, setIsAddressLine2Valid] = useState<boolean | undefined>(undefined);

    const [city, setCity] = useState("");
    const [isCityValid, setIsCityValid] = useState<boolean | undefined>(undefined);

    const [province, setProvince] = useState<IParentKeyValue>({ parent: "", key: "", value: "" });
    const [isProvinceValid, setIsProvinceValid] = useState<boolean | undefined>(undefined);

    const [country, setCountry] = useState<IKeyValue>({ key: "", value: "" });
    const [isCountryValid, setIsCountryValid] = useState<boolean | undefined>(undefined);

    const [postalCode, setPostalCode] = useState("");
    const [isPostalCodeValid, setIsPostalCodeValid] = useState<boolean | undefined>(undefined);
    const [isPostalCodeFormatValid, setIsPostalCodeFormatValid] = useState<boolean | undefined>(undefined);

    const [telephone, setTelephone] = useState("");
    const [isTelephoneValid, setIsTelephoneValid] = useState<boolean | undefined>(undefined);

    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState<boolean | undefined>(undefined);

    const [showAccountPreferencesDialog, setShowAccountPreferencesDialog] = useState(false);
    const [accountPreferencesDialogErrorMessage, setAccountPreferencesDialogErrorMessage] = useState("");

    const [ofscContactPermission, setOfscContactPermission] = useState(-1);
    const [isOfscContactPermissionValid, setIsOfscContactPermissionValid] = useState<boolean | undefined>(undefined);

    const [riderAdvantage, setRiderAdvantage] = useState(-1);
    const [isRiderAdvantageValid, setIsRiderAdvantageValid] = useState<boolean | undefined>(undefined);

    const [volunteering, setVolunteering] = useState(-1);
    const [isVolunteeringValid, setIsVolunteeringValid] = useState<boolean | undefined>(undefined);

    const [correspondenceLanguage, setCorrespondenceLanguage] = useState("");
    const [isCorrespondenceLanguageValid, setIsCorrespondenceLanguageValid] = useState<boolean | undefined>(undefined);

    const [provincesData, setProvincesData] = useState<IParentKeyValue[]>([]);
    const [countriesData, setCountriesData] = useState<IKeyValue[]>([]);
    const [correspondenceLanguagesData, setCorrespondenceLanguagesData] = useState<IKeyValue[]>([]);

    const t: Function = appContext.translation.t;

    useEffect(() => {
        if (appContext.data?.isFirstLoginOfSeason) {
            setMode(ContactPageMode.FirstLoginOfSeason);
        } else {
            setMode(ContactPageMode.Regular);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (appContext.data?.isFirstLoginOfSeason) {
            setEmail(appContext.data?.contactInfo?.email ?? "");

            setFirstName(appContext.data?.contactInfo?.firstName ?? "");
            setMiddleInitial(appContext.data?.contactInfo?.initial ?? "")
            setLastName(appContext.data?.contactInfo?.lastName ?? "");
            setAddressLine1(appContext.data?.contactInfo?.addressLine1 ?? "");
            setAddressLine2(appContext.data?.contactInfo?.addressLine2 ?? "");
            setCity(appContext.data?.contactInfo?.city ?? "");
            setProvince(appContext.data?.contactInfo?.province ?? { parent: "", key: "", value: "" });
            setCountry(appContext.data?.contactInfo?.country ?? { key: "", value: "" });
            setPostalCode(appContext.data?.contactInfo?.postalCode ?? "");
            setTelephone(appContext.data?.contactInfo?.telephone ?? "");

            setOfscContactPermission(-1);
            setRiderAdvantage(-1);
            setVolunteering(-1);
            setCorrespondenceLanguage(appContext.data?.accountPreferences?.correspondenceLanguage ?? "");
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appContext.data?.contactInfo, appContext.data?.accountPreferences]);

    useEffect(() => {
        // Get data from api.
        const batchApi: Observable<any>[] = [
            apiGetUserDetails(),
            apiGetUserPreferences(),
            apiGetProvinces(),
            apiGetCountries(),
            apiGetCorrespondenceLanguages()
        ];

        const subscription: Subscription = forkJoin(batchApi).subscribe({
            next: (results: any[]) => {
                // apiGetUserDetails
                const apiGetUserDetailsResult: IApiGetUserDetailsResult = results[0] as IApiGetUserDetailsResult;

                if (apiGetUserDetailsResult != undefined) {
                    appContext.updater(draft => {
                        draft.contactInfo = {
                            personId: apiGetUserDetailsResult?.personId,
                            firstName: apiGetUserDetailsResult?.firstName,
                            initial: apiGetUserDetailsResult?.initial,
                            lastName: apiGetUserDetailsResult?.lastName,
                            addressLine1: apiGetUserDetailsResult?.addressLine1,
                            addressLine2: apiGetUserDetailsResult?.addressLine2,
                            city: apiGetUserDetailsResult?.city,
                            province: apiGetUserDetailsResult?.province,
                            postalCode: apiGetUserDetailsResult?.postalCode,
                            country: apiGetUserDetailsResult?.country,
                            telephone: apiGetUserDetailsResult?.telephone,
                            email: apiGetUserDetailsResult?.email,
                            adminUser: apiGetUserDetailsResult?.adminUser ?? false,
                            verified: apiGetUserDetailsResult?.verified ?? false
                        };
                    });
                }

                // apiGetUserPreferences
                const apiGetUserPreferences: IApiGetUserPreferencesResult = results[1] as IApiGetUserPreferencesResult;

                if (apiGetUserPreferences != undefined) {
                    appContext.updater(draft => {
                        draft.accountPreferences = {
                            ofscContactPermission: apiGetUserPreferences?.ofscContactPermission ?? -1,
                            riderAdvantage: apiGetUserPreferences?.riderAdvantage ?? -1,
                            volunteering: apiGetUserPreferences?.volunteering ?? -1,
                            correspondenceLanguage: apiGetUserPreferences?.correspondenceLanguage ?? ""
                        };
                    })
                }

                // apiGetProvinces
                const apiGetProvincesResult: IApiGetProvincesResult[] = results[2] as IApiGetProvincesResult[];

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
                const apiGetCountriesResult: IApiGetCountriesResult[] = results[3] as IApiGetCountriesResult[];

                if (apiGetCountriesResult != undefined && apiGetCountriesResult.length > 0) {
                    const countries: IKeyValue[] = apiGetCountriesResult.map<IKeyValue>(x => ({
                        key: x?.key ?? "",
                        value: x?.value ?? "",
                        valueFr: x?.valueFr ?? ""
                    }));

                    setCountriesData(countries);
                }

                // apiGetCorrespondenceLanguages
                const apiGetCorrespondenceLanguagesResult: IApiGetCorrespondenceLanguagesResult[] = results[4] as IApiGetCorrespondenceLanguagesResult[];

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
                checkResponseStatus(error);
            },
            complete: () => {
                setShowAlert(false);
                setPageLoaded(true);
            }
        });

        return () => {
            subscription.unsubscribe();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (mode === ContactPageMode.Unknown) {
        return null;
    } else if (mode === ContactPageMode.Regular) {
        return (
            <>
                <Head>
                    <title>{t("ContactInfo.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                <h3 className="mb-3">{t("ContactInfo.Title")}</h3>

                <CartItemsAlert></CartItemsAlert>

                <div className="card mb-3">
                    <div className="card-header bg-success-subtle">
                        <div className="row gap-3">
                            <div className="col d-flex justify-content-center justify-content-md-start align-items-center">
                                <div className="d-none d-md-block fs-5 fw-semibold">
                                    {t("ContactInfo.ContactInfo.Title")}
                                </div>

                                <div className="d-flex d-md-none text-center fw-semibold">
                                    {t("ContactInfo.ContactInfo.Title")}
                                </div>
                            </div>

                            <div className="col-12 col-md-auto d-flex align-items-center">
                                <button className="btn btn-outline-dark btn-sm min-75 w-sm-100" onClick={contactInfoDialogShow}>
                                    {t("Common.Buttons.Edit")}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <Loading showLoading={!pageLoaded}>
                            <div>
                                {`${appContext.data?.contactInfo?.firstName ?? ""} ${appContext.data?.contactInfo?.initial ?? ""} ${appContext.data?.contactInfo?.lastName ?? ""}`}
                            </div>

                            <div>
                                <span>{appContext.data?.contactInfo?.addressLine1 ?? ""}</span>

                                {appContext.data?.contactInfo?.addressLine2 != undefined && appContext.data?.contactInfo?.addressLine2 !== "" && (
                                    <span>, {appContext.data?.contactInfo?.addressLine2 ?? ""}</span>
                                )}

                                <span>, {appContext.data?.contactInfo?.city ?? ""}</span>
                                <span>, {appContext.data?.contactInfo?.province?.key ?? ""}</span>
                                <span>, {appContext.data?.contactInfo?.postalCode ?? ""}</span>
                                <span>, {getLocalizedValue2(appContext.data?.contactInfo?.country?.value, appContext.data?.contactInfo?.country?.valueFr)}</span>
                            </div>

                            <div>
                                <div>{appContext.data?.contactInfo?.telephone ?? ""}</div>
                                <div>{appContext.data?.contactInfo?.email ?? ""}</div>
                            </div>
                        </Loading>
                    </div>
                </div>

                <div className="card mb-3">
                    <div className="card-header bg-success-subtle">
                        <div className="row gap-3">
                            <div className="col d-flex justify-content-center justify-content-md-start align-items-center">
                                <div className="d-none d-md-block fs-5 fw-semibold">
                                    {t("ContactInfo.Preferences.Title")}
                                </div>

                                <div className="d-flex d-md-none text-center fw-semibold">
                                    {t("ContactInfo.Preferences.Title")}
                                </div>
                            </div>

                            <div className="col-12 col-md-auto d-flex align-items-center">
                                <button className="btn btn-outline-dark btn-sm min-75 w-sm-100" onClick={accountPreferencesDialogShow}>
                                    {t("Common.Buttons.Edit")}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <Loading showLoading={!pageLoaded}>
                            <div className="row mb-2 mb-md-0">
                                <div className="col-12 col-md-6 text-start text-md-end">{t("ContactInfo.Preferences.OfscConsentLabel")}:</div>
                                <div className="col-12 col-md-6">
                                    {appContext.data?.accountPreferences?.ofscContactPermission === 0 && (
                                        <span className="fw-semibold">{t("Common.Buttons.No")}</span>
                                    )}

                                    {appContext.data?.accountPreferences?.ofscContactPermission === 1 && (
                                        <span className="fw-semibold">{t("Common.Buttons.Yes")}</span>
                                    )}
                                </div>
                            </div>
                            <div className="row mb-2 mb-md-0">
                                <div className="col-12 col-md-6 text-start text-md-end">{t("ContactInfo.Preferences.RiderAdvantageLabel")}:</div>
                                <div className="col-12 col-md-6">
                                    {appContext.data?.accountPreferences?.riderAdvantage === 0 && (
                                        <span className="fw-semibold">{t("Common.Buttons.No")}</span>
                                    )}

                                    {appContext.data?.accountPreferences?.riderAdvantage === 1 && (
                                        <span className="fw-semibold">{t("Common.Buttons.Yes")}</span>
                                    )}
                                </div>
                            </div>
                            <div className="row mb-2 mb-md-0">
                                <div className="col-12 col-md-6 text-start text-md-end">{t("ContactInfo.Preferences.VolunteeringLabel")}:</div>
                                <div className="col-12 col-md-6">
                                    {appContext.data?.accountPreferences?.volunteering === 0 && (
                                        <span className="fw-semibold">{t("Common.Buttons.No")}</span>
                                    )}

                                    {(appContext.data?.accountPreferences?.volunteering === 1 || appContext.data?.accountPreferences?.volunteering === 2) && (
                                        <span className="fw-semibold">{t("Common.Buttons.Yes")}</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 col-md-6 text-start text-md-end">{t("ContactInfo.Preferences.CorrespondenceLanguageLabel")}:</div>
                                <div className="col-12 col-md-6">
                                    <span className="fw-semibold">
                                        {getLocalizedValue(getCorrespondenceLanguage(appContext.data?.accountPreferences?.correspondenceLanguage))}
                                    </span>
                                </div>
                            </div>
                        </Loading>
                    </div>
                </div>

                {!appContext.data?.isContactInfoVerified && (
                    <div className="card">
                        <div className="card-body text-center">
                            <button type="button" className="btn btn-primary" onClick={() => confirmContactInfoClick()}>
                                {t("ContactInfo.ConfirmButton")}
                            </button>
                        </div>
                    </div>
                )}

                <Modal show={showContactInfoDialog} onHide={contactInfoDialogHide} backdrop="static" keyboard={false} dialogClassName="modal-width-75-percent">
                    <Modal.Header closeButton>
                        <Modal.Title>{t("ContactInfo.ContactInfoEditDialog.Title")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            {contactInfoDialogErrorMessage !== "" && (
                                <div className="row">
                                    <div className="col-12">
                                        <div className="alert alert-danger" role="alert">
                                            {getApiErrorMessage(contactInfoDialogErrorMessage)}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="row gap-2 gap-md-0 gx-2 mb-2">
                                <div className="col-12">
                                    <div className="input-group has-validation">
                                        <div className={`form-floating ${iv(isEmailValid)}`}>
                                            <input type="email" className={`form-control ${iv(isEmailValid)}`} id="contact-info-email" placeholder={t("ContactInfo.ContactInfoEditDialog.EmailAddress")} maxLength={200} aria-describedby="contact-info-email-validation" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                                            <label className="required" htmlFor="contact-info-email">{t("ContactInfo.ContactInfoEditDialog.EmailAddress")}</label>
                                        </div>
                                        <div id="contact-info-email-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.EmailAddress")} {t("Common.Validation.IsRequiredSuffix")}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="row gap-2 gap-md-0 gx-2 mb-2">
                                <div className="col-12 col-md-4">
                                    <div className="input-group has-validation">
                                        <div className={`form-floating ${iv(isFirstNameValid)}`}>
                                            <input type="text" className={`form-control ${iv(isFirstNameValid)}`} id="contact-info-first-name" placeholder={t("ContactInfo.ContactInfoEditDialog.FirstName")} maxLength={150} aria-describedby="contact-info-first-name-validation" value={firstName} onChange={(e: any) => setFirstName(e.target.value)} disabled={true} />
                                            <label className="required" htmlFor="contact-info-first-name">{t("ContactInfo.ContactInfoEditDialog.FirstName")}</label>
                                        </div>
                                        <div id="contact-info-first-name-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.FirstName")} {t("Common.Validation.IsRequiredSuffix")}</div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="input-group has-validation">
                                        <div className={`form-floating ${iv(isMiddleInitialValid)}`}>
                                            <input type="text" className={`form-control ${iv(isMiddleInitialValid)}`} id="contact-info-middle-initial" placeholder={t("ContactInfo.ContactInfoEditDialog.MiddleInitial")} maxLength={1} aria-describedby="contact-info-middle-initial-validation" value={middleInitial} onChange={(e: any) => setMiddleInitial(e.target.value)} disabled={true} />
                                            <label htmlFor="contact-info-middle-initial">{t("ContactInfo.ContactInfoEditDialog.MiddleInitial")}</label>
                                        </div>
                                        <div id="contact-info-middle-initial-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.MiddleInitial")} {t("Common.Validation.IsRequiredSuffix")}</div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="input-group has-validation">
                                        <div className={`form-floating ${iv(isLastNameValid)}`}>
                                            <input type="text" className={`form-control ${iv(isLastNameValid)}`} id="contact-info-last-name" placeholder={t("ContactInfo.ContactInfoEditDialog.LastName")} maxLength={150} aria-describedby="contact-info-last-name-validation" value={lastName} onChange={(e: any) => setLastName(e.target.value)} disabled={true} />
                                            <label className="required" htmlFor="contact-info-last-name">{t("ContactInfo.ContactInfoEditDialog.LastName")}</label>
                                        </div>
                                        <div id="contact-info-last-name-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.LastName")} {t("Common.Validation.IsRequiredSuffix")}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="row gap-2 gap-md-0 gx-2 mb-2">
                                <div className="col-12 col-md-6">
                                    <div className="input-group has-validation">
                                        <div className={`form-floating ${iv(isAddressLine1Valid)}`}>
                                            <input type="text" className={`form-control ${iv(isAddressLine1Valid)}`} id="contact-info-address-line-1" placeholder={t("ContactInfo.ContactInfoEditDialog.AddressLine1")} maxLength={30} aria-describedby="contact-info-address-line-1-validation" value={addressLine1} onChange={(e: any) => setAddressLine1(e.target.value)} />
                                            <label className="required" htmlFor="contact-info-address-line-1">{t("ContactInfo.ContactInfoEditDialog.AddressLine1")}</label>
                                        </div>
                                        <div id="contact-info-address-line-1-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.AddressLine1")} {t("Common.Validation.IsRequiredSuffix")}</div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="input-group has-validation">
                                        <div className={`form-floating ${iv(isAddressLine2Valid)}`}>
                                            <input type="text" className={`form-control ${iv(isAddressLine2Valid)}`} id="contact-info-address-line-2" placeholder={t("ContactInfo.ContactInfoEditDialog.AddressLine2")} maxLength={30} aria-describedby="contact-info-address-line-2-validation" value={addressLine2} onChange={(e: any) => setAddressLine2(e.target.value)} />
                                            <label htmlFor="contact-info-address-line-2">{t("ContactInfo.ContactInfoEditDialog.AddressLine2")}</label>
                                        </div>
                                        <div id="contact-info-address-line-2-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.AddressLine2")} {t("Common.Validation.IsRequiredSuffix")}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="row gap-2 gap-md-0 gx-2 mb-2">
                                <div className="col-12 col-md-4">
                                    <div className="input-group has-validation">
                                        <div className={`form-floating ${iv(isCityValid)}`}>
                                            <input type="text" className={`form-control ${iv(isCityValid)}`} id="contact-info-city" placeholder={t("ContactInfo.ContactInfoEditDialog.CityTownOrVillage")} maxLength={30} aria-describedby="contact-info-city-validation" value={city} onChange={(e: any) => setCity(e.target.value)} />
                                            <label className="required" htmlFor="contact-info-city">{t("ContactInfo.ContactInfoEditDialog.CityTownOrVillage")}</label>
                                        </div>
                                        <div id="contact-info-city-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.CityTownOrVillage")} {t("Common.Validation.IsRequiredSuffix")}</div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="input-group has-validation">
                                        <div className={`form-floating ${iv(isCountryValid)}`}>
                                            <select className={`form-select ${iv(isCountryValid)}`} id="contact-info-country" aria-label={t("ContactInfo.ContactInfoEditDialog.Country")} aria-describedby="contact-info-country-validation" value={country.key} onChange={(e: any) => countryChange(e)}>
                                                <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                                {countriesData != undefined && countriesData.length > 0 && getCountriesData().map(countryData => (
                                                    <option value={countryData.key} key={countryData.key}>{getLocalizedValue(countryData)}</option>
                                                ))}
                                            </select>
                                            <label className="required" htmlFor="contact-info-country">{t("ContactInfo.ContactInfoEditDialog.Country")}</label>
                                        </div>
                                        <div id="contact-info-country-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.Country")} {t("Common.Validation.IsRequiredSuffix")}</div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="input-group has-validation">
                                        <div className={`form-floating ${iv(isProvinceValid)}`}>
                                            <select className={`form-select ${iv(isProvinceValid)}`} id="contact-info-province" aria-label={t("ContactInfo.ContactInfoEditDialog.ProvinceState")} aria-describedby="contact-info-province-validation" value={getSelectedProvinceStateOption()} onChange={(e: any) => provinceChange(e)}>
                                                <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                                {provincesData != undefined && provincesData.length > 0 && getProvinceData().map(provinceData => (
                                                    <option value={`${country.key}|${provinceData.key}`} key={`${country.key}|${provinceData.key}`}>{getLocalizedValue(provinceData)}</option>
                                                ))}
                                            </select>
                                            <label className="required" htmlFor="contact-info-province">{t("ContactInfo.ContactInfoEditDialog.ProvinceState")}</label>
                                        </div>
                                        <div id="contact-info-province-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.ProvinceState")} {t("Common.Validation.IsRequiredSuffix")}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="row gap-2 gap-md-0 gx-2">
                                <div className="col-12 col-md-6">
                                    <div className="input-group has-validation">
                                        <div className={`form-floating ${iv(isPostalCodeValid && isPostalCodeFormatValid)}`}>
                                            <input type="text" className={`form-control ${iv(isPostalCodeValid)}`} id="contact-info-postal-code" placeholder={t("ContactInfo.ContactInfoEditDialog.PostalZipCode")} maxLength={7} aria-describedby="contact-info-postal-code-validation" value={postalCode} onChange={(e: any) => setPostalCode(e.target.value)} />
                                            <label className="required" htmlFor="contact-info-postal-code">{t("ContactInfo.ContactInfoEditDialog.PostalZipCode")}</label>
                                        </div>
                                        <div id="contact-info-postal-code-validation" className="invalid-feedback">
                                            {!isPostalCodeValid && (
                                                <>
                                                    {t("ContactInfo.ContactInfo.PostalZipCode")} {t("Common.Validation.IsRequiredSuffix")}
                                                </>
                                            )}
                                            {isPostalCodeValid && !isPostalCodeFormatValid && (
                                                <>
                                                    {t("ContactInfo.ContactInfo.InvalidPostalCodeFormat")}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <div className="input-group has-validation">
                                        <div className={`form-floating ${iv(isTelephoneValid)}`}>
                                            <input type="text" className={`form-control ${iv(isTelephoneValid)}`} id="contact-info-telephone" placeholder={t("ContactInfo.ContactInfoEditDialog.Telephone")} maxLength={10} aria-describedby="contact-info-telephone-validation" value={telephone} onChange={(e: any) => setTelephone(e.target.value)} />
                                            <label className="required" htmlFor="contact-info-telephone">{t("ContactInfo.ContactInfoEditDialog.Telephone")}</label>
                                        </div>
                                        <div id="contact-info-telephone-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.Telephone")} {t("Common.Validation.IsRequiredSuffix")}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="container-fluid">
                            <div className="row d-flex flex-column flex-sm-row gap-2">
                                <div className="col d-flex justify-content-center justify-content-sm-start align-items-center">
                                    <div className="text-nowrap">
                                        <span className="text-danger me-1">*</span> = {t("ContactInfo.ContactInfoEditDialog.MandatoryField")}
                                    </div>
                                </div>

                                <div className="col d-flex justify-content-center justify-content-sm-end align-items-center">
                                    <button className="btn btn-outline-dark btn-sm min-75 me-1" type="button" onClick={() => contactInfoDialogSaveClick()}>
                                        {t("Common.Buttons.Save")}
                                    </button>

                                    <button className="btn btn-outline-dark btn-sm min-75" type="button" onClick={() => contactInfoDialogHide()}>
                                        {t("Common.Buttons.Cancel")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal >

                <Modal show={showAccountPreferencesDialog} onHide={accountPreferencesDialogHide} backdrop="static" keyboard={false} dialogClassName="modal-width-75-percent">
                    <Modal.Header closeButton>
                        <Modal.Title>{t("ContactInfo.PreferencesEditDialog.Title")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            {accountPreferencesDialogErrorMessage !== "" && (
                                <div className="row">
                                    <div className="col-12">
                                        <div className="alert alert-danger" role="alert">
                                            {getApiErrorMessage(accountPreferencesDialogErrorMessage)}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="row gap-2 gap-md-0 gx-2 mb-4">
                                <div className="col-12">
                                    <label htmlFor="account-preferences-ofsc-contact-permission" className="form-label required">{t("ContactInfo.PreferencesEditDialog.OfscConsent")}</label>
                                    <label htmlFor="account-preferences-ofsc-contact-permission" className="form-label">{t("ContactInfo.PreferencesEditDialog.OfscConsentMore")}</label>
                                    <select className={`form-select ${iv(isOfscContactPermissionValid)}`} id="account-preferences-ofsc-contact-permission" aria-label={t("ContactInfo.PreferencesEditDialog.OfscConsent")} aria-describedby="account-preferences-ofsc-contact-permission-validation" value={ofscContactPermission.toString()} onChange={(e: any) => setOfscContactPermission(Number(e.target.value))}>
                                        <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                                        <option value="1">{t("Common.Buttons.Yes")}</option>
                                        <option value="0">{t("Common.Buttons.No")}</option>
                                    </select>
                                    <div id="account-preferences-ofsc-contact-permission-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                                </div>
                            </div>

                            <div className="row gap-2 gap-md-0 gx-2 mb-4">
                                <div className="col-12">
                                    <label htmlFor="account-preferences-rider-advantage" className="form-label required">{t("ContactInfo.PreferencesEditDialog.RiderAdvantage")}</label>
                                    <select className={`form-select ${iv(isRiderAdvantageValid)}`} id="account-preferences-rider-advantage" aria-label={t("ContactInfo.PreferencesEditDialog.RiderAdvantage")} aria-describedby="account-preferences-rider-advantage-validation" value={riderAdvantage.toString()} onChange={(e: any) => setRiderAdvantage(Number(e.target.value))}>
                                        <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                                        <option value="1">{t("Common.Buttons.Yes")}</option>
                                        <option value="0">{t("Common.Buttons.No")}</option>
                                    </select>
                                    <div id="account-preferences-rider-advantage-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                                </div>
                            </div>

                            <div className="row gap-2 gap-md-0 gx-2 mb-4">
                                <div className="col-12">
                                    <label htmlFor="account-preferences-volunteering" className="form-label required">{t("ContactInfo.PreferencesEditDialog.Volunteering")}</label>
                                    <select className={`form-select ${iv(isVolunteeringValid)}`} id="account-preferences-volunteering" aria-label={t("ContactInfo.PreferencesEditDialog.Volunteering")} aria-describedby="account-preferences-volunteering-validation" value={volunteering.toString()} onChange={(e: any) => setVolunteering(Number(e.target.value))}>
                                        <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                                        <option value="0">{t("ContactInfo.PreferencesEditDialog.NoIAmNotInterestedInVolunteering")}</option>
                                        <option value="1">{t("ContactInfo.PreferencesEditDialog.YesIAlreadyVolunteer")}</option>
                                        <option value="2">{t("ContactInfo.PreferencesEditDialog.YesIdLikeToVolunteer")}</option>
                                    </select>
                                    <div id="account-preferences-volunteering-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <label htmlFor="account-preferences-correspondence-language" className="form-label required">{t("ContactInfo.PreferencesEditDialog.CorrespondenceLanguage")}</label>
                                    <select className={`form-select ${iv(isCorrespondenceLanguageValid)}`} id="account-preferences-correspondence-language" aria-label={t("ContactInfo.PreferencesEditDialog.CorrespondenceLanguage")} aria-describedby="account-preferences-correspondence-language-validation" value={correspondenceLanguage} onChange={(e: any) => setCorrespondenceLanguage(e.target.value)}>
                                        <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                        {correspondenceLanguagesData != undefined && correspondenceLanguagesData.length > 0 && getCorrespondenceLanguagesData().map(correspondenceLanguageData => (
                                            <option value={correspondenceLanguageData.key} key={correspondenceLanguageData.key}>{getLocalizedValue(correspondenceLanguageData)}</option>
                                        ))}
                                    </select>
                                    <div id="account-preferences-correspondence-language-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="container-fluid">
                            <div className="row d-flex flex-column flex-sm-row gap-2">
                                <div className="col d-flex justify-content-center justify-content-sm-start align-items-center">
                                    <div className="text-nowrap">
                                        <span className="text-danger me-1">*</span> = {t("ContactInfo.ContactInfoEditDialog.MandatoryField")}
                                    </div>
                                </div>
                                <div className="col d-flex justify-content-center justify-content-sm-end align-items-center">
                                    <button className="btn btn-outline-dark btn-sm min-75 me-2" type="button" onClick={() => accountPreferencesDialogSaveClick()}>
                                        {t("Common.Buttons.Save")}
                                    </button>

                                    <button className="btn btn-outline-dark btn-sm min-75" type="button" onClick={() => accountPreferencesDialogHide()}>
                                        {t("Common.Buttons.Cancel")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal >
            </>
        )
    } else if (mode === ContactPageMode.FirstLoginOfSeason) {
        return (
            <>
                <Head>
                    <title>{t("ContactInfo.Title")} | {t("Common.Ofsc")}</title>
                </Head>

                {firstLoginOfSeasonErrorMessages != undefined && firstLoginOfSeasonErrorMessages.length > 0 && (
                    <div className="">
                        <div className="col-12">
                            <div className="alert alert-danger" role="alert">
                                {firstLoginOfSeasonErrorMessages.map(errorMessage => (
                                    <div key={getGuid()}>{getApiErrorMessage(errorMessage)}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <h3 className="mb-3">{t("ContactInfo.Title")}</h3>

                <CartItemsAlert></CartItemsAlert>

                <div className="fs-6 fw-semibold mb-2">
                    {t("ContactInfo.ContactInfo.Title")}
                </div>

                <div className="row gap-2 gap-md-0 gx-2 mb-2">
                    <div className="col-12">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isEmailValid)}`}>
                                <input type="email" className={`form-control ${iv(isEmailValid)}`} id="contact-info-email" placeholder={t("ContactInfo.ContactInfo.EmailAddress")} maxLength={200} aria-describedby="contact-info-email-validation" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                                <label className="required" htmlFor="contact-info-email">{t("ContactInfo.ContactInfo.EmailAddress")}</label>
                            </div>
                            <div id="contact-info-email-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.EmailAddress")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                </div>

                <div className="row gap-2 gap-md-0 gx-2 mb-2">
                    <div className="col-12 col-md-4">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isFirstNameValid)}`}>
                                <input type="text" className={`form-control ${iv(isFirstNameValid)}`} id="contact-info-first-name" placeholder={t("ContactInfo.ContactInfo.FirstName")} maxLength={150} aria-describedby="contact-info-first-name-validation" value={firstName} onChange={(e: any) => setFirstName(e.target.value)} />
                                <label className="required" htmlFor="contact-info-first-name">{t("ContactInfo.ContactInfo.FirstName")}</label>
                            </div>
                            <div id="contact-info-first-name-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.FirstName")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isMiddleInitialValid)}`}>
                                <input type="text" className={`form-control ${iv(isMiddleInitialValid)}`} id="contact-info-middle-initial" placeholder={t("ContactInfo.ContactInfo.MiddleInitial")} maxLength={1} aria-describedby="contact-info-middle-initial-validation" value={middleInitial} onChange={(e: any) => setMiddleInitial(e.target.value)} />
                                <label htmlFor="contact-info-middle-initial">{t("ContactInfo.ContactInfo.MiddleInitial")}</label>
                            </div>
                            <div id="contact-info-middle-initial-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.MiddleInitial")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isLastNameValid)}`}>
                                <input type="text" className={`form-control ${iv(isLastNameValid)}`} id="contact-info-last-name" placeholder={t("ContactInfo.ContactInfo.LastName")} maxLength={150} aria-describedby="contact-info-last-name-validation" value={lastName} onChange={(e: any) => setLastName(e.target.value)} />
                                <label className="required" htmlFor="contact-info-last-name">{t("ContactInfo.ContactInfo.LastName")}</label>
                            </div>
                            <div id="contact-info-last-name-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.LastName")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                </div>

                <div className="row gap-2 gap-md-0 gx-2 mb-2">
                    <div className="col-12 col-md-6">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isAddressLine1Valid)}`}>
                                <input type="text" className={`form-control ${iv(isAddressLine1Valid)}`} id="contact-info-address-line-1" placeholder={t("ContactInfo.ContactInfo.AddressLine1")} maxLength={30} aria-describedby="contact-info-address-line-1-validation" value={addressLine1} onChange={(e: any) => setAddressLine1(e.target.value)} />
                                <label className="required" htmlFor="contact-info-address-line-1">{t("ContactInfo.ContactInfo.AddressLine1")}</label>
                            </div>
                            <div id="contact-info-address-line-1-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.AddressLine1")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isAddressLine2Valid)}`}>
                                <input type="text" className={`form-control ${iv(isAddressLine2Valid)}`} id="contact-info-address-line-2" placeholder={t("ContactInfo.ContactInfo.AddressLine2")} maxLength={30} aria-describedby="contact-info-address-line-2-validation" value={addressLine2} onChange={(e: any) => setAddressLine2(e.target.value)} />
                                <label htmlFor="contact-info-address-line-2">{t("ContactInfo.ContactInfo.AddressLine2")}</label>
                            </div>
                            <div id="contact-info-address-line-2-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.AddressLine2")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                </div>

                <div className="row gap-2 gap-md-0 gx-2 mb-2">
                    <div className="col-12 col-md-4">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isCityValid)}`}>
                                <input type="text" className={`form-control ${iv(isCityValid)}`} id="contact-info-city" placeholder={t("ContactInfo.ContactInfo.CityTownOrVillage")} maxLength={30} aria-describedby="contact-info-city-validation" value={city} onChange={(e: any) => setCity(e.target.value)} />
                                <label className="required" htmlFor="contact-info-city">{t("ContactInfo.ContactInfo.CityTownOrVillage")}</label>
                            </div>
                            <div id="contact-info-city-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.CityTownOrVillage")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isCountryValid)}`}>
                                <select className={`form-select ${iv(isCountryValid)}`} id="contact-info-country" aria-label={t("ContactInfo.ContactInfo.Country")} aria-describedby="contact-info-country-validation" value={country.key} onChange={(e: any) => countryChange(e)}>
                                    <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                    {countriesData != undefined && countriesData.length > 0 && getCountriesData().map(countryData => (
                                        <option value={countryData.key} key={countryData.key}>{getLocalizedValue(countryData)}</option>
                                    ))}
                                </select>
                                <label className="required" htmlFor="contact-info-country">{t("ContactInfo.ContactInfo.Country")}</label>
                            </div>
                            <div id="contact-info-country-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.Country")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isProvinceValid)}`}>
                                <select className={`form-select ${iv(isProvinceValid)}`} id="contact-info-province" aria-label={t("ContactInfo.ContactInfo.ProvinceState")} aria-describedby="contact-info-province-validation" value={getSelectedProvinceStateOption()} onChange={(e: any) => provinceChange(e)}>
                                    <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                    {provincesData != undefined && provincesData.length > 0 && getProvinceData().map(provinceData => (
                                        <option value={`${country.key}|${provinceData.key}`} key={`${country.key}|${provinceData.key}`}>{getLocalizedValue(provinceData)}</option>
                                    ))}
                                </select>
                                <label className="required" htmlFor="contact-info-province">{t("ContactInfo.ContactInfo.ProvinceState")}</label>
                            </div>
                            <div id="contact-info-province-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.ProvinceState")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                </div>

                <div className="row gap-2 gap-md-0 gx-2 mb-3">
                    <div className="col-12 col-md-6">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isPostalCodeValid && isPostalCodeFormatValid)}`}>
                                <input type="text" className={`form-control ${iv(isPostalCodeValid && isPostalCodeFormatValid)}`} id="contact-info-postal-code" placeholder={t("ContactInfo.ContactInfo.PostalZipCode")} maxLength={7} aria-describedby="contact-info-postal-code-validation" value={postalCode} onChange={(e: any) => setPostalCode(e.target.value)} />
                                <label className="required" htmlFor="contact-info-postal-code">{t("ContactInfo.ContactInfo.PostalZipCode")}</label>
                            </div>
                            <div id="contact-info-postal-code-validation" className="invalid-feedback">
                                {!isPostalCodeValid && (
                                    <>
                                        {t("ContactInfo.ContactInfo.PostalZipCode")} {t("Common.Validation.IsRequiredSuffix")}
                                    </>
                                )}
                                {isPostalCodeValid && !isPostalCodeFormatValid && (
                                    <>
                                        {t("ContactInfo.ContactInfo.InvalidPostalCodeFormat")}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="input-group has-validation">
                            <div className={`form-floating ${iv(isTelephoneValid)}`}>
                                <input type="text" className={`form-control ${iv(isTelephoneValid)}`} id="contact-info-telephone" placeholder={t("ContactInfo.ContactInfo.Telephone")} maxLength={10} aria-describedby="contact-info-telephone-validation" value={telephone} onChange={(e: any) => setTelephone(e.target.value)} />
                                <label className="required" htmlFor="contact-info-telephone">{t("ContactInfo.ContactInfo.Telephone")}</label>
                            </div>
                            <div id="contact-info-telephone-validation" className="invalid-feedback">{t("ContactInfo.ContactInfo.Telephone")} {t("Common.Validation.IsRequiredSuffix")}</div>
                        </div>
                    </div>
                </div>

                <div className="fs-6 fw-semibold mb-2">
                    {t("ContactInfo.Preferences.Title")}
                </div>

                <div className="row gap-2 gap-md-0 gx-2 mb-4">
                    <div className="col-12">
                        <label htmlFor="account-preferences-ofsc-contact-permission" className="form-label required">{t("ContactInfo.Preferences.OfscConsent")}</label>
                        <label htmlFor="account-preferences-ofsc-contact-permission" className="form-label">{t("ContactInfo.Preferences.OfscConsentMore")}</label>
                        <select className={`form-select ${iv(isOfscContactPermissionValid)}`} id="account-preferences-ofsc-contact-permission" aria-label={t("ContactInfo.Preferences.OfscConsent")} aria-describedby="account-preferences-ofsc-contact-permission-validation" value={ofscContactPermission.toString()} onChange={(e: any) => setOfscContactPermission(Number(e.target.value))}>
                            <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                            <option value="1">{t("Common.Buttons.Yes")}</option>
                            <option value="0">{t("Common.Buttons.No")}</option>
                        </select>
                        <div id="account-preferences-ofsc-contact-permission-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                    </div>
                </div>

                <div className="row gap-2 gap-md-0 gx-2 mb-4">
                    <div className="col-12">
                        <label htmlFor="account-preferences-rider-advantage" className="form-label required">{t("ContactInfo.Preferences.RiderAdvantage")}</label>
                        <select className={`form-select ${iv(isRiderAdvantageValid)}`} id="account-preferences-rider-advantage" aria-label={t("ContactInfo.Preferences.RiderAdvantage")} aria-describedby="account-preferences-rider-advantage-validation" value={riderAdvantage.toString()} onChange={(e: any) => setRiderAdvantage(Number(e.target.value))}>
                            <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                            <option value="1">{t("Common.Buttons.Yes")}</option>
                            <option value="0">{t("Common.Buttons.No")}</option>
                        </select>
                        <div id="account-preferences-rider-advantage-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                    </div>
                </div>

                <div className="row gap-2 gap-md-0 gx-2 mb-4">
                    <div className="col-12">
                        <label htmlFor="account-preferences-volunteering" className="form-label required">{t("ContactInfo.Preferences.Volunteering")}</label>
                        <select className={`form-select ${iv(isVolunteeringValid)}`} id="account-preferences-volunteering" aria-label={t("ContactInfo.Preferences.Volunteering")} aria-describedby="account-preferences-volunteering-validation" value={volunteering.toString()} onChange={(e: any) => setVolunteering(Number(e.target.value))}>
                            <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                            <option value="0">{t("ContactInfo.Preferences.NoIAmNotInterestedInVolunteering")}</option>
                            <option value="1">{t("ContactInfo.Preferences.YesIAlreadyVolunteer")}</option>
                            <option value="2">{t("ContactInfo.Preferences.YesIdLikeToVolunteer")}</option>
                        </select>
                        <div id="account-preferences-volunteering-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                    </div>
                </div>

                <div className="row gap-2 gap-md-0 gx-2 mb-4">
                    <div className="col-12">
                        <label htmlFor="account-preferences-correspondence-language" className="form-label required">{t("ContactInfo.Preferences.CorrespondenceLanguage")}</label>
                        <select className={`form-select ${iv(isCorrespondenceLanguageValid)}`} id="account-preferences-correspondence-language" aria-label={t("ContactInfo.Preferences.CorrespondenceLanguage")} aria-describedby="account-preferences-correspondence-language-validation" value={correspondenceLanguage} onChange={(e: any) => setCorrespondenceLanguage(e.target.value)}>
                            <option value="" disabled>{t("Common.PleaseSelect")}</option>

                            {correspondenceLanguagesData != undefined && correspondenceLanguagesData.length > 0 && getCorrespondenceLanguagesData().map(correspondenceLanguageData => (
                                <option value={correspondenceLanguageData.key} key={correspondenceLanguageData.key}>{getLocalizedValue(correspondenceLanguageData)}</option>
                            ))}
                        </select>
                        <div id="account-preferences-correspondence-language-validation" className="invalid-feedback">{t("Common.Validation.SelectionIsRequired")}</div>
                    </div>
                </div>

                {!appContext.data?.isContactInfoVerified && (
                    <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 pt-2">
                        <button type="button" className="btn btn-primary" onClick={() => confirmContactInfoClick()}>
                            {t("ContactInfo.ConfirmButton")}
                        </button>
                    </div>
                )}
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

    function contactInfoDialogShow(): void {
        setFirstName(appContext.data?.contactInfo?.firstName ?? "");
        setMiddleInitial(appContext.data?.contactInfo?.initial ?? "")
        setLastName(appContext.data?.contactInfo?.lastName ?? "");
        setAddressLine1(appContext.data?.contactInfo?.addressLine1 ?? "");
        setAddressLine2(appContext.data?.contactInfo?.addressLine2 ?? "");
        setCity(appContext.data?.contactInfo?.city ?? "");
        setProvince(appContext.data?.contactInfo?.province ?? { parent: "", key: "", value: "" });
        setCountry(appContext.data?.contactInfo?.country ?? { key: "", value: "" });
        setPostalCode(appContext.data?.contactInfo?.postalCode ?? "");
        setTelephone(appContext.data?.contactInfo?.telephone ?? "");
        setEmail(appContext.data?.contactInfo?.email ?? "");

        setIsFirstNameValid(undefined);
        setIsMiddleInitialValid(undefined);
        setIsLastNameValid(undefined);
        setIsAddressLine1Valid(undefined);
        setIsAddressLine2Valid(undefined);
        setIsCityValid(undefined);
        setIsProvinceValid(undefined);
        setIsCountryValid(undefined);
        setIsPostalCodeValid(undefined);
        setIsTelephoneValid(undefined);
        setIsEmailValid(undefined);

        setShowContactInfoDialog(true);
    }

    function contactInfoDialogSaveClick(): void {
        if (validateContactInfo()) {
            contactInfoSave();
        }
    }

    function contactInfoSave(): void {
        const apiSaveUserDetailsRequest: IApiSaveUserDetailsRequest = {
            addressLine1: addressLine1?.trim()?.substring(0, 30),
            addressLine2: addressLine2?.trim()?.substring(0, 30),
            city: city?.trim()?.substring(0, 30),
            countryId: country?.key,
            email: email?.trim()?.substring(0, 200),
            postalCode: postalCode?.trim()?.substring(0, 7),
            provinceId: province?.key,
            telephone: telephone?.trim()?.substring(0, 10),
        };

        setShowAlert(true);

        apiSaveUserDetails(apiSaveUserDetailsRequest).subscribe({
            next: (result: IApiSaveUserDetailsResult) => {
                if (result?.isSuccessful && result?.data != undefined) {
                    appContext.updater(draft => {
                        draft.contactInfo = {
                            personId: result?.data?.personId,
                            firstName: result?.data?.firstName,
                            initial: result?.data?.initial,
                            lastName: result?.data?.lastName,
                            addressLine1: result?.data?.addressLine1,
                            addressLine2: result?.data?.addressLine2,
                            city: result?.data?.city,
                            province: result?.data?.province,
                            postalCode: result?.data?.postalCode,
                            country: result?.data?.country,
                            telephone: result?.data?.telephone,
                            email: result?.data?.email,
                            adminUser: result?.data?.adminUser ?? false,
                            verified: result?.data?.verified ?? false,
                        };
                    });

                    setShowContactInfoDialog(false);
                } else {
                    setContactInfoDialogErrorMessage(result?.errorMessage ?? "");
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

    function validateContactInfo(): boolean {
        let result: boolean = true;

        if (email.trim() === "") {
            setIsEmailValid(false);
            result = false;
        } else {
            setIsEmailValid(true);
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

    function contactInfoDialogHide(): void {
        setShowContactInfoDialog(false);
    }

    function accountPreferencesDialogShow(): void {
        setOfscContactPermission(appContext.data?.accountPreferences?.ofscContactPermission ?? -1);
        setRiderAdvantage(appContext.data?.accountPreferences?.riderAdvantage ?? -1);
        setVolunteering(appContext.data?.accountPreferences?.volunteering ?? -1);
        setCorrespondenceLanguage(appContext.data?.accountPreferences?.correspondenceLanguage ?? "");

        setIsOfscContactPermissionValid(undefined);
        setIsRiderAdvantageValid(undefined);
        setIsVolunteeringValid(undefined);
        setIsCorrespondenceLanguageValid(undefined);

        setShowAccountPreferencesDialog(true);
    }

    function accountPreferencesDialogSaveClick(): void {
        if (validateAccountPreferences()) {
            accountPreferencesSave();
        }
    }

    function accountPreferencesSave(): void {
        const apiSaveUserPreferencesRequest: IApiSaveUserPreferencesRequest = {
            ofscContactPermission: ofscContactPermission,
            riderAdvantage: riderAdvantage,
            volunteering: volunteering,
            correspondenceLanguage: correspondenceLanguage
        };

        setShowAlert(true);

        apiSaveUserPreferences(apiSaveUserPreferencesRequest).subscribe({
            next: (result: IApiSaveUserPreferencesResult) => {
                if (result?.isSuccessful && result?.data != undefined) {
                    appContext.updater(draft => {
                        draft.accountPreferences = {
                            ofscContactPermission: result?.data?.ofscContactPermission ?? -1,
                            riderAdvantage: result?.data?.riderAdvantage ?? -1,
                            volunteering: result?.data?.volunteering ?? -1,
                            correspondenceLanguage: result?.data?.correspondenceLanguage ?? ""
                        };
                    });

                    setShowAccountPreferencesDialog(false);
                } else {
                    setAccountPreferencesDialogErrorMessage(result?.errorMessage ?? "");
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

    function validateAccountPreferences(): boolean {
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

    function accountPreferencesDialogHide(): void {
        setShowAccountPreferencesDialog(false);
    }

    function confirmContactInfoClick(): void {
        const contactInfoValid: boolean = validateContactInfo();
        const accountPreferencesValid: boolean = validateAccountPreferences();

        if (contactInfoValid && accountPreferencesValid) {
            const apiSaveUserDetailsRequest: IApiSaveUserDetailsRequest = {
                addressLine1: addressLine1?.trim()?.substring(0, 30),
                addressLine2: addressLine2?.trim()?.substring(0, 30),
                city: city?.trim()?.substring(0, 30),
                countryId: country?.key,
                email: email?.trim()?.substring(0, 200),
                postalCode: postalCode?.trim()?.substring(0, 7),
                provinceId: province?.key,
                telephone: telephone?.trim()?.substring(0, 10),
            };

            const apiSaveUserPreferencesRequest: IApiSaveUserPreferencesRequest = {
                ofscContactPermission: ofscContactPermission,
                riderAdvantage: riderAdvantage,
                volunteering: volunteering,
                correspondenceLanguage: correspondenceLanguage
            };

            // Get data from api.
            const batchApi: Observable<any>[] = [
                apiSaveUserDetails(apiSaveUserDetailsRequest),
                apiSaveUserPreferences(apiSaveUserPreferencesRequest)
            ];

            const errorMessages: string[] = [];

            setShowAlert(true);

            const subscription: Subscription = forkJoin(batchApi).subscribe({
                next: (results: any[]) => {
                    // apiSaveUserDetails
                    const apiSaveUserDetailsResult: IApiSaveUserDetailsResult = results[0] as IApiSaveUserDetailsResult;

                    if (apiSaveUserDetailsResult != undefined && apiSaveUserDetailsResult?.isSuccessful) {
                        //
                    } else {
                        errorMessages.push(apiSaveUserDetailsResult?.errorMessage ?? "");
                    }

                    // apiSaveUserPreferences
                    const apiSaveUserPreferencesResult: IApiSaveUserPreferencesResult = results[1] as IApiSaveUserPreferencesResult;

                    if (apiSaveUserPreferencesResult != undefined && apiSaveUserPreferencesResult?.isSuccessful) {
                        //
                    } else {
                        errorMessages.push(apiSaveUserPreferencesResult?.errorMessage ?? "");
                    }

                    if (apiSaveUserDetailsResult?.isSuccessful && apiSaveUserPreferencesResult?.isSuccessful) {
                        appContext.updater(draft => {
                            draft.isFirstLoginOfSeason = false;
                            draft.isContactInfoVerified = true;
                        });

                        router.push("/home");
                    }
                },
                error: (error: any) => {
                    checkResponseStatus(error);
                },
                complete: () => {
                    setFirstLoginOfSeasonErrorMessages(errorMessages.filter(x => x != undefined && x.trim() !== ""));

                    setShowAlert(false);
                }
            });
        }
    }
}
