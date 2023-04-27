import { useContext, useEffect, useState } from 'react'
import { AppContext, ICartItem, IGiftCardOption } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import { giftCardOptionsData } from '@/custom/data';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { getPageAlertMessage } from '../cart';

export default function GiftCardsPage() {
    const appContext = useContext(AppContext);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "gift-cards" });
    }, [appContext])

    return (
        <AuthenticatedPageLayout>
            <GiftCards></GiftCards>
        </AuthenticatedPageLayout>
    )
}

function GiftCards() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    const [purchaseGiftCard, setPurchaseGiftCard] = useState(false);
    const [giftCardType, setGiftCardType] = useState("");
    const [giftCardLastName, setGiftCardLastName] = useState("");
    const [giftCardPostalCode, setGiftCardPostalCode] = useState("");

    return (
        <>
            <Head>
                <title>Gift Cards | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>Gift Cards</h4>

            {appContext.data?.cartItems != undefined && appContext.data?.cartItems?.length > 0 && (
                <div className="alert alert-primary" role="alert">
                    <div className="d-flex justify-content-between align-items-center flex-wrap flex-sm-wrap flex-md-wrap flex-md-nowrap w-100">
                        <div>
                            <i className="fa-solid fa-cart-shopping fa-xl me-2"></i>
                            {getPageAlertMessage(appContext)}
                        </div>
                        <div>
                            <button type="button" className="btn btn-primary btn-sm mt-2 mt-sm-2 mt-md-0" onClick={() => router.push("/cart")}>Go to Cart</button>
                        </div>
                    </div>
                </div >
            )}

            <div className="fw-semibold">Gift Cards are ideal for those who:</div>
            <ul>
                <li>Do not yet have their vehicle ownership and want to take advantage of early bird fees</li>
                <li>Want to gift a permit for a family member, friend, business associate, customer, etc.</li>
            </ul>

            <div className="fw-semibold">Gift card options based on recipient&apos;s vehicle model year:</div>
            <ul>
                <li>Classic (1999 or older)</li>
                <li>Seasonal (2000 or newer)</li>
            </ul>

            <b>Please note that you can only purchase a maximum of 3 gift cards.</b>

            <div className="mt-3">
                <button className="btn btn-primary btn-sm" onClick={() => setPurchaseGiftCard(true)} disabled={purchaseGiftCard || getGiftCardCountInCart() >= 3}>I want to purchase a gift card</button>

                {getGiftCardCountInCart() >= 3 && (
                    <div className="text-danger fw-semibold mt-3">You have already added the maximum number of gift cards to your cart.</div>
                )}
            </div>

            {purchaseGiftCard && (
                <div className="card mt-3">
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                            <h6 className="card-title">Select a permit to purchase</h6>

                            {giftCardOptionsData != null && giftCardOptionsData.length > 0 && giftCardOptionsData.map(giftCardOption => (
                                <div className="form-check form-check-inline" key={giftCardOption.id}>
                                    <input className="form-check-input" type="radio" name={`gift-cards-${giftCardOption.id}`} id={`gift-cards-${giftCardOption.id}`} checked={giftCardType === giftCardOption.id} value={giftCardOption.id} onChange={(e: any) => setGiftCardType(e.target.value)} />
                                    <label className="form-check-label" htmlFor={`gift-cards-${giftCardOption.id}`}>
                                        {giftCardOption.name} - ${giftCardOption.price}
                                    </label>
                                </div>
                            ))}
                        </li>

                        <li className="list-group-item">
                            <h6 className="mt-2">Recipient Information</h6>

                            <div className="row">
                                <div className="col-12 col-sm-12 col-md-6">
                                    <div className="form-floating mb-2">
                                        <input type="text" className="form-control" id="gift-cards-last-name" placeholder="Recipient's LAST Name ONLY" value={giftCardLastName} onChange={(e: any) => setGiftCardLastName(e.target.value)} />
                                        <label className="required" htmlFor="gift-cards-last-name">Recipient&apos;s LAST Name ONLY</label>
                                    </div>
                                </div>

                                <div className="col-12 col-sm-12 col-md-6">
                                    <div className="form-floating mb-2">
                                        <input type="text" className="form-control" id="gift-cards-postal-code" placeholder="Recipient's Postal Code" value={giftCardPostalCode} onChange={(e: any) => setGiftCardPostalCode(e.target.value)} />
                                        <label className="required" htmlFor="gift-cards-postal-code">Recipient&apos;s Postal Code</label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-danger me-1">*</span>= mandatory field and must match the recipient&apos;s OFSC account information
                            </div>
                        </li>
                    </ul>

                    <div className="card-footer">
                        <button className="btn btn-success btn-sm me-2" onClick={() => addGiftCardToCartClick()} disabled={!isAddToCartButtonEnabled()}>Add to Cart</button>
                        <button className="btn btn-primary btn-sm" onClick={() => cancelAddGiftCardToCartClick()}>Cancel</button>
                    </div>
                </div>
            )}
        </>
    )



    function addGiftCardToCartClick(): void {
        appContext.updater(draft => {
            let giftCardOption: IGiftCardOption | undefined = giftCardOptionsData?.filter(x => x.id === giftCardType)[0];

            if (giftCardOption != undefined) {
                let description: string = `${giftCardOption?.name} Gift Card - ${giftCardLastName} - ${giftCardPostalCode}`;

                let cartItem: ICartItem = {
                    id: uuidv4(),
                    description: description,
                    price: giftCardOption?.price,
                    isPermit: false,
                    isGiftCard: true,
                    snowmobileId: undefined
                };

                draft.cartItems.push(cartItem);
            }
        });

        setPurchaseGiftCard(false);
        setGiftCardType("");
        setGiftCardLastName("");
        setGiftCardPostalCode("");
    }

    function cancelAddGiftCardToCartClick(): void {
        setPurchaseGiftCard(false);
        setGiftCardType("");
        setGiftCardLastName("");
        setGiftCardPostalCode("");
    }

    function isAddToCartButtonEnabled(): boolean {
        let result: boolean = false;

        result = giftCardType !== ""
            && giftCardLastName !== ""
            && giftCardPostalCode !== "";

        return result;
    }

    function getGiftCardCountInCart(): number {
        let result: number = 0;

        result = appContext.data?.cartItems?.filter(x => x.isGiftCard)?.length;

        return result;
    }
}