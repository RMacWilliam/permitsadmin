import { Dispatch, SetStateAction, forwardRef, useContext, useEffect, useState } from 'react'
import { AppContext, IAppContextValues, ICartItem, IKeyValue, IPermit, IPermitOption, IPermitSelections, ISnowmobile } from '@/custom/app-context';
import AuthenticatedPageLayout, { IShowHoverButton } from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import { checkResponseStatus, formatCurrency, formatShortDate, getApiErrorMessage, getDate, getGuid, getKeyValueFromSelect, getMoment, iv, parseDate, sortArray } from '@/custom/utilities';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ConfirmationDialog, { ConfirmationDialogButtons, ConfirmationDialogIcons } from '@/components/confirmation-dialog';
import { NextRouter, useRouter } from 'next/router';
import DatePicker, { registerLocale } from 'react-datepicker';
import en from "date-fns/locale/en-CA";
import fr from "date-fns/locale/fr-CA";
import CartItemsAlert from '@/components/cart-items-alert';
import { IApiAddVehicleForUserRequest, IApiAddVehicleForUserResult, IApiGetVehicleMakesResult, IApiGetVehiclesAndPermitsForUserResult, IApiSavePermitSelectionForVehicleRequest, IApiSavePermitSelectionForVehicleResult, IApiUpdateVehicleRequest, IApiUpdateVehicleResult, apiAddVehicleForUser, apiGetVehicleMakes, apiGetVehiclesAndPermitsForUser, apiSavePermitSelectionForVehicle, apiUpdateVehicle, IApiDeleteVehicleRequest, IApiDeleteVehicleResult, apiDeleteVehicle, IApiVehiclePermit, IApiVehiclePermitOption } from '@/custom/api';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { getLocalizedValue } from '@/localization/i18n';

export default function PermitsPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(true);

    // Display hover button.
    const [showHoverButton, setShowHoverButton] = useState({} as IShowHoverButton);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "permits" });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthenticatedPageLayout showAlert={showAlert} showHoverButton={showHoverButton}>
            <Permits appContext={appContext} router={router} setShowAlert={setShowAlert} setShowHoverButton={setShowHoverButton}></Permits>
        </AuthenticatedPageLayout>
    )
}

enum DialogMode {
    Add = 0,
    Edit = 1
}

