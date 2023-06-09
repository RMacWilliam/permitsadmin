import ConfirmationDialog from "@/components/confirmation-dialog";
import AuthenticatedPageLayout from "@/components/layouts/authenticated-page"
import { IApiGetClubsResult, IApiGetCountriesResult, IApiGetProcessingFeeResult, IApiGetProvincesResult, IApiGetShippingFeesResult, apiGetClubs, apiGetCountries, apiGetProcessingFee, apiGetProvinces, apiGetRedeemableGiftCardsForUser, apiGetShippingFees, IApiSavePermitSelectionForVehicleRequest, apiSavePermitSelectionForVehicle, IApiSavePermitSelectionForVehicleResult, apiGetGoogleMapKey, IApiGetGoogleMapKeyResult } from "@/custom/api";
import { AppContext, IAppContextValues, ICartItem, IKeyValue, IParentKeyValue, IRedeemableGiftCards, IShippingFee, ISnowmobile, IPermitSelections } from "@/custom/app-context";
import { formatCurrency, getGuid, getKeyValueFromSelect, getParentKeyValueFromSelect } from "@/custom/utilities";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Observable, Subscription, forkJoin } from "rxjs";
import Select from 'react-select';
import { Constants } from "../../../constants";
import ClubLocatorMap from "./club-locator-map";

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

enum ShipTo {
    Registered = 0,
    Alternate = 1
}

