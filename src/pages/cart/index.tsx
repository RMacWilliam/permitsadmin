import ConfirmationDialog, { ConfirmationDialogButtons, ConfirmationDialogIcons } from "@/components/confirmation-dialog";
import AuthenticatedPageLayout from "@/components/layouts/authenticated-page"
import { IApiGetClubsResult, IApiGetCountriesResult, IApiGetProcessingFeeResult, IApiGetProvincesResult, IApiGetShippingFeesResult, apiGetClubs, apiGetCountries, apiGetProcessingFee, apiGetProvinces, apiGetRedeemableGiftCardsForUser, apiGetShippingFees, IApiSavePermitSelectionForVehicleRequest, apiSavePermitSelectionForVehicle, IApiSavePermitSelectionForVehicleResult, apiGetGoogleMapKey, IApiGetGoogleMapKeyResult, apiGetIsValidRedemptionCodeForVehicle, IApiGetIsValidRedemptionCodeForVehicleResult, IApiGetIsValidRedemptionCodeForVehicleRequest } from "@/custom/api";
import { AppContext, IAppContextValues, ICartItem, IKeyValue, IParentKeyValue, IRedeemableGiftCards, IShippingFee, ISnowmobile, IPermitSelections, IPermitOption } from "@/custom/app-context";
import { checkResponseStatus, formatCurrency, getApiErrorMessage, getGuid, getKeyValueFromSelect, getParentKeyValueFromSelect, sortArray } from "@/custom/utilities";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Observable, Subscription, forkJoin } from "rxjs";
import Select from 'react-select';
import ClubLocatorMap from "./club-locator-map";
import { getLocalizedValue, getLocalizedValue2 } from "@/localization/i18n";

export default function CartPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "cart" });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthenticatedPageLayout showAlert={showAlert}>
            <Cart appContext={appContext} router={router} setShowAlert={setShowAlert}></Cart>
        </AuthenticatedPageLayout>
    )
}

export enum ShipTo {
    Registered = 0,
    Alternate = 1
}

