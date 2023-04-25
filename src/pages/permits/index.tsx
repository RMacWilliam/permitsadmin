import { useContext, useEffect, useState } from 'react'
import { AppContext, ICartItem, IPermit, ISnowmobile } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import { formatShortDate, getKeyValueFromSelect } from '@/custom/utilities';
import { clubsData, permitOptionsData, snowmobileMakesData } from '@/custom/data';
import Link from 'next/link';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { v4 as uuidv4 } from 'uuid';

export default function PermitsPage() {
    const appContext = useContext(AppContext);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "permits" });
    }, [appContext])

    return (
        <AuthenticatedPageLayout>
            <Permits></Permits>
        </AuthenticatedPageLayout>
    )
}

function Permits() {
    const appContext = useContext(AppContext);

    const snowmobiles: ISnowmobile[] = appContext.data?.snowmobiles ?? [];

    const [showAddEditSnowmobileDialog, setShowAddEditSnowmobileDialog] = useState(false);
    const [editedSnowmobileId, setEditedSnowmobileId] = useState("");

    const startYear: number = 1960; // TODO: Is this the minimum year?
    const endYear: number = (new Date()).getFullYear(); // TODO: Is the current year the maximum year?
    const years: number[] = getYearRange(startYear, endYear);

    const [year, setYear] = useState("");
    const [make, setMake] = useState({ key: "", value: "" });
    const [model, setModel] = useState("");
    const [vin, setVin] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    const [permitForThisSnowmobileOnly, setPermitForThisSnowmobileOnly] = useState(false);
    const [registeredOwner, setRegisteredOwner] = useState(false);

    return (
        <>
            <Head>
                <title>Permits | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>Snowmobiles &amp; Permits</h4>

            {snowmobiles.length === 0 && (
                <div>You have not added any snowmobiles.</div>
            )}

            <button className="btn btn-primary mb-2" onClick={() => addEditSnowmobileDialogShow()}>Add Snowmobile</button>

            {snowmobiles != null && snowmobiles.length > 0 && snowmobiles.map(snowmobile => (
                <div className="card w-100 mb-2" key={snowmobile.id}>
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <div className="row row-cols-lg-auto g-3">
                            <div className="d-none d-sm-none d-md-flex">
                                <div className="form-floating" style={{ minWidth: 54 }}>
                                    <div className="form-control-plaintext fw-bold" id="floatingPlaintextInput">{snowmobile.year}</div>
                                    <label htmlFor="floatingPlaintextInput">Year</label>
                                </div>

                                <div className="form-floating" style={{ minWidth: 63 }}>
                                    <div className="form-control-plaintext fw-bold" id="floatingPlaintextInput">{snowmobile.make.value}</div>
                                    <label htmlFor="floatingPlaintextInput">Make</label>
                                </div>

                                <div className="form-floating" style={{ minWidth: 70 }}>
                                    <div className="form-control-plaintext fw-bold" id="floatingPlaintextInput">{snowmobile.model}</div>
                                    <label htmlFor="floatingPlaintextInput">Model</label>
                                </div>

                                <div className="form-floating" style={{ minWidth: 51 }}>
                                    <div className="form-control-plaintext fw-bold" id="floatingPlaintextInput">{snowmobile.vin}</div>
                                    <label htmlFor="floatingPlaintextInput">VIN</label>
                                </div>

                                <div className="form-floating" style={{ minWidth: 59 }}>
                                    <div className="form-control-plaintext fw-bold" id="floatingPlaintextInput">{snowmobile.licensePlate}</div>
                                    <label htmlFor="floatingPlaintextInput">Plate</label>
                                </div>
                            </div>
                            <div className="d-md-none">
                                {`${snowmobile.year} ${snowmobile.make.value} ${snowmobile.model} ${snowmobile.vin} ${snowmobile.licensePlate}`}
                            </div>
                        </div>
                        <div className="d-flex justify-content-end">
                            {snowmobile.isEditable && (
                                <>
                                    <button className="btn btn-primary btn-sm" onClick={() => addEditSnowmobileDialogShow(snowmobile.id)}>Edit</button>
                                    <button className="btn btn-danger btn-sm ms-1">Remove</button>
                                </>
                            )}
                        </div>
                    </div>

                    <ul className="list-group list-group-flush">
                        {snowmobile.permit != null && (
                            <li className="list-group-item">
                                <div>
                                    <div><b>Permit:</b> {snowmobile.permit?.name} - {snowmobile.permit?.number}</div>
                                    <div><b>Purchased:</b> {formatShortDate(snowmobile.permit?.purchaseDate)}</div>
                                    <div><b>Tracking #:</b> {snowmobile.permit?.trackingNumber}</div>
                                </div>
                            </li>
                        )}

                        {snowmobile.permit == null && snowmobile.permitOptions != null && snowmobile.permitOptions.length > 0 && (
                            <>
                                <li className="list-group-item">
                                    <h5 className="card-title">Select a permit to purchase</h5>

                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" />
                                        <label className="form-check-label" htmlFor="flexRadioDefault1">
                                            None Selected
                                        </label>
                                    </div>

                                    {snowmobile.permitOptions.map(po => (
                                        <div className="form-check form-check-inline" key={po.id}>
                                            <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" />
                                            <label className="form-check-label" htmlFor="flexRadioDefault2">
                                                {po.name} - {po.price}
                                            </label>
                                        </div>
                                    ))}
                                </li>

                                <li className="list-group-item">
                                    <h5 className="card-title">Select a date range</h5>

                                    <div className="row">
                                        <div className="col-12 col-sm-12 col-md-6">
                                            <div className="form-floating mb-2">
                                                <input type="text" className="form-control" id="permit-from" placeholder="From" />
                                                <label className="required" htmlFor="permit-from">From</label>
                                            </div>
                                        </div>

                                        <div className="col-12 col-sm-12 col-md-6">
                                            <div className="form-floating mb-2">
                                                <input type="text" className="form-control" id="permit-to" placeholder="To" />
                                                <label className="required" htmlFor="permit-to">To</label>
                                            </div>
                                        </div>
                                    </div>
                                </li>

                                <li className="list-group-item">
                                    <h5 className="card-title">Select a club</h5>

                                    <div className="mb-2 fw-bold">
                                        By choosing a specific club when buying a permit, you&apos;re directly helping that club groom and maintain the trails you enjoy riding most often,
                                        so please buy where you ride and make your selection below.
                                    </div>

                                    <div className="form-floating mb-2">
                                        <select className="form-select" id="permits-club" aria-label="Club" value="" onChange={() => { return true; }}>
                                            <option value="" disabled>Please select a value</option>

                                            {clubsData != null && clubsData.length > 0 && clubsData.map(club => (
                                                <option value={club.key} key={club.key}>{club.value}</option>
                                            ))}
                                        </select>
                                        <label className="required" htmlFor="permits-club">Club</label>
                                    </div>

                                    <Link className="text-decoration-none" href="" onClick={(e: any) => clubLocatorMapDialogShow()}>
                                        Can&apos;t find your club? Use the Club Locator Map and enter the closest town name to get started.
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

                    {snowmobile.isEditable && (
                        <div className="card-footer">
                            <button className="btn btn-success btn-sm" onClick={() => addPermitToCartClick(snowmobile.id)}>Add to Cart</button>
                        </div>
                    )}
                    {!snowmobile.isEditable && (
                        <div className="card-footer">
                            <i className="fa-solid fa-circle-info me-2"></i>This vehicle cannot be modified as a Ministry of Transportation Ontario Snowmobile Trail Permit has been registered to it.
                        </div>
                    )}
                </div>
            ))}

            {snowmobiles.length > 0 && (
                <button className="btn btn-primary" onClick={() => addEditSnowmobileDialogShow()}>Add Snowmobile</button>
            )}

            <Modal show={showAddEditSnowmobileDialog} onHide={addEditSnowmobileDialogHide} backdrop="static" keyboard={false} dialogClassName="modal-width-90-percent">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Snowmobile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <select className="form-select" id="add-edit-snowmobile-year" aria-label="Year" value={year} onChange={(e: any) => setYear(e.target.value)}>
                                        <option value="" disabled>Please select a value</option>

                                        {years != null && years.length > 0 && years.map(x => (
                                            <option value={x} key={x}>{x}</option>
                                        ))}
                                    </select>
                                    <label className="required" htmlFor="add-edit-snowmobile-year">Year</label>
                                </div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <select className="form-select" id="add-edit-snowmobile-make" aria-label="Make" value={make.key} onChange={(e: any) => setMake(getKeyValueFromSelect(e) ?? { key: "", value: "" })}>
                                        <option value="" disabled>Please select a value</option>

                                        {snowmobileMakesData != null && snowmobileMakesData.length > 0 && snowmobileMakesData.map(x => (
                                            <option value={x.key} key={x.key}>{x.value}</option>
                                        ))}
                                    </select>
                                    <label className="required" htmlFor="add-edit-snowmobile-make">Make</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="add-edit-snowmobile-model" placeholder="Model" value={model} onChange={(e: any) => setModel(e.target.value)} />
                                    <label className="required" htmlFor="add-edit-snowmobile-model">Model</label>
                                </div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="add-edit-snowmobile-vin" placeholder="VIN" value={vin} onChange={(e: any) => setVin(e.target.value)} />
                                    <label className="required" htmlFor="add-edit-snowmobile-vin">VIN</label>
                                </div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="add-edit-snowmobile-license-plate" placeholder="License Plate" value={licensePlate} onChange={(e: any) => setLicensePlate(e.target.value)} />
                                    <label className="required" htmlFor="add-edit-snowmobile-license-plate">License Plate</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div className="form-check mb-2">
                                    <input className="form-check-input" type="checkbox" value="" id="add-edit-snowmobile-permit-for-this-snowmobile-only" defaultChecked={permitForThisSnowmobileOnly} onChange={(e: any) => { setPermitForThisSnowmobileOnly(e.target.checked) }} />
                                    <label className="form-check-label" htmlFor="add-edit-snowmobile-permit-for-this-snowmobile-only">
                                        I understand that the trail permit for which I am applying is valid only for the motorized snow vehicle identified in this application
                                        and is valid only where the sticker (permit) issued under this application is permanently affixed in the required position on that
                                        motorized snow vehicle. I certify that the information contained in this application is true and acknowledge and accept the responsibilities
                                        imposed by law.
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value="" id="add-edit-snowmobile-registered-owner" defaultChecked={registeredOwner} onChange={(e: any) => setRegisteredOwner(e.target.checked)} />
                                    <label className="form-check-label" htmlFor="add-edit-snowmobile-registered-owner">
                                        I confirm I am the registered owner of this vehicle.
                                    </label>
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
                                <Button className="me-2" variant="secondary" onClick={addEditSnowmobileDialogSave}>Save</Button>
                                <Button variant="primary" onClick={addEditSnowmobileDialogHide}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* <hr />

            <div className="card w-100 mt-2">
                <h5 className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        2005 Yamaha Some Model DRFF2122030493 3ZZ877
                    </div>
                    <div>
                        <button className="btn btn-primary">Edit</button>
                        <button className="btn btn-danger">Remove</button>
                    </div>
                </h5>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <h5 className="card-title">Select a permit to purchase</h5>

                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" />
                            <label className="form-check-label" htmlFor="flexRadioDefault1">
                                None Selected
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" checked />
                            <label className="form-check-label" htmlFor="flexRadioDefault2">
                                Classic - $190.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault3" />
                            <label className="form-check-label" htmlFor="flexRadioDefault3">
                                Multi Day 4 - $180.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault4" />
                            <label className="form-check-label" htmlFor="flexRadioDefault4">
                                Multi Day 3 - $135.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault5" />
                            <label className="form-check-label" htmlFor="flexRadioDefault5">
                                Multi Day 2 - $90.00
                            </label>
                        </div>
                    </li>
                    <li className="list-group-item">
                        <h5 className="card-title">Select a club</h5>

                        <select className="form-select" aria-label="Default select example">
                            <option selected>Please select your club</option>
                            <option value="1">Arctic Riders Snow Club</option>
                            <option value="2">Ontario Snow Club</option>
                        </select>

                        <div className="mt-2">- OR -</div>

                        <div className="mt-2">Can&apos;t find your club? Use the Club Locator Map and enter the closest town name to get started.
                            <select className="form-select" aria-label="Default select example">
                                <option selected>Club Locator</option>
                                <option value="1">Arctic Riders Snow Club</option>
                                <option value="2">Ontario Snow Club</option>
                            </select>

                            <div className="mt-2 fw-bold">
                                By choosing a specific club when buying a permit, you&apos;re directly helping that club groom and maintain the trails you enjoy riding most often,
                                so please buy where you ride and make your selection above.
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

            <div className="card w-100 mt-2">
                <h5 className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        2022 Yamaha Vmax MRT00038472984 7ZZ332
                    </div>
                    <div>
                        <button className="btn btn-primary">Edit</button>
                        <button className="btn btn-danger">Remove</button>
                    </div>
                </h5>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <h5 className="card-title">Select a permit to purchase</h5>

                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefaultx" id="flexRadioDefault1x" checked />
                            <label className="form-check-label" htmlFor="flexRadioDefault1x">
                                None Selected
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefaultx" id="flexRadioDefault2x" />
                            <label className="form-check-label" htmlFor="flexRadioDefault2x">
                                Seasonal - $280.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefaultx" id="flexRadioDefault3x" />
                            <label className="form-check-label" htmlFor="flexRadioDefault3x">
                                Multi Day 6 - $270.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefaultx" id="flexRadioDefault4x" />
                            <label className="form-check-label" htmlFor="flexRadioDefault4x">
                                Multi Day 5 - $225.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefaultx" id="flexRadioDefault5x" />
                            <label className="form-check-label" htmlFor="flexRadioDefault5x">
                                Multi Day 4 - $180.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefaultx" id="flexRadioDefault6x" />
                            <label className="form-check-label" htmlFor="flexRadioDefault6x">
                                Multi Day 3 - $135.00
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="flexRadioDefaultx" id="flexRadioDefault7x" />
                            <label className="form-check-label" htmlFor="flexRadioDefault7x">
                                Multi Day 2 - $90.00
                            </label>
                        </div>
                    </li>
                    <li className="list-group-item">
                        <h5 className="card-title">Select a club</h5>

                        <select className="form-select" aria-label="Default select example">
                            <option selected>Please select a club</option>
                            <option value="1">Arctic Riders Snow Club</option>
                            <option value="2">Ontario Snow Club</option>
                        </select>

                        <div className="mt-2">- OR -</div>

                        <div className="mt-2">Can&apos;t find your club? Use the Club Locator Map and enter the closest town name to get started.
                            <select className="form-select" aria-label="Default select example">
                                <option selected>Club Locator</option>
                                <option value="1">Arctic Riders Snow Club</option>
                                <option value="2">Ontario Snow Club</option>
                            </select>

                            <div className="mt-2 fw-bold">
                                By choosing a specific club when buying a permit, you&apos;re directly helping that club groom and maintain the trails you enjoy riding most often,
                                so please buy where you ride and make your selection above.
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

            <button className="btn btn-primary mt-3">Add Vehicle</button> */}
        </>
    )

    function addEditSnowmobileDialogShow(id?: string): void {
        if (id == null) {
            setYear("");
            setMake({ key: "", value: "" });
            setModel("");
            setVin("");
            setLicensePlate("");
            setPermitForThisSnowmobileOnly(false);
            setRegisteredOwner(false);

            setEditedSnowmobileId("");
        } else {
            let snowmobile: ISnowmobile = snowmobiles.filter(x => x.id === id)[0];

            setYear(snowmobile?.year ?? "");
            setMake(snowmobile?.make ?? { key: "", value: "" });
            setModel(snowmobile?.model ?? "");
            setVin(snowmobile?.vin ?? "");
            setLicensePlate(snowmobile?.licensePlate ?? "");
            setPermitForThisSnowmobileOnly(snowmobile?.permitForThisSnowmobileOnly ?? false); // TODO: should this always be false?
            setRegisteredOwner(snowmobile?.registeredOwner ?? false); // TODO: should this always be false?

            setEditedSnowmobileId(id);
        }

        setShowAddEditSnowmobileDialog(true);
    }

    function addEditSnowmobileDialogSave(): void {
        appContext.updater(draft => {
            if (editedSnowmobileId === "") {
                let item: ISnowmobile = {
                    id: uuidv4(),
                    year: year,
                    make: make,
                    model: model,
                    vin: vin,
                    licensePlate: licensePlate,
                    permitForThisSnowmobileOnly: permitForThisSnowmobileOnly,
                    registeredOwner: registeredOwner,
                    permit: undefined,
                    permitOptions: permitOptionsData, // TODO: Permit options should reflect selections
                    isEditable: true
                };

                draft.snowmobiles.push(item);
            } else {
                let item: ISnowmobile = draft.snowmobiles.filter(x => x.id === editedSnowmobileId)[0];

                if (item != null) {
                    item.year = year;
                    item.make = make;
                    item.model = model;
                    item.vin = vin;
                    item.licensePlate = licensePlate;
                    item.permitForThisSnowmobileOnly = permitForThisSnowmobileOnly;
                    item.registeredOwner = registeredOwner;
                    item.permit = undefined;
                    item.permitOptions = permitOptionsData; // TODO: Permit options should reflect selections
                    item.isEditable = true;
                }
            }
        });

        setShowAddEditSnowmobileDialog(false);
    }

    function addEditSnowmobileDialogHide(): void {
        setShowAddEditSnowmobileDialog(false);
    }

    function getYearRange(startYear: number, endYear: number): number[] {
        let result: number[] = [];

        for (let i: number = startYear; i <= endYear; i++) {
            result.push(i);
        }

        return result;
    }

    function clubLocatorMapDialogShow(): void {

    }

    function addPermitToCartClick(id: string): void {
        //let cartItems: ICartItem[] = appContext.data?.cartItems ?? [];

        // let permit: IPermit = snowmobiles.filter(x => x.id === id)[0];

        // let item: ICartItem = {
        //     id: uuidv4(),
        //     description: 
        // };


    }
}
