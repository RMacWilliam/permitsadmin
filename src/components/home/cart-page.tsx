import Head from "next/head";
import { useContext, useState } from 'react';
import { AppContext, ICartItem } from '@/custom/app-context';

export default function CartPage() {
    const appContext = useContext(AppContext);

    const cartItems: ICartItem[] = appContext.data?.cartItems ?? [];

    const [shipping, setShipping] = useState("0");

    return (
        <>
            <Head>
                <title>Cart | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>My Purchases</h4>

            <div className="card mb-2">
                <div className="card-body p-1">
                    <table className="table table-bordered mb-0">
                        <tbody>
                            {cartItems != null && cartItems.length > 0 && cartItems.map(x => (
                                <tr key={x.id}>
                                    <td>
                                        {x.description}
                                    </td>
                                    <td className="text-end">
                                        ${x.price}
                                    </td>
                                    <td>
                                        <button className="btn btn-primary btn-sm" type="button">Redeem Gift Card Here</button>
                                        <button className="btn btn-danger btn-sm ms-1"><i className="fa-solid fa-trash-can"></i></button>
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
                                <td colSpan={2}>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            Shipping
                                        </div>

                                        <div>
                                            <select className="form-select" aria-label="Shipping" value={shipping} onChange={(e: any) => setShipping(e.target.value)}>
                                                <option value="0">Standard - $0</option>
                                                <option value="1">Tracked - $10</option>
                                            </select>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    &nbsp;
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <b>Total</b>
                                </td>
                                <td className="text-end">
                                    <b>{calculateTotal()}</b>
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
    )

    function calculateTotal(): number {
        let result: number = 0;

        if (cartItems != null && cartItems.length > 0) {
            result = cartItems.reduce((subTotal, item) => subTotal + item.price, 0);
        }

        result += 7.50; // TODO: Is Transaction and Administration Fee retrieved from the database?
        result += shipping === "1" ? 10 : 0; // TODO: Are shipping rates retrieved from the database?

        return result;
    }
}
