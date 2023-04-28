import { useContext, useEffect, useState } from 'react'
import { AppContext, ICartItem, IGiftCard, IGiftCardOption } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import { giftCardOptionsData, giftCardsData } from '@/custom/data';
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

    const giftCards: IGiftCard[] = appContext.data?.giftCards ?? [];

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
                <button className="btn btn-primary btn-sm" onClick={() => purchaseGiftCardClick()} disabled={getGiftCardCount() >= 3}>I want to purchase a gift card</button>

                {getGiftCardCount() >= 3 && (
                    <div className="text-danger fw-semibold mt-3">You have already added the maximum number of gift cards to your cart.</div>
                )}
            </div>

            {giftCards && giftCards.length > 0 && giftCards.map(giftCard => (
                <div className="card mt-3" key={giftCard.id}>
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                            <h6 className="card-title">Select a permit to purchase</h6>

                            {giftCardOptionsData != null && giftCardOptionsData.length > 0 && giftCardOptionsData.map(giftCardOption => (
                                <div className="form-check form-check-inline" key={giftCardOption.id}>
                                    <input className="form-check-input" type="radio" name={`gift-cards-permit-options-${giftCard.id}-${giftCardOption.id}`} id={`gift-cards-permit-options-${giftCard.id}-${giftCardOption.id}`} checked={giftCard.giftCardOptionId === giftCardOption.id} value={giftCardOption.id} onChange={(e: any) => giftCardOptionChange(e, giftCard.id)} disabled={!giftCard?.isEditable} />
                                    <label className="form-check-label" htmlFor={`gift-cards-permit-options-${giftCard.id}-${giftCardOption.id}`}>
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
                                        <input type="text" className="form-control" id="gift-cards-last-name-${giftCard.id}" placeholder="Recipient's LAST Name ONLY" value={giftCard.lastName} onChange={(e: any) => giftCardLastNameChange(e, giftCard.id)} />
                                        <label className="required" htmlFor="gift-cards-last-name-${giftCard.id}">Recipient&apos;s LAST Name ONLY</label>
                                    </div>
                                </div>

                                <div className="col-12 col-sm-12 col-md-6">
                                    <div className="form-floating mb-2">
                                        <input type="text" className="form-control" id="gift-cards-postal-code-${giftCard.id}" placeholder="Recipient's Postal Code" value={giftCard.postalCode} onChange={(e: any) => giftCardPostalCodeChange(e, giftCard.id)} />
                                        <label className="required" htmlFor="gift-cards-postal-code-${giftCard.id}">Recipient&apos;s Postal Code</label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-danger me-1">*</span>= mandatory field and must match the recipient&apos;s OFSC account information
                            </div>
                        </li>
                    </ul>

                    <div className="card-footer">
                        {giftCard.isEditable && !isGiftCardAddedToCart(giftCard.id) && (
                            <button className="btn btn-success btn-sm me-2" onClick={() => addGiftCardToCartClick(giftCard.id)} disabled={!isAddToCartButtonEnabled(giftCard.id)}>Add Gift Card to Cart</button>
                        )}

                        {giftCard.isEditable && isGiftCardAddedToCart(giftCard.id) && (
                            <button className="btn btn-danger btn-sm" onClick={() => removeGiftCardFromCartClick(giftCard.id)}>Remove Gift Card from Cart</button>
                        )}

                        {!giftCard.isEditable && (
                            <button className="btn btn-primary btn-sm" onClick={() => saveGiftCardChangesClick(giftCard.id)}>Save Changes</button>
                        )}

                        {giftCard.isEditable && !isGiftCardAddedToCart(giftCard.id) && (
                            <button className="btn btn-primary btn-sm" onClick={() => cancelAddGiftCardClick(giftCard.id)}>Cancel</button>
                        )}
                    </div>
                </div>
            ))}
        </>
    )

    function getGiftCard(giftCardId: string): IGiftCard | undefined {
        let result: IGiftCard | undefined = undefined;

        result = giftCards?.filter(x => x.id === giftCardId)[0];

        return result;
    }

    function purchaseGiftCardClick(): void {
        if (giftCards.length < 3) {
            appContext.updater(draft => {
                let giftCard: IGiftCard = {
                    id: uuidv4(),
                    giftCardOptionId: "",
                    lastName: "",
                    postalCode: "",
                    isEditable: true
                };

                draft.giftCards = [...draft.giftCards, giftCard];
            });
        }
    }

    function giftCardOptionChange(e: any, giftCardId: string): void {
        appContext.updater(draft => {
            let giftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x.id === giftCardId)[0];

            if (giftCard != undefined) {
                giftCard.giftCardOptionId = e?.target?.value;
            }
        });
    }

    function giftCardLastNameChange(e: any, giftCardId: string): void {
        appContext.updater(draft => {
            let giftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x.id === giftCardId)[0];

            if (giftCard != undefined) {
                giftCard.lastName = e?.target?.value;
            }
        });
    }

    function giftCardPostalCodeChange(e: any, giftCardId: string): void {
        appContext.updater(draft => {
            let giftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x.id === giftCardId)[0];

            if (giftCard != undefined) {
                giftCard.postalCode = e?.target?.value;
            }
        });
    }

    function addGiftCardToCartClick(giftCardId: string): void {
        let giftCard: IGiftCard | undefined = getGiftCard(giftCardId);

        if (giftCard != undefined) {
            let giftCardOption: IGiftCardOption | undefined = giftCardOptionsData?.filter(x => x.id === giftCard?.giftCardOptionId)[0];

            if (giftCardOption != undefined) {
                let description: string = `${giftCardOption?.name} Gift Card - ${giftCard?.lastName} - ${giftCard?.postalCode}`;

                let cartItem: ICartItem = {
                    id: uuidv4(),
                    description: description,
                    price: giftCardOption?.price,
                    isPermit: false,
                    isGiftCard: true,
                    itemId: giftCard.id
                };

                appContext.updater(draft => {
                    draft.cartItems.push(cartItem);
                });
            }
        }
    }

    function removeGiftCardFromCartClick(giftCardId: string): void {
        appContext.updater(draft => {
            draft.cartItems = draft.cartItems?.filter(x => x.itemId !== giftCardId);
        });
    }

    function cancelAddGiftCardClick(giftCardId: string): void {
        appContext.updater(draft => {
            draft.giftCards = giftCards?.filter(x => x.id !== giftCardId);
        });
    }

    function saveGiftCardChangesClick(giftCardId: string): void {

    }

    function isAddToCartButtonEnabled(giftCardId: string): boolean {
        let result: boolean = false;

        let giftCard: IGiftCard | undefined = getGiftCard(giftCardId);

        if (giftCard != undefined) {
            result = giftCard?.giftCardOptionId !== ""
                && giftCard?.lastName?.trim() !== ""
                && giftCard?.postalCode?.trim() !== "";
        }

        return result;
    }

    function isGiftCardAddedToCart(giftCardId: string): boolean {
        let result: boolean = false;

        result = appContext.data?.cartItems?.filter(x => x.isGiftCard && x.itemId === giftCardId)?.length > 0;

        return result;
    }

    function getGiftCardCount(): number {
        let result: number = 0;

        result = giftCards?.length ?? 0;

        return result;
    }
}