function Cart({ appContext, router, setShowAlert }:
    {
        appContext: IAppContextValues,
        router: NextRouter,
        setShowAlert: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [pageLoaded, setPageLoaded] = useState(false);

    const [showClubInfoDialog, setShowClubInfoDialog] = useState(false);

    const [showClubLocatorMapDialog, setShowClubLocatorMapDialog] = useState(false);
    const [clubLocatorMapSnowmobileId, setClubLocatorMapSnowmobileId] = useState("");

    const [isShippingValid, setIsShippingValid] = useState(true);

    const [standardShippingWarning, setStandardShippingWarning] = useState(false);
    const [isStandardShippingWarningValid, setIsStandardShippingWarningValid] = useState(true);

    const [isAddressLine1Valid, setIsAddressLine1Valid] = useState(true);
    const [isCityValid, setIsCityValid] = useState(true);
    const [isProvinceValid, setIsProvinceValid] = useState(true);
    const [isCountryValid, setIsCountryValid] = useState(true);
    const [isPostalCodeValid, setIsPostalCodeValid] = useState(true);

    const [processingFee, setProcessingFee] = useState(0);
    const [shippingFeesData, setShippingFeesData] = useState([] as IShippingFee[]);
    const [provincesData, setProvincesData] = useState([] as IParentKeyValue[]);
    const [countriesData, setCountriesData] = useState([] as IKeyValue[]);
    const [redeemableGiftCards, setRedeemableGiftCards] = useState({} as IRedeemableGiftCards);
    const [clubsData, setClubsData] = useState([] as IKeyValue[]);

    const [googleMapKey, setGoogleMapKey] = useState(undefined as string | undefined);

    const t: Function = appContext.translation.t;

    useEffect(() => {
        if (appContext.data?.cart == undefined) {
            appContext.updater(draft => {
                draft.cart = { alternateAddress: {} };
            });
        }
    }, []);

    useEffect(() => {
        // Get data from api.
        const batchApi: Observable<any>[] = [
            apiGetProcessingFee(),
            apiGetShippingFees(),
            apiGetProvinces(),
            apiGetCountries(),
            apiGetRedeemableGiftCardsForUser(),
            apiGetClubs(),
            apiGetGoogleMapKey()
        ];

        const subscription: Subscription = forkJoin(batchApi).subscribe({
            next: (results: any[]) => {
                // apiGetProcessingFee
                const apiGetProcessingFeeResult: IApiGetProcessingFeeResult = results[0] as IApiGetProcessingFeeResult;

                if (apiGetProcessingFeeResult != undefined) {
                    setProcessingFee(apiGetProcessingFeeResult?.fee ?? 0);
                }

                // apiGetShippingFees
                const apiGetShippingFeesResult: IApiGetShippingFeesResult[] = results[1] as IApiGetShippingFeesResult[];

                if (apiGetShippingFeesResult != undefined && apiGetShippingFeesResult.length > 0) {
                    const shippingFees: IShippingFee[] = apiGetShippingFeesResult.map<IShippingFee>((x: IApiGetShippingFeesResult) => ({
                        id: x?.id,
                        name: x?.name,
                        nameFr: x?.nameFr,
                        price: x?.price,
                        showConfirmation: x?.showConfirmation,
                        isTracked: x?.isTracked
                    }));

                    setShippingFeesData(shippingFees);
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

                // apiGetRedeemableGiftCardsForUser
                const apiGetRedeemableGiftCardsForUserResult: IRedeemableGiftCards = results[4] as IRedeemableGiftCards;

                if (apiGetRedeemableGiftCardsForUserResult != undefined) {
                    setRedeemableGiftCards({
                        seasonalGiftCards: apiGetRedeemableGiftCardsForUserResult?.seasonalGiftCards ?? 0,
                        classicGiftCards: apiGetRedeemableGiftCardsForUserResult?.classicGiftCards ?? 0
                    });
                }

                // apiGetClubs
                const apiGetClubsResult: IApiGetClubsResult[] = results[5] as IApiGetClubsResult[];

                if (apiGetClubsResult != undefined && apiGetClubsResult.length > 0) {
                    setClubsData(apiGetClubsResult.map<IKeyValue>(x => ({ key: x?.key ?? "", value: x?.value ?? "" })));
                }

                // apiGetGoogleMapKey
                const apiGetGoogleMapKeyResult: IApiGetGoogleMapKeyResult = results[6] as IApiGetGoogleMapKeyResult;

                if (apiGetGoogleMapKeyResult != undefined) {
                    if (apiGetGoogleMapKeyResult?.isSuccessful && apiGetGoogleMapKeyResult?.data != undefined) {
                        setGoogleMapKey(apiGetGoogleMapKeyResult.data?.key);
                    }
                }

                // Reset validation.
                appContext.updater(draft => {
                    draft?.cartItems?.filter(x => x.isPermit)?.forEach(x => {
                        x.uiIsClubValid = undefined;
                    });
                });

                // Select shipTo value if unselected.
                if (appContext.data?.cart?.shipTo == undefined) {
                    shipToAddressChange(ShipTo.Registered);
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
                <title>{t("Cart.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h4 className="mb-3">{t("Cart.Title")}</h4>

            {getCartItems() != undefined && getCartItems().length === 0 && (
                <div>You have not added any items to your cart.</div>
            )}

            {getCartItems() != undefined && getCartItems().length > 0 && (
                <>
                    <div className="card mb-3">
                        <ul className="list-group list-group-flush">
                            {getCartItems().map(cartItem => (
                                <li className="list-group-item" key={cartItem.id}>
                                    <div className="d-flex my-2">
                                        <div className="flex-fill">
                                            {cartItem.isPermit && (
                                                <i className="fa-solid fa-snowflake me-2"></i>
                                            )}
                                            {cartItem.isGiftCard && (
                                                <i className="fa-solid fa-gift me-2"></i>
                                            )}

                                            {appContext.translation.i18n.language === "fr" && (
                                                <span className="me-2">{cartItem.descriptionFr}</span>
                                            )}
                                            {appContext.translation.i18n.language === "en" && (
                                                <span className="me-2">{cartItem.description}</span>
                                            )}

                                            <button className="btn btn-link text-danger align-baseline p-0" type="button" onClick={() => removeCartItemClick(cartItem.id)}>
                                                {t("Common.Delete")}
                                            </button>
                                        </div>
                                        <div className="fw-bold text-end ms-3">
                                            {formatCurrency(cartItem.price)}
                                        </div>
                                    </div>
                                    <div className="d-flex">
                                        <div className="flex-column flex-fill w-100">
                                            {cartItem?.isPermit && (
                                                <>
                                                    {isRedeemGiftCardVisible(cartItem?.itemId) && (
                                                        <div className="card mt-2">
                                                            <div className="card-body bg-success-subtle">
                                                                {cartItem?.redemptionCode != undefined && (
                                                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                                        <div className="fw-semibold flex-fill">
                                                                            <span className="me-2">{t("Cart.GiftCardRedemption")} ({cartItem?.redemptionCode})</span>

                                                                            <button className="btn btn-link text-danger align-baseline p-0" type="button" onClick={() => removeGiftCardClick(cartItem.id)}>
                                                                                {t("Common.Delete")}
                                                                            </button>
                                                                        </div>

                                                                        <div className="fw-bold text-danger text-end ms-auto">{formatCurrency(cartItem?.price)}</div>
                                                                    </div>
                                                                )}

                                                                {cartItem?.redemptionCode == undefined && (
                                                                    <>
                                                                        <div className="fw-semibold mb-2">{t("Cart.RedeemGiftCard")}</div>

                                                                        <div className="d-flex flex-column gap-2">
                                                                            <div className="input-group">
                                                                                <input type="text" className="form-control" id={`cart-redemption-code-${cartItem?.itemId}`} placeholder={t("Cart.EnterGiftCardRedemptionCode")} value={cartItem?.uiRedemptionCode} onKeyUp={(e: any) => redemptionCodeKeyUp(e, cartItem?.id)} onChange={(e: any) => redemptionCodeChange(e, cartItem?.id)} />
                                                                                <button className="btn btn-outline-dark d-none d-sm-block" type="button" onClick={() => validateGiftCard(cartItem?.id)}>{t("Cart.Validate")}</button>
                                                                            </div>

                                                                            <button className="btn btn-outline-dark btn-sm d-sm-none" type="button" onClick={() => validateGiftCard(cartItem?.id)}>{t("Cart.Validate")}</button>

                                                                            {cartItem?.uiShowRedemptionCodeNotFound && (
                                                                                <div className="text-danger">{cartItem?.uiRedemptionCodeErrorMessage}</div>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="card mt-2">
                                                        <div className="card-body bg-success-subtle">
                                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                                <div className="d-flex flex-fill align-items-center">
                                                                    <div className="fw-semibold required">{t("Cart.SelectClub")}</div>
                                                                    <button type="button" className="btn btn-link p-0 ms-2" onClick={() => setShowClubInfoDialog(true)}>
                                                                        <i className="fa-solid fa-circle-info fa-lg"></i>
                                                                    </button>
                                                                </div>

                                                                <div className="d-none d-sm-block">
                                                                    <button type="button" className="btn btn-link text-black p-0" onClick={() => clubLocatorMapDialogShow(cartItem?.itemId)}>
                                                                        <i className="fa-solid fa-map fa-lg me-2"></i>{t("Cart.UseClubLocatorMap")}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="mt-2">
                                                                <Select id={`cart-club-${cartItem?.itemId}`} className="react-select" aria-label="Club" classNames={getClubReactSelectClasses(cartItem?.id)} isClearable={true} placeholder={t("Common.PleaseSelect")} options={getClubsData()} value={getSelectedClub(cartItem?.itemId)} onChange={(e: any) => permitClubChange(e, cartItem?.itemId)} />
                                                                <button type="button" className="btn btn-link text-black text-start d-sm-none p-0 mt-2" onClick={() => clubLocatorMapDialogShow(cartItem?.itemId)}>
                                                                    <i className="fa-solid fa-map fa-lg me-2"></i>{t("Cart.UseClubLocatorMap")}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}

                            {getPermitCount() > 0 && (
                                <li className="list-group-item">
                                    <div className="d-flex">
                                        <div className="fw-semibold me-auto">
                                            {t("Cart.TransactionAndAdminFee")}
                                        </div>
                                        <div className="fw-bold text-end ms-3">
                                            {formatCurrency(processingFee)}
                                        </div>
                                    </div>

                                    {isTransactionAndAdministrationFeeDiscountVisible() && (
                                        <div className="card mt-2">
                                            <div className="card-body bg-success-subtle">
                                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                    <div className="fw-semibold flex-fill">
                                                        {t("Cart.TransactionAndAdminFeeDiscount")}
                                                    </div>

                                                    <div className="fw-bold text-danger text-end ms-auto">{formatCurrency(-processingFee)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            )}

                            <li className="list-group-item">
                                <div className="fw-semibold mb-2 required">{t("Cart.Shipping")}</div>

                                <div className="d-flex">
                                    <div className="flex-column me-auto w-100">
                                        <select id="cart-shipping" className={`form-select ${isShippingValid ? "" : "is-invalid"}`} aria-label="Shipping" value={getShipping()} onChange={(e: any) => shippingChange(e)}>
                                            <option value="">{t("Common.PleaseSelect")}</option>

                                            {shippingFeesData != undefined && shippingFeesData.length > 0 && getShippingFeesData().map(shippingMethod => (
                                                <option value={shippingMethod?.id} key={shippingMethod?.id}>
                                                    {getLocalizedValue2(shippingMethod?.name, shippingMethod?.nameFr)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="fw-bold text-end ms-3">
                                        {formatCurrency(getShippingFee())}
                                    </div>
                                </div>

                                {isStandardShippingWarningVisible() && (
                                    <div className="form-check mt-2">
                                        <input className={`form-check-input ${isStandardShippingWarningValid ? "" : "is-invalid"}`} type="checkbox" value="" id="cart-standard-shipping-verification" defaultChecked={standardShippingWarning} onChange={(e: any) => { setStandardShippingWarning(e.target.checked) }} />
                                        <label className="form-check-label required" htmlFor="cart-standard-shipping-verification">
                                            {t("Cart.StandardShippingAcceptTerms")}
                                        </label>
                                    </div>
                                )}

                                {isTrackedShippingDiscountVisible() && (
                                    <div className="card mt-2">
                                        <div className="card-body bg-success-subtle">
                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                <div className="fw-semibold flex-fill">
                                                    {t("Cart.TrackedShippingDiscount")}
                                                </div>

                                                <div className="fw-bold text-danger text-end ms-auto">{formatCurrency(getTrackedShippingDiscount())}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </li>
                        </ul>

                        <div className="card-footer">
                            <div className="d-flex fs-5">
                                <div className="fw-bold me-auto">
                                    {t("Cart.TotalAmount")}
                                </div>
                                <div className="fw-bold text-end ms-3">
                                    {formatCurrency(calculateTotal())}
                                </div>
                            </div>
                        </div>
                    </div >

                    <div className="card mb-3">
                        <div className="card-body">
                            <div className="fw-semibold mb-2">{t("Cart.ShippingAddress")}</div>

                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="shipTo" id="shipToRegistered" checked={getShipTo() === ShipTo.Registered} value={ShipTo.Registered} onChange={() => shipToAddressChange(ShipTo.Registered)} />
                                <label className="form-check-label" htmlFor="shipToRegistered">
                                    {t("Cart.RegisteredOwnerAddress")}
                                </label>
                                <div className="mt-1">
                                    <div>{`${appContext.data?.contactInfo?.firstName} ${appContext.data?.contactInfo?.initial} ${appContext.data?.contactInfo?.lastName}`}</div>
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
                                </div>
                            </div>

                            <div className="form-check mt-2">
                                <input className="form-check-input" type="radio" name="shipTo" id="shipToAlternate" checked={getShipTo() === ShipTo.Alternate} value={ShipTo.Alternate} onChange={() => shipToAddressChange(ShipTo.Alternate)} />
                                <label className="form-check-label" htmlFor="shipToAlternate">
                                    {t("Cart.AlternateAddress")}
                                </label>

                                {getShipTo() === ShipTo.Alternate && (
                                    <div className="container-fluid mt-1">
                                        <div className="row">
                                            <div className="col-12 col-sm-12 col-md-6">
                                                <div className="form-floating mb-2">
                                                    <input type="text" className={`form-control ${isAddressLine1Valid ? "" : "is-invalid"}`} id="alternate-address-address-line-1" placeholder={t("Cart.AlternateAddressFields.AddressLine1")} value={getAddressLine1()} onChange={(e: any) => updateAddressLine1(e.target.value)} />
                                                    <label className="required" htmlFor="alternate-address-address-line-1">{t("Cart.AlternateAddressFields.AddressLine1")}</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-6">
                                                <div className="form-floating mb-2">
                                                    <input type="text" className="form-control" id="alternate-address-address-line-2" placeholder={t("Cart.AlternateAddressFields.AddressLine2")} value={getAddressLine2()} onChange={(e: any) => updateAddressLine2(e.target.value)} />
                                                    <label htmlFor="alternate-address-address-line-2">{t("Cart.AlternateAddressFields.AddressLine2")}</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-12 col-sm-12 col-md-3">
                                                <div className="form-floating mb-2">
                                                    <input type="text" className={`form-control ${isCityValid ? "" : "is-invalid"}`} id="alternate-address-city" placeholder={t("Cart.AlternateAddressFields.CityTownOrVillage")} value={getCity()} onChange={(e: any) => updateCity(e.target.value)} />
                                                    <label className="required" htmlFor="alternate-address-city">{t("Cart.AlternateAddressFields.CityTownOrVillage")}</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-3">
                                                <div className="form-floating mb-2">
                                                    <select className={`form-select ${isProvinceValid ? "" : "is-invalid"}`} id="alternate-address-province" aria-label={t("Cart.AlternateAddressFields.ProvinceState")} value={getProvince()} onChange={(e: any) => updateProvince(e)}>
                                                        <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                                        {provincesData != undefined && provincesData.length > 0 && getProvinceData().map(provinceData => (
                                                            <option value={`${appContext.data?.cart?.alternateAddress?.country?.key}|${provinceData.key}`} key={`${appContext.data?.cart?.alternateAddress?.country?.key}|${provinceData.key}`}>{getLocalizedValue(provinceData)}</option>
                                                        ))}
                                                    </select>
                                                    <label className="required" htmlFor="alternate-address-province">{t("Cart.AlternateAddressFields.ProvinceState")}</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-3">
                                                <div className="form-floating mb-2">
                                                    <select className={`form-select ${isCountryValid ? "" : "is-invalid"}`} id="alternate-address-country" aria-label={t("Cart.AlternateAddressFields.Country")} value={getCountry()} onChange={(e: any) => updateCountry(e)}>
                                                        <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                                        {countriesData != undefined && countriesData.length > 0 && getCountriesData().map(countryData => (
                                                            <option value={countryData.key} key={countryData.key}>{getLocalizedValue(countryData)}</option>
                                                        ))}
                                                    </select>
                                                    <label className="required" htmlFor="alternate-address-country">{t("Cart.AlternateAddressFields.Country")}</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-3">
                                                <div className="form-floating mb-2">
                                                    <input type="text" className={`form-control ${isPostalCodeValid ? "" : "is-invalid"}`} id="alternate-address-postal-code" placeholder={t("Cart.AlternateAddressFields.PostalZipCode")} value={getPostalCode()} onChange={(e: any) => updatePostalCode(e.target.value)} />
                                                    <label className="required" htmlFor="alternate-address-postal-code">{t("Cart.AlternateAddressFields.PostalZipCode")}</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card mb-3">
                        <div className="card-body d-flex justify-content-center align-items-center flex-wrap gap-2">
                            <button className="btn btn-primary" onClick={() => checkoutClick()}>{t("Cart.ProceedToCheckout")}</button>
                            <button className="btn btn-primary" onClick={() => continueShoppingClick()}>{t("Cart.ContinueShopping")}</button>
                        </div>
                    </div>

                    <div className="d-flex justify-content-center">
                        <span className="text-danger me-1">*</span>= {t("Cart.MandatoryField")}
                    </div>
                </>
            )}

            <ConfirmationDialog showDialog={showClubInfoDialog} title="Information" buttons={ConfirmationDialogButtons.Ok} icon={ConfirmationDialogIcons.Information} width="50"
                okClick={() => setShowClubInfoDialog(false)} closeClick={() => setShowClubInfoDialog(false)}>
                <div>By choosing a specific club when buying a permit, you're directly helping that club groom and maintain the trails you enjoy riding most often, so please buy where you ride and make your selection below.</div>
            </ConfirmationDialog>

            {googleMapKey != undefined && showClubLocatorMapDialog && (
                <ClubLocatorMap showDialog={showClubLocatorMapDialog} closeClick={() => setShowClubLocatorMapDialog(false)}
                    clubLocatorMapSnowmobileId={clubLocatorMapSnowmobileId} googleMapKey={googleMapKey} appContext={appContext}
                    selectClubFromClubLocatorMapSelection={(snowmobileId?: string, selectedClub?: string) => selectClubFromClubLocatorMapSelection(snowmobileId, selectedClub)} />
            )}
        </>
    )

    function getCartItems(): ICartItem[] {
        let result: ICartItem[] = [];

        result = appContext.data?.cartItems ?? [];

        return result;
    }

    function getCartItem(cartItem?: string): ICartItem | undefined {
        let result: ICartItem | undefined = undefined;

        if (cartItem != undefined) {
            result = getCartItems()?.filter(x => x.id === cartItem)[0];
        }

        return result;
    }

    function getShippingFeesData(): IShippingFee[] {
        let result: IShippingFee[] = [];

        if (shippingFeesData != undefined && shippingFeesData.length > 0) {
            let countryKey: string | undefined = "";

            if (appContext.data.cart?.shipTo === ShipTo.Registered) {
                countryKey = appContext.data?.contactInfo?.country?.key;
            } else if (appContext.data.cart?.shipTo === ShipTo.Alternate) {
                countryKey = appContext.data?.cart?.alternateAddress?.country?.key;
            }

            if (countryKey === "CA") {
                result = shippingFeesData.filter(x => x?.name !== "US");
            } else if (countryKey === "US") {
                result = shippingFeesData.filter(x => x?.name === "US");
            }
        }

        return result;
    }

    function getClubsData(): { value?: string, label?: string }[] {
        let result: { value?: string, label?: string }[] = [];

        if (clubsData != undefined && clubsData.length > 0) {
            result = clubsData?.map(x => ({ value: x?.key, label: x?.value }))
        }

        return result;
    }

    function clubLocatorMapDialogShow(snowmobileId?: string): void {
        if (snowmobileId != undefined) {
            setClubLocatorMapSnowmobileId(snowmobileId);
            setShowClubLocatorMapDialog(true);
        }
    }

    function selectClubFromClubLocatorMapSelection(snowmobileId?: string, selectedClub?: string): void {
        if (snowmobileId != undefined && selectedClub != undefined) {
            appContext.updater(draft => {
                const draftSnowmobile: ISnowmobile | undefined = draft.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

                if (draftSnowmobile != undefined) {
                    const clubId: string | undefined = clubsData?.filter(x => x?.value === selectedClub)[0]?.key;

                    if (clubId != undefined && draftSnowmobile.permitSelections != undefined) {
                        draftSnowmobile.permitSelections.clubId = Number(clubId);
                    }
                }
            });
        }
    }

    function getPermitCount(): number {
        let result: number = 0;

        result = getCartItems()?.filter(x => x.isPermit)?.length ?? 0;

        return result;
    }

    function getProcessingFee(): number {
        let result: number = 0;

        // If any gift cards were added to the cart, then the processing fee should be discounted.
        if (getCartItems()?.some(x => x?.isPermit && x?.redemptionCode != undefined)) {
            result = 0;
        } else {
            result = processingFee ?? 0;
        }

        return result;
    }

    function getShippingFee(): number {
        let result: number = 0;

        if (appContext.data.cart?.shipping != undefined && shippingFeesData != undefined && shippingFeesData.length > 0) {
            const item: IShippingFee = shippingFeesData.filter(x => x.id === appContext.data.cart?.shipping)[0];

            if (item != undefined) {
                result = item?.price ?? 0;
            }
        }

        return result;
    }

    function calculateTotal(): number {
        let result: number = 0;

        // Total the price of cart items minus the price of cart items if a gift card was redeemed.
        getCartItems()?.forEach(x => {
            result += x.price;

            if (x?.redemptionCode != undefined) {
                result -= x.price;
            }
        });

        // Add processing fee if there's at least one permit in the cart.
        if (getPermitCount() > 0) {
            result += getProcessingFee();
        }

        // Add shipping fee.
        result += getShippingFee();

        // Add negative tracked shipping discount if tracked shipping is selected and a gift card with tracked shipping is redeemed.
        result += getTrackedShippingDiscount();

        // Adjust total to zero if less than 0.
        if (result < 0) {
            result = 0;
        }

        return result;
    }

    function isTransactionAndAdministrationFeeDiscountVisible(): boolean {
        let result: boolean = false;

        result = getCartItems()?.some(x => x?.isPermit && x?.redemptionCode != undefined);

        return result;
    }

    function isStandardShippingWarningVisible(): boolean {
        let result: boolean = false;

        if (appContext.data.cart?.shipping != undefined) {
            const shippingFee: IShippingFee = shippingFeesData?.filter(x => x?.id === appContext.data.cart?.shipping)[0];

            if (shippingFee != undefined) {
                result = shippingFee?.showConfirmation ?? false;
            }
        }

        return result;
    }

    function isTrackedShippingDiscountVisible(): boolean {
        let result: boolean = false;

        // If Tracked shipping is selected and a gift card with tracked shipping is redeemed, then display tracked shipping discount.
        if (appContext.data.cart?.shipping != undefined && shippingFeesData != undefined && shippingFeesData.length > 0) {
            const shippingFee: IShippingFee | undefined = shippingFeesData.filter(x => x.id === appContext.data.cart?.shipping && x?.isTracked)[0];

            if (shippingFee != undefined && getCartItems()?.some(x => x?.giftCardTrackedShippingAmount != undefined)) {
                result = true;
            }
        }

        return result;
    }

    function getTrackedShippingDiscount(): number {
        let result: number = 0;

        // If Tracked shipping is selected and a gift card with tracked shipping is redeemed, then return tracked shipping discount.
        if (appContext.data.cart?.shipping != undefined && shippingFeesData != undefined && shippingFeesData.length > 0) {
            const shippingFee: IShippingFee | undefined = shippingFeesData.filter(x => x?.id === appContext.data.cart?.shipping && x?.isTracked)[0];

            if (shippingFee != undefined && getCartItems()?.some(x => x?.giftCardTrackedShippingAmount != undefined)) {
                result = -(shippingFee?.price ?? 0);
            }
        }

        return result;
    }

    function removeCartItemClick(cartItemId: string): void {
        appContext.updater(draft => {
            draft.cartItems = draft?.cartItems?.filter(x => x.id !== cartItemId);
        });
    }

    function checkoutClick(): void {
        if (validateCart()) {
            router.push("/checkout");
        }
    }

    function continueShoppingClick(): void {
        router.push("/home");
    }

    function getShipping(): string {
        return appContext.data.cart?.shipping?.toString() ?? "";
    }

    function shippingChange(e: any): void {
        if (e != undefined) {
            appContext.updater(draft => {
                const shippingFee: IShippingFee | undefined = shippingFeesData?.filter(x => x?.id === Number(e?.target?.value ?? 0))[0];

                if (shippingFee != undefined) {
                    draft.cart!.shipping = shippingFee?.id;
                    draft.cart!.isTrackedShipping = shippingFee?.isTracked;
                }
            });

            setIsShippingValid(true);
            setIsStandardShippingWarningValid(true);
        }
    }

    function validateCart(): boolean {
        let result: boolean = true;

        // Validate that all permits has a selected club.
        let isPermitsValid: boolean = true;
        appContext.updater(draft => {
            draft?.cartItems?.filter(x => x.isPermit)?.forEach(ci => {
                const snowmobile: ISnowmobile | undefined = appContext.data?.snowmobiles?.filter(x => x?.oVehicleId === ci?.itemId)[0];

                if (snowmobile != undefined) {
                    ci.uiIsClubValid = snowmobile?.permitSelections?.clubId != undefined;

                    isPermitsValid &&= ci.uiIsClubValid;
                }
            });
        });

        if (!isPermitsValid) {
            result = false;
        }

        // Validate that a shipping method is selected.
        if (appContext.data.cart?.shipping == undefined) {
            setIsShippingValid(false);
            result = false;
        } else {
            setIsShippingValid(true);
        }

        // Validate that standard shipping warning is accepted by user.
        if (isStandardShippingWarningVisible() && standardShippingWarning === false) {
            setIsStandardShippingWarningValid(false);
            result = false;
        } else {
            setIsStandardShippingWarningValid(true);
        }

        // Validate that alternate address fields have values if ship to alternate address is selected.
        if (appContext.data.cart?.shipTo === ShipTo.Alternate) {
            if (appContext.data.cart?.alternateAddress?.addressLine1 == undefined) {
                setIsAddressLine1Valid(false);
                result = false;
            } else {
                setIsAddressLine1Valid(true);
            }

            if (appContext.data.cart?.alternateAddress?.city == undefined) {
                setIsCityValid(false);
                result = false;
            } else {
                setIsCityValid(true);
            }

            if (appContext.data.cart?.alternateAddress?.province == undefined
                || appContext.data.cart?.alternateAddress?.province?.key == undefined
                || appContext.data.cart?.alternateAddress?.province.key === "") {

                setIsProvinceValid(false);
                result = false;
            } else {
                setIsProvinceValid(true);
            }

            if (appContext.data.cart?.alternateAddress?.country == undefined
                || appContext.data.cart?.alternateAddress?.country?.key == undefined
                || appContext.data.cart?.alternateAddress?.country.key === "") {

                setIsCountryValid(false);
                result = false;
            } else {
                setIsCountryValid(true);
            }

            if (appContext.data.cart?.alternateAddress?.postalCode == undefined) {
                setIsPostalCodeValid(false);
                result = false;
            } else {
                setIsPostalCodeValid(true);
            }
        }

        return result;
    }

    function isRedeemGiftCardVisible(snowmobileId?: string): boolean {
        let result: boolean = false;

        // If there are redeemable gift cards, then proceed.
        if (redeemableGiftCards != undefined && ((redeemableGiftCards?.seasonalGiftCards ?? 0) > 0 || (redeemableGiftCards?.classicGiftCards ?? 0) > 0)
            && snowmobileId != undefined) {

            const snowmobile: ISnowmobile | undefined = appContext.data?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

            if (snowmobile != undefined) {
                const permitOption: IPermitOption | undefined = snowmobile?.permitOptions?.filter(x => x?.productId === snowmobile?.permitSelections?.permitOptionId)[0];

                if (permitOption != undefined) {
                    // Show redeem gift card section if the selected permit is not a multi-day permit
                    result = !permitOption?.isMultiDay
                        // and user has a redeemable gift card that can be used for the type of permit they want to purchase.
                        && (snowmobile?.isClassic && (redeemableGiftCards?.classicGiftCards ?? 0) > 0
                            || !snowmobile?.isClassic && (redeemableGiftCards?.seasonalGiftCards ?? 0) > 0);
                }
            }
        }

        return result;
    }

    function removeGiftCardClick(cartItemId?: string): void {
        if (cartItemId != undefined) {
            appContext.updater(draft => {
                const draftCartItem: ICartItem | undefined = draft?.cartItems?.filter(x => x.id === cartItemId)[0];

                if (draftCartItem != undefined) {
                    draftCartItem.redemptionCode = undefined;
                    draftCartItem.giftCardTrackedShippingAmount = undefined;
                }
            });
        }
    }

    function redemptionCodeChange(e: any, cartItemId?: string): void {
        if (e != undefined && cartItemId != undefined) {
            appContext.updater(draft => {
                const draftCartItem: ICartItem | undefined = draft?.cartItems?.filter(x => x.id === cartItemId)[0];

                if (draftCartItem != undefined) {
                    draftCartItem.uiRedemptionCode = e?.target?.value;
                    draftCartItem.uiShowRedemptionCodeNotFound = false;
                    draftCartItem.uiRedemptionCodeErrorMessage = "";
                }
            });
        }
    }

    function redemptionCodeKeyUp(e: any, cartItemId?: string): void {
        if (e != undefined && cartItemId != undefined) {
            if (e.keyCode === 13) {
                e.preventDefault();
                validateGiftCard(cartItemId);
            }
        }
    }

    function validateGiftCard(cartItemId?: string): void {
        if (cartItemId != undefined) {
            const cartItem: ICartItem | undefined = getCartItem(cartItemId);

            if (cartItem != undefined && cartItem.uiRedemptionCode.trim() !== "") {
                setShowAlert(true);

                const apiGetIsValidRedemptionCodeForVehicleRequest: IApiGetIsValidRedemptionCodeForVehicleRequest = {
                    oVehicleId: cartItem.itemId, // oVehicleId for permit items in cart
                    redemptionCode: cartItem.uiRedemptionCode.trim()
                };

                apiGetIsValidRedemptionCodeForVehicle(apiGetIsValidRedemptionCodeForVehicleRequest).subscribe({
                    next: (result: IApiGetIsValidRedemptionCodeForVehicleResult) => {
                        if (result?.isSuccessful) {
                            if (result?.data?.isValid) {
                                appContext.updater(draft => {
                                    const draftCartItem: ICartItem | undefined = draft?.cartItems?.filter(x => x.id === cartItemId)[0];

                                    if (draftCartItem != undefined) {
                                        draftCartItem.redemptionCode = draftCartItem?.uiRedemptionCode;
                                        draftCartItem.giftCardTrackedShippingAmount = -(result?.data?.trackedShippingAmount ?? 0);

                                        draftCartItem.uiRedemptionCode = "";
                                        draftCartItem.uiShowRedemptionCodeNotFound = false;
                                        draftCartItem.uiRedemptionCodeErrorMessage = "";

                                        const shippingFee: IShippingFee | undefined = shippingFeesData?.filter(x => x?.isTracked)[0];

                                        if (shippingFee != undefined) {
                                            draft.cart!.shipping = shippingFee?.id;
                                            draft.cart!.isTrackedShipping = shippingFee?.isTracked;
                                        }
                                    }
                                });
                            } else {
                                appContext.updater(draft => {
                                    const draftCartItem: ICartItem | undefined = draft?.cartItems?.filter(x => x.id === cartItemId)[0];

                                    if (draftCartItem != undefined) {
                                        draftCartItem.redemptionCode = undefined;
                                        draftCartItem.giftCardTrackedShippingAmount = undefined;

                                        draftCartItem.uiShowRedemptionCodeNotFound = true;
                                        draftCartItem.uiRedemptionCodeErrorMessage = getApiErrorMessage(result?.data?.message);
                                    }
                                });
                            }
                        } else {
                            // TODO: What do we do if the call was unsuccessful?
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

    function getShipTo(): number | undefined {
        return appContext.data.cart?.shipTo;
    }

    function shipToAddressChange(shipToLocation: number): void {
        appContext.updater(draft => {
            draft.cart!.shipTo = shipToLocation;

            if (appContext.data?.cart?.alternateAddress?.country == undefined
                || appContext.data?.cart?.alternateAddress?.country?.key === undefined
                || appContext.data?.cart?.alternateAddress?.country.key === "") {

                const country: IKeyValue | undefined = appContext.data?.contactInfo?.country ?? { key: "CA", value: "Canada" };

                if (country != undefined) {
                    draft.cart!.alternateAddress!.country = country;
                }
            }
        });
    }

    function getProvinceData(): IParentKeyValue[] {
        let result: IParentKeyValue[] = [];

        if (provincesData != undefined && provincesData.length > 0) {
            if (appContext.translation.i18n.language === "fr") {
                result = sortArray(provincesData.filter(x => x.parent === appContext.data?.cart?.alternateAddress?.country?.key), ["valueFr"]);
            } else {
                result = sortArray(provincesData.filter(x => x.parent === appContext.data?.cart?.alternateAddress?.country?.key), ["value"]);
            }
        }

        return result;
    }

    function getCountriesData(): IKeyValue[] {
        return countriesData?.filter(x => x?.key !== 'OT');
    }

    function getClubReactSelectClasses(cartItemId?: string): any {
        let result: any = {};

        if (cartItemId != undefined) {
            const cartItem: ICartItem | undefined = getCartItem(cartItemId);

            if (cartItem != undefined) {
                const isClubValid: boolean = (cartItem?.uiIsClubValid == undefined || cartItem?.uiIsClubValid) ? true : false;

                result = {
                    control: () => `react-select-control form-control ${isClubValid ? "" : "is-invalid"}`,
                    input: () => "react-select-input",
                    placeholder: () => "react-select-placeholder",
                    menu: () => "react-select-menu",
                    option: () => "react-select-option"
                };
            }
        }

        return result;
    }

    function getSelectedClub(snowmobileId?: string): { value?: string, label?: string } {
        let result: { value?: string, label?: string } = {} as { value?: string, label?: string };

        if (snowmobileId != undefined) {
            const snowmobile: ISnowmobile | undefined = appContext.data?.snowmobiles?.filter(x => x.oVehicleId === snowmobileId)[0];

            if (snowmobile != undefined) {
                result = getClubsData()?.filter(x => x?.value === snowmobile?.permitSelections?.clubId?.toString())[0];
            }
        }

        return result;
    }

    function permitClubChange(e: any, snowmobileId?: string): void {
        if (snowmobileId != undefined) {
            const snowmobile: ISnowmobile | undefined = appContext.data?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

            if (snowmobile != undefined) {
                const permitSelections: IPermitSelections | undefined = snowmobile?.permitSelections;

                if (permitSelections != undefined) {
                    const apiSavePermitSelectionForVehicleRequest: IApiSavePermitSelectionForVehicleRequest | undefined = {
                        oVehicleId: snowmobileId,
                        oPermitId: permitSelections?.oPermitId ?? getGuid(),
                        permitOptionId: permitSelections?.permitOptionId,
                        dateStart: permitSelections?.dateStart,
                        dateEnd: permitSelections?.dateEnd,
                        clubId: e == undefined ? undefined : Number(e?.value)
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
                            //
                        }
                    });
                }
            }
        }
    }

    function getStringOrUndefined(value?: string): string | undefined {
        return value == undefined || value.trim() === "" ? undefined : value;
    }

    function getAddressLine1(): string {
        return appContext.data?.cart?.alternateAddress?.addressLine1 ?? "";
    }

    function updateAddressLine1(value?: string): void {
        appContext.updater(draft => {
            draft.cart!.alternateAddress!.addressLine1 = getStringOrUndefined(value);
        });
    }

    function getAddressLine2(): string {
        return appContext.data?.cart?.alternateAddress?.addressLine2 ?? "";
    }

    function updateAddressLine2(value?: string): void {
        appContext.updater(draft => {
            draft.cart!.alternateAddress!.addressLine2 = getStringOrUndefined(value);
        });
    }

    function getCity(): string {
        return appContext.data?.cart?.alternateAddress?.city ?? "";
    }

    function updateCity(value?: string): void {
        appContext.updater(draft => {
            draft.cart!.alternateAddress!.city = getStringOrUndefined(value);;
        });
    }

    function getProvince(): string {
        let result: string = "";

        if (appContext.data.cart?.alternateAddress?.country != undefined
            && appContext.data.cart?.alternateAddress?.country?.key != undefined
            && appContext.data.cart?.alternateAddress?.country.key !== ""
            && appContext.data.cart?.alternateAddress?.province != undefined
            && appContext.data.cart?.alternateAddress?.province?.key != undefined
            && appContext.data.cart?.alternateAddress?.province.key !== "") {

            result = appContext.data.cart?.alternateAddress?.country?.key + "|" + appContext.data.cart?.alternateAddress?.province?.key;
        }

        return result;
    }

    function updateProvince(e: any): void {
        appContext.updater(draft => {
            draft.cart!.alternateAddress!.province = getParentKeyValueFromSelect(e) ?? { parent: "", key: "", value: "" };
        });
    }

    function getCountry(): string {
        return appContext.data?.cart?.alternateAddress?.country?.key ?? "";
    }

    function updateCountry(e: any): void {
        appContext.updater(draft => {
            draft.cart!.alternateAddress!.country = getKeyValueFromSelect(e) ?? { key: "", value: "" };
            draft.cart!.alternateAddress!.province = { parent: "", key: "", value: "" };
        });
    }

    function getPostalCode(): string {
        return appContext.data?.cart?.alternateAddress?.postalCode ?? "";
    }

    function updatePostalCode(value?: string): void {
        appContext.updater(draft => {
            draft.cart!.alternateAddress!.postalCode = getStringOrUndefined(value);
        });
    }
}
