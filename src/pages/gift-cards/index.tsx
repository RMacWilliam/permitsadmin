import { useContext, useEffect, useState } from 'react'
import { AppContext, IAppContextValues, ICartItem, IGiftCard, IGiftCardType } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import CartItemsAlert from '@/components/cart-items-alert';
import { formatCurrency, getGuid, parseDate } from '@/custom/utilities';
import { Observable, forkJoin } from 'rxjs';
import { IApiGetAvailableGiftCardsResult, IApiGetGiftcardsForCurrentSeasonForUserResult, apiGetAvailableGiftCards, apiGetGiftcardsForCurrentSeasonForUser } from '@/custom/api';

export default function GiftCardsPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(true);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "gift-cards" });
    }, [appContext])

    return (
        <AuthenticatedPageLayout showAlert={showAlert}>
            <GiftCards appContext={appContext} router={router} setShowAlert={setShowAlert}></GiftCards>
        </AuthenticatedPageLayout>
    )
}

function GiftCards({ appContext, router, setShowAlert }: { appContext: IAppContextValues, router: NextRouter, setShowAlert: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [giftCardTypesData, setGiftCardTypesData] = useState([] as IGiftCardType[]);

    useEffect(() => {
        // Get data from api.
        let batchApi: Observable<any>[] = [
            apiGetGiftcardsForCurrentSeasonForUser(),
            apiGetAvailableGiftCards()
        ];

        forkJoin(batchApi).subscribe({
            next: (results: any[]) => {
                // apiGetGiftcardsForCurrentSeasonForUser
                const apiGetGiftcardsForCurrentSeasonForUserResult: IApiGetGiftcardsForCurrentSeasonForUserResult[] = results[0] as IApiGetGiftcardsForCurrentSeasonForUserResult[];

                if (apiGetGiftcardsForCurrentSeasonForUserResult != undefined) {
                    appContext.updater(draft => {
                        draft.giftCards = apiGetGiftcardsForCurrentSeasonForUserResult.map<IGiftCard>((x: IApiGetGiftcardsForCurrentSeasonForUserResult) => ({
                            oVoucherId: x?.oVoucherId,
                            orderId: x?.orderId,
                            transactionDate: parseDate(x?.transactionDate),
                            recipientLastName: x?.recipientLastName,
                            recipientPostal: x?.recipientPostal,
                            redemptionCode: x?.redemptionCode,
                            purchaserEmail: x?.purchaserEmail,
                            productId: x?.productId,
                            redeemed: x?.redeemed,
                            useShippingAddress: x?.useShippingAddress,
                            shippingOption: x?.shippingOption,
                            clubId: x?.clubId,
                            permitId: x?.permitId,
                            isEditable: true // TODO: This should come from api.
                        }));
                    });
                }

                // apiGetAvailableGiftCards
                const apiGetAvailableGiftCardsResult: IApiGetAvailableGiftCardsResult[] = results[1] as IApiGetAvailableGiftCardsResult[];

                if (apiGetAvailableGiftCardsResult != undefined) {
                    let giftCardTypes: IGiftCardType[] = apiGetAvailableGiftCardsResult.map<IGiftCardType>((x: IApiGetAvailableGiftCardsResult) => ({
                        productId: x?.productId,
                        name: x?.name,
                        displayName: x?.displayName,
                        frenchDisplayName: x?.frenchDisplayName,
                        amount: x?.amount,
                        testAmount: x?.testAmount,
                        classic: x?.classic,
                        multiDayUpgrade: x?.multiDayUpgrade,
                        isMultiDay: x?.isMultiDay,
                        isSpecialEvent: x?.isSpecialEvent,
                        eventDate: parseDate(x?.eventDate),
                        eventName: x?.eventName,
                        eventClubId: x?.eventClubId,
                        csrOnly: x?.csrOnly,
                        permitDays: x?.permitDays,
                        canBuyGiftCard: x?.canBuyGiftCard
                    }));

                    setGiftCardTypesData(giftCardTypes);
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
                <title>Gift Cards | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>{appContext.translation?.t("GIFT_CARDS.TITLE")}</h4>

            <CartItemsAlert></CartItemsAlert>

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

            <button className="btn btn-primary btn-sm mt-2" onClick={() => addGiftCardClick()}>Add Gift Card</button>

            {getGiftCards() != undefined && getGiftCards().length > 0 && getGiftCards().map(giftCard => (
                <div className="card mt-3" key={giftCard.oVoucherId}>
                    <h5 className="card-header">
                        {!giftCard.isEditable && getGiftCardType(giftCard.productId) != undefined && (
                            <span>Purchased {getGiftCardType(giftCard.productId)?.name} Gift Card - ${formatCurrency(getGiftCardType(giftCard.productId)?.amount)}</span>
                        )}

                        {giftCard.isEditable && (
                            <span>Unpurchased Gift Card</span>
                        )}
                    </h5>

                    <ul className="list-group list-group-flush">
                        {giftCard.isEditable && (
                            <li className="list-group-item">
                                <h6 className="card-title">Select a permit to purchase</h6>

                                {giftCardTypesData != undefined && giftCardTypesData.length > 0 && getGiftCardTypesData().map(giftCardType => (
                                    <div className="form-check form-check-inline" key={giftCardType?.productId}>
                                        <input className="form-check-input" type="radio" name={`gift-cards-permit-options-${giftCard.oVoucherId}`} id={`gift-cards-permit-options-${giftCard.oVoucherId}-${giftCardType?.productId}`} checked={isGiftCardTypeChecked(giftCard.oVoucherId, giftCardType?.productId)} value={giftCardType?.productId} onChange={(e: any) => giftCardTypeChange(e, giftCard.oVoucherId)} disabled={!giftCard?.isEditable} />
                                        <label className="form-check-label" htmlFor={`gift-cards-permit-options-${giftCard.oVoucherId}-${giftCardType?.productId}`}>
                                            {giftCardType?.name} - ${formatCurrency(giftCardType?.amount)}
                                        </label>
                                    </div>
                                ))}
                            </li>
                        )}

                        <li className="list-group-item">
                            <h6 className="mt-2">Recipient Information</h6>

                            <div className="row">
                                <div className="col-12 col-sm-12 col-md-6">
                                    <div className="form-floating mb-2">
                                        <input type="text" className="form-control" id="gift-cards-last-name-${giftCard.id}" placeholder="Recipient's LAST Name ONLY" value={giftCard.recipientLastName} onChange={(e: any) => giftCardLastNameChange(e, giftCard.oVoucherId)} />
                                        <label className="required" htmlFor="gift-cards-last-name-${giftCard.id}">Recipient&apos;s LAST Name ONLY</label>
                                    </div>
                                </div>

                                <div className="col-12 col-sm-12 col-md-6">
                                    <div className="form-floating mb-2">
                                        <input type="text" className="form-control" id="gift-cards-postal-code-${giftCard.id}" placeholder="Recipient's Postal Code" value={giftCard.recipientPostal} onChange={(e: any) => giftCardPostalCodeChange(e, giftCard.oVoucherId)} />
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
                        {giftCard.isEditable && !isGiftCardAddedToCart(giftCard.oVoucherId) && (
                            <button className="btn btn-success btn-sm me-2" onClick={() => addGiftCardToCartClick(giftCard?.oVoucherId)} disabled={!isAddToCartEnabled(giftCard?.oVoucherId)}>Add Gift Card to Cart</button>
                        )}

                        {giftCard.isEditable && isGiftCardAddedToCart(giftCard.oVoucherId) && (
                            <button className="btn btn-danger btn-sm" onClick={() => removeGiftCardFromCartClick(giftCard?.oVoucherId)}>Remove Gift Card from Cart</button>
                        )}

                        {!giftCard.isEditable && (
                            <button className="btn btn-primary btn-sm" onClick={() => saveGiftCardChangesClick(giftCard?.oVoucherId)}>Save Changes</button>
                        )}

                        {giftCard.isEditable && !isGiftCardAddedToCart(giftCard.oVoucherId) && (
                            <button className="btn btn-primary btn-sm" onClick={() => cancelAddGiftCardClick(giftCard?.oVoucherId)}>Cancel</button>
                        )}
                    </div>
                </div>
            ))}
        </>
    )

    function getGiftCards(): IGiftCard[] {
        let result: IGiftCard[] = [];

        if (appContext.data?.giftCards != undefined) {
            result = appContext.data.giftCards;
        }

        return result;
    }

    function getGiftCard(giftCardId?: string): IGiftCard | undefined {
        let result: IGiftCard | undefined = undefined;

        if (giftCardId != undefined) {
            result = getGiftCards()?.filter(x => x.oVoucherId === giftCardId)[0];
        }

        return result;
    }

    function getGiftCardTypesData(): IGiftCardType[] {
        let result: IGiftCardType[] = [];

        if (giftCardTypesData != null && giftCardTypesData.length > 0) {
            result = giftCardTypesData;
        }

        return result;
    }

    function getGiftCardType(giftCardTypeId?: number): IGiftCardType | undefined {
        let result: IGiftCardType | undefined = undefined;

        if (giftCardTypeId != undefined) {
            result = getGiftCardTypesData()?.filter(x => x?.productId === giftCardTypeId)[0];
        }

        return result;
    }

    function addGiftCardClick(): void {
        let giftCard: IGiftCard = {
            oVoucherId: getGuid(),            
            productId: 0,
            recipientLastName: "",
            recipientPostal: "",
            isEditable: true
        };

        appContext.updater(draft => {
            draft.giftCards = draft.giftCards == undefined ? [giftCard] : [...draft.giftCards, giftCard];
        });
    }

    function isGiftCardTypeChecked(giftCardId?: string, giftCardTypeId?: number): boolean {
        let result: boolean = false;

        if (giftCardId != undefined && giftCardTypeId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCards()?.filter(x => x.oVoucherId === giftCardId)[0];

            if (giftCard != undefined) {
                result = giftCard.productId === giftCardTypeId;
            }
        }

        return result;
    }

    function giftCardTypeChange(e: any, giftCardId?: string): void {
        if (giftCardId != undefined) {
            appContext.updater(draft => {
                let giftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x.oVoucherId === giftCardId)[0];

                if (giftCard != undefined) {
                    giftCard.productId = Number(e?.target?.value);
                }
            });
        }
    }

    function giftCardLastNameChange(e: any, giftCardId?: string): void {
        if (giftCardId != undefined) {
            appContext.updater(draft => {
                let giftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x.oVoucherId === giftCardId)[0];

                if (giftCard != undefined) {
                    giftCard.recipientLastName = e?.target?.value;
                }
            });
        }
    }

    function giftCardPostalCodeChange(e: any, giftCardId?: string): void {
        if (giftCardId != undefined) {
            appContext.updater(draft => {
                let giftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x.oVoucherId === giftCardId)[0];

                if (giftCard != undefined) {
                    giftCard.recipientPostal = e?.target?.value;
                }
            });
        }
    }

    function addGiftCardToCartClick(giftCardId?: string): void {
        if (giftCardId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(giftCardId);

            if (giftCard != undefined) {
                let giftCardType: IGiftCardType | undefined = giftCardTypesData?.filter(x => x?.productId === giftCard?.productId)[0];

                if (giftCardType != undefined) {
                    let description: string = `${giftCardType?.name} Gift Card - ${giftCard?.recipientLastName} - ${giftCard?.recipientPostal}`;

                    let cartItem: ICartItem = {
                        id: getGuid(),
                        description: description,
                        price: giftCardType?.amount ?? 0,
                        isPermit: false,
                        isGiftCard: true,
                        itemId: giftCard.oVoucherId
                    };

                    appContext.updater(draft => {
                        draft.cartItems = draft.cartItems == undefined ? [cartItem] : [...draft.cartItems, cartItem];
                    });
                }
            }
        }
    }

    function removeGiftCardFromCartClick(giftCardId?: string): void {
        if (giftCardId != undefined) {
            appContext.updater(draft => {
                draft.cartItems = draft.cartItems?.filter(x => x.itemId !== giftCardId);
            });
        }
    }

    function cancelAddGiftCardClick(giftCardId?: string): void {
        if (giftCardId != undefined) {
            appContext.updater(draft => {
                draft.giftCards = draft?.giftCards?.filter(x => x.oVoucherId !== giftCardId);
            });
        }
    }

    function saveGiftCardChangesClick(giftCardId?: string): void {

    }

    function isAddToCartEnabled(giftCardId?: string): boolean {
        let result: boolean = false;

        if (giftCardId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(giftCardId);

            if (giftCard != undefined) {
                result = giftCard?.productId !== 0
                    && giftCard?.recipientLastName?.trim() !== ""
                    && giftCard?.recipientPostal?.trim() !== "";
            }
        }

        return result;
    }

    function isGiftCardAddedToCart(giftCardId?: string): boolean {
        let result: boolean = false;

        if (giftCardId != undefined) {
            result = appContext.data?.cartItems?.some(x => x.isGiftCard && x.itemId === giftCardId) ?? false;
        }

        return result;
    }
}