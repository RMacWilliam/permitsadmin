import AuthenticatedPageLayout from "@/components/layouts/authenticated-page"
import { AppContext, ICartItem, IShippingMethod } from "@/custom/app-context";
import { shippingMethodsData, transactionAndAdministrationFee } from "@/custom/data";
import Head from "next/head";
import { useContext, useState } from "react";

export default function CartPage() {
    return (
        <AuthenticatedPageLayout>
            <Cart></Cart>
        </AuthenticatedPageLayout>
    )
}

function Cart() {
    const appContext = useContext(AppContext);

    const cartItems: ICartItem[] = appContext.data?.cartItems ?? [];

    const [shipping, setShipping] = useState("");

    return (
        <>
            <Head>
                <title>Cart | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>My Purchases</h4>

            {cartItems.length === 0 && (
                <div>You have not added any items to your cart.</div>
            )}

            {cartItems.length > 0 && (
                <>
                    <div className="card mb-2">
                        <div className="card-body p-1">
                            <table className="table table-bordered mb-0">
                                <tbody>
                                    {cartItems != null && cartItems.length > 0 && cartItems.map(cartItem => (
                                        <tr key={cartItem.id}>
                                            <td>
                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        {cartItem.description}
                                                    </div>
                                                    <div>
                                                        <button className="btn btn-danger btn-sm ms-1" onClick={() => removeCartItemClick(cartItem.id)}>
                                                            <span className="d-none d-sm-none d-md-block">Remove</span>
                                                            <span className="d-md-none"><i className="fa-solid fa-xmark"></i></span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-end">
                                                ${cartItem.price}
                                            </td>
                                            <td className="text-center">
                                                <button className="btn btn-primary btn-sm" type="button">Redeem Gift Card</button>
                                            </td>
                                        </tr>
                                    ))}

                                    <tr>
                                        <td>
                                            Transaction and Administration Fee
                                        </td>
                                        <td className="text-end">
                                            $7.50
                                        </td>
                                        <td>
                                            &nbsp;
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <div className="d-flex justify-content-end align-items-center">
                                                <div className="fw-bold me-2">
                                                    Shipping
                                                </div>

                                                <div>
                                                    <select className="form-select" aria-label="Shipping" value={shipping} onChange={(e: any) => setShipping(e.target.value)}>
                                                        {shippingMethodsData != null && shippingMethodsData.length > 0 && shippingMethodsData.map(shippingMethod => (
                                                            <option value={shippingMethod.id} key={shippingMethod.id}>{shippingMethod.name} - ${shippingMethod.price}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="fw-bold text-end">
                                            ${getShippingPrice()}
                                        </td>
                                        <td>
                                            &nbsp;
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="fw-bold text-end">
                                            Total
                                        </td>
                                        <td className="text-end">
                                            <b>${calculateTotal()}</b>
                                        </td>
                                        <td>
                                            &nbsp;
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

    function getShippingPrice(): number {
        let result: number = 0;

        if (shipping != null && shippingMethodsData != null && shippingMethodsData.length > 0) {
            let item: IShippingMethod = shippingMethodsData.filter(x => x.id === shipping)[0];

            if (item != null) {
                result = item.price;
            }
        }

        return result;
    }

    function calculateTotal(): number {
        let result: number = 0;

        if (cartItems != null && cartItems.length > 0) {
            result = cartItems.reduce((subTotal, item) => subTotal + item.price, 0);
        }

        result += transactionAndAdministrationFee;
        result += getShippingPrice();

        return result;
    }

    function removeCartItemClick(id: string): void {
        appContext.updater(draft => {
            draft.cartItems = draft.cartItems.filter(x => x.id !== id);
        });
    }
}