function Cart({ appContext, router, setShowAlert }:
    {
        appContext: IAppContextValues,
        router: NextRouter,
        setShowAlert: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [showClubInfoDialog, setShowClubInfoDialog] = useState(false);

    const [showClubLocatorMapDialog, setShowClubLocatorMapDialog] = useState(false);
    const [clubLocatorMapSnowmobileId, setClubLocatorMapSnowmobileId] = useState("");

    const [shipping, setShipping] = useState("");
    const [isShippingValid, setIsShippingValid] = useState(true);

    const [standardShippingWarning, setStandardShippingWarning] = useState(false);
    const [isStandardShippingWarningValid, setIsStandardShippingWarningValid] = useState(true);

    const [shipTo, setShipTo] = useState(ShipTo.Registered);

    const [addressLine1, setAddressLine1] = useState("");
    const [isAddressLine1Valid, setIsAddressLine1Valid] = useState(true);

    const [addressLine2, setAddressLine2] = useState("");

    const [city, setCity] = useState("");
    const [isCityValid, setIsCityValid] = useState(true);

    const [province, setProvince] = useState({ parent: "", key: "", value: "" });
    const [isProvinceValid, setIsProvinceValid] = useState(true);

    const [country, setCountry] = useState({ key: "", value: "" });
    const [isCountryValid, setIsCountryValid] = useState(true);

    const [postalCode, setPostalCode] = useState("");
    const [isPostalCodeValid, setIsPostalCodeValid] = useState(true);

    const [processingFee, setProcessingFee] = useState(0);
    const [shippingFeesData, setShippingFeesData] = useState([] as IShippingFee[])
    const [provincesData, setProvincesData] = useState([] as IParentKeyValue[]);
    const [countriesData, setCountriesData] = useState([] as IKeyValue[]);
    const [redeemableGiftCards, setRedeemableGiftCards] = useState({} as IRedeemableGiftCards);
    const [clubsData, setClubsData] = useState([] as IKeyValue[]);

    const [googleMapKey, setGoogleMapKey] = useState(undefined as string | undefined);

    const t: Function = appContext.translation.t;

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

                if (apiGetShippingFeesResult != undefined) {
                    const shippingFees: IShippingFee[] = apiGetShippingFeesResult.map<IShippingFee>((x: IApiGetShippingFeesResult) => ({
                        id: x?.id,
                        name: x?.name,
                        price: x?.price,
                        showConfirmation: x?.showConfirmation
                    }));

                    setShippingFeesData(shippingFees);
                }

                // apiGetProvinces
                const apiGetProvincesResult: IApiGetProvincesResult[] = results[2] as IApiGetProvincesResult[];

                if (apiGetProvincesResult != undefined) {
                    const provinces: IParentKeyValue[] = apiGetProvincesResult.map<IParentKeyValue>(x => ({
                        parent: x?.parent ?? "",
                        key: x?.key ?? "",
                        value: x?.value ?? ""
                    }));

                    setProvincesData(provinces);
                }

                // apiGetCountries
                const apiGetCountriesResult: IApiGetCountriesResult[] = results[3] as IApiGetCountriesResult[];

                if (apiGetCountriesResult != undefined) {
                    const countries: IKeyValue[] = apiGetCountriesResult.map<IKeyValue>(x => ({
                        key: x?.key ?? "",
                        value: x?.value ?? ""
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

                setShowAlert(false);
            },
            error: (error: any) => {
                console.log(error);

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
                <title>{t("Cart.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h4>{t("Cart.Title")}</h4>

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
                                            <span className="me-2">
                                                {cartItem.isPermit && (
                                                    <i className="fa-solid fa-snowflake me-2"></i>
                                                )}
                                                {cartItem.isGiftCard && (
                                                    <i className="fa-solid fa-gift me-2"></i>
                                                )}

                                                {appContext.translation?.i18n?.language === "fr" && (
                                                    <span>{cartItem.descriptionFr}</span>
                                                )}
                                                {appContext.translation?.i18n?.language === "en" && (
                                                    <span>{cartItem.description}</span>
                                                )}
                                            </span>

                                            <button className="btn btn-link text-danger" style={{ display: "contents" }} type="button" onClick={() => removeCartItemClick(cartItem.id)}>
                                                Remove
                                            </button>
                                        </div>
                                        <div className="fw-bold text-end ms-3">
                                            ${formatCurrency(cartItem.price)}
                                        </div>
                                    </div>
                                    <div className="d-flex">
                                        <div className="flex-column flex-fill w-100">
                                            {cartItem?.isPermit && (
                                                <>
                                                    {isRedeemGiftCardVisible(cartItem?.itemId) && (
                                                        <div className="card mt-2">
                                                            <div className="card-body footer-color">
                                                                {cartItem?.redemptionCode != undefined && (
                                                                    <div className="d-flex justify-content-between flex-wrap gap-2">
                                                                        <div className="fw-semibold w-100">
                                                                            <span className="me-2">Gift card redemption ({cartItem?.redemptionCode})</span>

                                                                            <a className="btn btn-link text-danger" style={{ display: "contents" }} type="button" onClick={() => removeGiftCardClick(cartItem.id)}>
                                                                                Remove
                                                                            </a>
                                                                        </div>

                                                                        <div className="fw-bold text-danger text-end ms-auto">${formatCurrency(cartItem?.giftCardAmount)}</div>
                                                                    </div>
                                                                )}

                                                                {cartItem?.redemptionCode == undefined && (
                                                                    <>
                                                                        <div className="fw-semibold mb-2">Redeem Gift Card</div>

                                                                        <div className="d-flex flex-column gap-2">
                                                                            <div className="input-group">
                                                                                <input type="text" className="form-control" id={`cart-redemption-code-${cartItem?.itemId}`} placeholder="Enter gift card redemption code" value={cartItem?.uiRedemptionCode} onChange={(e: any) => redemptionCodeChange(e, cartItem?.id)} />
                                                                                <button className="btn btn-outline-primary d-none d-sm-block" type="button" onClick={() => validateGiftCard(cartItem?.id)}>Validate</button>
                                                                            </div>

                                                                            <button className="btn btn-outline-primary btn-sm d-sm-none" type="button" onClick={() => validateGiftCard(cartItem?.id)}>Validate</button>

                                                                            {cartItem?.uiShowRedemptionCodeNotFound && (
                                                                                <div className="text-danger">Redemption code not found.</div>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="card mt-2">
                                                        <div className="card-body footer-color">
                                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                                <div className="d-flex flex-fill align-items-center">
                                                                    <div className="fw-semibold required">Select a Club</div>
                                                                    <button type="button" className="btn btn-link p-0 ms-2" onClick={() => setShowClubInfoDialog(true)}><i className="fa-solid fa-circle-info fa-lg"></i></button>
                                                                </div>

                                                                <div className="d-none d-sm-block">
                                                                    <button type="button" className="btn btn-link text-decoration-none p-0" onClick={() => clubLocatorMapDialogShow(cartItem?.itemId)}><i className="fa-solid fa-map fa-lg me-2"></i>Use Club Locator Map</button>
                                                                </div>
                                                            </div>

                                                            <div className="mt-2">
                                                                <Select id={`cart-club-${cartItem?.itemId}`} className="react-select" aria-label="Club" classNames={getClubReactSelectClasses(cartItem?.id)} isClearable={true} placeholder={t("Common.PleaseSelect")} options={getClubsData()} value={getSelectedClub(cartItem?.itemId)} onChange={(e: any) => permitClubChange(e, cartItem?.itemId)} />
                                                                <button type="button" className="btn btn-link text-decoration-none d-sm-none p-0 mt-2" onClick={() => clubLocatorMapDialogShow(cartItem?.itemId)}><i className="fa-solid fa-map fa-lg me-2"></i>Use Club Locator Map</button>
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
                                            Transaction and Administration Fee
                                        </div>
                                        <div className="fw-bold text-end ms-3">
                                            ${formatCurrency(processingFee)}
                                        </div>
                                    </div>

                                    {isTransactionAndAdministrationFeeDiscountVisible() && (
                                        <div className="card mt-2">
                                            <div className="card-body footer-color">
                                                <div className="d-flex justify-content-between flex-wrap gap-2">
                                                    <div className="fw-semibold w-100">
                                                        Transaction and Administration Fee Discount
                                                    </div>

                                                    <div className="fw-bold text-danger text-end ms-auto">$-{formatCurrency(processingFee)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            )}

                            <li className="list-group-item">
                                <div className="fw-semibold mb-2 required">Shipping</div>

                                <div className="d-flex">
                                    <div className="flex-column me-auto w-100">
                                        <select className={`form-select ${isShippingValid ? "" : "is-invalid"}`} aria-label="Shipping" value={shipping} onChange={(e: any) => shippingChange(e)}>
                                            <option value="">{t("Common.PleaseSelect")}</option>

                                            {shippingFeesData != undefined && shippingFeesData.length > 0 && getShippingFeesData().map(shippingMethod => (
                                                <option value={shippingMethod.id} key={shippingMethod.id}>{shippingMethod.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="fw-bold text-end ms-3">
                                        ${formatCurrency(getShippingFee())}
                                    </div>
                                </div>

                                {isStandardShippingWarningVisible() && (
                                    <div className="form-check mt-2">
                                        <input className={`form-check-input ${isStandardShippingWarningValid ? "" : "is-invalid"}`} type="checkbox" value="" id="cart-standard-shipping-verification" defaultChecked={standardShippingWarning} onChange={(e: any) => { setStandardShippingWarning(e.target.checked) }} />
                                        <label className="form-check-label required" htmlFor="cart-standard-shipping-verification">
                                            By selecting standard delivery for my permit, I assume all responsibility should my permit get lost or stolen in the mail,
                                            or for any other reason that it is not received in the mail, and therefore agree to adhere to all Ministry of Transportation rules
                                            for the issuance of a replacement permit.
                                        </label>
                                    </div>
                                )}

                                {isTrackedShippingDiscountVisible() && (
                                    <div className="card mt-2">
                                        <div className="card-body footer-color">
                                            <div className="d-flex justify-content-between flex-wrap gap-2">
                                                <div className="fw-semibold w-100">
                                                    Tracked Shipping Discount
                                                </div>

                                                <div className="fw-bold text-danger text-end ms-auto">${formatCurrency(getTrackedShippingDiscount())}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </li>
                        </ul>

                        <div className="card-footer">
                            <div className="d-flex fs-5">
                                <div className="fw-bold me-auto">
                                    Total
                                </div>
                                <div className="fw-bold text-end ms-3">
                                    ${formatCurrency(calculateTotal())}
                                </div>
                            </div>
                        </div>
                    </div >

                    <div className="card mb-3">
                        <div className="card-body">
                            <div className="fw-semibold mb-2">Ship To</div>

                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="shipTo" id="shipToRegistered" checked={shipTo === ShipTo.Registered} value={ShipTo.Registered} onChange={() => shipToAddressChange(ShipTo.Registered)} />
                                <label className="form-check-label" htmlFor="shipToRegistered">
                                    Registered Owner Address
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
                                <input className="form-check-input" type="radio" name="shipTo" id="shipToAlternate" checked={shipTo === ShipTo.Alternate} value={ShipTo.Alternate} onChange={() => shipToAddressChange(ShipTo.Alternate)} />
                                <label className="form-check-label" htmlFor="shipToAlternate">
                                    Alternate Address
                                </label>

                                {shipTo === ShipTo.Alternate && (
                                    <div className="container-fluid mt-1">
                                        <div className="row">
                                            <div className="col-12 col-sm-12 col-md-6">
                                                <div className="form-floating mb-2">
                                                    <input type="text" className={`form-control ${isAddressLine1Valid ? "" : "is-invalid"}`} id="alternate-address-address-line-1" placeholder="Address Line 1" value={addressLine1} onChange={(e: any) => setAddressLine1(e.target.value)} />
                                                    <label className="required" htmlFor="alternate-address-address-line-1">Address Line 1</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-6">
                                                <div className="form-floating mb-2">
                                                    <input type="text" className="form-control" id="alternate-address-address-line-2" placeholder="Address Line 2" value={addressLine2} onChange={(e: any) => setAddressLine2(e.target.value)} />
                                                    <label htmlFor="alternate-address-address-line-2">Address Line 2</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-12 col-sm-12 col-md-3">
                                                <div className="form-floating mb-2">
                                                    <input type="text" className={`form-control ${isCityValid ? "" : "is-invalid"}`} id="alternate-address-city" placeholder="City, Town, or Village" value={city} onChange={(e: any) => setCity(e.target.value)} />
                                                    <label className="required" htmlFor="alternate-address-city">City, Town, or Village</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-3">
                                                <div className="form-floating mb-2">
                                                    <select className={`form-select ${isProvinceValid ? "" : "is-invalid"}`} id="alternate-address-province" aria-label="Province/State" value={getSelectedProvinceStateOption()} onChange={(e: any) => provinceChange(e)}>
                                                        <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                                        {provincesData != undefined && provincesData.length > 0 && getProvinceData().map(provinceData => (
                                                            <option value={`${country.key}|${provinceData.key}`} key={`${country.key}|${provinceData.key}`}>{provinceData.value}</option>
                                                        ))}
                                                    </select>
                                                    <label className="required" htmlFor="alternate-address-province">Province/State</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-3">
                                                <div className="form-floating mb-2">
                                                    <select className={`form-select ${isCountryValid ? "" : "is-invalid"}`} id="alternate-address-country" aria-label="Country" value={country.key} onChange={(e: any) => countryChange(e)}>
                                                        <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                                        {countriesData != undefined && countriesData.length > 0 && getCountriesData().map(countryData => (
                                                            <option value={countryData.key} key={countryData.key}>{countryData.value}</option>
                                                        ))}
                                                    </select>
                                                    <label className="required" htmlFor="alternate-address-country">Country</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-3">
                                                <div className="form-floating mb-2">
                                                    <input type="text" className={`form-control ${isPostalCodeValid ? "" : "is-invalid"}`} id="alternate-address-postal-code" placeholder="Postal/Zip Code" value={postalCode} onChange={(e: any) => setPostalCode(e.target.value)} />
                                                    <label className="required" htmlFor="alternate-address-postal-code">Postal/Zip Code</label>
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
                            <button className="btn btn-success" onClick={() => checkoutClick()}>Proceed to Checkout</button>
                            <button className="btn btn-success" onClick={() => continueShoppingClick()}>Continue Shopping</button>
                        </div>
                    </div>

                    <div className="d-flex justify-content-center">
                        <span className="text-danger me-1">*</span>= mandatory field
                    </div>
                </>
            )}

            <ConfirmationDialog showDialog={showClubInfoDialog} title="Information" buttons={0} icon="information" width="50"
                okClick={() => setShowClubInfoDialog(false)} closeClick={() => setShowClubInfoDialog(false)}>
                <div>By choosing a specific club when buying a permit, you're directly helping that club groom and maintain the trails you enjoy riding most often, so please buy where you ride and make your selection below.</div>
            </ConfirmationDialog>

            {googleMapKey != undefined && (
                <ClubLocatorMap showDialog={showClubLocatorMapDialog} closeClick={() => setShowClubLocatorMapDialog(false)}
                    clubLocatorMapSnowmobileId={clubLocatorMapSnowmobileId} googleMapKey={googleMapKey}
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

            if (shipTo === ShipTo.Registered) {
                countryKey = appContext.data?.contactInfo?.country?.key;
            } else if (shipTo === ShipTo.Alternate) {
                countryKey = country?.key;
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

        if (shipping != undefined && shippingFeesData != undefined && shippingFeesData.length > 0) {
            const item: IShippingFee = shippingFeesData.filter(x => x.id === shipping)[0];

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

        if (shipping != undefined) {
            const shippingFee: IShippingFee = shippingFeesData?.filter(x => x?.id === shipping)[0];

            if (shippingFee != undefined) {
                result = shippingFee?.showConfirmation ?? false;
            }
        }

        return result;
    }

    function isTrackedShippingDiscountVisible(): boolean {
        let result: boolean = false;

        // If Tracked shipping is selected and a gift card with tracked shipping is redeemed, then display tracked shipping discount.
        if (shipping != undefined && shippingFeesData != undefined && shippingFeesData.length > 0) {
            const item: IShippingFee = shippingFeesData.filter(x => x.id === shipping)[0];

            if (item != undefined && item?.name === "Tracked"
                && getCartItems()?.some(x => x?.giftCardTrackingShippingAmount != undefined)) {

                result = true;
            }
        }

        return result;
    }

    function getTrackedShippingDiscount(): number {
        let result: number = 0;

        // If Tracked shipping is selected and a gift card with tracked shipping is redeemed, then return tracked shipping discount.
        if (shipping != undefined && shippingFeesData != undefined && shippingFeesData.length > 0) {
            const item: IShippingFee = shippingFeesData.filter(x => x.id === shipping)[0];

            if (item != undefined && item?.name === "Tracked"
                && getCartItems()?.some(x => x?.giftCardTrackingShippingAmount != undefined)) {

                result = -(item?.price ?? 0);
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
        } else {

        }
    }

    function continueShoppingClick(): void {
        router.push("/home");
    }

    function shippingChange(e: any): void {
        if (e != undefined) {
            setShipping(e?.target?.value ?? "");

            setIsShippingValid(true);
            setIsStandardShippingWarningValid(true);
        }
    }

    function validateCart(): boolean {
        let isValid: boolean = true;

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
            isValid = false;
        }

        // Validate that a shipping method is selected.
        if (shipping === "") {
            setIsShippingValid(false);
            isValid = false;
        } else {
            setIsShippingValid(true);
        }

        // Validate that standard shipping warning is accepted by user.
        if (isStandardShippingWarningVisible() && standardShippingWarning === false) {
            setIsStandardShippingWarningValid(false);
            isValid = false;
        } else {
            setIsStandardShippingWarningValid(true);
        }

        // Validate that alternate address fields have values if ship to alternate address is selected.
        if (shipTo === ShipTo.Alternate) {
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
        }

        return isValid;
    }

    function isRedeemGiftCardVisible(snowmobileId?: string): boolean {
        let result: boolean = false;

        if (redeemableGiftCards != undefined && ((redeemableGiftCards?.seasonalGiftCards ?? 0) > 0 || (redeemableGiftCards?.classicGiftCards ?? 0) > 0)
            && snowmobileId != undefined) {

            const snowmobile: ISnowmobile | undefined = appContext.data?.snowmobiles?.filter(x => x?.oVehicleId === snowmobileId)[0];

            if (snowmobile != undefined) {
                result = snowmobile?.isClassic && (redeemableGiftCards?.classicGiftCards ?? 0) > 0
                    || !snowmobile?.isClassic && (redeemableGiftCards?.seasonalGiftCards ?? 0) > 0;
            }
        }

        return (redeemableGiftCards != undefined && ((redeemableGiftCards?.seasonalGiftCards ?? 0) > 0 || (redeemableGiftCards?.classicGiftCards ?? 0) > 0)) ?? false;
    }

    function removeGiftCardClick(cartItemId?: string): void {
        if (cartItemId != undefined) {
            appContext.updater(draft => {
                const draftCartItem: ICartItem | undefined = draft?.cartItems?.filter(x => x.id === cartItemId)[0];

                if (draftCartItem != undefined) {
                    draftCartItem.redemptionCode = undefined;
                    draftCartItem.giftCardAmount = undefined;
                    draftCartItem.giftCardTrackingShippingAmount = undefined;
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
                }
            });
        }
    }

    function validateGiftCard(cartItemId?: string): void {
        if (cartItemId != undefined) {
            appContext.updater(draft => {
                const draftCartItem: ICartItem | undefined = draft?.cartItems?.filter(x => x.id === cartItemId)[0];

                if (draftCartItem != undefined) {
                    // TODO: Replace with actual lookup.
                    if (draftCartItem?.uiRedemptionCode?.startsWith("0")) {
                        draftCartItem.redemptionCode = undefined;
                        draftCartItem.giftCardAmount = undefined;
                        draftCartItem.giftCardTrackingShippingAmount = undefined;

                        draftCartItem.uiShowRedemptionCodeNotFound = true;
                    } else {
                        draftCartItem.redemptionCode = draftCartItem?.uiRedemptionCode;
                        draftCartItem.giftCardAmount = -Number(draftCartItem?.price);
                        draftCartItem.giftCardTrackingShippingAmount = -10;

                        draftCartItem.uiRedemptionCode = "";
                        draftCartItem.uiShowRedemptionCodeNotFound = false;

                        const trackedShipping: string | undefined = shippingFeesData?.filter(x => x?.name === "Tracked")[0]?.id;

                        if (trackedShipping != undefined) {
                            setShipping(trackedShipping);
                        }
                    }
                }
            });
        }
    }

    function shipToAddressChange(shipToLocation: number): void {
        setShipTo(shipToLocation);

        if (country == undefined || country?.key === undefined || country.key === "") {
            const country: IKeyValue | undefined = appContext.data?.contactInfo?.country ?? { key: "CA", value: "Canada" };

            if (country != undefined) {
                setCountry({ key: country.key, value: country.value });
            }
        }
    }

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
