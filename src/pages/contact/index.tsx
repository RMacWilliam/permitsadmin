import { useContext, useEffect, useState } from 'react'
import { AppContext, IAccountPreferences, IAppContextValues, IContactInfo } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { getKeyValueFromSelect } from '@/custom/utilities';
import { getPageAlertMessage } from '../cart';
import { NextRouter, useRouter } from 'next/router';

export default function ContactPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "contact" });
    }, [appContext])

    return (
        <AuthenticatedPageLayout>
            <Contact appContext={appContext} router={router}></Contact>
        </AuthenticatedPageLayout>
    )
}

function Contact({ appContext, router }: { appContext: IAppContextValues, router: NextRouter }) {
    const [showContactInfoDialog, setShowContactInfoDialog] = useState(false);

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [city, setCity] = useState("");
    const [province, setProvince] = useState({ key: "", value: "" });
    const [country, setCountry] = useState({ key: "", value: "" });
    const [postalCode, setPostalCode] = useState("");
    const [telephone, setTelephone] = useState("");

    const [showAccountPreferencesDialog, setShowAccountPreferencesDialog] = useState(false);

    const [ofscContactPermission, setOfscContactPermission] = useState(-1);
    const [riderAdvantage, setRiderAdvantage] = useState(-1);
    const [volunteering, setVolunteering] = useState(-1);

    return (
        <>
            <Head>
                <title>Contact | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>{appContext.translation?.t("CONTACT_INFORMATION.TITLE")}</h4>

            {appContext.data?.cartItems != undefined && appContext.data?.cartItems?.length > 0 && (
                <div className="alert alert-primary" role="alert">
                    <div className="d-flex justify-content-between align-items-center flex-wrap flex-sm-wrap flex-md-wrap flex-md-nowrap w-100">
                        <div>
                            <i className="fa-solid fa-cart-shopping fa-xl me-2"></i>
                            {getPageAlertMessage(appContext)}
                        </div>
                        <div>
                            <button type="button" className="btn btn-primary btn-sm mt-2 mt-sm-2 mt-md-0" onClick={() => router.push("/cart")}>Go to Cart</button>
                        </div>
                    </div>
                </div >
            )}

            <div className="card w-100">
                <h5 className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        {`${appContext.data?.contactInfo?.firstName} ${appContext.data?.contactInfo?.middleName} ${appContext.data?.contactInfo?.lastName}`}
                    </div>
                    <div>
                        <button className="btn btn-primary btn-sm" onClick={contactInfoDialogShow}>Edit</button>
                    </div>
                </h5>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <div>
                            <div>{appContext.data?.contactInfo?.addressLine1}</div>
                            <div>{appContext.data?.contactInfo?.addressLine2}</div>
                            <div>{appContext.data?.contactInfo?.city}, {appContext.data?.contactInfo?.province?.key}, {appContext.data?.contactInfo?.country?.key}</div>
                            <div>{appContext.data?.contactInfo?.postalCode}</div>
                            <div>{appContext.data?.contactInfo?.telephone}</div>
                            <div>{appContext.data?.contactInfo?.email}</div>
                        </div>
                    </li>
                </ul>
            </div>

            <div className="card mt-2 w-100">
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
                            <div>Consent for OFSC to contact me: <b>{appContext.data?.accountPreferences?.ofscContactPermission === 1 ? "Yes" : "No"}</b></div>
                            <div>Rider Advantage: <b>{appContext.data?.accountPreferences?.riderAdvantage === 1 ? "Yes" : "No"}</b></div>
                            <div>Interested in volunteering: <b>{appContext.data?.accountPreferences?.volunteering === 1 || appContext.data?.accountPreferences?.volunteering === 2 ? "Yes" : "No"}</b></div>
                        </div>
                    </li>
                </ul>
            </div>

            {!appContext.data?.isContactInfoVerified && (
                <button type="button" className="btn btn-success mt-3" onClick={() => confirmContactInfoClick()}>Confirm Contact Information</button>
            )}

            <Modal show={showContactInfoDialog} onHide={contactInfoDialogHide} backdrop="static" keyboard={false} dialogClassName="modal-width-90-percent">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Contact Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="form-floating mb-2">
                                    <input type="email" className="form-control" id="contact-info-email-address" placeholder="name@example.com" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-email-address">Email address</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating  mb-2">
                                    <input type="text" className="form-control" id="contact-info-first-name" placeholder="First Name" value={firstName} onChange={(e: any) => setFirstName(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-first-name">First Name</label>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="contact-info-middle-name" placeholder="Middle Name(s)" value={middleName} onChange={(e: any) => setMiddleName(e.target.value)} />
                                    <label htmlFor="contact-info-middle-name">Middle Name(s)</label>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="contact-info-last-name" placeholder="Last Name" value={lastName} onChange={(e: any) => setLastName(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-last-name">Last Name</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="contact-info-address-line-1" placeholder="Address Line 1" value={addressLine1} onChange={(e: any) => setAddressLine1(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-address-line-1">Address Line 1</label>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="contact-info-address-line-2" placeholder="Address Line 2" value={addressLine2} onChange={(e: any) => setAddressLine2(e.target.value)} />
                                    <label htmlFor="contact-info-address-line-2">Address Line 2</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="contact-info-city" placeholder="City, Town, or Village" value={city} onChange={(e: any) => setCity(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-city">City, Town, or Village</label>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <select className="form-select" id="contact-info-province" aria-label="Province/State" value={province.key} onChange={(e: any) => setProvince(getKeyValueFromSelect(e) ?? { key: "", value: "" })}>
                                        <option value="" disabled>Please select a value</option>
                                        <option value="ON">One</option>
                                        <option value="PQ">Two</option>
                                        <option value="BC">Three</option>
                                    </select>
                                    <label className="required" htmlFor="contact-info-province">Province/State</label>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <select className="form-select" id="contact-info-country" aria-label="Country" value={country.key} onChange={(e: any) => setCountry(getKeyValueFromSelect(e) ?? { key: "", value: "" })}>
                                        <option value="" disabled>Please select a value</option>
                                        <option value="CA">Canada</option>
                                        <option value="US">United States</option>
                                        <option value="OT">Other</option>
                                    </select>
                                    <label className="required" htmlFor="contact-info-country">Country</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="contact-info-postal-code" placeholder="Postal Code" value={postalCode} onChange={(e: any) => setPostalCode(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-postal-code">Postal Code</label>
                                </div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="contact-info-telephone" placeholder="Telephone" value={telephone} onChange={(e: any) => setTelephone(e.target.value)} />
                                    <label className="required" htmlFor="contact-info-telephone">Telephone</label>
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
                                <Button className="me-2" variant="secondary" onClick={contactInfoDialogSave}>Save</Button>
                                <Button variant="primary" onClick={contactInfoDialogHide}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>

            <Modal show={showAccountPreferencesDialog} onHide={accountPreferencesDialogHide} backdrop="static" keyboard={false} dialogClassName="modal-width-90-percent">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Account Preferences</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div>
                                    I consent to the OFSC contacting me with information regarding permits, Rider Advantage and other information related to snowmobiling.
                                    I understand that the OFSC values my privacy and the protection of personal information, by authorizing the release of my name and address
                                    information, I consent to the OFSC&apos;s use of this information for the purposes related to the mandate of the OFSC (www.ofsc.on.ca). I
                                    further understand that any information provided to the OFSC is out of custody and control of the Ministry of Transportation and that the
                                    OFSC will have sole responsibility of the information.
                                </div>
                                <div className="form-floating mb-2">
                                    <select className="form-select" id="account-preferences-ofsc-contact-permission" aria-label="OFSC Contact Permission" value={ofscContactPermission.toString()} onChange={(e: any) => setOfscContactPermission(Number(e.target.value))}>
                                        <option value="-1" disabled>Please select a value</option>
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
                                        <option value="-1" disabled>Please select a value</option>
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
                                    <select className="form-select" id="account-preferences-volunteering" aria-label="Volunteering" value={volunteering.toString()} onChange={(e: any) => setVolunteering(Number(e.target.value))}>
                                        <option value="-1" disabled>Please select a value</option>
                                        <option value="0">No, I am not interested in volunteering</option>
                                        <option value="1">Yes, I already volunteer</option>
                                        <option value="2">Yes, I&apos;d like to volunteer</option>
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
                                <Button className="me-2" variant="secondary" onClick={accountPreferencesDialogSave}>Save</Button>
                                <Button variant="primary" onClick={accountPreferencesDialogHide}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    )

    function contactInfoDialogShow(): void {
        setEmail(appContext.data?.contactInfo?.email ?? "");
        setFirstName(appContext.data?.contactInfo?.firstName ?? "");
        setMiddleName(appContext.data?.contactInfo?.middleName ?? "")
        setLastName(appContext.data?.contactInfo?.lastName ?? "");
        setAddressLine1(appContext.data?.contactInfo?.addressLine1 ?? "");
        setAddressLine2(appContext.data?.contactInfo?.addressLine2 ?? "");
        setCity(appContext.data?.contactInfo?.city ?? "");
        setProvince(appContext.data?.contactInfo?.province ?? { key: "", value: "" });
        setCountry(appContext.data?.contactInfo?.country ?? { key: "", value: "" });
        setPostalCode(appContext.data?.contactInfo?.postalCode ?? "");
        setTelephone(appContext.data?.contactInfo?.telephone ?? "");

        setShowContactInfoDialog(true);
    }

    function contactInfoDialogSave(): void {
        appContext.updater(draft => {
            let contactInfo: IContactInfo = {
                email: email,
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                addressLine1: addressLine1,
                addressLine2: addressLine2,
                city: city,
                province: province,
                country: country,
                postalCode: postalCode,
                telephone: telephone
            };

            draft.contactInfo = contactInfo;
        });

        setShowContactInfoDialog(false);
    }

    function contactInfoDialogHide(): void {
        setShowContactInfoDialog(false);
    }

    function accountPreferencesDialogShow(): void {
        setOfscContactPermission(appContext.data?.accountPreferences?.ofscContactPermission ?? -1);
        setRiderAdvantage(appContext.data?.accountPreferences?.riderAdvantage ?? -1);
        setVolunteering(appContext.data?.accountPreferences?.volunteering ?? -1);

        setShowAccountPreferencesDialog(true);
    }

    function accountPreferencesDialogSave(): void {
        appContext.updater(draft => {
            let accountPreferences: IAccountPreferences = {
                ofscContactPermission: ofscContactPermission,
                riderAdvantage: riderAdvantage,
                volunteering: volunteering
            };

            draft.accountPreferences = accountPreferences;
        });

        setShowAccountPreferencesDialog(false);
    }

    function accountPreferencesDialogHide(): void {
        setShowAccountPreferencesDialog(false);
    }

    function confirmContactInfoClick(): void {
        appContext.updater(draft => { draft.isContactInfoVerified = true; });
    }
}
