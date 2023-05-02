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
    const cartItems: ICartItem[] = appContext.data?.cartItems ?? [];

    const [shipping, setShipping] = useState("");

    return (
        <>
            <Head>
                <title>Cart | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>{appContext.translation?.t("CART.TITLE")}</h4>

            {cartItems.length === 0 && (
                <div>You have not added any items to your cart.</div>
            )}

            {cartItems.length > 0 && (
                <>
                    <div className="card mb-2">
                        <div className="card-body p-1">
                            <table className="table table-bordered mb-0">
                                <tbody>
                                    {cartItems != undefined && cartItems.length > 0 && cartItems.map(cartItem => (
                                        <tr key={cartItem.id}>
                                            <td>
                                                <div className="d-flexx justify-content-betweenn">
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
                                            </td>
                                            <td className="text-end">
                                                ${cartItem.price}
                                            </td>
                                        </tr>
                                    ))}

                                    {getPermitCount() > 0 && (
                                        <tr>
                                            <td>
                                                Permit Transaction and Administration Fee
                                            </td>
                                            <td className="text-end">
                                                $7.50
                                            </td>
                                        </tr>
                                    )}

                                    <tr>
                                        <td>
                                            <div className="d-flex justify-content-end align-items-center">
                                                <div className="fw-bold me-2">
                                                    Shipping
                                                </div>

                                                <div>
                                                    <select className="form-select" aria-label="Shipping" value={shipping} onChange={(e: any) => setShipping(e.target.value)}>
                                                        {shippingMethodsData != undefined && shippingMethodsData.length > 0 && shippingMethodsData.map(shippingMethod => (
                                                            <option value={shippingMethod.id} key={shippingMethod.id}>{shippingMethod.name} - ${shippingMethod.price}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="fw-bold text-end">
                                            ${getShippingPrice()}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="fw-bold text-end">
                                            Total
                                        </td>
                                        <td className="text-end">
                                            <b>${calculateTotal()}</b>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <h6>Ship To</h6>

                    <div className="form-check pt-2">
                        <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" checked />
                        <label className="form-check-label" htmlFor="flexRadioDefault1">
                            Registered Owner Address
                        </label>
                    </div>
                    <div className="form-check">
                        <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" />
                        <label className="form-check-label" htmlFor="flexRadioDefault2">
                            Alternate Address
                        </label>
                    </div>

                    <div className="mt-2">
                        <div>{`${appContext.data?.contactInfo?.firstName} ${appContext.data?.contactInfo?.middleName} ${appContext.data?.contactInfo?.lastName}`}</div>
                        <div>{appContext.data?.contactInfo?.addressLine1}</div>
                        <div>{appContext.data?.contactInfo?.addressLine2}</div>
                        <div>{appContext.data?.contactInfo?.city}, {appContext.data?.contactInfo?.province?.key}, {appContext.data?.contactInfo?.country?.key}</div>
                        <div>{appContext.data?.contactInfo?.postalCode}</div>
                    </div>

                    <button className="btn btn-warning mt-3">Checkout</button>
                </>
            )}
        </>
    )

    function getPermitCount(): number {
        let result: number = 0;

        result = cartItems?.filter(x => x.isPermit)?.length ?? 0;

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

        if (cartItems != undefined && cartItems.length > 0) {
            result = cartItems.reduce((subTotal, item) => subTotal + item.price, 0);
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
}

export function getPageAlertMessage(appContext: IAppContextValues): string {
    let result: string = "";

    let permitCount: number = appContext.data?.cartItems?.filter(x => x.isPermit)?.length ?? 0;
    let giftCardCount: number = appContext.data?.cartItems?.filter(x => x.isGiftCard)?.length ?? 0;

    if (permitCount > 0 || giftCardCount > 0) {
        result = "You have ";

        if (permitCount > 0) {
            result += permitCount.toString() + (permitCount === 1 ? " permit " : " permits ");
        }

        if (giftCardCount > 0) {
            if (permitCount > 0) {
                result += "and ";
            }

            result += giftCardCount.toString() + (giftCardCount === 1 ? " gift card " : " gift cards ");
        }

        result += "in your cart.";
    }

    return result;
}