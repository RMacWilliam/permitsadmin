import { forwardRef, useContext, useEffect, useState } from 'react'
import { AppContext, IAppContextValues, ICartItem, IKeyValue, IPermit, IPermitOption, IPermitSelections, ISnowmobile } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import { formatShortDate, getApiErrorMessage, getDate, getGuid, getKeyValueFromSelect, getMoment, parseDate, sortArray } from '@/custom/utilities';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { NextRouter, useRouter } from 'next/router';
import DatePicker from 'react-datepicker';
import CartItemsAlert from '@/components/cart-items-alert';
import { IApiAddVehicleForUserRequest, IApiAddVehicleForUserResult, IApiGetVehicleMakesResult, IApiGetVehiclesAndPermitsForUserResult, IApiSavePermitSelectionForVehicleRequest, IApiSavePermitSelectionForVehicleResult, IApiUpdateVehicleRequest, IApiUpdateVehicleResult, apiAddVehicleForUser, apiGetVehicleMakes, apiGetVehiclesAndPermitsForUser, apiSavePermitSelectionForVehicle, apiUpdateVehicle, IApiDeleteVehicleRequest, IApiDeleteVehicleResult, apiDeleteVehicle, IApiVehiclePermit, IApiVehiclePermitOption } from '@/custom/api';
import { Observable, forkJoin } from 'rxjs';
import { isRoutePermitted, isUserAuthenticated, logout } from '@/custom/authentication';
import { Constants } from '../../../constants';

export default function PermitsPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        setIsAuthenticated(false);

        let authenticated: boolean = isUserAuthenticated(router, appContext);

        if (authenticated) {
            let permitted: boolean = isRoutePermitted(router, appContext, "permits");

            if (permitted) {
                appContext.updater(draft => { draft.navbarPage = "permits" });

                setIsAuthenticated(true);
                setShowAlert(true);
            }
        }
    }, [appContext.data.isAuthenticated]);

    return (
        <AuthenticatedPageLayout showAlert={showAlert}>
            {isAuthenticated && (
                <Permits appContext={appContext} router={router} setShowAlert={setShowAlert}></Permits>
            )}
        </AuthenticatedPageLayout>
    )
}

enum DialogMode {
    Add = 0,
    Edit = 1
}

