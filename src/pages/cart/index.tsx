import ConfirmationDialog from "@/components/confirmation-dialog";
import AuthenticatedPageLayout from "@/components/layouts/authenticated-page"
import { IApiGetClubsResult, IApiGetCountriesResult, IApiGetProcessingFeeResult, IApiGetProvincesResult, IApiGetShippingFeesResult, apiGetClubs, apiGetCountries, apiGetProcessingFee, apiGetProvinces, apiGetRedeemableGiftCardsForUser, apiGetShippingFees } from "@/custom/api";
import { AppContext, IAppContextValues, ICartItem, IKeyValue, IParentKeyValue, IRedeemableGiftCards, IShippingFee, ISnowmobile } from "@/custom/app-context";
import { isRoutePermitted, isUserAuthenticated } from "@/custom/authentication";
import { formatCurrency, getGuid, getKeyValueFromSelect, getParentKeyValueFromSelect, sortArray } from "@/custom/utilities";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Observable, forkJoin } from "rxjs";

export default function CartPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        let authenticated: boolean = isUserAuthenticated(router, appContext);

        if (authenticated) {
            let permitted: boolean = isRoutePermitted(router, appContext, "cart");

            if (permitted) {
                appContext.updater(draft => { draft.navbarPage = "cart" });

                setIsAuthenticated(true);
                setShowAlert(false);
            }
        }
    }, []);

    return (
        <AuthenticatedPageLayout showAlert={showAlert}>
            {isAuthenticated && (
                <Cart appContext={appContext} router={router} setShowAlert={setShowAlert}></Cart>
            )}
        </AuthenticatedPageLayout>
    )
}

enum ShipTo {
    Registered = 0,
    Alternate = 1
}

