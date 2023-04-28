import { forwardRef, useContext, useEffect, useState } from 'react'
import { AppContext, ICartItem, IKeyValue, IPermitOption, ISnowmobile } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import { formatShortDate, getKeyValueFromSelect } from '@/custom/utilities';
import { clubsData, permitOptionsData, snowmobileMakesData } from '@/custom/data';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { v4 as uuidv4 } from 'uuid';
import ConfirmationDialog from '@/components/confirmation-dialog';
import moment from 'moment';
import { useRouter } from 'next/router';
import DatePicker from 'react-datepicker';
import { getPageAlertMessage } from '../cart';

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
    const router = useRouter();

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

    const [showDeleteSnowmobileDialog, setShowDeleteSnowmobileDialog] = useState(false);
    const [snowmobileIdToDelete, setSnowmobileIdToDelete] = useState("");
    const [snowmobileNameToDelete, setSnowmobileNameToDelete] = useState("");

    const DateRangeInput = forwardRef(({ value, snowmobile, onClick }: { value?: Date, snowmobile: ISnowmobile, onClick?: (e: any) => void }, ref: any) => (
        <div className="form-floating mb-2">
            <input type="text" className="form-control" id={`permit-from-${snowmobile.id}`} placeholder="From" value={formatShortDate(value)} onClick={onClick} onChange={() => null} disabled={isPermitAddedToCart(snowmobile.id)} readOnly={true} ref={ref} />
            <label className="required" htmlFor={`permit-from-${snowmobile.id}`}>From</label>
        </div>
    ));
    DateRangeInput.displayName = "DateRangeInput";

    return (
        <>
            <Head>
                <title>Permits | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>Snowmobiles &amp; Permits</h4>

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

            {snowmobiles != undefined && snowmobiles.length === 0 && (
                <div>You have not added any snowmobiles.</div>
            )}

            <button className="btn btn-primary mb-3" onClick={() => addEditSnowmobileDialogShow()}>Add Snowmobile</button>

            {snowmobiles != undefined && snowmobiles.length > 0 && snowmobiles.map(snowmobile => (
                <div className="card w-100 mb-2" key={snowmobile.id}>
                    <div className="card-header d-flex justify-content-between align-items-center flex-wrap flex-sm-nowrap">
                        <div className="row row-cols-lg-auto g-3">
                            <div className="d-none d-sm-none d-md-flex">
                                <div className="form-floating" style={{ minWidth: 54 }}>
                                    <div className="form-control-plaintext fw-bold" id="floatingPlaintextInput">{snowmobile?.year}</div>
                                    <label htmlFor="floatingPlaintextInput">Year</label>
                                </div>

                                <div className="form-floating" style={{ minWidth: 63 }}>
                                    <div className="form-control-plaintext fw-bold" id="floatingPlaintextInput">{snowmobile?.make?.value}</div>
                                    <label htmlFor="floatingPlaintextInput">Make</label>
                                </div>

                                <div className="form-floating" style={{ minWidth: 70 }}>
                                    <div className="form-control-plaintext fw-bold" id="floatingPlaintextInput">{snowmobile?.model}</div>
                                    <label htmlFor="floatingPlaintextInput">Model</label>
                                </div>

                                <div className="form-floating" style={{ minWidth: 51 }}>
                                    <div className="form-control-plaintext fw-bold" id="floatingPlaintextInput">{snowmobile?.vin}</div>
                                    <label htmlFor="floatingPlaintextInput">VIN</label>
                                </div>

                                <div className="form-floating" style={{ minWidth: 59 }}>
                                    <div className="form-control-plaintext fw-bold" id="floatingPlaintextInput">{snowmobile?.licensePlate}</div>
                                    <label htmlFor="floatingPlaintextInput">Plate</label>
                                </div>
                            </div>
                            <div className="d-md-none">
                                {`${snowmobile?.year} ${snowmobile?.make?.value} ${snowmobile?.model} ${snowmobile?.vin} ${snowmobile?.licensePlate}`}
                            </div>
                        </div>
                        <div className="d-flex justify-content-end">
                            {snowmobile.isEditable && (
                                <>
                                    <button className="btn btn-primary btn-sm mt-2 mt-sm-0" onClick={() => addEditSnowmobileDialogShow(snowmobile.id)}>Edit</button>
                                    <button className="btn btn-danger btn-sm mt-2 mt-sm-0 ms-1" onClick={() => deleteSnowmobileDialogShow(snowmobile.id)}>Remove</button>
                                </>
                            )}
                        </div>
                    </div>

                    <ul className="list-group list-group-flush">
                        {!snowmobile?.isEditable && (
                            <li className="list-group-item">
                                <div>
                                    <div><b>Permit:</b> {snowmobile?.permit?.name} - {snowmobile?.permit?.number}</div>
                                    <div><b>Purchased:</b> {formatShortDate(snowmobile?.permit?.purchaseDate)}</div>
                                    <div><b>Tracking #:</b> {snowmobile?.permit?.trackingNumber}</div>
                                </div>
                            </li>
                        )}

                        {snowmobile?.isEditable && snowmobile?.permitOptions != undefined && snowmobile.permitOptions.length > 0 && (
                            <>
                                <li className="list-group-item">
                                    <h6 className="card-title">Select a permit to purchase</h6>

                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="radio" name={`permits-permit-options-${snowmobile.id}`} id={`permits-permit-options-${snowmobile.id}-none`} checked={snowmobile?.permit?.permitOptionId === ""} value="" onChange={(e: any) => permitOptionChange(e, snowmobile.id)} disabled={isPermitAddedToCart(snowmobile.id)} />
                                        <label className="form-check-label" htmlFor={`permits-permit-options-${snowmobile.id}-none`}>
                                            None Selected
                                        </label>
                                    </div>

                                    {snowmobile.permitOptions.map(permitOption => (
                                        <div className="form-check form-check-inline" key={permitOption.id}>
                                            <input className="form-check-input" type="radio" name={`permits-permit-options-${snowmobile.id}`} id={`permits-permit-options-${snowmobile.id}-${permitOption.id}`} checked={snowmobile?.permit?.permitOptionId === permitOption.id} value={permitOption.id} onChange={(e: any) => permitOptionChange(e, snowmobile.id)} disabled={isPermitAddedToCart(snowmobile.id)} />
                                            <label className="form-check-label" htmlFor={`permits-permit-options-${snowmobile.id}-${permitOption.id}`}>
                                                {permitOption?.name} - ${permitOption?.price}
                                            </label>
                                        </div>
                                    ))}
                                </li>

                                {showDateRangeForSelectedPermit(snowmobile.id) && (
                                    <li className="list-group-item">
                                        <h6 className="card-title">Select a date range</h6>

                                        <div className="row">
                                            <div className="col-12 col-sm-12 col-md-6">
                                                <DatePicker dateFormat="yyyy-MM-dd" selected={snowmobile?.permit?.dateStart} minDate={moment().toDate()} onChange={(date: Date) => permitDateRangeChange(date, snowmobile.id)} customInput={<DateRangeInput value={undefined} snowmobile={snowmobile} onClick={undefined} />} />
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-6">
                                                <div className="form-floating mb-2">
                                                    <input type="text" className="form-control" id={`permit-to-${snowmobile.id}`} placeholder="To" value={formatShortDate(snowmobile?.permit?.dateEnd)} onChange={() => null} disabled={true} />
                                                    <label className="required" htmlFor={`permit-to-${snowmobile.id}`}>To</label>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                )}

                                <li className="list-group-item">
                                    <h6 className="card-title">Select a club</h6>

                                    <div className="mb-2">
                                        By choosing a specific club when buying a permit, you&apos;re directly helping that club groom and maintain the trails you enjoy riding most often,
                                        so please buy where you ride and make your selection below.
                                    </div>

                                    <div className="form-floating mb-2">
                                        <select className="form-select" id={`permits-club-${snowmobile.id}`} aria-label="Club" value={snowmobile?.permit?.clubId ?? ""} onChange={(e) => permitClubChange(e, snowmobile.id)} disabled={isPermitAddedToCart(snowmobile.id)}>
                                            <option value="" disabled>Please select a value</option>

                                            {clubsData != undefined && clubsData.length > 0 && clubsData.map(club => (
                                                <option value={club.key} key={club.key}>{club.value}</option>
                                            ))}
                                        </select>
                                        <label className="required" htmlFor="permits-club">Club</label>
                                    </div>

                                    {!isPermitAddedToCart(snowmobile.id) && (
                                        <span className="btn btn-link text-decoration-none align-baseline text-start border-0 p-0" onClick={() => clubLocatorMapDialogShow()}>
                                            Can&apos;t find your club? Use the Club Locator Map and enter the closest town name to get started.
                                        </span>
                                    )}
                                    {isPermitAddedToCart(snowmobile.id) && (
                                        <span className="">
                                            Can&apos;t find your club? Use the Club Locator Map and enter the closest town name to get started.
                                        </span>
                                    )}
                                </li>
                            </>
                        )}
                    </ul>

                    {snowmobile.isEditable && !isPermitAddedToCart(snowmobile.id) && (
                        <div className="card-footer">
                            <button className="btn btn-success btn-sm" onClick={() => addPermitToCartClick(snowmobile.id)} disabled={!isAddToCartButtonEnabled(snowmobile.id)}>Add to Cart</button>
                        </div>
                    )}
                    {snowmobile.isEditable && isPermitAddedToCart(snowmobile.id) && (
                        <div className="card-footer">
                            <button className="btn btn-danger btn-sm" onClick={() => removePermitFromCartClick(snowmobile.id)}>Remove from Cart</button>
                        </div>
                    )}

                    {!snowmobile.isEditable && (
                        <div className="card-footer">
                            <i className="fa-solid fa-circle-info me-2"></i>This vehicle cannot be modified as a Ministry of Transportation Ontario Snowmobile Trail Permit has been registered to it.
                        </div>
                    )}
                </div>
            ))}

            <ConfirmationDialog showDialog={showDeleteSnowmobileDialog} title="Delete Snowmobile" buttons={2} width="50"
                yesClick={() => deleteSnowmobileDialogYesClick()} noClick={() => deleteSnowmobileDialogNoClick()} closeClick={() => deleteSnowmobileDialogNoClick()}>
                <div className="fw-bold mb-2">{snowmobileNameToDelete}</div>
                <div >Are you sure you want to delete this snowmobile?</div>
            </ConfirmationDialog>

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

                                        {years != undefined && years.length > 0 && years.map(x => (
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

                                        {snowmobileMakesData != undefined && snowmobileMakesData.length > 0 && snowmobileMakesData.map(x => (
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
        </>
    )

    function getSnowmobile(snowmobileId: string): ISnowmobile | undefined {
        let result: ISnowmobile | undefined = undefined;

        result = snowmobiles?.filter(x => x.id === snowmobileId)[0];

        return result;
    }

    function addEditSnowmobileDialogShow(snowmobileId?: string): void {
        if (snowmobileId == undefined) {
            setYear("");
            setMake({ key: "", value: "" });
            setModel("");
            setVin("");
            setLicensePlate("");
            setPermitForThisSnowmobileOnly(false);
            setRegisteredOwner(false);

            setEditedSnowmobileId("");
        } else {
            let snowmobile: ISnowmobile = snowmobiles?.filter(x => x.id === snowmobileId)[0];

            setYear(snowmobile?.year ?? "");
            setMake(snowmobile?.make ?? { key: "", value: "" });
            setModel(snowmobile?.model ?? "");
            setVin(snowmobile?.vin ?? "");
            setLicensePlate(snowmobile?.licensePlate ?? "");
            setPermitForThisSnowmobileOnly(snowmobile?.permitForThisSnowmobileOnly ?? false); // TODO: should this always be false?
            setRegisteredOwner(snowmobile?.registeredOwner ?? false); // TODO: should this always be false?

            setEditedSnowmobileId(snowmobileId);
        }

        setShowAddEditSnowmobileDialog(true);
    }

    function addEditSnowmobileDialogSave(): void {
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
                isEditable: true,
            };

            appContext.updater(draft => {
                draft.snowmobiles.push(item);
            });
        } else {
            appContext.updater(draft => {
                let item: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x.id === editedSnowmobileId)[0];

                if (item != undefined) {
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
            });
        }

        setShowAddEditSnowmobileDialog(false);
    }

    function addEditSnowmobileDialogHide(): void {
        setShowAddEditSnowmobileDialog(false);
    }

    function deleteSnowmobileDialogShow(snowmobileId: string): void {
        let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

        if (snowmobile != undefined) {
            setSnowmobileIdToDelete(snowmobileId);
            setSnowmobileNameToDelete(`${snowmobile.year} ${snowmobile.make.value} ${snowmobile.model} ${snowmobile.vin}`);

            setShowDeleteSnowmobileDialog(true);
        }
    }

    function deleteSnowmobileDialogYesClick(): void {
        appContext.updater(draft => {
            draft.snowmobiles = draft.snowmobiles.filter(x => x.id !== snowmobileIdToDelete);
            draft.cartItems = draft.cartItems.filter(x => x.itemId !== snowmobileIdToDelete);
        });

        setSnowmobileIdToDelete("");
        setSnowmobileNameToDelete("");

        setShowDeleteSnowmobileDialog(false);
    }

    function deleteSnowmobileDialogNoClick(): void {
        setSnowmobileIdToDelete("");
        setSnowmobileNameToDelete("");

        setShowDeleteSnowmobileDialog(false);
    }

    function getYearRange(startYear: number, endYear: number): number[] {
        let result: number[] = [];

        for (let i: number = endYear; i >= startYear; i--) {
            result.push(i);
        }

        return result;
    }

    function permitOptionChange(e: any, snowmobileId: string): void {
        appContext.updater(draft => {
            let snowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x.id === snowmobileId)[0];

            if (snowmobile != undefined) {
                if (snowmobile?.permit == undefined) {
                    snowmobile.permit = {
                        id: uuidv4(),
                        name: undefined,
                        number: undefined,
                        purchaseDate: undefined,
                        trackingNumber: undefined,

                        permitOptionId: undefined,
                        dateStart: undefined,
                        dateEnd: undefined,
                        clubId: undefined
                    };
                }

                let permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x.id === e?.target?.value)[0];

                if (permitOption == undefined) { // None was selected
                    snowmobile.permit.permitOptionId = "";
                    snowmobile.permit.dateStart = undefined;
                    snowmobile.permit.dateEnd = undefined;
                } else {
                    snowmobile.permit.permitOptionId = permitOption.id;
                    snowmobile.permit.dateStart = undefined;
                    snowmobile.permit.dateEnd = undefined;
                }
            }
        });
    }

    function permitDateRangeChange(date: Date, snowmobileId: string): void {
        console.log('date', date, 'snowmobileid', snowmobileId)

        appContext.updater(draft => {
            let snowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x.id === snowmobileId)[0];
            let permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x.id === snowmobile?.permit?.permitOptionId)[0];

            if (snowmobile != undefined && permitOption != undefined) {
                if (snowmobile?.permit == undefined) {
                    snowmobile.permit = {
                        id: uuidv4(),
                        name: undefined,
                        number: undefined,
                        purchaseDate: undefined,
                        trackingNumber: undefined,

                        permitOptionId: undefined,
                        dateStart: undefined,
                        dateEnd: undefined,
                        clubId: undefined
                    };
                }

                snowmobile.permit.dateStart = date;

                let daysToAdd: number = (permitOption?.numberOfDays ?? 0) - 1;

                if (daysToAdd >= 0) {
                    snowmobile.permit.dateEnd = moment(date).add(daysToAdd, 'days').toDate();
                }
            }
        });
    }

    function permitClubChange(e: any, snowmobileId: string): void {
        appContext.updater(draft => {
            let snowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x.id === snowmobileId)[0];

            if (snowmobile != undefined) {
                if (snowmobile?.permit == undefined) {
                    snowmobile.permit = {
                        id: uuidv4(),
                        name: undefined,
                        number: undefined,
                        purchaseDate: undefined,
                        trackingNumber: undefined,

                        permitOptionId: undefined,
                        dateStart: undefined,
                        dateEnd: undefined,
                        clubId: undefined
                    };
                }

                snowmobile.permit.clubId = e?.target?.value;
            }
        });
    }

    function showDateRangeForSelectedPermit(snowmobileId: string): boolean {
        let result = false;

        let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

        if (snowmobile != undefined) {
            let permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x.id === snowmobile?.permit?.permitOptionId)[0];

            if (permitOption != undefined) {
                result = permitOption?.requiresDateRange;
            }
        }

        return result;
    }

    function clubLocatorMapDialogShow(): void {

    }

    function isAddToCartButtonEnabled(snowmobileId: string): boolean {
        let result: boolean = false;

        let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

        if (snowmobile != undefined) {
            let permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x.id === snowmobile?.permit?.permitOptionId)[0];

            if (permitOption != undefined) {
                result = snowmobile?.permit?.permitOptionId != undefined
                    && (!permitOption?.requiresDateRange
                        || (permitOption?.requiresDateRange && snowmobile?.permit?.dateStart != undefined && snowmobile?.permit?.dateEnd != undefined))
                    && snowmobile?.permit?.clubId != undefined;
            }
        }

        return result;
    }

    function addPermitToCartClick(snowmobileId: string): void {
        appContext.updater(draft => {
            let snowmobile: ISnowmobile | undefined = draft.snowmobiles.filter(x => x.id === snowmobileId)[0];

            if (snowmobile != undefined) {
                let permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x.id === snowmobile?.permit?.permitOptionId)[0];
                let club: IKeyValue | undefined = clubsData?.filter(x => x.key === snowmobile?.permit?.clubId)[0];

                if (permitOption != undefined && club != undefined) {
                    let description: string = `${snowmobile?.year} ${snowmobile?.make?.value} ${snowmobile?.model} ${snowmobile?.vin} `;

                    if (permitOption.requiresDateRange) {
                        description += `${permitOption?.name} (${formatShortDate(snowmobile?.permit?.dateStart)} - ${formatShortDate(snowmobile?.permit?.dateEnd)}) `;
                    } else {
                        description += `${permitOption?.name} `;
                    }

                    description += `(${club.value})`;

                    let cartItem: ICartItem = {
                        id: uuidv4(),
                        description: description,
                        price: permitOption?.price,
                        isPermit: true,
                        isGiftCard: false,
                        itemId: snowmobile.id
                    };

                    draft.cartItems.push(cartItem);
                }
            }
        });
    }

    function removePermitFromCartClick(snowmobileId: string): void {
        appContext.updater(draft => {
            draft.cartItems = draft.cartItems.filter(x => x.itemId !== snowmobileId);
        })
    }

    function isPermitAddedToCart(snowmobileId: string): boolean {
        let result: boolean = false;

        result = appContext.data?.cartItems?.filter(x => x.isPermit && x.itemId === snowmobileId)?.length > 0;

        return result;
    }
}