function Permits({ appContext, router, setShowAlert, setShowHoverButton }
    : {
        appContext: IAppContextValues,
        router: NextRouter,
        setShowAlert: Dispatch<SetStateAction<boolean>>,
        setShowHoverButton: Dispatch<SetStateAction<IShowHoverButton>>
    }) {

    const [pageLoaded, setPageLoaded] = useState(false);

    const [showAddEditSnowmobileDialog, setShowAddEditSnowmobileDialog] = useState(false);
    const [addEditSnowmobileDialogMode, setAddEditSnowmobileDialogMode] = useState(DialogMode.Add);
    const [addEditSnowmobileDialogErrorMessage, setAddEditSnowmobileDialogErrorMessage] = useState("");
    const [editedSnowmobileId, setEditedSnowmobileId] = useState("");

    const [vehicleYear, setVehicleYear] = useState("");
    const [isVehicleYearValid, setIsVehicleYearValid] = useState(undefined as boolean | undefined);

    const [make, setMake] = useState({ key: "", value: "" });
    const [isMakeValid, setIsMakeValid] = useState(undefined as boolean | undefined);

    const [model, setModel] = useState("");
    const [isModelValid, setIsModelValid] = useState(undefined as boolean | undefined);

    const [vin, setVin] = useState("");
    const [isVinValid, setIsVinValid] = useState(undefined as boolean | undefined);
    const [isVinFormatValid, setIsVinFormatValid] = useState(undefined as boolean | undefined);

    const [licensePlate, setLicensePlate] = useState("");
    const [isLicensePlateValid, setIsLicensePlateValid] = useState(undefined as boolean | undefined);

    const [permitForThisSnowmobileOnly, setPermitForThisSnowmobileOnly] = useState(false);
    const [isPermitForThisSnowmobileOnlyValid, setIsPermitForThisSnowmobileOnlyValid] = useState(undefined as boolean | undefined);

    const [registeredOwner, setRegisteredOwner] = useState(false);
    const [isRegisteredOwnerValid, setIsRegisteredOwnerValid] = useState(undefined as boolean | undefined);

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
        <div className="form-floating">
            <input type="text" className="form-control" id={`permit-from-${snowmobile.oVehicleId}`} placeholder={t("Permits.Vehicle.PermitStartDate")} value={formatShortDate(value)} onClick={onClick} onChange={() => null} disabled={snowmobile?.uiDateStartLoading || isPermitAddedToCart(snowmobile.oVehicleId)} readOnly={true} ref={ref} />
            <label className="required" htmlFor={`permit-from-${snowmobile.oVehicleId}`}>{t("Permits.Vehicle.PermitStartDate")}</label>

            {snowmobile?.uiDateStartLoading && (
                <span className="position-absolute" style={{ left: "50%", top: "30%" }}>
                    <i className="fa-solid fa-spinner fa-spin fa-xl"></i>
                </span>
            )}
        </div>
    ));
    DateRangeInput.displayName = "DateRangeInput";

    registerLocale("en", en);
    registerLocale("fr", fr);

    const t: Function = appContext.translation.t;

    useEffect(() => {
        setHoverButtonVisibility(true);

        // Get data from api.
        const batchApi: Observable<any>[] = [
            apiGetVehiclesAndPermitsForUser(),
            apiGetVehicleMakes()
        ];

        const subscription: Subscription = forkJoin(batchApi).subscribe({
            next: (results: any[]) => {
                // apiGetVehiclesAndPermitsForUser
                const apiGetVehiclesAndPermitsForUserResult: IApiGetVehiclesAndPermitsForUserResult[] = results[0] as IApiGetVehiclesAndPermitsForUserResult[];

                if (apiGetVehiclesAndPermitsForUserResult != undefined && results.length > 0) {
                    const snowmobiles: ISnowmobile[] = [];

                    apiGetVehiclesAndPermitsForUserResult.forEach(x => {
                        const snowmobile: ISnowmobile = {
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
                            permitOptions: undefined,

                            uiPermitOptionIdLoading: false,
                            uiDateStartLoading: false,
                            uiClubIdLoading: false
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
                                dateStart: parseDate(p?.dateStart),
                                dateEnd: parseDate(p?.dateEnd)
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
                    const vehicleMakes: IKeyValue[] = apiGetVehicleMakesResult.map<IKeyValue>(x => ({
                        key: x?.key ?? "",
                        value: x?.value ?? "",
                        valueFr: x?.valueFr ?? ""
                    }));

                    setVehicleMakesData(vehicleMakes);
                }

                // non-api
                const years: number[] = [];

                for (let i: number = endYear; i >= startYear; i--) {
                    years.push(i);
                }

                setYearsData(years);
            },
            error: (error: any) => {
                checkResponseStatus(error);
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

    return (
        <>
            <Head>
                <title>{t("Permits.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h4 className="mb-3">{t("Permits.Title")}</h4>

            <CartItemsAlert></CartItemsAlert>

            {getSnowmobiles() != undefined && getSnowmobiles().length === 0 && (
                <div className="mb-2">{t("Permits.YouHaveNotAddedAnySnowmobiles")}</div>
            )}

            {getSnowmobiles() != undefined && getSnowmobiles().length > 0 && getSnowmobiles().map(snowmobile => (
                <div className="card mb-3" key={snowmobile?.oVehicleId}>
                    <div className="card-header bg-success-subtle">
                        <div className="row gap-3">
                            <div className="col d-flex justify-content-center justify-content-md-start align-items-center">
                                <div className="d-none d-md-flex align-items-center my-1">
                                    <div className="me-3">
                                        <div className="floating-info-label">{t("Permits.Vehicle.Year")}</div>
                                        <div className="floating-info-text fw-semibold">{snowmobile?.vehicleYear}</div>
                                    </div>

                                    <div className="me-3">
                                        <div className="floating-info-label">{t("Permits.Vehicle.Make")}</div>
                                        <div className="floating-info-text fw-semibold">{snowmobile?.vehicleMake?.value}</div>
                                    </div>

                                    <div className="me-3">
                                        <div className="floating-info-label">{t("Permits.Vehicle.Model")}</div>
                                        <div className="floating-info-text fw-semibold">{snowmobile?.model}</div>
                                    </div>

                                    <div className="me-3">
                                        <div className="floating-info-label">{t("Permits.Vehicle.Vin")}</div>
                                        <div className="floating-info-text fw-semibold">{snowmobile?.vin}</div>
                                    </div>

                                    <div className="">
                                        <div className="floating-info-label">{t("Permits.Vehicle.LicensePlate")}</div>
                                        <div className="floating-info-text fw-semibold">{snowmobile?.licensePlate}</div>
                                    </div>
                                </div>

                                <div className="d-flex d-md-none text-center fw-semibold">
                                    {`${snowmobile?.vehicleYear} ${snowmobile?.vehicleMake?.value} ${snowmobile?.model} ${snowmobile?.vin} ${snowmobile?.licensePlate}`}
                                </div>
                            </div>

                            <div className="col-12 col-md-auto d-flex align-items-center">
                                {snowmobile?.isEditable && !isPermitAddedToCart(snowmobile?.oVehicleId) && (
                                    <>
                                        <button className="btn btn-outline-dark btn-sm w-sm-100" onClick={() => addEditSnowmobileDialogShow(snowmobile?.oVehicleId)} disabled={isPermitAddedToCart(snowmobile?.oVehicleId)}>
                                            {t("Common.Buttons.Edit")}
                                        </button>

                                        <button className="btn btn-outline-dark btn-sm ms-1 w-sm-100" onClick={() => deleteSnowmobileDialogShow(snowmobile?.oVehicleId)} disabled={isPermitAddedToCart(snowmobile?.oVehicleId)}>
                                            {t("Common.Buttons.Delete")}
                                        </button>
                                    </>
                                )}

                                {!snowmobile?.isEditable && (
                                    <button type="button" className="btn btn-link" onClick={() => setShowSnowmobileInfoDialog(true)}>
                                        <i className="fa-solid fa-circle-info fa-lg"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <ul className="list-group list-group-flush">
                        {snowmobile?.permits != undefined && snowmobile.permits.length > 0 && snowmobile.permits.map(permit => (
                            <li className="list-group-item" key={permit?.oPermitId}>
                                <div>
                                    <span className="me-1"><b>{t("Permits.Vehicle.Permit")}:</b></span>
                                    <span className="me-1">{getLocalizedValue(permit?.permitType)}</span>
                                    <span>- {permit?.linkedPermit}</span>
                                </div>

                                <div><b>{t("Permits.Vehicle.Purchased")}:</b> {formatShortDate(permit?.purchaseDate)}</div>
                                <div><b>{t("Permits.Vehicle.TrackingNumber")}:</b> {permit?.trackingNumber}</div>
                            </li>
                        ))}

                        {snowmobile?.isEditable && (snowmobile?.permitOptions == undefined || snowmobile.permitOptions.length === 0) && (
                            <li className="list-group-item">
                                <div>{t("Permits.NoPermitsAvailableAtThisTime")}</div>
                            </li>
                        )}

                        {snowmobile?.isEditable && snowmobile?.permitOptions != undefined && snowmobile.permitOptions.length > 0 && (
                            <>
                                <li className="list-group-item">
                                    <div className="form-floating">
                                        <select className="form-select" id={`permits-permit-options-${snowmobile?.oVehicleId}`} aria-label={t("Permits.Vehicle.Permit")} value={getSelectedPermitOption(snowmobile?.oVehicleId)} onChange={(e: any) => permitOptionChange(e, snowmobile?.oVehicleId)} disabled={snowmobile?.uiPermitOptionIdLoading || isPermitAddedToCart(snowmobile?.oVehicleId)}>
                                            <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                            {snowmobile.permitOptions.map(permitOption => {
                                                if (appContext.translation.i18n.language === "fr") {
                                                    return (
                                                        <option value={permitOption?.productId} key={permitOption?.productId}>{permitOption?.frenchDisplayName} — {formatCurrency(permitOption?.amount)}</option>
                                                    );
                                                } else {
                                                    return (
                                                        <option value={permitOption?.productId} key={permitOption?.productId}>{permitOption?.displayName} — {formatCurrency(permitOption?.amount)}</option>
                                                    );
                                                }
                                            })}
                                        </select>
                                        <label className="required" htmlFor={`permits-permit-options-${snowmobile?.oVehicleId}`}>{t("Permits.Vehicle.Permit")}</label>

                                        {snowmobile?.uiPermitOptionIdLoading && (
                                            <span className="position-absolute" style={{ left: "50%", top: "30%" }}>
                                                <i className="fa-solid fa-spinner fa-spin fa-xl"></i>
                                            </span>
                                        )}
                                    </div>

                                    {showDateRangeForSelectedPermit(snowmobile?.oVehicleId) && (
                                        <div className="row mt-2">
                                            <div className="col-12 col-sm-12 col-md-6 mb-2 mb-md-0">
                                                <DatePicker dateFormat="yyyy-MM-dd" locale={appContext.translation.i18n.language} selected={getPermitDateRangeFromDate(snowmobile?.oVehicleId)} minDate={getDate()} onChange={(date: Date) => permitDateRangeChange(date, snowmobile?.oVehicleId)} customInput={<DateRangeInput value={undefined} snowmobile={snowmobile} onClick={undefined} />} />
                                            </div>

                                            <div className="col-12 col-sm-12 col-md-6">
                                                <div className="form-floating">
                                                    <input type="text" className="form-control" id={`permit-to-${snowmobile?.oVehicleId}`} placeholder={t("Permits.Vehicle.PermitValidUntil")} value={getPermitDateRangeToDate(snowmobile?.oVehicleId)} onChange={() => null} disabled={true} />
                                                    <label className="" htmlFor={`permit-to-${snowmobile?.oVehicleId}`}>{t("Permits.Vehicle.PermitValidUntil")}</label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            </>
                        )}
                    </ul>

                    {snowmobile?.isEditable && snowmobile?.permitOptions != undefined && snowmobile.permitOptions.length > 0 && (
                        <div className="card-footer">
                            {snowmobile?.isEditable && !isPermitAddedToCart(snowmobile?.oVehicleId) && (
                                <button className="btn btn-outline-dark btn-sm" onClick={() => addPermitToCartClick(snowmobile?.oVehicleId)} disabled={!isAddToCartEnabled(snowmobile?.oVehicleId)}>
                                    <i className="fa-solid fa-plus"></i> {t("Permits.Vehicle.AddPermitToCart")}
                                </button>
                            )}

                            {snowmobile?.isEditable && isPermitAddedToCart(snowmobile?.oVehicleId) && (
                                <button className="btn btn-outline-dark btn-sm" onClick={() => removePermitFromCartClick(snowmobile?.oVehicleId)}>
                                    <i className="fa-solid fa-xmark"></i> {t("Permits.Vehicle.RemovePermitFromCart")}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}

            <div className="card">
                <div className="card-body text-center">
                    <button className="btn btn-primary" onClick={() => addEditSnowmobileDialogShow()}>
                        {t("Permits.Vehicle.AddSnowmobile")}
                    </button>

                    <button className="btn btn-primary ms-1" onClick={() => router.push("/cart")}>
                        {t("GiftCards.ProceedWithPurchase")}
                    </button>
                </div>
            </div>

            <ConfirmationDialog showDialog={showSnowmobileInfoDialog} title={t("Permits.VehicleCannotBeModifiedDialog.Title")} buttons={ConfirmationDialogButtons.Ok} icon={ConfirmationDialogIcons.Information} width="50"
                okClick={() => setShowSnowmobileInfoDialog(false)} closeClick={() => setShowSnowmobileInfoDialog(false)}>
                <div>{t("Permits.VehicleCannotBeModifiedDialog.Message")}</div>
            </ConfirmationDialog>

            <ConfirmationDialog showDialog={showDeleteSnowmobileDialog} title={t("Permits.DeleteSnowmobileDialog.Title")} errorMessage={deleteSnowmobileDialogErrorMessage} buttons={ConfirmationDialogButtons.YesNo}
                icon={ConfirmationDialogIcons.Question} width="50" yesClick={() => deleteSnowmobileDialogYesClick()} noClick={() => deleteSnowmobileDialogNoClick()}
                closeClick={() => deleteSnowmobileDialogNoClick()}>
                <div className="fw-bold mb-2">{snowmobileNameToDelete}</div>
                <div>{t("Permits.DeleteSnowmobileDialog.Message")}</div>
            </ConfirmationDialog>

            <Modal show={showAddEditSnowmobileDialog} onHide={() => addEditSnowmobileDialogHide()} backdrop="static" keyboard={false} dialogClassName="modal-width-75-percent">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {addEditSnowmobileDialogMode === DialogMode.Add && (<div>{t("Permits.AddEditSnowmobileDialog.AddTitle")}</div>)}
                        {addEditSnowmobileDialogMode === DialogMode.Edit && (<div>{t("Permits.AddEditSnowmobileDialog.EditTitle")}</div>)}
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
                            <div className="col-12 col-sm-12 col-md-6 mb-2">
                                <div className="input-group has-validation">
                                    <div className={`form-floating ${iv(isVehicleYearValid)}`}>
                                        <select className={`form-select ${iv(isVehicleYearValid)}`} id="add-edit-snowmobile-year" aria-label={t("Permits.AddEditSnowmobileDialog.Year")} aria-describedby="add-edit-snowmobile-year-validation" value={vehicleYear} onChange={(e: any) => setVehicleYear(e?.target?.value ?? "")}>
                                            <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                            {yearsData != undefined && yearsData.length > 0 && yearsData.map(x => (
                                                <option value={x} key={x}>{x}</option>
                                            ))}
                                        </select>
                                        <label className="required" htmlFor="add-edit-snowmobile-year">{t("Permits.AddEditSnowmobileDialog.Year")}</label>
                                    </div>
                                    <div id="add-edit-snowmobile-year-validation" className="invalid-feedback">{t("Permits.AddEditSnowmobileDialog.Year")} {t("Common.Validation.IsRequiredSuffix")}</div>
                                </div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-6 mb-2">
                                <div className="input-group has-validation">
                                    <div className={`form-floating ${iv(isMakeValid)}`}>
                                        <select className={`form-select ${iv(isMakeValid)}`} id="add-edit-snowmobile-make" aria-label={t("Permits.AddEditSnowmobileDialog.Make")} aria-describedby="add-edit-snowmobile-make-validation" value={make?.key} onChange={(e: any) => setMake(getKeyValueFromSelect(e) ?? { key: "", value: "" })}>
                                            <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                            {vehicleMakesData != undefined && vehicleMakesData.length > 0 && getVehicleMakesData().map(x => (
                                                <option value={x.key} key={x.key}>{getLocalizedValue(x)}</option>
                                            ))}
                                        </select>
                                        <label className="required" htmlFor="add-edit-snowmobile-make">{t("Permits.AddEditSnowmobileDialog.Make")}</label>
                                    </div>
                                    <div id="add-edit-snowmobile-make-validation" className="invalid-feedback">{t("Permits.AddEditSnowmobileDialog.Make")} {t("Common.Validation.IsRequiredSuffix")}</div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-4 mb-2">
                                <div className="input-group has-validation">
                                    <div className={`form-floating ${iv(isModelValid)}`}>
                                        <input type="text" className={`form-control ${iv(isModelValid)}`} id="add-edit-snowmobile-model" placeholder={t("Permits.AddEditSnowmobileDialog.Model")} maxLength={50} aria-describedby="add-edit-snowmobile-model-validation" value={model} onChange={(e: any) => setModel(e?.target?.value ?? "")} />
                                        <label className="required" htmlFor="add-edit-snowmobile-model">{t("Permits.AddEditSnowmobileDialog.Model")}</label>
                                    </div>
                                    <div id="add-edit-snowmobile-model-validation" className="invalid-feedback">{t("Permits.AddEditSnowmobileDialog.Model")} {t("Common.Validation.IsRequiredSuffix")}</div>
                                </div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-4 mb-2">
                                <div className="input-group has-validation">
                                    <div className={`form-floating ${iv(isVinValid && isVinFormatValid)}`}>
                                        <input type="text" className={`form-control ${iv(isVinValid && isVinFormatValid)}`} id="add-edit-snowmobile-vin" placeholder={t("Permits.AddEditSnowmobileDialog.Vin")} maxLength={17} aria-describedby="add-edit-snowmobile-vin-validation" value={vin} onChange={(e: any) => setVin(e?.target?.value ?? "")} />
                                        <label className="required" htmlFor="add-edit-snowmobile-vin">{t("Permits.AddEditSnowmobileDialog.Vin")}</label>
                                    </div>
                                    <div id="add-edit-snowmobile-vin-validation" className="invalid-feedback">
                                        {!isVinValid && (
                                            <>
                                                {t("Permits.AddEditSnowmobileDialog.Vin")} {t("Common.Validation.IsRequiredSuffix")}
                                            </>
                                        )}
                                        {isVinValid && !isVinFormatValid && (
                                            <>
                                                {t("Permits.AddEditSnowmobileDialog.InvalidVin")}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-4 mb-2">
                                <div className="input-group has-validation">
                                    <div className={`form-floating ${iv(isLicensePlateValid)}`}>
                                        <input type="text" className={`form-control ${iv(isLicensePlateValid)}`} id="add-edit-snowmobile-license-plate" placeholder={t("Permits.AddEditSnowmobileDialog.LicensePlate")} maxLength={10} aria-describedby="add-edit-snowmobile-license-plate-validation" value={licensePlate} onChange={(e: any) => setLicensePlate(e?.target?.value ?? "")} />
                                        <label className="required" htmlFor="add-edit-snowmobile-license-plate">{t("Permits.AddEditSnowmobileDialog.LicensePlate")}</label>
                                    </div>
                                    <div id="add-edit-snowmobile-license-plate-validation" className="invalid-feedback">{t("Permits.AddEditSnowmobileDialog.LicensePlate")} {t("Common.Validation.IsRequiredSuffix")}</div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div className="form-check mb-2">
                                    <input className={`form-check-input ${iv(isPermitForThisSnowmobileOnlyValid)}`} type="checkbox" value="" id="add-edit-snowmobile-permit-for-this-snowmobile-only" defaultChecked={permitForThisSnowmobileOnly} onChange={(e: any) => { setPermitForThisSnowmobileOnly(e.target.checked) }} />
                                    <label className="form-check-label required" htmlFor="add-edit-snowmobile-permit-for-this-snowmobile-only">{t("Permits.AddEditSnowmobileDialog.PermitForThisSnowmobileOnly")}</label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div className="form-check">
                                    <input className={`form-check-input ${iv(isRegisteredOwnerValid)}`} type="checkbox" value="" id="add-edit-snowmobile-registered-owner" defaultChecked={registeredOwner} onChange={(e: any) => setRegisteredOwner(e.target.checked)} />
                                    <label className="form-check-label required" htmlFor="add-edit-snowmobile-registered-owner">{t("Permits.AddEditSnowmobileDialog.RegisteredOwner")}</label>
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
                                    <span className="text-danger me-1">*</span>{t("Permits.AddEditSnowmobileDialog.MandatoryField")}
                                </div>
                            </div>
                            <div className="col d-flex justify-content-center justify-content-sm-end align-items-center">
                                <Button className="me-2" variant="outline-dark" onClick={() => addEditSnowmobileDialogSave()}>
                                    {t("Common.Buttons.Save")}
                                </Button>

                                <Button variant="outline-dark" onClick={() => addEditSnowmobileDialogHide()}>
                                    {t("Common.Buttons.Cancel")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    )

    function getSnowmobiles(): ISnowmobile[] {
        let result: ISnowmobile[] = [];

        if (appContext.data?.snowmobiles != undefined && appContext.data.snowmobiles.length > 0) {
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

            const snowmobile: ISnowmobile = getSnowmobiles()?.filter(x => x?.oVehicleId === snowmobileId)[0];

            setVehicleYear(snowmobile?.vehicleYear ?? "");
            setMake(snowmobile?.vehicleMake ?? { key: "", value: "" });
            setModel(snowmobile?.model ?? "");
            setVin(snowmobile?.vin ?? "");
            setLicensePlate(snowmobile?.licensePlate ?? "");
            setPermitForThisSnowmobileOnly(false);
            setRegisteredOwner(false);
        }

        setIsVehicleYearValid(undefined);
        setIsMakeValid(undefined);
        setIsModelValid(undefined);
        setIsVinValid(undefined);
        setIsLicensePlateValid(undefined);
        setIsPermitForThisSnowmobileOnlyValid(undefined);
        setIsRegisteredOwnerValid(undefined);

        setAddEditSnowmobileDialogErrorMessage("");
        setShowAddEditSnowmobileDialog(true);

        setHoverButtonVisibility(false);
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
                const apiAddVehicleForUserRequest: IApiAddVehicleForUserRequest = {
                    oVehicleId: editedSnowmobileId,
                    makeId: Number(make?.key),
                    model: model?.trim()?.substring(0, 50),
                    vin: vin?.trim()?.substring(0, 17),
                    licensePlate: licensePlate?.trim()?.substring(0, 10),
                    vehicleYear: vehicleYear
                };

                setShowAlert(true);

                apiAddVehicleForUser(apiAddVehicleForUserRequest).subscribe({
                    next: (result: IApiAddVehicleForUserResult) => {
                        if (result?.isSuccessful && result?.data != undefined) {
                            const newSnowmobile: ISnowmobile = {
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
                                    dateStart: parseDate(p?.dateStart),
                                    dateEnd: parseDate(p?.dateEnd)
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

                            setHoverButtonVisibility(true);
                        } else {
                            setAddEditSnowmobileDialogErrorMessage(getApiErrorMessage(result?.errorMessage) ?? result?.errorMessage ?? "");
                        }
                    },
                    error: (error: any) => {
                        checkResponseStatus(error);
                    },
                    complete: () => {
                        setShowAlert(false);
                    }
                });
            } else if (addEditSnowmobileDialogMode === DialogMode.Edit) {
                const apiUpdateVehicleRequest: IApiUpdateVehicleRequest = {
                    oVehicleId: editedSnowmobileId,
                    makeId: Number(make?.key),
                    model: model?.trim()?.substring(0, 50),
                    vin: vin?.trim()?.substring(0, 17),
                    licensePlate: licensePlate?.trim()?.substring(0, 10),
                    vehicleYear: vehicleYear
                };

                setShowAlert(true);

                apiUpdateVehicle(apiUpdateVehicleRequest).subscribe({
                    next: (result: IApiUpdateVehicleResult) => {
                        if (result?.isSuccessful && result?.data != undefined) {
                            const updatedSnowmobile: ISnowmobile = result.data as ISnowmobile;

                            appContext.updater(draft => {
                                if (draft?.snowmobiles != undefined) {
                                    const index: number = draft.snowmobiles.findIndex(x => x?.oVehicleId === editedSnowmobileId) ?? -1;

                                    if (index != -1) {
                                        draft.snowmobiles[index] = updatedSnowmobile;
                                    }
                                }
                            });

                            setShowAddEditSnowmobileDialog(false);

                            setHoverButtonVisibility(true);
                        } else {
                            setAddEditSnowmobileDialogErrorMessage(getApiErrorMessage(result?.errorMessage) ?? result?.errorMessage ?? "");
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
    }

    function validateVinNumber(vinNumber?: string): boolean {
        let result: boolean = false;

        if (vinNumber != undefined) {
            result = /^([a-z,A-Z,0-9])([a-z,A-Z])([a-z,A-Z,0-9]{10})((\d{5}))$/.test(vinNumber);
        }

        return result;
    }

    function validateAddEditSnowmobileDialog(): boolean {
        let result: boolean = true;

        if (vehicleYear === "") {
            setIsVehicleYearValid(false);
            result = false;
        } else {
            setIsVehicleYearValid(true);
        }

        if (make?.key == undefined || make.key === "") {
            setIsMakeValid(false);
            result = false;
        } else {
            setIsMakeValid(true);
        }

        if (model.trim() === "") {
            setIsModelValid(false);
            result = false;
        } else {
            setIsModelValid(true);
        }

        if (vin.trim() === "") {
            setIsVinValid(false);
            result = false;
        } else {
            setIsVinValid(true);
        }

        if (!validateVinNumber(vin.trim())) {
            setIsVinFormatValid(false);
            result = false;
        } else {
            setIsVinFormatValid(true);
        }

        if (licensePlate.trim() === "") {
            setIsLicensePlateValid(false);
            result = false;
        } else {
            setIsLicensePlateValid(true);
        }

        if (permitForThisSnowmobileOnly === false) {
            setIsPermitForThisSnowmobileOnlyValid(false);
            result = false;
        } else {
            setIsPermitForThisSnowmobileOnlyValid(true);
        }

        if (registeredOwner === false) {
            setIsRegisteredOwnerValid(false);
            result = false;
        } else {
            setIsRegisteredOwnerValid(true);
        }

        return result;
    }

    function addEditSnowmobileDialogHide(): void {
        setShowAddEditSnowmobileDialog(false);

        setHoverButtonVisibility(true);
    }

    function deleteSnowmobileDialogShow(snowmobileId?: string): void {
        if (snowmobileId != undefined) {
            const snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                setSnowmobileIdToDelete(snowmobileId);
                setSnowmobileNameToDelete(`${snowmobile.vehicleYear} ${snowmobile?.vehicleMake?.value} ${snowmobile?.model} ${snowmobile?.vin}`);
                setDeleteSnowmobileDialogErrorMessage("");
                setShowDeleteSnowmobileDialog(true);

                setHoverButtonVisibility(false);
            }
        }
    }

    function deleteSnowmobileDialogYesClick(): void {
        const apiDeleteVehicleRequest: IApiDeleteVehicleRequest = {
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

                    setSnowmobileIdToDelete("");
                    setSnowmobileNameToDelete("");
                    setDeleteSnowmobileDialogErrorMessage("");
                    setShowDeleteSnowmobileDialog(false);

                    setHoverButtonVisibility(true);
                } else {
                    setDeleteSnowmobileDialogErrorMessage(getApiErrorMessage(result?.errorMessage) ?? result?.errorMessage ?? "");
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

    function deleteSnowmobileDialogNoClick(): void {
        setSnowmobileIdToDelete("");
        setSnowmobileNameToDelete("");
        setDeleteSnowmobileDialogErrorMessage("");
        setShowDeleteSnowmobileDialog(false);

        setHoverButtonVisibility(true);
    }

    function getSelectedPermitOption(snowmobileId?: string): string {
        let result: string = "";

        if (snowmobileId != undefined) {
            const snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                result = snowmobile?.permitSelections?.permitOptionId?.toString() ?? "";
            }
        }

        return result;
    }

    function permitOptionChange(e: any, snowmobileId?: string): void {
        if (e != undefined && snowmobileId != undefined) {
            const snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                const permitSelections: IPermitSelections | undefined = snowmobile?.permitSelections;

                if (permitSelections != undefined) {
                    const apiSavePermitSelectionForVehicleRequest: IApiSavePermitSelectionForVehicleRequest | undefined = {
                        oVehicleId: snowmobileId,
                        oPermitId: permitSelections?.oPermitId ?? getGuid(),
                        permitOptionId: Number(e?.target?.value), // New value
                        dateStart: undefined, // Clear because permit option was changed
                        dateEnd: undefined, // Clear because permit option was changed
                        clubId: permitSelections?.clubId
                    };

                    appContext.updater(draft => {
                        const draftSnowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

                        if (draftSnowmobile != undefined) {
                            draftSnowmobile.uiPermitOptionIdLoading = true;
                        }
                    });

                    apiSavePermitSelectionForVehicle(apiSavePermitSelectionForVehicleRequest).subscribe({
                        next: (result: IApiSavePermitSelectionForVehicleResult) => {
                            if (result?.isSuccessful && result?.data != undefined) {
                                appContext.updater(draft => {
                                    const draftSnowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

                                    if (draftSnowmobile != undefined) {
                                        draftSnowmobile.uiPermitOptionIdLoading = false;

                                        draftSnowmobile.permitSelections = {
                                            oPermitId: result?.data?.oPermitId ?? getGuid(),
                                            permitOptionId: result?.data?.permitOptionId,
                                            dateStart: result?.data?.dateStart,
                                            dateEnd: result?.data?.dateEnd,
                                            clubId: result?.data?.clubId
                                        };
                                    }
                                });
                            } else {
                                //
                            }
                        },
                        error: (error: any) => {
                            checkResponseStatus(error);
                        },
                        complete: () => {
                            appContext.updater(draft => {
                                const draftSnowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

                                if (draftSnowmobile != undefined) {
                                    draftSnowmobile.uiPermitOptionIdLoading = false;
                                }
                            });
                        }
                    });
                }
            }
        }
    }

    function getPermitDateRangeFromDate(snowmobileId?: string): Date | undefined {
        let result: Date | undefined = undefined;

        if (snowmobileId != undefined) {
            const snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                result = parseDate(snowmobile?.permitSelections?.dateStart);
            }
        }

        return result;
    }

    function getPermitDateRangeToDate(snowmobileId?: string): string {
        let result: string = "";

        if (snowmobileId != undefined) {
            const snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined && snowmobile?.permitSelections?.dateEnd != undefined) {
                result = formatShortDate(snowmobile?.permitSelections?.dateEnd);
            }
        }

        return result;
    }

    function permitDateRangeChange(date?: Date, snowmobileId?: string): void {
        if (date != undefined && snowmobileId != undefined) {
            const snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                const permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x?.productId === snowmobile?.permitSelections?.permitOptionId)[0];

                if (permitOption != undefined) {
                    const permitSelections: IPermitSelections | undefined = snowmobile?.permitSelections;

                    if (permitSelections != undefined) {
                        const daysToAdd: number = (permitOption?.permitDays ?? 0) - 1;

                        appContext.updater(draft => {
                            const draftSnowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

                            if (draftSnowmobile != undefined) {
                                draftSnowmobile.uiDateStartLoading = true;
                            }
                        });

                        const apiSavePermitSelectionForVehicleRequest: IApiSavePermitSelectionForVehicleRequest | undefined = {
                            oVehicleId: snowmobileId,
                            oPermitId: permitSelections?.oPermitId ?? getGuid(),
                            permitOptionId: permitSelections?.permitOptionId,
                            dateStart: date, // New value
                            dateEnd: daysToAdd >= 0 ? getMoment(date).add(daysToAdd, 'days').toDate() : date, // New value
                            clubId: permitSelections?.clubId
                        };

                        apiSavePermitSelectionForVehicle(apiSavePermitSelectionForVehicleRequest).subscribe({
                            next: (result: IApiSavePermitSelectionForVehicleResult) => {
                                if (result?.isSuccessful && result?.data != undefined) {
                                    appContext.updater(draft => {
                                        const draftSnowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

                                        if (draftSnowmobile != undefined) {
                                            draftSnowmobile.permitSelections = {
                                                oPermitId: result?.data?.oPermitId ?? getGuid(),
                                                permitOptionId: result?.data?.permitOptionId,
                                                dateStart: result?.data?.dateStart,
                                                dateEnd: result?.data?.dateEnd,
                                                clubId: result?.data?.clubId
                                            };
                                        }
                                    });
                                } else {
                                    //
                                }
                            },
                            error: (error: any) => {
                                checkResponseStatus(error);
                            },
                            complete: () => {
                                appContext.updater(draft => {
                                    const draftSnowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

                                    if (draftSnowmobile != undefined) {
                                        draftSnowmobile.uiDateStartLoading = false;
                                    }
                                });
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
            const snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                const permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x?.productId === snowmobile?.permitSelections?.permitOptionId)[0];

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
            const snowmobile: ISnowmobile | undefined = getSnowmobile(snowmobileId);

            if (snowmobile != undefined) {
                const permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x?.productId === snowmobile?.permitSelections?.permitOptionId)[0];

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
                const draftSnowmobile: ISnowmobile | undefined = draft?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

                if (draftSnowmobile != undefined) {
                    const draftPermitOption: IPermitOption | undefined = draftSnowmobile?.permitOptions?.filter(x => x?.productId === draftSnowmobile?.permitSelections?.permitOptionId)[0];

                    if (draftPermitOption != undefined) {
                        let description: string = `${draftSnowmobile?.vehicleYear} ${draftSnowmobile?.vehicleMake?.value} ${draftSnowmobile?.model} ${draftSnowmobile?.vin} ${draftPermitOption?.displayName}`;
                        let descriptionFr: string = `${draftSnowmobile?.vehicleYear} ${draftSnowmobile?.vehicleMake?.value} ${draftSnowmobile?.model} ${draftSnowmobile?.vin} ${draftPermitOption?.frenchDisplayName}`;

                        if (draftPermitOption.isMultiDay) {
                            description += ` (${formatShortDate(draftSnowmobile?.permitSelections?.dateStart)} — ${formatShortDate(draftSnowmobile?.permitSelections?.dateEnd)}) `;
                            descriptionFr += ` (${formatShortDate(draftSnowmobile?.permitSelections?.dateStart)} — ${formatShortDate(draftSnowmobile?.permitSelections?.dateEnd)}) `;
                        }

                        const cartItem: ICartItem = {
                            id: getGuid(),
                            description: description,
                            descriptionFr: descriptionFr,
                            price: draftPermitOption?.amount ?? 0,
                            isPermit: true,
                            isGiftCard: false,
                            itemId: draftSnowmobile.oVehicleId,

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

    function setHoverButtonVisibility(isVisible: boolean): void {
        setShowHoverButton({
            showHoverButton: isVisible,
            getButtonText: (): string => { return t("Permits.HoverButtons.AddSnowmobile"); },
            action: addEditSnowmobileDialogShow
        });
    }
}