function Cart({ appContext, router, setShowAlert }: { appContext: IAppContextValues, router: NextRouter, setShowAlert: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [showClubInfoDialog, setShowClubInfoDialog] = useState(false);

    const [shipping, setShipping] = useState("");
    const [pendingShipping, setPendingShipping] = useState("");

    const [showStandardShippingDialog, setShowStandardShippingDialog] = useState(false);

    const [shipTo, setShipTo] = useState(ShipTo.Registered);

    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [city, setCity] = useState("");
    const [province, setProvince] = useState({ parent: "", key: "", value: "" });
    const [country, setCountry] = useState({ key: "", value: "" });
    const [postalCode, setPostalCode] = useState("");

    const [processingFee, setProcessingFee] = useState(0);
    const [shippingFeesData, setShippingFeesData] = useState([] as IShippingFee[])
    const [provincesData, setProvincesData] = useState([] as IParentKeyValue[]);
    const [countriesData, setCountriesData] = useState([] as IKeyValue[]);
    const [redeemableGiftCards, setRedeemableGiftCards] = useState({} as IRedeemableGiftCards);
    const [clubsData, setClubsData] = useState([] as IKeyValue[]);

    useEffect(() => {
        // Get data from api.
        let batchApi: Observable<any>[] = [
            apiGetProcessingFee(),
            apiGetShippingFees(),
            apiGetProvinces(),
            apiGetCountries(),
            apiGetRedeemableGiftCardsForUser(),
            apiGetClubs()
        ];

        forkJoin(batchApi).subscribe({
            next: (results: any[]) => {
                // apiGetProcessingFee
                const apiGetProcessingFeeResult: IApiGetProcessingFeeResult = results[0] as IApiGetProcessingFeeResult;

                if (apiGetProcessingFeeResult != undefined) {
                    setProcessingFee(apiGetProcessingFeeResult?.fee ?? 0);
                }

                // apiGetShippingFees
                const apiGetShippingFeesResult: IApiGetShippingFeesResult[] = results[1] as IApiGetShippingFeesResult[];

                if (apiGetShippingFeesResult != undefined) {
                    let shippingFees: IShippingFee[] = apiGetShippingFeesResult.map<IShippingFee>((x: IApiGetShippingFeesResult) => ({
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
                    let provinces: IParentKeyValue[] = apiGetProvincesResult.map<IParentKeyValue>(x => ({
                        parent: x?.parent ?? "",
                        key: x?.key ?? "",
                        value: x?.value ?? ""
                    }));

                    setProvincesData(provinces);
                }

                // apiGetCountries
                const apiGetCountriesResult: IApiGetCountriesResult[] = results[3] as IApiGetCountriesResult[];

                if (apiGetCountriesResult != undefined) {
                    let countries: IKeyValue[] = apiGetCountriesResult.map<IKeyValue>(x => ({
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
                <title>Cart | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>{appContext.translation?.t("CART.TITLE")}</h4>

            {getCartItems() != undefined && getCartItems().length === 0 && (
                <div>You have not added any items to your cart.</div>
            )}

            {getCartItems() != undefined && getCartItems().length > 0 && (
                <>
                    <div className="card mb-3">
                        <ul className="list-group list-group-flush">
                            {getCartItems().map(cartItem => (
                                <li className="list-group-item" key={cartItem.id}>
                                    <div className="d-flex">
                                        <div className="flex-column flex-fill">
                                            <div>
                                                {cartItem.isPermit && (
                                                    <i className="fa-solid fa-snowflake me-2"></i>
                                                )}
                                                {cartItem.isGiftCard && (
                                                    <i className="fa-solid fa-gift me-2"></i>
                                                )}

                                                {cartItem.description}
                                            </div>

                                            <div>
                                                <button className="btn btn-danger btn-sm mt-2 me-2" style={{ minWidth: 150 }} type="button" onClick={() => removeCartItemClick(cartItem.id)}>
                                                    Remove
                                                </button>
                                            </div>

                                            {cartItem?.isPermit && (
                                                <>
                                                    <div className="card mt-2">
                                                        <div className="card-body">
                                                            {cartItem?.redemptionCode != undefined && (
                                                                <>
                                                                    <div className="d-flex justify-content-between">
                                                                        <div className="fw-bold">Gift card redemption ({cartItem?.redemptionCode})</div>
                                                                        <div className="fw-bold">${formatCurrency(cartItem?.giftCardAmount)}</div>
                                                                    </div>
                                                                    <div>
                                                                        <button className="btn btn-danger btn-sm mt-2 me-2" style={{ minWidth: 150 }} type="button" onClick={() => removeGiftCardClick(cartItem.id)}>
                                                                            Remove Gift Card
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}

                                                            {cartItem?.redemptionCode == undefined && (
                                                                <>
                                                                    <div className="fw-bold mb-2">Redeem Gift Card</div>

                                                                    <div className="d-flex">
                                                                        <div className="flex-column me-auto w-100">
                                                                            <div className="container-fluid">
                                                                                <div className="row">
                                                                                    <div className="col-12 col-md-6 g-0 w-100">
                                                                                        <div className="input-group">
                                                                                            <div className="form-floating">
                                                                                                <input type="text" className="form-control" id={`cart-redemption-code-${cartItem?.itemId}`} placeholder="Enter the redemption code provided on your gift card." value={cartItem?.uiRedemptionCode} onChange={(e: any) => redemptionCodeChange(e, cartItem?.id)} />
                                                                                                <label htmlFor={`cart-redemption-code-${cartItem?.itemId}`}>Enter the redemption code provided on your gift card.</label>
                                                                                            </div>
                                                                                            <button className="btn btn-primary btn-sm" type="button" onClick={() => validateGiftCard(cartItem?.id)}>Validate Gift Card</button>
                                                                                        </div>

                                                                                        {cartItem?.uiShowRedemptionCodeNotFound && (
                                                                                            <div className="text-danger mt-1">Redemption code not found.</div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="card mt-2">
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <h6 className="card-title fw-bold required">Select a Club</h6>
                                                                </div>
                                                                <div>
                                                                    <button type="button" className="btn btn-link p-0" onClick={() => setShowClubInfoDialog(true)}><i className="fa-solid fa-circle-info fa-lg"></i></button>
                                                                </div>
                                                            </div>

                                                            <div className="form-floating mt-1">
                                                                <select className="form-select" id={`cart-club-${cartItem?.itemId}`} aria-label="Club" value={getSelectedClub(cartItem?.itemId)} onChange={(e) => permitClubChange(e, cartItem?.itemId)}>
                                                                    <option value="" disabled key="PLEASE_SELECT">Please select</option>

                                                                    {clubsData != undefined && clubsData.length > 0 && getClubsData().map(club => (
                                                                        <option value={club.key} key={club.key}>{club.value}</option>
                                                                    ))}
                                                                </select>
                                                                <label className="required" htmlFor={`cart-club-${cartItem?.itemId}`}>Club</label>
                                                            </div>

                                                            <div className="btn btn-link text-decoration-none align-baseline text-start border-0 px-0 pb-0" onClick={() => clubLocatorMapDialogShow()}>
                                                                Can't find your club? Use the Club Locator Map and enter the closest town name to get started.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="fw-bold text-end ms-3">
                                            ${formatCurrency(cartItem.price)}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {getPermitCount() > 0 && (
                            <div className="card-footer">
                                <div className="d-flex">
                                    <div className="fw-bold me-auto">
                                        Transaction and Administration Fee
                                    </div>
                                    <div className="fw-bold text-end ms-3">
                                        ${formatCurrency(processingFee)}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card-footer">
                            <div className="fw-bold mb-2">Shipping</div>

                            <div className="d-flex">
                                <div className="flex-column me-auto w-100">
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-12 col-md-6 g-0">
                                                <select className="form-select" aria-label="Shipping" value={shipping} onChange={(e: any) => shippingChange(e)}>
                                                    <option value="">Please select</option>

                                                    {shippingFeesData != undefined && shippingFeesData.length > 0 && getShippingFeesData().map(shippingMethod => (
                                                        <option value={shippingMethod.id} key={shippingMethod.id}>{shippingMethod.name} - ${formatCurrency(shippingMethod.price)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="fw-bold text-end ms-3">
                                    ${formatCurrency(getShippingPrice())}
                                </div>
                            </div>
                        </div>

                        <div className="card-footer">
                            <div className="d-flex">
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
                            <div className="fw-bold mb-2">Ship To</div>

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
                                                    <input type="text" className="form-control" id="alternate-address-address-line-1" placeholder="Address Line 1" value={addressLine1} onChange={(e: any) => setAddressLine1(e.target.value)} />
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
                                                    <input type="text" className="form-control" id="alternate-address-city" placeholder="City, Town, or Village" value={city} onChange={(e: any) => setCity(e.target.value)} />
                                                    <label className="required" htmlFor="alternate-address-city">City, Town, or Village</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-3">
                                                <div className="form-floating mb-2">
                                                    <select className="form-select" id="alternate-address-province" aria-label="Province/State" value={getSelectedProvinceStateOption()} onChange={(e: any) => provinceChange(e)}>
                                                        <option value="" disabled>Please select</option>

                                                        {provincesData != undefined && provincesData.length > 0 && getProvinceData().map(provinceData => (
                                                            <option value={`${country.key}|${provinceData.key}`} key={`${country.key}|${provinceData.key}`}>{provinceData.value}</option>
                                                        ))}
                                                    </select>
                                                    <label className="required" htmlFor="alternate-address-province">Province/State</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-3">
                                                <div className="form-floating mb-2">
                                                    <select className="form-select" id="alternate-address-country" aria-label="Country" value={country.key} onChange={(e: any) => countryChange(e)}>
                                                        <option value="" disabled>Please select</option>

                                                        {countriesData != undefined && countriesData.length > 0 && getCountriesData().map(countryData => (
                                                            <option value={countryData.key} key={countryData.key}>{countryData.value}</option>
                                                        ))}
                                                    </select>
                                                    <label className="required" htmlFor="alternate-address-country">Country</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-3">
                                                <div className="form-floating mb-2">
                                                    <input type="text" className="form-control" id="alternate-address-postal-code" placeholder="Postal/Zip Code" value={postalCode} onChange={(e: any) => setPostalCode(e.target.value)} />
                                                    <label className="required" htmlFor="alternate-address-postal-code">Postal/Zip Code</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body text-center">
                            <button className="btn btn-success" onClick={() => checkoutClick()}>Proceed to Checkout</button>
                        </div>
                    </div>
                </>
            )
            }

            <ConfirmationDialog showDialog={showClubInfoDialog} title="Information" buttons={0} icon="information" width="50"
                okClick={() => setShowClubInfoDialog(false)} closeClick={() => setShowClubInfoDialog(false)}>
                <div>By choosing a specific club when buying a permit, you're directly helping that club groom and maintain the trails you enjoy riding most often, so please buy where you ride and make your selection below.</div>
            </ConfirmationDialog>

            <ConfirmationDialog showDialog={showStandardShippingDialog} title="Shipping Acknowledgement" buttons={2} icon="question" width="50"
                yesClick={() => standardShippingDialogYesClick()} noClick={() => standardShippingDialogNoClick()} closeClick={() => standardShippingDialogNoClick()}>
                <div className="fw-bold mb-2">Are you sure you want standard shipping?</div>
                <div className="">By selecting standard delivery for your permit, you assume all responsibility should your permit get lost or stolen in the mail,
                    or for any other reason that it is not received in the mail, and therefore agree to adhere to all Ministry of Transportation rules
                    for the issuance of a replacement permit.</div>
            </ConfirmationDialog>
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

    function getClubsData(): IKeyValue[] {
        let result: IKeyValue[] = [];

        if (clubsData != undefined && clubsData.length > 0) {
            result = sortArray(clubsData, ["value"]);
        }

        return result;
    }

    function clubLocatorMapDialogShow(): void {

    }

    function getPermitCount(): number {
        let result: number = 0;

        result = getCartItems()?.filter(x => x.isPermit)?.length ?? 0;

        return result;
    }

    function getShippingPrice(): number {
        let result: number = 0;

        if (shipping != undefined && shippingFeesData != undefined && shippingFeesData.length > 0) {
            let item: IShippingFee = shippingFeesData.filter(x => x.id === shipping)[0];

            if (item != undefined) {
                result = item?.price ?? 0;
            }
        }

        return result;
    }

    function calculateTotal(): number {
        let result: number = 0;

        if (getCartItems() != undefined && getCartItems().length > 0) {
            result = getCartItems().reduce((subTotal, item) => subTotal + item.price, 0);
        }

        result += getCartItems().reduce((subTotal, item) => subTotal + (item?.giftCardAmount ?? 0) + (item?.giftCardTrackingShippingAmount ?? 0), 0);

        if (getPermitCount() > 0) {
            result += processingFee;
        }

        result += getShippingPrice();

        if (result < 0) {
            result = 0;
        }

        return result;
    }

    function removeCartItemClick(cartItemId: string): void {
        appContext.updater(draft => {
            draft.cartItems = draft?.cartItems?.filter(x => x.id !== cartItemId);
        });
    }

    function checkoutClick(): void {
        router.push("/checkout");
    }

    function removeGiftCardClick(cartId?: string): void {
        if (cartId != undefined) {
            appContext.updater(draft => {
                let cartItem: ICartItem | undefined = draft?.cartItems?.filter(x => x.id === cartId)[0];

                if (cartItem != undefined) {
                    cartItem.redemptionCode = undefined;
                    cartItem.giftCardAmount = undefined;
                    cartItem.giftCardTrackingShippingAmount = undefined;
                }
            });
        }
    }

    function redemptionCodeChange(e: any, cartId?: string): void {
        if (e != undefined && cartId != undefined) {
            appContext.updater(draft => {
                let cartItem: ICartItem | undefined = draft?.cartItems?.filter(x => x.id === cartId)[0];

                if (cartItem != undefined) {
                    cartItem.uiRedemptionCode = e?.target?.value;
                }
            });
        }
    }

    function validateGiftCard(cartId?: string): void {
        if (cartId != undefined) {
            appContext.updater(draft => {
                let cartItem: ICartItem | undefined = draft?.cartItems?.filter(x => x.id === cartId)[0];

                if (cartItem != undefined) {
                    // TODO: Replace with actual lookup.
                    if (cartItem?.uiRedemptionCode?.startsWith("0")) {
                        cartItem.redemptionCode = undefined;
                        cartItem.giftCardAmount = undefined;
                        cartItem.giftCardTrackingShippingAmount = undefined;

                        cartItem.uiShowRedemptionCodeNotFound = true;
                    } else {
                        cartItem.redemptionCode = cartItem?.uiRedemptionCode;
                        cartItem.giftCardAmount = -Number(cartItem?.price);
                        cartItem.giftCardTrackingShippingAmount = -10;

                        cartItem.uiRedemptionCode = "";
                        cartItem.uiShowRedemptionCodeNotFound = false;
                    }
                }
            });
        }
    }

    function shippingChange(e: any): void {
        let shippingMethod: IShippingFee | undefined = shippingFeesData?.filter(x => x?.id === e?.target?.value)[0];

        if (shippingMethod != undefined) {
            if (shippingMethod.showConfirmation) {
                setPendingShipping(e.target.value);
                setShowStandardShippingDialog(true);
            } else {
                setShipping(e.target.value)
                setPendingShipping("");
            }
        }
    }

    function standardShippingDialogYesClick(): void {
        // Apply confirmed shipping fee.
        setShipping(pendingShipping);
        setPendingShipping("");

        setShowStandardShippingDialog(false);
    }

    function standardShippingDialogNoClick(): void {
        setShowStandardShippingDialog(false);
    }

    function shipToAddressChange(shipToLocation: number): void {
        setShipTo(shipToLocation);

        if (country == undefined || country?.key === undefined || country.key === "") {
            let country: IKeyValue | undefined = appContext.data?.contactInfo?.country ?? { key: "CA", value: "Canada" };

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
            result = sortArray(provincesData.filter(x => x.parent === country.key), ["value"]);
        }

        return result;
    }

    function countryChange(e: any): void {
        setCountry(getKeyValueFromSelect(e) ?? { key: "", value: "" });
        setProvince({ parent: "", key: "", value: "" });
    }

    function getCountriesData(): IKeyValue[] {
        return countriesData;
    }

    function getSelectedClub(snowmobileId?: string): string {
        let result: string = "";

        if (snowmobileId != undefined) {
            let snowmobile: ISnowmobile | undefined = appContext.data?.snowmobiles?.filter(x => x.oVehicleId === snowmobileId)[0];

            if (snowmobile != undefined) {
                result = snowmobile?.permitSelections?.clubId ?? "";
            }
        }

        return result;
    }

    function permitClubChange(e: any, snowmobileId?: string): void {
        if (e != undefined && snowmobileId != undefined) {
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
}
