import { forwardRef, useContext, useEffect, useState } from 'react'
import { AppContext, IAppContextValues, ICartItem, IKeyValue, IPermit, IPermitOption, ISnowmobile } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import { formatShortDate, getDate, getGuid, getKeyValueFromSelect, getMoment, parseDate, sortArray } from '@/custom/utilities';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { NextRouter, useRouter } from 'next/router';
import DatePicker from 'react-datepicker';
import CartItemsAlert from '@/components/cart-items-alert';
import { IApiGetClubsResult, IApiGetVehicleMakesResult, IApiGetVehiclesAndPermitsForUserPermit, IApiGetVehiclesAndPermitsForUserPermitOption, IApiGetVehiclesAndPermitsForUserResult, apiGetClubs, apiGetVehicleMakes, apiGetVehiclesAndPermitsForUser } from '@/custom/api';
import { Observable, forkJoin } from 'rxjs';

export default function PermitsPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(true);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "permits" });
    }, [appContext])

    return (
        <AuthenticatedPageLayout showAlert={showAlert}>
            <Permits appContext={appContext} router={router} setShowAlert={setShowAlert}></Permits>
        </AuthenticatedPageLayout>
    )
}

function Permits({ appContext, router, setShowAlert }: { appContext: IAppContextValues, router: NextRouter, setShowAlert: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [showAddEditSnowmobileDialog, setShowAddEditSnowmobileDialog] = useState(false);
    const [editedSnowmobileId, setEditedSnowmobileId] = useState("");

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

    const startYear: number = 1960; // TODO: Is this the minimum year?
    const endYear: number = getDate().getFullYear(); // TODO: Is the current year the maximum year?
    const [yearsData, setYearsData] = useState([] as number[]);
    const [vehicleMakesData, setVehicleMakesData] = useState([] as IKeyValue[]);
    const [clubsData, setClubsData] = useState([] as IKeyValue[]);

    const DateRangeInput = forwardRef(({ value, snowmobile, onClick }: { value?: Date, snowmobile: ISnowmobile, onClick?: (e: any) => void }, ref: any) => (
        <div className="form-floating mb-2">
            <input type="text" className="form-control" id={`permit-from-${snowmobile.oVehicleId}`} placeholder="From" value={formatShortDate(value)} onClick={onClick} onChange={() => null} disabled={isPermitAddedToCart(snowmobile.oVehicleId)} readOnly={true} ref={ref} />
            <label className="required" htmlFor={`permit-from-${snowmobile.oVehicleId}`}>From</label>
        </div>
    ));
    DateRangeInput.displayName = "DateRangeInput";

    useEffect(() => {
        // Get data from api.
        let batchApi: Observable<any>[] = [
            apiGetVehiclesAndPermitsForUser(),
            apiGetVehicleMakes(),
            apiGetClubs()
        ];

        forkJoin(batchApi).subscribe({
            next: (results: any[]) => {
                // apiGetVehiclesAndPermitsForUser
                const apiGetVehiclesAndPermitsForUserResult: IApiGetVehiclesAndPermitsForUserResult[] = results[0] as IApiGetVehiclesAndPermitsForUserResult[];

                if (apiGetVehiclesAndPermitsForUserResult != undefined && results.length > 0) {
                    let snowmobiles: ISnowmobile[] = [];

                    apiGetVehiclesAndPermitsForUserResult.forEach(x => {
                        let snowmobile: ISnowmobile = {
                            oVehicleId: x?.oVehicleId,
                            vehicleMake: x?.vehicleMake,
                            model: x?.model,
                            vin: x?.vin,
                            licensePlate: x?.licensePlate,
                            vehicleYear: x?.vehicleYear,
                            origVehicleId: x?.origVehicleId,
                            isClassic: x?.isClassic,
                            permits: undefined,
                            permitSelections: x?.permitSelections ?? {
                                oPermitId: getGuid(),
                                permitOptionId: undefined,
                                dateStart: undefined,
                                dateEnd: undefined,
                                clubId: undefined
                            },
                            permitOptions: undefined,
                            isEditable: true
                        };

                        // TODO: Get api to set oPermitId to a guid initially.
                        if (snowmobile?.permitSelections != undefined && snowmobile?.permitSelections?.oPermitId == undefined) {
                            snowmobile.permitSelections.oPermitId = getGuid();
                        }

                        if (x.permits != undefined && x.permits.length > 0) {
                            snowmobile.permits = x.permits.map<IPermit>((p: IApiGetVehiclesAndPermitsForUserPermit) => ({
                                oPermitId: p?.oPermitId,
                                permitType: p?.permitType,
                                ofscNumber: p?.ofscNumber,
                                linkedPermit: p?.linkedPermit,
                                seasonId: p?.seasonId,
                                purchaseDate: parseDate(p?.purchaseDate),
                                club: p?.club,
                                origPermitId: p?.origPermitId,
                                associationId: p?.associationId,
                                trackingNumber: p?.trackingNumber,
                                isReplacement: p?.isReplacement,
                                effectiveDate: parseDate(p?.effectiveDate),
                                tempPermitDownloaded: p?.tempPermitDownloaded,
                                refunded: p?.refunded,
                                cancelled: p?.cancelled,
                                manualReset: p?.manualReset,
                                isaVoucher: p?.isaVoucher,
                                encryptedReference: p?.encryptedReference,
                                isMostRecent: p?.isMostRecent,
                                isExpired: p?.isExpired,
                                permitOptionId: undefined,
                                dateStart: undefined,
                                dateEnd: undefined,
                                clubIdString: undefined
                            }));
                        }

                        if (x.permitOptions != undefined && x.permitOptions.length > 0) {
                            snowmobile.permitOptions = x.permitOptions.map<IPermitOption>((p: IApiGetVehiclesAndPermitsForUserPermitOption) => ({
                                productId: p?.productId,
                                name: p?.name,
                                displayName: p?.displayName,
                                frenchDisplayName: p?.frenchDisplayName,
                                amount: p?.amount,
                                testAmount: p?.testAmount,
                                classic: p?.classic,
                                multiDayUpgrade: p?.multiDayUpgrade,
                                isMultiDay: p?.isMultiDay,
                                isSpecialEvent: p?.isSpecialEvent,
                                eventDate: parseDate(p?.eventDate),
                                eventName: p?.eventName,
                                eventClubId: p?.eventClubId,
                                csrOnly: p?.csrOnly,
                                permitDays: p?.permitDays,
                                canBuyGiftCard: p?.canBuyGiftCard
                            }));
                        }

                        snowmobiles.push(snowmobile);
                    });

                    appContext.updater(draft => { draft.snowmobiles = snowmobiles });
                }

                // apiGetVehicleMakes
                const apiGetVehicleMakesResult: IApiGetVehicleMakesResult[] = results[1] as IApiGetVehicleMakesResult[];

                if (apiGetVehicleMakesResult != undefined && apiGetVehicleMakesResult.length > 0) {
                    setVehicleMakesData(apiGetVehicleMakesResult.map<IKeyValue>(x => ({ key: x?.key ?? "", value: x?.value ?? "" })));
                }

                // apiGetClubs
                const apiGetClubsResult: IApiGetClubsResult[] = results[2] as IApiGetClubsResult[];

                if (apiGetClubsResult != undefined && apiGetClubsResult.length > 0) {
                    setClubsData(apiGetClubsResult.map<IKeyValue>(x => ({ key: x?.key ?? "", value: x?.value ?? "" })));
                }

                // non-api
                let years: number[] = [];

                for (let i: number = endYear; i >= startYear; i--) {
                    years.push(i);
                }

                setYearsData(years);

                setShowAlert(false);
            },
            error: (error: any) => {
                console.log(error);

                setShowAlert(false);
            }
        });
    }, []);

    return (
        <>
            <Head>
                <title>Permits | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>{appContext.translation?.t("SNOWMOBILES_AND_PERMITS.TITLE")}</h4>

            <CartItemsAlert></CartItemsAlert>

            {getSnowmobiles() != undefined && getSnowmobiles().length === 0 && (
                <div className="mb-2">You have not added any snowmobiles.</div>
            )}

            <button className="btn btn-primary mb-3" onClick={() => addEditSnowmobileDialogShow()}>Add Snowmobile</button>

            {getSnowmobiles() != undefined && getSnowmobiles().length > 0 && getSnowmobiles().map(snowmobile => (
                <div className="card w-100 mb-2" key={snowmobile.oVehicleId}>
                    <div className="card-header d-flex justify-content-between align-items-center flex-wrap flex-sm-nowrap">
                        <div className="row row-cols-lg-auto g-3">
                            <div className="d-none d-sm-none d-md-flex">
                                <div className="form-floating" style={{ minWidth: 54 }}>
                                    <div className="form-control-plaintext fw-bold" id="floatingPlaintextInput">{snowmobile?.vehicleYear}</div>
                                    <label htmlFor="floatingPlaintextInput">Year</label>
                                </div>

                                <div className="form-floating" style={{ minWidth: 63 }}>
                                    <div className="form-control-plaintext fw-bold" id="floatingPlaintextInput">{snowmobile?.vehicleMake?.value}</div>
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
                                {`${snowmobile?.vehicleYear} ${snowmobile?.vehicleMake?.value} ${snowmobile?.model} ${snowmobile?.vin} ${snowmobile?.licensePlate}`}
                            </div>
                        </div>
                        <div className="d-flex justify-content-end">
                            {snowmobile.isEditable && (
                                <>
                                    <button className="btn btn-primary btn-sm mt-2 mt-sm-0" onClick={() => addEditSnowmobileDialogShow(snowmobile?.oVehicleId)}>Edit</button>
                                    <button className="btn btn-danger btn-sm mt-2 mt-sm-0 ms-1" onClick={() => deleteSnowmobileDialogShow(snowmobile?.oVehicleId)}>Remove</button>
                                </>
                            )}
                        </div>
                    </div>

                    <ul className="list-group list-group-flush">
                        {snowmobile?.permits != undefined && snowmobile.permits.length > 0 && snowmobile.permits.map(permit => (
                            <li className="list-group-item" key={permit?.oPermitId}>
                                <div>
                                    {appContext?.translation?.i18n?.language === "en" && (
                                        <div><b>Permit:</b> {permit?.permitType?.value} - {permit?.linkedPermit}</div>
                                    )}
                                    {appContext?.translation?.i18n?.language === "fr" && (
                                        <div><b>Permit:</b> {permit?.permitType?.valueFr} - {permit?.linkedPermit}</div>
                                    )}

                                    <div><b>Purchased:</b> {formatShortDate(permit?.purchaseDate)}</div>
                                    <div><b>Tracking #:</b> {permit?.trackingNumber}</div>
                                </div>
                            </li>
                        ))}

                        {snowmobile?.isEditable && snowmobile?.permitOptions != undefined && snowmobile.permitOptions.length > 0 && (
                            <>
                                <li className="list-group-item">
                                    <h6 className="card-title required">Select a permit to purchase</h6>

                                    <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="radio" name={`permits-permit-options-${snowmobile?.oVehicleId}`} id={`permits-permit-options-${snowmobile?.oVehicleId}-none`} checked={isPermitOptionChecked(snowmobile?.oVehicleId, 0)} value={0} onChange={(e: any) => permitOptionChange(e, snowmobile?.oVehicleId, 0)} disabled={isPermitAddedToCart(snowmobile?.oVehicleId)} />
                                        <label className="form-check-label" htmlFor={`permits-permit-options-${snowmobile?.oVehicleId}-none`}>
                                            None Selected
                                        </label>
                                    </div>

                                    {snowmobile.permitOptions.map(permitOption => (
                                        <div className="form-check form-check-inline" key={permitOption.productId}>
                                            <input className="form-check-input" type="radio" name={`permits-permit-options-${snowmobile?.oVehicleId}`} id={`permits-permit-options-${snowmobile?.oVehicleId}-${permitOption?.productId}`} checked={isPermitOptionChecked(snowmobile?.oVehicleId, permitOption?.productId)} value={permitOption.productId} onChange={(e: any) => permitOptionChange(e, snowmobile?.oVehicleId, permitOption?.productId)} disabled={isPermitAddedToCart(snowmobile?.oVehicleId)} />
                                            <label className="form-check-label" htmlFor={`permits-permit-options-${snowmobile?.oVehicleId}-${permitOption?.productId}`}>
                                                {permitOption?.name} - ${permitOption?.amount}
                                            </label>
                                        </div>
                                    ))}
                                </li>

                                {showDateRangeForSelectedPermit(snowmobile?.oVehicleId) && (
                                    <li className="list-group-item">
                                        <h6 className="card-title required">Select a date range</h6>

                                        <div className="row">
                                            <div className="col-12 col-sm-12 col-md-6">
                                                <DatePicker dateFormat="yyyy-MM-dd" selected={getPermitDateRangeFromDate(snowmobile?.oVehicleId)} minDate={getDate()} onChange={(date: Date) => permitDateRangeChange(date, snowmobile?.oVehicleId)} customInput={<DateRangeInput value={undefined} snowmobile={snowmobile} onClick={undefined} />} />
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-6">
                                                <div className="form-floating mb-2">
                                                    <input type="text" className="form-control" id={`permit-to-${snowmobile?.oVehicleId}`} placeholder="To" value={getPermitDateRangeToDate(snowmobile?.oVehicleId)} onChange={() => null} disabled={true} />
                                                    <label className="required" htmlFor={`permit-to-${snowmobile?.oVehicleId}`}>To</label>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                )}

                                <li className="list-group-item">
                                    <h6 className="card-title required">Select a club</h6>

                                    <div className="mb-2">
                                        By choosing a specific club when buying a permit, you&apos;re directly helping that club groom and maintain the trails you enjoy riding most often,
                                        so please buy where you ride and make your selection below.
                                    </div>

                                    <div className="form-floating mb-2">
                                        <select className="form-select" id={`permits-club-${snowmobile?.oVehicleId}`} aria-label="Club" value={getSelectedClub(snowmobile?.oVehicleId)} onChange={(e) => permitClubChange(e, snowmobile?.oVehicleId)} disabled={isPermitAddedToCart(snowmobile?.oVehicleId)}>
                                            <option value="" disabled>Please select a value</option>

                                            {clubsData != undefined && clubsData.length > 0 && getClubsData().map(club => (
                                                <option value={club.key} key={club.key}>{club.value}</option>
                                            ))}
                                        </select>
                                        <label className="required" htmlFor="permits-club">Club</label>
                                    </div>

                                    {!isPermitAddedToCart(snowmobile?.oVehicleId) && (
                                        <span className="btn btn-link text-decoration-none align-baseline text-start border-0 p-0" onClick={() => clubLocatorMapDialogShow()}>
                                            Can&apos;t find your club? Use the Club Locator Map and enter the closest town name to get started.
                                        </span>
                                    )}
                                    {isPermitAddedToCart(snowmobile?.oVehicleId) && (
                                        <span className="">
                                            Can&apos;t find your club? Use the Club Locator Map and enter the closest town name to get started.
                                        </span>
                                    )}
                                </li>
                            </>
                        )}
                    </ul>

                    {snowmobile?.isEditable && !isPermitAddedToCart(snowmobile?.oVehicleId) && (
                        <div className="card-footer">
                            <button className="btn btn-success btn-sm" onClick={() => addPermitToCartClick(snowmobile?.oVehicleId)} disabled={!isAddToCartEnabled(snowmobile?.oVehicleId)}>Add Permit to Cart</button>
                        </div>
                    )}
                    {snowmobile?.isEditable && isPermitAddedToCart(snowmobile?.oVehicleId) && (
                        <div className="card-footer">
                            <button className="btn btn-danger btn-sm" onClick={() => removePermitFromCartClick(snowmobile?.oVehicleId)}>Remove Permit from Cart</button>
                        </div>
                    )}

                    {!snowmobile?.isEditable && (
                        <div className="card-footer">
                            <i className="fa-solid fa-circle-info me-2"></i>This vehicle cannot be modified as a Ministry of Transportation Ontario Snowmobile Trail Permit has been registered to it.
                        </div>
                    )}
                </div>
            ))}

            <ConfirmationDialog showDialog={showDeleteSnowmobileDialog} title="Delete Snowmobile" buttons={2} icon="question" width="50"
                yesClick={() => deleteSnowmobileDialogYesClick()} noClick={() => deleteSnowmobileDialogNoClick()} closeClick={() => deleteSnowmobileDialogNoClick()}>
                <div className="fw-bold mb-2">{snowmobileNameToDelete}</div>
                <div>Are you sure you want to delete this snowmobile?</div>
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

                                        {yearsData != undefined && yearsData.length > 0 && yearsData.map(x => (
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

                                        {vehicleMakesData != undefined && vehicleMakesData.length > 0 && getVehicleMakesData().map(x => (
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
                                    <input type="text" className="form-control" id="add-edit-snowmobile-model" placeholder="Model" value={model} onChange={(e: any) => setModel(e?.target?.value ?? "")} onBlur={(e: any) => setModel(e?.target?.value?.trim() ?? "")} />
                                    <label className="required" htmlFor="add-edit-snowmobile-model">Model</label>
                                </div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="add-edit-snowmobile-vin" placeholder="VIN" value={vin} onChange={(e: any) => setVin(e?.target?.value ?? "")} onBlur={(e: any) => setVin(e?.target?.value?.trim() ?? "")} />
                                    <label className="required" htmlFor="add-edit-snowmobile-vin">VIN</label>
                                </div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className="form-control" id="add-edit-snowmobile-license-plate" placeholder="License Plate" value={licensePlate} onChange={(e: any) => setLicensePlate(e?.target?.value ?? "")} onBlur={(e: any) => setLicensePlate(e?.target?.value?.trim() ?? "")} />
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
                                <Button className="me-2" variant="secondary" onClick={addEditSnowmobileDialogSave} disabled={!isSaveSnowmobileEnabled()}>Save</Button>
                                <Button variant="primary" onClick={addEditSnowmobileDialogHide}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    )

    function getSnowmobiles(): ISnowmobile[] {
        let result: ISnowmobile[] = [];

        if (appContext.data?.snowmobiles != undefined) {
            result = appContext.data.snowmobiles;
        }

        return result;
    }

    function getSnowmobile(snowmobileId?: string): ISnowmobile | undefined {
        let result: ISnowmobile | undefined = undefined;

        if (snowmobileId != undefined) {
            result = getSnowmobiles()?.filter(x => x?.oVehicleId === snowmobileId)[0];
        }

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
            let snowmobile: ISnowmobile = getSnowmobiles()?.filter(x => x?.oVehicleId === snowmobileId)[0];

            setYear(snowmobile?.vehicleYear ?? "");
            setMake(snowmobile?.vehicleMake ?? { key: "", value: "" });
            setModel(snowmobile?.model ?? "");
            setVin(snowmobile?.vin ?? "");
            setLicensePlate(snowmobile?.licensePlate ?? "");
            setPermitForThisSnowmobileOnly(false);
            setRegisteredOwner(false);

            setEditedSnowmobileId(snowmobileId);
        }

        setShowAddEditSnowmobileDialog(true);
    }

    function getVehicleMakesData(): IKeyValue[] {
        let result: IKeyValue[] = [];

        if (vehicleMakesData != undefined && vehicleMakesData.length > 0) {
            result = vehicleMakesData;
        }

        return result;
    }

    function addEditSnowmobileDialogSave(): void {
        if (editedSnowmobileId === "") {
            let snowmobile: ISnowmobile = {
                oVehicleId: getGuid(),
                vehicleMake: make,
                model: model,
                vin: vin,
                licensePlate: licensePlate,
                vehicleYear: year,
                permits: undefined,
                permitSelections: { oPermitId: getGuid() },
                permitOptions: undefined, // TODO: Permit options should reflect selections
                isEditable: true,
            };

            appContext.updater(draft => {
                draft.snowmobiles = draft.snowmobiles == undefined ? [snowmobile] : [...draft.snowmobiles, snowmobile];
            });
        } else {
            appContext.updater(draft => {
                let snowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x?.oVehicleId === editedSnowmobileId)[0];

                if (snowmobile != undefined) {
                    snowmobile.vehicleMake = make;
                    snowmobile.model = model;
                    snowmobile.vin = vin;
                    snowmobile.licensePlate = licensePlate;
                    snowmobile.vehicleYear = year;
                    snowmobile.permits = undefined;
                    snowmobile.permitOptions = undefined; // TODO: Permit options should reflect selections
                    snowmobile.isEditable = true;
                }
            });
        }

        setShowAddEditSnowmobileDialog(false);
    }

    function isSaveSnowmobileEnabled(): boolean {
        return year !== ''
            && make != undefined
            && model.trim() !== ''
            && vin.trim() !== ''
            && licensePlate.trim() !== ''
            && permitForThisSnowmobileOnly
            && registeredOwner;
    }

    function addEditSnowmobileDialogHide(): void {
        setShowAddEditSnowmobileDialog(false);
    }

    function deleteSnowmobileDialogShow(snowmobileId?: string): void {
        if (snowmobileId != undefined) {
            let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                setSnowmobileIdToDelete(snowmobileId);
                setSnowmobileNameToDelete(`${snowmobile.vehicleYear} ${snowmobile?.vehicleMake?.value} ${snowmobile?.model} ${snowmobile?.vin}`);

                setShowDeleteSnowmobileDialog(true);
            }
        }
    }

    function deleteSnowmobileDialogYesClick(): void {
        appContext.updater(draft => {
            draft.snowmobiles = draft?.snowmobiles?.filter(x => x?.oVehicleId !== snowmobileIdToDelete);
            draft.cartItems = draft?.cartItems?.filter(x => x.itemId !== snowmobileIdToDelete);
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

    function isPermitOptionChecked(snowmobileId?: string, permitOptionId?: number): boolean {
        let result: boolean = false;

        if (snowmobileId != undefined && permitOptionId != undefined) {
            let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                result = snowmobile?.permitSelections?.permitOptionId === permitOptionId;
            }
        }

        return result;
    }

    function permitOptionChange(e: any, snowmobileId?: string, permitOptionId?: number): void {
        appContext.updater(draft => {
            let snowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

            if (snowmobile != undefined) {
                if (snowmobile?.permitSelections == undefined) {
                    snowmobile.permitSelections = { oPermitId: getGuid() };
                }

                snowmobile.permitSelections.permitOptionId = permitOptionId;
                snowmobile.permitSelections.dateStart = undefined;
                snowmobile.permitSelections.dateEnd = undefined;
            }
        });
    }

    function getPermitDateRangeFromDate(snowmobileId?: string): Date | undefined {
        let result: Date | undefined = undefined;

        if (snowmobileId != undefined) {
            let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                result = parseDate(snowmobile?.permitSelections?.dateStart);
            }
        }

        return result;
    }

    function getPermitDateRangeToDate(snowmobileId?: string): string {
        let result: string = "";

        if (snowmobileId != undefined) {
            let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined && snowmobile?.permitSelections?.dateEnd != undefined) {
                result = formatShortDate(snowmobile?.permitSelections?.dateEnd);
            }
        }

        return result;
    }

    function permitDateRangeChange(date: Date, snowmobileId?: string): void {
        if (snowmobileId != undefined) {
            appContext.updater(draft => {
                let snowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

                if (snowmobile != undefined) {
                    let permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x?.productId === snowmobile?.permitSelections?.permitOptionId)[0];

                    if (permitOption != undefined) {
                        if (snowmobile?.permitSelections == undefined) {
                            snowmobile.permitSelections = { oPermitId: getGuid() };
                        }

                        snowmobile.permitSelections.dateStart = date;

                        let daysToAdd: number = (permitOption?.permitDays ?? 0) - 1;

                        if (daysToAdd >= 0) {
                            snowmobile.permitSelections.dateEnd = getMoment(date).add(daysToAdd, 'days').toDate();
                        }
                    }
                }
            });
        }
    }

    function getSelectedClub(snowmobileId?: string): string {
        let result: string = "";

        if (snowmobileId != undefined) {
            let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                result = snowmobile?.permitSelections?.clubId ?? "";
            }
        }

        return result;
    }

    function permitClubChange(e: any, snowmobileId?: string): void {
        if (snowmobileId != undefined) {
            appContext.updater(draft => {
                let snowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

                if (snowmobile != undefined) {
                    if (snowmobile?.permitSelections == undefined) {
                        snowmobile.permitSelections = { oPermitId: getGuid() };
                    }

                    snowmobile.permitSelections.clubId = e?.target?.value;
                }
            });
        }
    }

    function showDateRangeForSelectedPermit(snowmobileId?: string): boolean {
        let result = false;

        if (snowmobileId != undefined) {
            let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                let permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x?.productId === snowmobile?.permitSelections?.permitOptionId)[0];

                if (permitOption != undefined) {
                    result = permitOption?.isMultiDay ?? false;
                }
            }
        }

        return result;
    }

    function getClubsData(): IKeyValue[] {
        let result: IKeyValue[] = [];

        if (clubsData != undefined && clubsData.length > 0) {
            result = sortArray(clubsData, ["value"]);
        }

        return result;
    }

    function clubLocatorMapDialogShow(): void {

    }

    function isAddToCartEnabled(snowmobileId?: string): boolean {
        let result: boolean = false;

        if (snowmobileId != undefined) {
            let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                let permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x?.productId === snowmobile?.permitSelections?.permitOptionId)[0];

                if (permitOption != undefined) {
                    result = snowmobile?.permitSelections?.permitOptionId != undefined
                        && (!permitOption?.isMultiDay || (permitOption?.isMultiDay && snowmobile?.permitSelections?.dateStart != undefined && snowmobile?.permitSelections?.dateEnd != undefined))
                        && snowmobile?.permitSelections?.clubId != undefined;
                }
            }
        }

        return result;
    }

    function addPermitToCartClick(snowmobileId?: string): void {
        if (snowmobileId != undefined) {
            appContext.updater(draft => {
                let snowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

                if (snowmobile != undefined) {
                    let permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x?.productId === snowmobile?.permitSelections?.permitOptionId)[0];
                    let club: IKeyValue | undefined = clubsData?.filter(x => x.key === snowmobile?.permitSelections?.clubId)[0];

                    if (permitOption != undefined && club != undefined) {
                        let description: string = `${snowmobile?.vehicleYear} ${snowmobile?.vehicleMake?.value} ${snowmobile?.model} ${snowmobile?.vin} `;

                        if (permitOption.isMultiDay) {
                            description += `${permitOption?.name} (${formatShortDate(snowmobile?.permitSelections?.dateStart)} - ${formatShortDate(snowmobile?.permitSelections?.dateEnd)}) `;
                        } else {
                            description += `${permitOption?.name} `;
                        }

                        description += `(${club.value})`;

                        let cartItem: ICartItem = {
                            id: getGuid(),
                            description: description,
                            price: permitOption?.amount ?? 0,
                            isPermit: true,
                            isGiftCard: false,
                            itemId: snowmobile.oVehicleId
                        };

                        draft.cartItems = draft.cartItems == undefined ? [cartItem] : [...draft.cartItems, cartItem];
                    }
                }
            });
        }
    }

    function removePermitFromCartClick(snowmobileId?: string): void {
        if (snowmobileId != undefined) {
            appContext.updater(draft => {
                draft.cartItems = draft?.cartItems?.filter(x => x.itemId !== snowmobileId);
            });
        }
    }

    function isPermitAddedToCart(snowmobileId?: string): boolean {
        let result: boolean = false;

        if (snowmobileId != undefined) {
            result = appContext.data?.cartItems?.some(x => x.isPermit && x.itemId === snowmobileId) ?? false;
        }

        return result;
    }
}
