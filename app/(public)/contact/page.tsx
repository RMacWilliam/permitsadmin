"use client"

import { Inter } from 'next/font/google';

import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/app/AppContext';
import { useRouter } from 'next/navigation';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { getKeyValueFromSelect } from '@/app/custom/utilities';

const inter = Inter({ subsets: ['latin'] })

export default function ContactPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

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

    const [ofscContactPermission, setOfscContactPermission] = useState("");
    const [riderAdvantage, setRiderAdvantage] = useState("");
    const [volunteering, setVolunteering] = useState("");

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = 'contact' });
    }, [])

    if (!appContext.data.isAuthenticated) {
        return null;
    }

    return (
        <>
            <h4>Contact Information</h4>

            <div className="card w-100">
                <h5 className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        {`${appContext.data?.contactInfo?.firstName} ${appContext.data?.contactInfo?.middleName} ${appContext.data?.contactInfo?.lastName}`}
                    </div>
                    <div>
                        <button className="btn btn-primary" onClick={doContactInfoDialogShow}>Edit</button>
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
                        <button className="btn btn-primary" onClick={doAccountPreferencesDialogShow}>Edit</button>
                    </div>
                </h5>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <div>
                            <div>Consent for OFSC to contact me: <b>{appContext.data?.accountPreferences?.ofscContactPermission ? "Yes" : "No"}</b></div>
                            <div>Rider Advantage: <b>{appContext.data?.accountPreferences?.riderAdvantage ? "Yes" : "No"}</b></div>
                            <div>Interested in volunteering: <b>{appContext.data?.accountPreferences?.volunteering === 1 || appContext.data?.accountPreferences?.volunteering === 2 ? "Yes" : "No"}</b></div>
                        </div>
                    </li>
                </ul>
            </div>

            <Modal show={showContactInfoDialog} onHide={doContactInfoDialogHide} backdrop="static" keyboard={false} dialogClassName="modal-width-90-percent">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Contact Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container fluid>
                        <Row>
                            <Col xs={12}>
                                <div className="form-floating mb-2">
                                    <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                                    <label className="required" htmlFor="floatingInput">Email address</label>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12} sm={12} md={4}>
                                <div className="form-floating  mb-2">
                                    <input type="text" className="form-control" id="floatingInput" placeholder="First Name" value={firstName} onChange={(e: any) => setFirstName(e.target.value)} />
                                    <label className="required" htmlFor="floatingInput">First Name</label>
                                </div>
                            </Col>
                            <Col xs={12} sm={12} md={4}>
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="floatingInput" placeholder="Middle Name(s)" value={middleName} onChange={(e: any) => setMiddleName(e.target.value)} />
                                    <label htmlFor="floatingInput">Middle Name(s)</label>
                                </div>
                            </Col>
                            <Col xs={12} sm={12} md={4}>
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="floatingInput" placeholder="Last Name" value={lastName} onChange={(e: any) => setLastName(e.target.value)} />
                                    <label className="required" htmlFor="floatingInput">Last Name</label>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12} sm={12} md={6}>
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="floatingInput" placeholder="Address Line 1" value={addressLine1} onChange={(e: any) => setAddressLine1(e.target.value)} />
                                    <label className="required" htmlFor="floatingInput">Address Line 1</label>
                                </div>
                            </Col>
                            <Col xs={12} sm={12} md={6}>
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="floatingInput" placeholder="Address Line 2" value={addressLine2} onChange={(e: any) => setAddressLine2(e.target.value)} />
                                    <label htmlFor="floatingInput">Address Line 2</label>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12} sm={12} md={4}>
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="floatingInput" placeholder="City, Town, or Village" value={city} onChange={(e: any) => setCity(e.target.value)} />
                                    <label className="required" htmlFor="floatingInput">City, Town, or Village</label>
                                </div>
                            </Col>
                            <Col xs={12} sm={12} md={4}>
                                <div className="form-floating mb-2">
                                    <select className="form-select" id="floatingSelect" aria-label="Province/State" value={province.key} onChange={(e: any) => setProvince(getKeyValueFromSelect(e) ?? { key: "", value: "" })}>
                                        <option value="" disabled>Please select province/state</option>
                                        <option value="ON">One</option>
                                        <option value="PQ">Two</option>
                                        <option value="BC">Three</option>
                                    </select>
                                    <label className="required" htmlFor="floatingSelect">Province/State</label>
                                </div>
                            </Col>
                            <Col xs={12} sm={12} md={4}>
                                <div className="form-floating mb-2">
                                    <select className="form-select" id="floatingSelect" aria-label="Country" value={country.key} onChange={(e: any) => setCountry(getKeyValueFromSelect(e) ?? { key: "", value: "" })}>
                                        <option value="" disabled>Please select country</option>
                                        <option value="CA">Canada</option>
                                        <option value="US">United States</option>
                                        <option value="OT">Other</option>
                                    </select>
                                    <label className="required" htmlFor="floatingSelect">Country</label>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12} sm={12} md={6}>
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="floatingInput" placeholder="Postal Code" value={postalCode} onChange={(e: any) => setPostalCode(e.target.value)} />
                                    <label className="required" htmlFor="floatingInput">Postal Code</label>
                                </div>
                            </Col>

                            <Col xs={12} sm={12} md={6}>
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="floatingInput" placeholder="Telephone" value={telephone} onChange={(e: any) => setTelephone(e.target.value)} />
                                    <label className="required" htmlFor="floatingInput">Telephone</label>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Container fluid>
                        <Row>
                            <Col>
                                <span className="text-danger me-1">*</span>= mandatory field
                            </Col>
                            <Col className="d-flex justify-content-end">
                                <Button className="me-2" variant="secondary" onClick={doContactInfoDialogSave}>Save</Button>
                                <Button variant="primary" onClick={doContactInfoDialogHide}>Cancel</Button>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Footer>
            </Modal>

            <Modal show={showAccountPreferencesDialog} onHide={doAccountPreferencesDialogHide} backdrop="static" keyboard={false} dialogClassName="modal-width-90-percent">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Account Preferences</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container fluid>
                        <Row>
                            <Col xs={12}>
                                <div>
                                    I consent to the OFSC contacting me with information regarding permits, Rider Advantage and other information related to snowmobiling.
                                    I understand that the OFSC values my privacy and the protection of personal information, by authorizing the release of my name and address
                                    information, I consent to the OFSC&apos;s use of this information for the purposes related to the mandate of the OFSC (www.ofsc.on.ca). I
                                    further understand that any information provided to the OFSC is out of custody and control of the Ministry of Transportation and that the
                                    OFSC will have sole responsibility of the information.
                                </div>
                                <div className="form-floating mb-2">
                                    <select className="form-select" id="floatingSelect" aria-label="OFSC Contact Permission" value={ofscContactPermission} onChange={(e: any) => setOfscContactPermission(e.target.value)}>
                                        <option value="" disabled>Please select a value</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                    <label className="required" htmlFor="floatingSelect">OFSC Contact Permission</label>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12}>
                                <div>
                                    I would like to participate in eligible Rider Advantage programs as offered/available.
                                </div>
                                <div className="form-floating mb-2">
                                    <select className="form-select" id="floatingSelect" aria-label="Rider Advantage" value={riderAdvantage} onChange={(e: any) => setRiderAdvantage(e.target.value)}>
                                        <option value="" disabled>Please select a value</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                    <label className="required" htmlFor="floatingSelect">Rider Advantage</label>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12}>
                                <div>
                                    I am interested in volunteering to support my local Snowmobile Club and I consent to the Club contacting me by phone or email.
                                </div>
                                <div className="form-floating mb-2">
                                    <select className="form-select" id="floatingSelect" aria-label="Volunteering" value={volunteering} onChange={(e: any) => setVolunteering(e.target.value)}>
                                        <option value="" disabled>Please select a value</option>
                                        <option value="0">No, I am not interested in volunteering</option>
                                        <option value="1">Yes, I already volunteer</option>
                                        <option value="2">Yes, I&apos;d like to volunteer</option>
                                    </select>
                                    <label className="required" htmlFor="floatingSelect">Volunteering</label>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Container fluid>
                        <Row>
                            <Col>
                                <span className="text-danger me-1">*</span>= mandatory field
                            </Col>
                            <Col className="d-flex justify-content-end">
                                <Button className="me-2" variant="secondary" onClick={doAccountPreferencesDialogSave}>Save</Button>
                                <Button variant="primary" onClick={doAccountPreferencesDialogHide}>Cancel</Button>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Footer>
            </Modal>
        </>
    )

    function doContactInfoDialogShow(): void {
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

    function doContactInfoDialogSave(): void {
        appContext.updater(draft => {
            draft.contactInfo.email = email;
            draft.contactInfo.firstName = firstName;
            draft.contactInfo.middleName = middleName;
            draft.contactInfo.lastName = lastName;
            draft.contactInfo.addressLine1 = addressLine1;
            draft.contactInfo.addressLine2 = addressLine2;
            draft.contactInfo.city = city;
            draft.contactInfo.province = province;
            draft.contactInfo.country = country;
            draft.contactInfo.postalCode = postalCode;
            draft.contactInfo.telephone = telephone;
        });

        setShowContactInfoDialog(false);
    }

    function doContactInfoDialogHide(): void {
        setShowContactInfoDialog(false);
    }

    function doAccountPreferencesDialogShow(): void {
        setOfscContactPermission(convertBooleanUndefinedToYesNoEmptyString(appContext.data?.accountPreferences?.ofscContactPermission));
        setRiderAdvantage(convertBooleanUndefinedToYesNoEmptyString(appContext.data?.accountPreferences?.riderAdvantage));
        setVolunteering(convertNumberUndefinedTo012EmptyString(appContext.data?.accountPreferences?.volunteering));

        setShowAccountPreferencesDialog(true);
    }

    function doAccountPreferencesDialogSave(): void {
        appContext.updater(draft => {
            draft.accountPreferences.ofscContactPermission = convertYesNoToBoolean(ofscContactPermission);
            draft.accountPreferences.riderAdvantage = convertYesNoToBoolean(riderAdvantage);
            draft.accountPreferences.volunteering = convert012StringToNumber(volunteering);
        });

        setShowAccountPreferencesDialog(false);
    }

    function doAccountPreferencesDialogHide(): void {
        setShowAccountPreferencesDialog(false);
    }

    function convertBooleanUndefinedToYesNoEmptyString(value: boolean | undefined): string {
        return value == undefined ? "" : (value ? "Yes" : "No");
    }

    function convertYesNoToBoolean(value: string): boolean {
        return value?.toUpperCase() === "YES" ? true : false;
    }

    function convertNumberUndefinedTo012EmptyString(value: number | undefined): string {
        return value == undefined ? "" : (value === 2 ? "2" : (value === 1 ? "1" : "0"));
    }

    function convert012StringToNumber(value: string): number {
        return Number(value);
    }
}