function Permits({ appContext, router, setShowAlert }: { appContext: IAppContextValues, router: NextRouter, setShowAlert: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [showAddEditSnowmobileDialog, setShowAddEditSnowmobileDialog] = useState(false);
    const [addEditSnowmobileDialogMode, setAddEditSnowmobileDialogMode] = useState(DialogMode.Add);
    const [addEditSnowmobileDialogErrorMessage, setAddEditSnowmobileDialogErrorMessage] = useState("");
    const [editedSnowmobileId, setEditedSnowmobileId] = useState("");

    const [vehicleYear, setVehicleYear] = useState("");
    const [isVehicleYearValid, setIsVehicleYearValid] = useState(true);

    const [make, setMake] = useState({ key: "", value: "" });
    const [isMakeValid, setIsMakeValid] = useState(true);

    const [model, setModel] = useState("");
    const [isModelValid, setIsModelValid] = useState(true);

    const [vin, setVin] = useState("");
    const [isVinValid, setIsVinValid] = useState(true);

    const [licensePlate, setLicensePlate] = useState("");
    const [isLicensePlateValid, setIsLicensePlateValid] = useState(true);

    const [permitForThisSnowmobileOnly, setPermitForThisSnowmobileOnly] = useState(false);
    const [isPermitForThisSnowmobileOnlyValid, setIsPermitForThisSnowmobileOnlyValid] = useState(true);

    const [registeredOwner, setRegisteredOwner] = useState(false);
    const [isRegisteredOwnerValid, setIsRegisteredOwnerValid] = useState(true);

    const [showDeleteSnowmobileDialog, setShowDeleteSnowmobileDialog] = useState(false);
    const [deleteSnowmobileDialogErrorMessage, setDeleteSnowmobileDialogErrorMessage] = useState("");
    const [snowmobileIdToDelete, setSnowmobileIdToDelete] = useState("");
    const [snowmobileNameToDelete, setSnowmobileNameToDelete] = useState("");

    const [showSnowmobileInfoDialog, setShowSnowmobileInfoDialog] = useState(false);

    const startYear: number = 1960; // TODO: Is this the minimum year?
    const endYear: number = getDate().getFullYear(); // TODO: Is the current year the maximum year?
    const [yearsData, setYearsData] = useState([] as number[]);
    const [vehicleMakesData, setVehicleMakesData] = useState([] as IKeyValue[]);

    const DateRangeInput = forwardRef(({ value, snowmobile, onClick }: { value?: Date, snowmobile: ISnowmobile, onClick?: (e: any) => void }, ref: any) => (
        <div className="form-floating mb-2">
            <input type="text" className="form-control" id={`permit-from-${snowmobile.oVehicleId}`} placeholder="From" value={formatShortDate(value)} onClick={onClick} onChange={() => null} disabled={isPermitAddedToCart(snowmobile.oVehicleId)} readOnly={true} ref={ref} />
            <label className="required" htmlFor={`permit-from-${snowmobile.oVehicleId}`}>Select start date for permit</label>
        </div>
    ));
    DateRangeInput.displayName = "DateRangeInput";

    useEffect(() => {
        // Get data from api.
        let batchApi: Observable<any>[] = [
            apiGetVehiclesAndPermitsForUser(),
            apiGetVehicleMakes()
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
                            isEditable: x?.isEditable,
                            permits: undefined,
                            permitSelections: {
                                oPermitId: x?.permitSelections?.oPermitId,
                                permitOptionId: x?.permitSelections?.permitOptionId,
                                dateStart: x?.permitSelections?.dateStart,
                                dateEnd: x?.permitSelections?.dateEnd,
                                clubId: x?.permitSelections?.clubId
                            },
                            permitOptions: undefined
                        };

                        if (x.permits != undefined && x.permits.length > 0) {
                            snowmobile.permits = x.permits.map<IPermit>((p: IApiVehiclePermit) => ({
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
                                dateEnd: undefined
                            }));
                        }

                        if (x.permitOptions != undefined && x.permitOptions.length > 0) {
                            snowmobile.permitOptions = x.permitOptions.map<IPermitOption>((p: IApiVehiclePermitOption) => ({
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

                if (error instanceof Response) {
                    const resp: Response = error;

                    if (resp?.status === 401) {
                        logout(router, appContext);
                    }
                }

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

            {getSnowmobiles() != undefined && getSnowmobiles().length > 0 && getSnowmobiles().map(snowmobile => (
                <div className="card w-100 mb-3" key={snowmobile.oVehicleId}>
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
                            {snowmobile?.isEditable && (
                                <>
                                    <button className="btn btn-primary btn-sm mt-2 mt-sm-0" onClick={() => addEditSnowmobileDialogShow(snowmobile?.oVehicleId)} disabled={isPermitAddedToCart(snowmobile?.oVehicleId)}>Edit</button>
                                    <button className="btn btn-danger btn-sm mt-2 mt-sm-0 ms-1" onClick={() => deleteSnowmobileDialogShow(snowmobile?.oVehicleId)} disabled={isPermitAddedToCart(snowmobile?.oVehicleId)}>Remove</button>
                                </>
                            )}

                            {!snowmobile?.isEditable && (
                                <button type="button" className="btn btn-link" onClick={() => setShowSnowmobileInfoDialog(true)}><i className="fa-solid fa-circle-info fa-lg"></i></button>
                            )}
                        </div>
                    </div>

                    <ul className="list-group list-group-flush">
                        {snowmobile?.permits != undefined && snowmobile.permits.length > 0 && snowmobile.permits.map(permit => (
                            <li className="list-group-item" key={permit?.oPermitId}>
                                <div>
                                    <span className="me-1"><b>Permit:</b></span>

                                    {appContext?.translation?.i18n?.language === "en" && (
                                        <span className="me-1">{permit?.permitType?.value}</span>
                                    )}
                                    {appContext?.translation?.i18n?.language === "fr" && (
                                        <span className="me-1">{permit?.permitType?.valueFr}</span>
                                    )}

                                    <span>- {permit?.linkedPermit}</span>
                                </div>

                                <div><b>Purchased:</b> {formatShortDate(permit?.purchaseDate)}</div>
                                <div><b>Tracking #:</b> {permit?.trackingNumber}</div>
                            </li>
                        ))}

                        {snowmobile?.isEditable && (snowmobile?.permitOptions == undefined || snowmobile.permitOptions.length === 0) && (
                            <li className="list-group-item">
                                <div>There are no permits that you can purchase for this snowmobile at this time.</div>
                            </li>
                        )}

                        {snowmobile?.isEditable && snowmobile?.permitOptions != undefined && snowmobile.permitOptions.length > 0 && (
                            <>
                                <li className="list-group-item">
                                    <div className="form-floating">
                                        <select className="form-select" id={`permits-permit-options-${snowmobile?.oVehicleId}`} aria-label="Select permit to purchase" value={getSelectedPermitOption(snowmobile?.oVehicleId)} onChange={(e: any) => permitOptionChange(e, snowmobile?.oVehicleId)} disabled={isPermitAddedToCart(snowmobile?.oVehicleId)}>
                                            <option value="" disabled>{Constants.PleaseSelect}</option>

                                            {snowmobile.permitOptions.map(permitOption => {
                                                if (appContext.translation?.i18n?.language === "fr") {
                                                    return (
                                                        <option value={permitOption?.productId} key={permitOption?.productId}>{permitOption?.frenchDisplayName} - ${permitOption?.amount}</option>
                                                    );
                                                } else {
                                                    return (
                                                        <option value={permitOption?.productId} key={permitOption?.productId}>{permitOption?.displayName} - ${permitOption?.amount}</option>
                                                    );
                                                }
                                            })}
                                        </select>
                                        <label className="required" htmlFor={`permits-permit-options-${snowmobile?.oVehicleId}`}>Select permit to purchase</label>
                                    </div>
                                </li>

                                {showDateRangeForSelectedPermit(snowmobile?.oVehicleId) && (
                                    <li className="list-group-item">
                                        <div className="row">
                                            <div className="col-12 col-sm-12 col-md-6">
                                                <DatePicker dateFormat="yyyy-MM-dd" selected={getPermitDateRangeFromDate(snowmobile?.oVehicleId)} minDate={getDate()} onChange={(date: Date) => permitDateRangeChange(date, snowmobile?.oVehicleId)} customInput={<DateRangeInput value={undefined} snowmobile={snowmobile} onClick={undefined} />} />
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-6">
                                                <div className="form-floating mb-2">
                                                    <input type="text" className="form-control" id={`permit-to-${snowmobile?.oVehicleId}`} placeholder="To" value={getPermitDateRangeToDate(snowmobile?.oVehicleId)} onChange={() => null} disabled={true} />
                                                    <label className="" htmlFor={`permit-to-${snowmobile?.oVehicleId}`}>Permit will be valid until</label>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>

                    {snowmobile?.isEditable && snowmobile?.permitOptions != undefined && snowmobile.permitOptions.length > 0 && (
                        <div className="card-footer">
                            {snowmobile?.isEditable && !isPermitAddedToCart(snowmobile?.oVehicleId) && (
                                <button className="btn btn-success btn-sm" onClick={() => addPermitToCartClick(snowmobile?.oVehicleId)} disabled={!isAddToCartEnabled(snowmobile?.oVehicleId)}>Add Permit to Cart</button>
                            )}

                            {snowmobile?.isEditable && isPermitAddedToCart(snowmobile?.oVehicleId) && (
                                <button className="btn btn-danger btn-sm" onClick={() => removePermitFromCartClick(snowmobile?.oVehicleId)}>Remove Permit from Cart</button>
                            )}
                        </div>
                    )}
                </div>
            ))}

            <div className="card">
                <div className="card-body text-center">
                    <button className="btn btn-primary" onClick={() => addEditSnowmobileDialogShow()}>Add Snowmobile</button>
                </div>
            </div>

            <ConfirmationDialog showDialog={showSnowmobileInfoDialog} title="Information" buttons={0} icon="information" width="50"
                okClick={() => setShowSnowmobileInfoDialog(false)} closeClick={() => setShowSnowmobileInfoDialog(false)}>
                <div>This vehicle cannot be modified as a Ministry of Transportation Ontario Snowmobile Trail Permit has been registered to it.</div>
            </ConfirmationDialog>

            <ConfirmationDialog showDialog={showDeleteSnowmobileDialog} title="Delete Snowmobile" errorMessage={deleteSnowmobileDialogErrorMessage} buttons={2}
                icon="question" width="50" yesClick={() => deleteSnowmobileDialogYesClick()} noClick={() => deleteSnowmobileDialogNoClick()}
                closeClick={() => deleteSnowmobileDialogNoClick()}>
                <div className="fw-bold mb-2">{snowmobileNameToDelete}</div>
                <div>Are you sure you want to delete this snowmobile?</div>
            </ConfirmationDialog>

            <Modal show={showAddEditSnowmobileDialog} onHide={addEditSnowmobileDialogHide} backdrop="static" keyboard={false} dialogClassName="modal-width-90-percent">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {addEditSnowmobileDialogMode === DialogMode.Add && (<div>Add Snowmobile</div>)}
                        {addEditSnowmobileDialogMode === DialogMode.Edit && (<div>Edit Snowmobile</div>)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="container-fluid">
                        {addEditSnowmobileDialogErrorMessage !== "" && (
                            <div className="row">
                                <div className="col-12">
                                    <div className="alert alert-danger" role="alert">
                                        {addEditSnowmobileDialogErrorMessage}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <select className={`form-select ${isVehicleYearValid ? "" : "is-invalid"}`} id="add-edit-snowmobile-year" aria-label="Year" value={vehicleYear} onChange={(e: any) => setVehicleYear(e?.target?.value)}>
                                        <option value="" disabled>{Constants.PleaseSelect}</option>

                                        {yearsData != undefined && yearsData.length > 0 && yearsData.map(x => (
                                            <option value={x} key={x}>{x}</option>
                                        ))}
                                    </select>
                                    <label className="required" htmlFor="add-edit-snowmobile-year">Year</label>
                                </div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-6">
                                <div className="form-floating mb-2">
                                    <select className={`form-select ${isMakeValid ? "" : "is-invalid"}`} id="add-edit-snowmobile-make" aria-label="Make" value={make?.key} onChange={(e: any) => setMake(getKeyValueFromSelect(e) ?? { key: "", value: "" })}>
                                        <option value="" disabled>{Constants.PleaseSelect}</option>

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
                                    <input type="text" className={`form-control ${isModelValid ? "" : "is-invalid"}`} id="add-edit-snowmobile-model" placeholder="Model" value={model} onChange={(e: any) => setModel(e?.target?.value ?? "")} onBlur={(e: any) => setModel(e?.target?.value?.trim() ?? "")} />
                                    <label className="required" htmlFor="add-edit-snowmobile-model">Model</label>
                                </div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isVinValid ? "" : "is-invalid"}`} id="add-edit-snowmobile-vin" placeholder="VIN" value={vin} onChange={(e: any) => setVin(e?.target?.value ?? "")} onBlur={(e: any) => setVin(e?.target?.value?.trim() ?? "")} />
                                    <label className="required" htmlFor="add-edit-snowmobile-vin">VIN</label>
                                </div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-4">
                                <div className="form-floating mb-2">
                                    <input type="text" className={`form-control ${isLicensePlateValid ? "" : "is-invalid"}`} id="add-edit-snowmobile-license-plate" placeholder="License Plate" value={licensePlate} onChange={(e: any) => setLicensePlate(e?.target?.value ?? "")} onBlur={(e: any) => setLicensePlate(e?.target?.value?.trim() ?? "")} />
                                    <label className="required" htmlFor="add-edit-snowmobile-license-plate">License Plate</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div className="form-check mb-2">
                                    <input className={`form-check-input ${isPermitForThisSnowmobileOnlyValid ? "" : "is-invalid"}`} type="checkbox" value="" id="add-edit-snowmobile-permit-for-this-snowmobile-only" defaultChecked={permitForThisSnowmobileOnly} onChange={(e: any) => { setPermitForThisSnowmobileOnly(e.target.checked) }} />
                                    <label className="form-check-label required" htmlFor="add-edit-snowmobile-permit-for-this-snowmobile-only">
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
                                    <input className={`form-check-input ${isRegisteredOwnerValid ? "" : "is-invalid"}`} type="checkbox" value="" id="add-edit-snowmobile-registered-owner" defaultChecked={registeredOwner} onChange={(e: any) => setRegisteredOwner(e.target.checked)} />
                                    <label className="form-check-label required" htmlFor="add-edit-snowmobile-registered-owner">
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
                                <Button className="me-2" variant="primary" onClick={() => addEditSnowmobileDialogSave()}>Save</Button>
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
            setAddEditSnowmobileDialogMode(DialogMode.Add);
            setEditedSnowmobileId("");

            setVehicleYear("");
            setMake({ key: "", value: "" });
            setModel("");
            setVin("");
            setLicensePlate("");
            setPermitForThisSnowmobileOnly(false);
            setRegisteredOwner(false);
        } else {
            setAddEditSnowmobileDialogMode(DialogMode.Edit);
            setEditedSnowmobileId(snowmobileId);

            let snowmobile: ISnowmobile = getSnowmobiles()?.filter(x => x?.oVehicleId === snowmobileId)[0];

            setVehicleYear(snowmobile?.vehicleYear ?? "");
            setMake(snowmobile?.vehicleMake ?? { key: "", value: "" });
            setModel(snowmobile?.model ?? "");
            setVin(snowmobile?.vin ?? "");
            setLicensePlate(snowmobile?.licensePlate ?? "");
            setPermitForThisSnowmobileOnly(false);
            setRegisteredOwner(false);
        }

        setIsVehicleYearValid(true);
        setIsMakeValid(true);
        setIsModelValid(true);
        setIsVinValid(true);
        setIsLicensePlateValid(true);
        setIsPermitForThisSnowmobileOnlyValid(true);
        setIsRegisteredOwnerValid(true);

        setAddEditSnowmobileDialogErrorMessage("");
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
        if (validateAddEditSnowmobileDialog()) {
            if (addEditSnowmobileDialogMode === DialogMode.Add) {
                let apiAddVehicleForUserRequest: IApiAddVehicleForUserRequest = {
                    oVehicleId: editedSnowmobileId,
                    makeId: Number(make?.key),
                    model: model,
                    vin: vin,
                    licensePlate: licensePlate,
                    vehicleYear: vehicleYear
                };

                setShowAlert(true);

                apiAddVehicleForUser(apiAddVehicleForUserRequest).subscribe({
                    next: (result: IApiAddVehicleForUserResult) => {
                        if (result?.isSuccessful && result?.data != undefined) {
                            let newSnowmobile: ISnowmobile = {
                                oVehicleId: result?.data?.oVehicleId,
                                vehicleMake: result?.data?.vehicleMake,
                                model: result?.data?.model,
                                vin: result?.data?.vin,
                                licensePlate: result?.data?.licensePlate,
                                vehicleYear: result?.data?.vehicleYear,
                                origVehicleId: result?.data?.origVehicleId,
                                isClassic: result?.data?.isClassic,
                                isEditable: result?.data?.isEditable,
                                permits: undefined,
                                permitSelections: {
                                    oPermitId: result?.data?.permitSelections?.oPermitId,
                                    permitOptionId: result?.data?.permitSelections?.permitOptionId,
                                    dateStart: result?.data?.permitSelections?.dateStart,
                                    dateEnd: result?.data?.permitSelections?.dateEnd,
                                    clubId: result?.data?.permitSelections?.clubId
                                },
                                permitOptions: undefined
                            };

                            if (result?.data?.permits != undefined && result?.data?.permits.length > 0) {
                                newSnowmobile.permits = result?.data?.permits.map<IPermit>((p: IApiVehiclePermit) => ({
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
                                    dateEnd: undefined
                                }));
                            }

                            if (result?.data?.permitOptions != undefined && result?.data?.permitOptions.length > 0) {
                                newSnowmobile.permitOptions = result?.data?.permitOptions.map<IPermitOption>((p: IApiVehiclePermitOption) => ({
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

                            appContext.updater(draft => {
                                draft.snowmobiles = draft.snowmobiles == undefined ? [newSnowmobile] : [...draft.snowmobiles, newSnowmobile];
                            });

                            setShowAddEditSnowmobileDialog(false);
                        } else {
                            setAddEditSnowmobileDialogErrorMessage(getApiErrorMessage(result?.errorMessage) ?? result?.errorMessage ?? "");
                        }

                        setShowAlert(false);
                    },
                    error: (error: any) => {
                        console.log(error);

                        setShowAlert(false);
                    }
                });
            } else if (addEditSnowmobileDialogMode === DialogMode.Edit) {
                let apiUpdateVehicleRequest: IApiUpdateVehicleRequest = {
                    oVehicleId: editedSnowmobileId,
                    makeId: Number(make?.key),
                    model: model,
                    vin: vin,
                    licensePlate: licensePlate,
                    vehicleYear: vehicleYear
                };

                setShowAlert(true);

                apiUpdateVehicle(apiUpdateVehicleRequest).subscribe({
                    next: (result: IApiUpdateVehicleResult) => {
                        if (result?.isSuccessful && result?.data != undefined) {
                            let updatedSnowmobile: ISnowmobile = result.data as ISnowmobile;

                            appContext.updater(draft => {
                                if (draft?.snowmobiles != undefined) {
                                    let index: number = draft.snowmobiles.findIndex(x => x?.oVehicleId === editedSnowmobileId) ?? -1;

                                    if (index != -1) {
                                        draft.snowmobiles[index] = updatedSnowmobile;
                                    }
                                }
                            });

                            setShowAddEditSnowmobileDialog(false);
                        } else {
                            setAddEditSnowmobileDialogErrorMessage(getApiErrorMessage(result?.errorMessage) ?? result?.errorMessage ?? "");
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
    }

    function isVinNumberValid(vinNumber?: string): boolean {
        let result: boolean = false;

        if (vinNumber != undefined) {
            result = /^([a-z,A-Z,0-9])([a-z,A-Z])([a-z,A-Z,0-9]{10})((\d{5}))$/.test(vinNumber);
        }

        return result;
    }

    function validateAddEditSnowmobileDialog(): boolean {
        let isValid: boolean = true;

        if (vehicleYear === "") {
            setIsVehicleYearValid(false);
            isValid = false;
        } else {
            setIsVehicleYearValid(true);
        }

        if (make?.key == undefined || make.key === "") {
            setIsMakeValid(false);
            isValid = false;
        } else {
            setIsMakeValid(true);
        }

        if (model === "") {
            setIsModelValid(false);
            isValid = false;
        } else {
            setIsModelValid(true);
        }

        if (vin === "" || !isVinNumberValid(vin)) {
            setIsVinValid(false);
            isValid = false;
        } else {
            setIsVinValid(true);
        }

        if (licensePlate === "") {
            setIsLicensePlateValid(false);
            isValid = false;
        } else {
            setIsLicensePlateValid(true);
        }

        if (permitForThisSnowmobileOnly === false) {
            setIsPermitForThisSnowmobileOnlyValid(false);
            isValid = false;
        } else {
            setIsPermitForThisSnowmobileOnlyValid(true);
        }

        if (registeredOwner === false) {
            setIsRegisteredOwnerValid(false);
            isValid = false;
        } else {
            setIsRegisteredOwnerValid(true);
        }

        return isValid;
    }

    function addEditSnowmobileDialogHide(): void {
        setShowAddEditSnowmobileDialog(false);
    }

    function deleteSnowmobileDialogShow(snowmobileId?: string): void {
        if (snowmobileId != undefined) {
            let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                setDeleteSnowmobileDialogErrorMessage("");
                setSnowmobileIdToDelete(snowmobileId);
                setSnowmobileNameToDelete(`${snowmobile.vehicleYear} ${snowmobile?.vehicleMake?.value} ${snowmobile?.model} ${snowmobile?.vin}`);
                setShowDeleteSnowmobileDialog(true);
            }
        }
    }

    function deleteSnowmobileDialogYesClick(): void {
        let apiDeleteVehicleRequest: IApiDeleteVehicleRequest = {
            oVehicleId: snowmobileIdToDelete,
        };

        setShowAlert(true);

        apiDeleteVehicle(apiDeleteVehicleRequest).subscribe({
            next: (result: IApiDeleteVehicleResult) => {
                if (result?.isSuccessful) {
                    appContext.updater(draft => {
                        draft.snowmobiles = draft?.snowmobiles?.filter(x => x?.oVehicleId !== snowmobileIdToDelete);
                        draft.cartItems = draft?.cartItems?.filter(x => x.itemId !== snowmobileIdToDelete);
                    });

                    setDeleteSnowmobileDialogErrorMessage("");
                    setSnowmobileIdToDelete("");
                    setSnowmobileNameToDelete("");
                    setShowDeleteSnowmobileDialog(false);
                } else {
                    setDeleteSnowmobileDialogErrorMessage(getApiErrorMessage(result?.errorMessage) ?? result?.errorMessage ?? "");
                }

                setShowAlert(false);
            },
            error: (error: any) => {
                console.log(error);

                setShowAlert(false);
            }
        });
    }

    function deleteSnowmobileDialogNoClick(): void {
        setDeleteSnowmobileDialogErrorMessage("");
        setSnowmobileIdToDelete("");
        setSnowmobileNameToDelete("");

        setShowDeleteSnowmobileDialog(false);
    }

    function getSelectedPermitOption(snowmobileId?: string): string {
        let result: string = "";

        if (snowmobileId != undefined) {
            let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                result = snowmobile?.permitSelections?.permitOptionId?.toString() ?? "";
            }
        }

        return result;
    }

    function permitOptionChange(e: any, snowmobileId?: string): void {
        if (e != undefined && snowmobileId != undefined) {
            let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                let permitSelections: IPermitSelections | undefined = snowmobile?.permitSelections;

                if (permitSelections != undefined) {
                    let apiSavePermitSelectionForVehicleRequest: IApiSavePermitSelectionForVehicleRequest | undefined = {
                        oVehicleId: snowmobileId,
                        oPermitId: permitSelections?.oPermitId ?? getGuid(),
                        permitOptionId: Number(e?.target?.value), // New value
                        dateStart: undefined,
                        dateEnd: undefined,
                        clubId: permitSelections?.clubId
                    };

                    apiSavePermitSelectionForVehicle(apiSavePermitSelectionForVehicleRequest).subscribe({
                        next: (result: IApiSavePermitSelectionForVehicleResult) => {
                            if (result?.isSuccessful && result?.data != undefined) {
                                appContext.updater(draft => {
                                    let snowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

                                    if (snowmobile != undefined) {
                                        snowmobile.permitSelections = {
                                            oPermitId: result?.data?.oPermitId ?? getGuid(),
                                            permitOptionId: result?.data?.permitOptionId,
                                            dateStart: result?.data?.dateStart,
                                            dateEnd: result?.data?.dateEnd,
                                            clubId: result?.data?.clubId
                                        };
                                    }
                                });
                            } else {

                            }

                            //setShowAlert(false);
                        },
                        error: (error: any) => {
                            console.log(error);

                            //setShowAlert(false);
                        }
                    });
                }
            }
        }
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

    function permitDateRangeChange(date?: Date, snowmobileId?: string): void {
        if (date != undefined && snowmobileId != undefined) {
            let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                let permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x?.productId === snowmobile?.permitSelections?.permitOptionId)[0];

                if (permitOption != undefined) {
                    let permitSelections: IPermitSelections | undefined = snowmobile?.permitSelections;

                    if (permitSelections != undefined) {
                        let daysToAdd: number = (permitOption?.permitDays ?? 0) - 1;

                        let apiSavePermitSelectionForVehicleRequest: IApiSavePermitSelectionForVehicleRequest | undefined = {
                            oVehicleId: snowmobileId,
                            oPermitId: permitSelections?.oPermitId ?? getGuid(),
                            permitOptionId: permitSelections?.permitOptionId,
                            dateStart: date, // New value
                            dateEnd: daysToAdd >= 0 ? getMoment(date).add(daysToAdd, 'days').toDate() : date, // New value
                            clubId: permitSelections?.clubId
                        };

                        //setShowAlert(true);

                        apiSavePermitSelectionForVehicle(apiSavePermitSelectionForVehicleRequest).subscribe({
                            next: (result: IApiSavePermitSelectionForVehicleResult) => {
                                if (result?.isSuccessful && result?.data != undefined) {
                                    appContext.updater(draft => {
                                        let snowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

                                        if (snowmobile != undefined) {
                                            snowmobile.permitSelections = {
                                                oPermitId: result?.data?.oPermitId ?? getGuid(),
                                                permitOptionId: result?.data?.permitOptionId,
                                                dateStart: result?.data?.dateStart,
                                                dateEnd: result?.data?.dateEnd,
                                                clubId: result?.data?.clubId
                                            };
                                        }
                                    });
                                } else {
                                    
                                }

                                //setShowAlert(false);
                            },
                            error: (error: any) => {
                                console.log(error);

                                //setShowAlert(false);
                            }
                        });
                    }
                }
            }
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

    function isAddToCartEnabled(snowmobileId?: string): boolean {
        let result: boolean = false;

        if (snowmobileId != undefined) {
            let snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                let permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x?.productId === snowmobile?.permitSelections?.permitOptionId)[0];

                if (permitOption != undefined) {
                    result = snowmobile?.permitSelections?.permitOptionId != undefined
                        && (!permitOption?.isMultiDay || (permitOption?.isMultiDay && snowmobile?.permitSelections?.dateStart != undefined && snowmobile?.permitSelections?.dateEnd != undefined));
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

                    if (permitOption != undefined) {
                        let description: string = `${snowmobile?.vehicleYear} ${snowmobile?.vehicleMake?.value} ${snowmobile?.model} ${snowmobile?.vin} ${permitOption?.displayName}`;
                        let descriptionFr: string = `${snowmobile?.vehicleYear} ${snowmobile?.vehicleMake?.value} ${snowmobile?.model} ${snowmobile?.vin} ${permitOption?.frenchDisplayName}`;

                        if (permitOption.isMultiDay) {
                            description += ` (${formatShortDate(snowmobile?.permitSelections?.dateStart)} - ${formatShortDate(snowmobile?.permitSelections?.dateEnd)}) `;
                        }

                        let cartItem: ICartItem = {
                            id: getGuid(),
                            description: description,
                            descriptionFr: descriptionFr,
                            price: permitOption?.amount ?? 0,
                            isPermit: true,
                            isGiftCard: false,
                            itemId: snowmobile.oVehicleId,

                            uiRedemptionCode: ""
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
