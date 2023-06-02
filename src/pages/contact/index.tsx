import { useContext, useEffect, useState } from 'react'
import { AppContext, IAppContextValues, IKeyValue, IParentKeyValue } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { getApiErrorMessage, getKeyValueFromSelect, getParentKeyValueFromSelect } from '@/custom/utilities';
import { NextRouter, useRouter } from 'next/router';
import CartItemsAlert from '@/components/cart-items-alert';
import { Observable, forkJoin } from 'rxjs';
import { IApiGetCountriesResult, IApiGetProvincesResult, IApiGetUserDetailsResult, IApiGetUserPreferencesResult, IApiSaveUserDetailsRequest, IApiSaveUserDetailsResult, IApiSaveUserPreferencesRequest, IApiSaveUserPreferencesResult, IApiUpdateVehicleResult, apiGetCountries, apiGetProvinces, apiGetUserDetails, apiGetUserPreferences, apiSaveUserDetails, apiSaveUserPreferences } from '@/custom/api';
import { Constants } from '../../../constants';

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

function Contact({ appContext, router, setShowAlert }: { appContext: IAppContextValues, router: NextRouter, setShowAlert: React.Dispatch<React.SetStateAction<boolean>> }) {
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

    const [provincesData, setProvincesData] = useState([] as IParentKeyValue[]);
    const [countriesData, setCountriesData] = useState([] as IKeyValue[]);

    useEffect(() => {
        // Get data from api.
        let batchApi: Observable<any>[] = [
            apiGetUserDetails(),
            apiGetUserPreferences(),
            apiGetProvinces(),
            apiGetCountries()
        ];

        forkJoin(batchApi).subscribe({
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
                            volunteering: apiGetUserPreferences?.volunteering ?? -1
                        };
                    })
                }

                // apiGetProvinces
                const apiGetProvincesResult: IApiGetProvincesResult[] = results[2] as IApiGetProvincesResult[];

                if (apiGetProvincesResult != undefined) {
                    setProvincesData(apiGetProvincesResult.map<IParentKeyValue>(x => ({ parent: x?.parent ?? "", key: x?.key ?? "", value: x?.value ?? "" })));
                }

                // apiGetCountries
                const apiGetCountriesResult: IApiGetCountriesResult[] = results[3] as IApiGetCountriesResult[];

                if (apiGetCountriesResult != undefined) {
                    setCountriesData(apiGetCountriesResult.map<IKeyValue>(x => ({ key: x?.key ?? "", value: x?.value ?? "" })));
                }

                setShowAlert(false);
            },
            error: (error: any) => {
                console.log(error);

                setShowAlert(false);
            }
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Head>
                <title>Contact | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>{appContext.translation?.t("CONTACT_INFORMATION.TITLE")}</h4>

            <CartItemsAlert></CartItemsAlert>

            <div className="card mb-3 w-100">
                <h5 className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        {`${appContext.data?.contactInfo?.firstName} ${appContext.data?.contactInfo?.initial ?? ""} ${appContext.data?.contactInfo?.lastName}`}
                    </div>
                    <div>
                        <button className="btn btn-primary btn-sm" onClick={contactInfoDialogShow}>Edit</button>
                    </div>
                </h5>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <div>
                            <span>{appContext.data?.contactInfo?.addressLine1}</span>

                            {appContext.data?.contactInfo?.addressLine2 != undefined && appContext.data?.contactInfo?.addressLine2 !== "" && (
                                <span>, {appContext.data?.contactInfo?.addressLine2}</span>
                            )}

                            <span>, {appContext.data?.contactInfo?.city}</span>
                            <span>, {appContext.data?.contactInfo?.province?.key}</span>
                            <span>, {appContext.data?.contactInfo?.country?.key}</span>
                            <span>, {appContext.data?.contactInfo?.postalCode}</span>
                        </div>

                        <div>
                            <div>{appContext.data?.contactInfo?.telephone}</div>
                            <div>{appContext.data?.contactInfo?.email}</div>
                        </div>
                    </li>
                </ul>
            </div>

            <div className="card w-100">
                <h5 className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        Preferences
                    </div>
                    <div>
                        <button className="btn btn-primary btn-sm" onClick={accountPreferencesDialogShow}>Edit</button>
                    </div>
                </h5>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <div>
                            <span className="me-1">Consent for OFSC to contact me:</span>

                            {appContext.data?.accountPreferences?.ofscContactPermission === 0 && (
                                <span className="fw-bold">No</span>
                            )}

                            {appContext.data?.accountPreferences?.ofscContactPermission === 1 && (
                                <span className="fw-bold">Yes</span>
                            )}
                        </div>

                        <div>
                            <span className="me-1">Rider Advantage:</span>

                            {appContext.data?.accountPreferences?.riderAdvantage === 0 && (
                                <span className="fw-bold">No</span>
                            )}

                            {appContext.data?.accountPreferences?.riderAdvantage === 1 && (
                                <span className="fw-bold">Yes</span>
                            )}
                        </div>

                        <div>
                            <span className="me-1">Interested in volunteering:</span>

                            {appContext.data?.accountPreferences?.volunteering === 0 && (
                                <span className="fw-bold">No</span>
                            )}

                            {(appContext.data?.accountPreferences?.volunteering === 1 || appContext.data?.accountPreferences?.volunteering === 2) && (
                                <span className="fw-bold">Yes</span>
                            )}
                        </div>
                    </li>
                </ul>
            </div>

            {!appContext.data?.isContactInfoVerified && (
                <button type="button" className="btn btn-success mt-3" onClick={() => confirmContactInfoClick()}>Confirm Contact Information</button>
            )}

            <Modal show={showContactInfoDialog} onHide={contactInfoDialogHide} backdrop="static" keyboard={false} dialogClassName="modal-width-75-percent">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Contact Information</Modal.Title>
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
                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isFirstNameValid ? "" : "is-invalid"}`} id="contact-info-first-name" placeholder="First Name" value={firstName} onChange={(e: any) => setFirstName(e.target.value)} disabled={true} />
                                    <label className="required" htmlFor="contact-info-first-name">First Name</label>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isMiddleInitialValid ? "" : "is-invalid"}`} id="contact-info-middle-initial" placeholder="Middle Initial" value={middleInitial} onChange={(e: any) => setMiddleInitial(e.target.value)} disabled={true} />
                                    <label htmlFor="contact-info-middle-initial">Middle Initial</label>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isLastNameValid ? "" : "is-invalid"}`} id="contact-info-last-name" placeholder="Last Name" value={lastName} onChange={(e: any) => setLastName(e.target.value)} disabled={true} />
                                    <label className="required" htmlFor="contact-info-last-name">Last Name</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isAddressLine1Valid ? "" : "is-invalid"}`} id="contact-info-address-line-1" placeholder="Address Line 1" value={addressLine1} onChange={(e: any) => setAddressLine1(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-address-line-1">Address Line 1</label>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isAddressLine2Valid ? "" : "is-invalid"}`} id="contact-info-address-line-2" placeholder="Address Line 2" value={addressLine2} onChange={(e: any) => setAddressLine2(e.target.value)} />
                                    <label htmlFor="contact-info-address-line-2">Address Line 2</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isCityValid ? "" : "is-invalid"}`} id="contact-info-city" placeholder="City, Town, or Village" value={city} onChange={(e: any) => setCity(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-city">City, Town, or Village</label>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <select className={`form-select ${isProvinceValid ? "" : "is-invalid"}`} id="contact-info-province" aria-label="Province/State" value={getSelectedProvinceStateOption()} onChange={(e: any) => provinceChange(e)}>
                                        <option value="" disabled>{Constants.PleaseSelect}</option>

                                        {provincesData != undefined && provincesData.length > 0 && getProvinceData().map(provinceData => (
                                            <option value={`${country.key}|${provinceData.key}`} key={`${country.key}|${provinceData.key}`}>{provinceData.value}</option>
                                        ))}
                                    </select>
                                    <label className="required" htmlFor="contact-info-province">Province/State</label>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <select className={`form-select ${isCountryValid ? "" : "is-invalid"}`} id="contact-info-country" aria-label="Country" value={country.key} onChange={(e: any) => countryChange(e)}>
                                        <option value="" disabled>{Constants.PleaseSelect}</option>

                                        {countriesData != undefined && countriesData.length > 0 && getCountriesData().map(countryData => (
                                            <option value={countryData.key} key={countryData.key}>{countryData.value}</option>
                                        ))}
                                    </select>
                                    <label className="required" htmlFor="contact-info-country">Country</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isPostalCodeValid ? "" : "is-invalid"}`} id="contact-info-postal-code" placeholder="Postal/Zip Code" value={postalCode} onChange={(e: any) => setPostalCode(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-postal-code">Postal/Zip Code</label>
                                </div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isTelephoneValid ? "" : "is-invalid"}`} id="contact-info-telephone" placeholder="Telephone" value={telephone} onChange={(e: any) => setTelephone(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-telephone">Telephone</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div className="form-floating mb-2">
                                    <input type="email" className={`form-control ${isEmailValid ? "" : "is-invalid"}`} id="contact-info-email" placeholder="name@example.com" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-email">Email address</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col">
                                <span className="text-danger me-1">*</span>= mandatory field
                            </div>
                            <div className="col d-flex justify-content-end">
                                <Button className="me-2" variant="primary" onClick={() => contactInfoDialogSave()}>Save</Button>
                                <Button variant="primary" onClick={() => contactInfoDialogHide()}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>

            <Modal show={showAccountPreferencesDialog} onHide={accountPreferencesDialogHide} backdrop="static" keyboard={false} dialogClassName="modal-width-75-percent">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Account Preferences</Modal.Title>
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
                        <div className="row">
                            <div className="col-12">
                                <div>
                                    I consent to the OFSC contacting me with information regarding permits, Rider Advantage and other information related to snowmobiling.
                                    I understand that the OFSC values my privacy and the protection of personal information, by authorizing the release of my name and address
                                    information, I consent to the OFSC's use of this information for the purposes related to the mandate of the OFSC (www.ofsc.on.ca). I
                                    further understand that any information provided to the OFSC is out of custody and control of the Ministry of Transportation and that the
                                    OFSC will have sole responsibility of the information.
                                </div>
                                <div className="form-floating mb-2">
                                    <select className={`form-select ${isOfscContactPermissionValid ? "" : "is-invalid"}`} id="account-preferences-ofsc-contact-permission" aria-label="OFSC Contact Permission" value={ofscContactPermission.toString()} onChange={(e: any) => setOfscContactPermission(Number(e.target.value))}>
                                        <option value="-1" disabled>{Constants.PleaseSelect}</option>
                                        <option value="1">Yes</option>
                                        <option value="0">No</option>
                                    </select>
                                    <label className="required" htmlFor="account-preferences-ofsc-contact-permission">OFSC Contact Permission</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div>
                                    I would like to participate in eligible Rider Advantage programs as offered/available.
                                </div>
                                <div className="form-floating mb-2">
                                    <select className="form-select" id="account-preferences-rider-advantage" aria-label="Rider Advantage" value={riderAdvantage.toString()} onChange={(e: any) => setRiderAdvantage(Number(e.target.value))}>
                                        <option value="-1" disabled>{Constants.PleaseSelect}</option>
                                        <option value="1">Yes</option>
                                        <option value="0">No</option>
                                    </select>
                                    <label className="required" htmlFor="account-preferences-rider-advantage">Rider Advantage</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div>
                                    I am interested in volunteering to support my local Snowmobile Club and I consent to the Club contacting me by phone or email.
                                </div>
                                <div className="form-floating mb-2">
                                    <select className={`form-select ${isVolunteeringValid ? "" : "is-invalid"}`} id="account-preferences-volunteering" aria-label="Volunteering" value={volunteering.toString()} onChange={(e: any) => setVolunteering(Number(e.target.value))}>
                                        <option value="-1" disabled>{Constants.PleaseSelect}</option>
                                        <option value="0">No, I am not interested in volunteering</option>
                                        <option value="1">Yes, I already volunteer</option>
                                        <option value="2">Yes, I'd like to volunteer</option>
                                    </select>
                                    <label className="required" htmlFor="account-preferences-volunteering">Volunteering</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col">
                                <span className="text-danger me-1">*</span>= mandatory field
                            </div>
                            <div className="col d-flex justify-content-end">
                                <Button className="me-2" variant="primary" onClick={() => accountPreferencesDialogSave()}>Save</Button>
                                <Button variant="primary" onClick={() => accountPreferencesDialogHide()}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
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
            result = provincesData.filter(x => x.parent === country.key);
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
            let apiSaveUserDetailsRequest: IApiSaveUserDetailsRequest = {
                addressLine1: addressLine1,
                addressLine2: addressLine2,
                city: city,
                countryId: country?.key,
                email: email,
                postalCode: postalCode,
                provinceId: province?.key,
                telephone: telephone,
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

                    setShowAlert(false);
                },
                error: (error: any) => {
                    console.log(error);

                    setShowAlert(false);
                }
            });
        }
    }

    function validateContactInfoDialog(): boolean {
        let isValid: boolean = true;

        if (firstName === "") {
            setIsFirstNameValid(false);
            isValid = false;
        } else {
            setIsFirstNameValid(true);
        }

        if (lastName === "") {
            setIsLastNameValid(false);
            isValid = false;
        } else {
            setIsLastNameValid(true);
        }

        if (addressLine1 === "") {
            setIsAddressLine1Valid(false);
            isValid = false;
        } else {
            setIsAddressLine1Valid(true);
        }

        if (city === "") {
            setIsCityValid(false);
            isValid = false;
        } else {
            setIsCityValid(true);
        }

        if (province?.key == undefined || province.key === "") {
            setIsProvinceValid(false);
            isValid = false;
        } else {
            setIsProvinceValid(true);
        }

        if (country?.key == undefined || country.key === "") {
            setIsCountryValid(false);
            isValid = false;
        } else {
            setIsCountryValid(true);
        }

        if (postalCode === "") {
            setIsPostalCodeValid(false);
            isValid = false;
        } else {
            setIsPostalCodeValid(true);
        }

        if (telephone === "") {
            setIsTelephoneValid(false);
            isValid = false;
        } else {
            setIsTelephoneValid(true);
        }

        if (email === "") {
            setIsEmailValid(false);
            isValid = false;
        } else {
            setIsEmailValid(true);
        }

        return isValid;
    }

    function contactInfoDialogHide(): void {
        setShowContactInfoDialog(false);
    }

    function accountPreferencesDialogShow(): void {
        setOfscContactPermission(appContext.data?.accountPreferences?.ofscContactPermission ?? -1);
        setRiderAdvantage(appContext.data?.accountPreferences?.riderAdvantage ?? -1);
        setVolunteering(appContext.data?.accountPreferences?.volunteering ?? -1);

        setIsOfscContactPermissionValid(true);
        setIsRiderAdvantageValid(true);
        setIsVolunteeringValid(true);

        setShowAccountPreferencesDialog(true);
    }

    function accountPreferencesDialogSave(): void {
        if (validateAccountPreferencesDialog()) {
            let apiSaveUserPreferencesRequest: IApiSaveUserPreferencesRequest = {
                ofscContactPermission: ofscContactPermission,
                riderAdvantage: riderAdvantage,
                volunteering: volunteering
            };

            setShowAlert(true);

            apiSaveUserPreferences(apiSaveUserPreferencesRequest).subscribe({
                next: (result: IApiSaveUserPreferencesResult) => {
                    if (result?.isSuccessful && result?.data != undefined) {
                        appContext.updater(draft => {
                            draft.accountPreferences = {
                                ofscContactPermission: result?.data?.ofscContactPermission ?? -1,
                                riderAdvantage: result?.data?.riderAdvantage ?? -1,
                                volunteering: result?.data?.volunteering ?? -1
                            };
                        });

                        setShowAccountPreferencesDialog(false);
                    } else {
                        setAccountPreferencesDialogErrorMessage(getApiErrorMessage(result?.errorMessage) ?? result?.errorMessage ?? "");
                    }

                    setShowAlert(false);
                },
                error: (error: any) => {
                    console.log(error);

                    setShowAlert(false);
                }
            });
        }
    }

    function validateAccountPreferencesDialog(): boolean {
        let isValid: boolean = true;

        if (ofscContactPermission === -1) {
            setIsOfscContactPermissionValid(false);
            isValid = false;
        } else {
            setIsOfscContactPermissionValid(true);
        }

        if (riderAdvantage === -1) {
            setIsRiderAdvantageValid(false);
            isValid = false;
        } else {
            setIsRiderAdvantageValid(true);
        }

        if (volunteering === -1) {
            setIsVolunteeringValid(false);
            isValid = false;
        } else {
            setIsVolunteeringValid(true);
        }

        return isValid;
    }

    function accountPreferencesDialogHide(): void {
        setShowAccountPreferencesDialog(false);
    }

    function confirmContactInfoClick(): void {
        appContext.updater(draft => { draft.isContactInfoVerified = true; });

        router.push("/home");
    }
}
