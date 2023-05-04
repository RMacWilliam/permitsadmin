import ConfirmationDialog from "@/components/confirmation-dialog";
import AuthenticatedPageLayout from "@/components/layouts/authenticated-page"
import { AppContext, IAppContextValues, ICartItem, IShippingMethod } from "@/custom/app-context";
import { shippingMethodsData, transactionAndAdministrationFee } from "@/custom/data";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext, useState } from "react";

export default function CartPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    return (
        <AuthenticatedPageLayout>
            <Cart appContext={appContext} router={router}></Cart>
        </AuthenticatedPageLayout>
    )
}

function Cart({ appContext, router }: { appContext: IAppContextValues, router: NextRouter }) {
    const [shipping, setShipping] = useState("");
    const [pendingShipping, setPendingShipping] = useState("");

    const [showStandardShippingDialog, setShowStandardShippingDialog] = useState(false);

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
                    <div className="card mb-2">
                        <ul className="list-group list-group-flush">
                            {getCartItems().map(cartItem => (
                                <li className="list-group-item" key={cartItem.id}>
                                    <div className="d-flex">
                                        <div className="d-flex flex-fill flex-column">
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
                                                <button className="btn btn-danger btn-sm mt-2 me-2" style={{ width: 150 }} type="button" onClick={() => removeCartItemClick(cartItem.id)}>
                                                    Remove
                                                </button>

                                                {cartItem.isPermit && (
                                                    <button className="btn btn-primary btn-sm mt-2" style={{ width: 150 }} type="button">
                                                        Redeem Gift Card
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="fw-bold ms-3">
                                            ${cartItem.price}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {getPermitCount() > 0 && (
                            <div className="card-footer">
                                <div className="d-flex">
                                    <div className="d-flex flex-fill flex-column">
                                        Permit Transaction and Administration Fee
                                    </div>
                                    <div className="fw-bold ms-3">
                                        $7.50
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card-footer">
                            <div className="d-flex">
                                <div className="d-flex flex-fill align-items-center">
                                    Shipping

                                    <select className="form-select w-50 ms-2" aria-label="Shipping" value={shipping} onChange={(e: any) => shippingChange(e)}>
                                        <option value="" disabled>Please select a value</option>

                                        {shippingMethodsData != undefined && shippingMethodsData.length > 0 && shippingMethodsData.map(shippingMethod => (
                                            <option value={shippingMethod.id} key={shippingMethod.id}>{shippingMethod.name} - ${shippingMethod.price}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="fw-bold ms-3">
                                    ${getShippingPrice()}
                                </div>
                            </div>
                        </div>

                        <div className="card-footer">
                            <div className="d-flex">
                                <div className="d-flex flex-fill flex-column fw-bold">
                                    Total
                                </div>
                                <div className="fw-bold ms-3">
                                    ${calculateTotal()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card mb-2">
                        <div className="card-body">
                            <h6>Ship To</h6>

                            <div className="form-check pt-2">
                                <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" checked />
                                <label className="form-check-label" htmlFor="flexRadioDefault1">
                                    Registered Owner Address
                                </label>
                                <div className="mt-1">
                                    <div>{`${appContext.data?.contactInfo?.firstName} ${appContext.data?.contactInfo?.middleName} ${appContext.data?.contactInfo?.lastName}`}</div>
                                    <div>
                                        <span>{appContext.data?.contactInfo?.addressLine1},</span>
                                        <span className="ms-1">{appContext.data?.contactInfo?.addressLine2},</span>
                                        <span className="ms-1">{appContext.data?.contactInfo?.city}, {appContext.data?.contactInfo?.province?.key}, {appContext.data?.contactInfo?.country?.key},</span>
                                        <span className="ms-1">{appContext.data?.contactInfo?.postalCode}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-check mt-2">
                                <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" />
                                <label className="form-check-label" htmlFor="flexRadioDefault2">
                                    Alternate Address
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body text-center">
                            <button className="btn btn-warning" onClick={() => checkoutClick()}>Proceed to Checkout</button>
                        </div>
                    </div>
                </>
            )}

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

    function getPermitCount(): number {
        let result: number = 0;

        result = getCartItems()?.filter(x => x.isPermit)?.length ?? 0;

        return result;
    }

    function getShippingPrice(): number {
        let result: number = 0;

        if (shipping != undefined && shippingMethodsData != undefined && shippingMethodsData.length > 0) {
            let item: IShippingMethod = shippingMethodsData.filter(x => x.id === shipping)[0];

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

        if (getPermitCount() > 0) {
            result += transactionAndAdministrationFee;
        }

        result += getShippingPrice();

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

    function shippingChange(e: any): void {
        let shippingMethod: IShippingMethod | undefined = shippingMethodsData?.filter(x => x.id === e?.target?.value)[0];

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
}
