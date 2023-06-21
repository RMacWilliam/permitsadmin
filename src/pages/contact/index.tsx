import { useContext, useEffect, useState } from 'react'
import { AppContext, IAppContextValues, IContactInfo, IKeyValue, IParentKeyValue } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { checkResponseStatus, getApiErrorMessage, getKeyValueFromSelect, getParentKeyValueFromSelect, sortArray } from '@/custom/utilities';
import { NextRouter, useRouter } from 'next/router';
import CartItemsAlert from '@/components/cart-items-alert';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { IApiGetCorrespondenceLanguagesResult, IApiGetCountriesResult, IApiGetProvincesResult, IApiGetUserDetailsResult, IApiGetUserPreferencesResult, IApiSaveUserDetailsRequest, IApiSaveUserDetailsResult, IApiSaveUserPreferencesRequest, IApiSaveUserPreferencesResult, IApiUpdateVehicleResult, apiGetCorrespondenceLanguages, apiGetCountries, apiGetProvinces, apiGetUserDetails, apiGetUserPreferences, apiSaveUserDetails, apiSaveUserPreferences } from '@/custom/api';
import { getLocalizedValue } from '@/localization/i18n';
import Loading from '@/components/loading';

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

    const [showContactInfoDialog, setShowContactInfoDialog] = useState(false);
    const [contactInfoDialogErrorMessage, setContactInfoDialogErrorMessage] = useState("");

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

    const [showAccountPreferencesDialog, setShowAccountPreferencesDialog] = useState(false);
    const [accountPreferencesDialogErrorMessage, setAccountPreferencesDialogErrorMessage] = useState("");

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
                            adminUser: false, // apiGetUserDetailsResult?.adminUser ?? false,
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

    return (
        <>
            <Head>
                <title>{t("ContactInfo.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h4 className="mb-3">{t("ContactInfo.Title")}</h4>

            <CartItemsAlert></CartItemsAlert>

            <div className="card mb-3 w-100">
                <div className="card-header d-flex justify-content-between align-items-center bg-success-subtle fs-5 fw-semibold">
                    <div>
                        {`${appContext.data?.contactInfo?.firstName ?? ""} ${appContext.data?.contactInfo?.initial ?? ""} ${appContext.data?.contactInfo?.lastName ?? ""}`}
                    </div>

                    <div>
                        <button className="btn btn-outline-dark btn-sm" onClick={contactInfoDialogShow}>
                            {t("Common.Edit")}
                        </button>
                    </div>
                </div>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <Loading showLoading={!pageLoaded}>
                            <div>
                                <span>{appContext.data?.contactInfo?.addressLine1 ?? ""}</span>

                                {appContext.data?.contactInfo?.addressLine2 != undefined && appContext.data?.contactInfo?.addressLine2 !== "" && (
                                    <span>, {appContext.data?.contactInfo?.addressLine2 ?? ""}</span>
                                )}

                                <span>, {appContext.data?.contactInfo?.city ?? ""}</span>
                                <span>, {appContext.data?.contactInfo?.province?.key ?? ""}</span>
                                <span>, {appContext.data?.contactInfo?.country?.key ?? ""}</span>
                                <span>, {appContext.data?.contactInfo?.postalCode ?? ""}</span>
                            </div>

                            <div>
                                <div>{appContext.data?.contactInfo?.telephone ?? ""}</div>
                                <div>{appContext.data?.contactInfo?.email ?? ""}</div>
                            </div>
                        </Loading>
                    </li>
                </ul>
            </div>

            <div className="card mb-3 w-100">
                <div className="card-header d-flex justify-content-between align-items-center bg-success-subtle fs-5 fw-semibold">
                    <div>
                        {t("ContactInfo.Preferences")}
                    </div>

                    <div>
                        <button className="btn btn-outline-dark btn-sm" onClick={accountPreferencesDialogShow}>
                            {t("Common.Edit")}
                        </button>
                    </div>
                </div>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <Loading showLoading={!pageLoaded}>
                            <div className="row mb-2 mb-md-0">
                                <div className="col-12 col-md-6 text-start text-md-end">{t("ContactInfo.OfscConsent")}:</div>
                                <div className="col-12 col-md-6">
                                    {appContext.data?.accountPreferences?.ofscContactPermission === 0 && (
                                        <span className="fw-semibold">{t("Common.No")}</span>
                                    )}

                                    {appContext.data?.accountPreferences?.ofscContactPermission === 1 && (
                                        <span className="fw-semibold">{t("Common.Yes")}</span>
                                    )}
                                </div>
                            </div>
                            <div className="row mb-2 mb-md-0">
                                <div className="col-12 col-md-6 text-start text-md-end">{t("ContactInfo.RiderAdvantage")}:</div>
                                <div className="col-12 col-md-6">
                                    {appContext.data?.accountPreferences?.riderAdvantage === 0 && (
                                        <span className="fw-semibold">{t("Common.No")}</span>
                                    )}

                                    {appContext.data?.accountPreferences?.riderAdvantage === 1 && (
                                        <span className="fw-semibold">{t("Common.Yes")}</span>
                                    )}
                                </div>
                            </div>
                            <div className="row mb-2 mb-md-0">
                                <div className="col-12 col-md-6 text-start text-md-end">{t("ContactInfo.Volunteering")}:</div>
                                <div className="col-12 col-md-6">
                                    {appContext.data?.accountPreferences?.volunteering === 0 && (
                                        <span className="fw-semibold">{t("Common.No")}</span>
                                    )}

                                    {(appContext.data?.accountPreferences?.volunteering === 1 || appContext.data?.accountPreferences?.volunteering === 2) && (
                                        <span className="fw-semibold">{t("Common.Yes")}</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 col-md-6 text-start text-md-end">{t("ContactInfo.CorrespondenceLanguage")}:</div>
                                <div className="col-12 col-md-6">
                                    <span className="fw-semibold">
                                        {getLocalizedValue(getCorrespondenceLanguage(appContext.data?.accountPreferences?.correspondenceLanguage))}
                                    </span>
                                </div>
                            </div>
                        </Loading>
                    </li>
                </ul>
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
                                        {contactInfoDialogErrorMessage}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="row">
                            <div className="col-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isFirstNameValid ? "" : "is-invalid"}`} id="contact-info-first-name" placeholder={t("ContactInfo.ContactInfoEditDialog.FirstName")} maxLength={150} value={firstName} onChange={(e: any) => setFirstName(e.target.value)} disabled={true} />
                                    <label className="required" htmlFor="contact-info-first-name">{t("ContactInfo.ContactInfoEditDialog.FirstName")}</label>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isMiddleInitialValid ? "" : "is-invalid"}`} id="contact-info-middle-initial" placeholder={t("ContactInfo.ContactInfoEditDialog.MiddleInitial")} maxLength={1} value={middleInitial} onChange={(e: any) => setMiddleInitial(e.target.value)} disabled={true} />
                                    <label htmlFor="contact-info-middle-initial">{t("ContactInfo.ContactInfoEditDialog.MiddleInitial")}</label>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isLastNameValid ? "" : "is-invalid"}`} id="contact-info-last-name" placeholder={t("ContactInfo.ContactInfoEditDialog.LastName")} maxLength={150} value={lastName} onChange={(e: any) => setLastName(e.target.value)} disabled={true} />
                                    <label className="required" htmlFor="contact-info-last-name">{t("ContactInfo.ContactInfoEditDialog.LastName")}</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isAddressLine1Valid ? "" : "is-invalid"}`} id="contact-info-address-line-1" placeholder={t("ContactInfo.ContactInfoEditDialog.AddressLine1")} maxLength={30} value={addressLine1} onChange={(e: any) => setAddressLine1(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-address-line-1">{t("ContactInfo.ContactInfoEditDialog.AddressLine1")}</label>
                                </div>
                            </div>
                            <div className="col-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isAddressLine2Valid ? "" : "is-invalid"}`} id="contact-info-address-line-2" placeholder={t("ContactInfo.ContactInfoEditDialog.AddressLine2")} maxLength={30} value={addressLine2} onChange={(e: any) => setAddressLine2(e.target.value)} />
                                    <label htmlFor="contact-info-address-line-2">{t("ContactInfo.ContactInfoEditDialog.AddressLine2")}</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isCityValid ? "" : "is-invalid"}`} id="contact-info-city" placeholder={t("ContactInfo.ContactInfoEditDialog.CityTownOrVillage")} maxLength={30} value={city} onChange={(e: any) => setCity(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-city">{t("ContactInfo.ContactInfoEditDialog.CityTownOrVillage")}</label>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <select className={`form-select ${isProvinceValid ? "" : "is-invalid"}`} id="contact-info-province" aria-label={t("ContactInfo.ContactInfoEditDialog.ProvinceState")} value={getSelectedProvinceStateOption()} onChange={(e: any) => provinceChange(e)}>
                                        <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                        {provincesData != undefined && provincesData.length > 0 && getProvinceData().map(provinceData => (
                                            <option value={`${country.key}|${provinceData.key}`} key={`${country.key}|${provinceData.key}`}>{getLocalizedValue(provinceData)}</option>
                                        ))}
                                    </select>
                                    <label className="required" htmlFor="contact-info-province">{t("ContactInfo.ContactInfoEditDialog.ProvinceState")}</label>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <select className={`form-select ${isCountryValid ? "" : "is-invalid"}`} id="contact-info-country" aria-label={t("ContactInfo.ContactInfoEditDialog.Country")} value={country.key} onChange={(e: any) => countryChange(e)}>
                                        <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                        {countriesData != undefined && countriesData.length > 0 && getCountriesData().map(countryData => (
                                            <option value={countryData.key} key={countryData.key}>{getLocalizedValue(countryData)}</option>
                                        ))}
                                    </select>
                                    <label className="required" htmlFor="contact-info-country">{t("ContactInfo.ContactInfoEditDialog.Country")}</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isPostalCodeValid ? "" : "is-invalid"}`} id="contact-info-postal-code" placeholder={t("ContactInfo.ContactInfoEditDialog.PostalZipCode")} maxLength={7} value={postalCode} onChange={(e: any) => setPostalCode(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-postal-code">{t("ContactInfo.ContactInfoEditDialog.PostalZipCode")}</label>
                                </div>
                            </div>

                            <div className="col-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isTelephoneValid ? "" : "is-invalid"}`} id="contact-info-telephone" placeholder={t("ContactInfo.ContactInfoEditDialog.Telephone")} maxLength={10} value={telephone} onChange={(e: any) => setTelephone(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-telephone">{t("ContactInfo.ContactInfoEditDialog.Telephone")}</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div className="form-floating mb-2">
                                    <input type="email" className={`form-control ${isEmailValid ? "" : "is-invalid"}`} id="contact-info-email" placeholder={t("ContactInfo.ContactInfoEditDialog.EmailAddress")} maxLength={200} value={email} onChange={(e: any) => setEmail(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-email">{t("ContactInfo.ContactInfoEditDialog.EmailAddress")}</label>
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
                                <Button className="me-2" variant="outline-dark" onClick={() => contactInfoDialogSave()}>
                                    {t("Common.Save")}
                                </Button>

                                <Button variant="outline-dark" onClick={() => contactInfoDialogHide()}>
                                    {t("Common.Cancel")}
                                </Button>
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
                                        {accountPreferencesDialogErrorMessage}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="row mb-2">
                            <div className="col-12">
                                <label htmlFor="account-preferences-ofsc-contact-permission" className="form-label required">{t("ContactInfo.PreferencesEditDialog.OfscConsent")}</label>
                                <label htmlFor="account-preferences-ofsc-contact-permission" className="form-label">{t("ContactInfo.PreferencesEditDialog.OfscConsentMore")}</label>
                                <select className={`form-select ${isOfscContactPermissionValid ? "" : "is-invalid"}`} id="account-preferences-ofsc-contact-permission" aria-label={t("ContactInfo.PreferencesEditDialog.OfscConsent")} value={ofscContactPermission.toString()} onChange={(e: any) => setOfscContactPermission(Number(e.target.value))}>
                                    <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                                    <option value="1">{t("Common.Yes")}</option>
                                    <option value="0">{t("Common.No")}</option>
                                </select>
                            </div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-12">
                                <label htmlFor="account-preferences-rider-advantage" className="form-label required">{t("ContactInfo.PreferencesEditDialog.RiderAdvantage")}</label>
                                <select className={`form-select ${isRiderAdvantageValid ? "" : "is-invalid"}`} id="account-preferences-rider-advantage" aria-label={t("ContactInfo.PreferencesEditDialog.RiderAdvantage")} value={riderAdvantage.toString()} onChange={(e: any) => setRiderAdvantage(Number(e.target.value))}>
                                    <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                                    <option value="1">{t("Common.Yes")}</option>
                                    <option value="0">{t("Common.No")}</option>
                                </select>
                            </div>
                        </div>

                        <div className="row mb-2">
                            <div className="col-12">
                                <label htmlFor="account-preferences-volunteering" className="form-label required">{t("ContactInfo.PreferencesEditDialog.Volunteering")}</label>
                                <select className={`form-select ${isVolunteeringValid ? "" : "is-invalid"}`} id="account-preferences-volunteering" aria-label={t("ContactInfo.PreferencesEditDialog.Volunteering")} value={volunteering.toString()} onChange={(e: any) => setVolunteering(Number(e.target.value))}>
                                    <option value="-1" disabled>{t("Common.PleaseSelect")}</option>
                                    <option value="0">{t("ContactInfo.PreferencesEditDialog.NoIAmNotInterestedInVolunteering")}</option>
                                    <option value="1">{t("ContactInfo.PreferencesEditDialog.YesIAlreadyVolunteer")}</option>
                                    <option value="2">{t("ContactInfo.PreferencesEditDialog.YesIdLikeToVolunteer")}</option>
                                </select>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <label htmlFor="account-preferences-correspondence-language" className="form-label required">{t("ContactInfo.PreferencesEditDialog.CorrespondenceLanguage")}</label>
                                <select className={`form-select ${isCorrespondenceLanguageValid ? "" : "is-invalid"}`} id="account-preferences-correspondence-language" aria-label={t("ContactInfo.PreferencesEditDialog.CorrespondenceLanguage")} value={correspondenceLanguage} onChange={(e: any) => setCorrespondenceLanguage(e.target.value)}>
                                    <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                    {correspondenceLanguagesData != undefined && correspondenceLanguagesData.length > 0 && getCorrespondenceLanguagesData().map(correspondenceLanguageData => (
                                        <option value={correspondenceLanguageData.key} key={correspondenceLanguageData.key}>{getLocalizedValue(correspondenceLanguageData)}</option>
                                    ))}
                                </select>
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
                                <Button className="me-2" variant="outline-dark" onClick={() => accountPreferencesDialogSave()}>
                                    {t("Common.Save")}
                                </Button>

                                <Button variant="outline-dark" onClick={() => accountPreferencesDialogHide()}>
                                    {t("Common.Cancel")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal >
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

        setIsFirstNameValid(true);
        setIsMiddleInitialValid(true);
        setIsLastNameValid(true);
        setIsAddressLine1Valid(true);
        setIsAddressLine2Valid(true);
        setIsCityValid(true);
        setIsProvinceValid(true);
        setIsCountryValid(true);
        setIsPostalCodeValid(true);
        setIsTelephoneValid(true);
        setIsEmailValid(true);

        setShowContactInfoDialog(true);
    }

    function contactInfoDialogSave(): void {
        if (validateContactInfoDialog()) {
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
                        setContactInfoDialogErrorMessage(getApiErrorMessage(result?.errorMessage) ?? result?.errorMessage ?? "");
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

        if (firstName.trim() === "") {
            setIsFirstNameValid(false);
            result = false;
        } else {
            setIsFirstNameValid(true);
        }

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

        if (telephone.trim() === "") {
            setIsTelephoneValid(false);
            result = false;
        } else {
            setIsTelephoneValid(true);
        }

        if (email.trim() === "") {
            setIsEmailValid(false);
            result = false;
        } else {
            setIsEmailValid(true);
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

        setIsOfscContactPermissionValid(true);
        setIsRiderAdvantageValid(true);
        setIsVolunteeringValid(true);
        setIsCorrespondenceLanguageValid(true);

        setShowAccountPreferencesDialog(true);
    }

    function accountPreferencesDialogSave(): void {
        if (validateAccountPreferencesDialog()) {
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
                        setAccountPreferencesDialogErrorMessage(getApiErrorMessage(result?.errorMessage) ?? result?.errorMessage ?? "");
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

    function accountPreferencesDialogHide(): void {
        setShowAccountPreferencesDialog(false);
    }

    function confirmContactInfoClick(): void {
        appContext.updater(draft => { draft.isContactInfoVerified = true; });

        router.push("/home");
    }
}
