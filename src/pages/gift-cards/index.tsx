import { useContext, useEffect, useState } from 'react'
import { AppContext, IAppContextValues, ICartItem, IGiftCard, IGiftCardType } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import CartItemsAlert from '@/components/cart-items-alert';
import { formatCurrency, getGuid, parseDate } from '@/custom/utilities';
import { Observable, forkJoin } from 'rxjs';
import { IApiGetAvailableGiftCardsResult, IApiGetGiftcardsForCurrentSeasonForUserResult, apiGetAvailableGiftCards, apiGetGiftcardsForCurrentSeasonForUser } from '@/custom/api';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { isRoutePermitted, isUserAuthenticated } from '@/custom/authentication';

export default function GiftCardsPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        setIsAuthenticated(false);

        let authenticated: boolean = isUserAuthenticated(router, appContext);

        if (authenticated) {
            let permitted: boolean = isRoutePermitted(router, appContext, "gift-cards");

            if (permitted) {
                appContext.updater(draft => { draft.navbarPage = "gift-cards" });

                setIsAuthenticated(true);
                setShowAlert(true);
            }
        }
    }, [appContext.data.isAuthenticated]);

    return (
        <AuthenticatedPageLayout showAlert={showAlert}>
            {isAuthenticated && (
                <GiftCards appContext={appContext} router={router} setShowAlert={setShowAlert}></GiftCards>
            )}
        </AuthenticatedPageLayout>
    )
}

function GiftCards({ appContext, router, setShowAlert }: { appContext: IAppContextValues, router: NextRouter, setShowAlert: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [showDeleteGiftCardDialog, setShowDeleteGiftCardDialog] = useState(false);
    const [giftCardIdToDelete, setGiftCardIdToDelete] = useState("");

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
                    let giftCards: IGiftCard[] = apiGetGiftcardsForCurrentSeasonForUserResult.map<IGiftCard>((x: IApiGetGiftcardsForCurrentSeasonForUserResult) => ({
                        oVoucherId: x?.oVoucherId,
                        orderId: x?.orderId,
                        transactionDate: parseDate(x?.transactionDate),
                        recipientLastName: x?.recipientLastName,
                        recipientPostal: x?.recipientPostal,
                        redemptionCode: x?.redemptionCode,
                        purchaserEmail: x?.purchaserEmail,
                        productId: x?.productId,
                        isRedeemed: x?.isRedeemed,
                        isPurchased: x?.isPurchased,
                        useShippingAddress: x?.useShippingAddress,
                        shippingOption: x?.shippingOption,
                        clubId: x?.clubId,
                        permitId: x?.permitId,

                        uiIsInEditMode: false,
                        uiRecipientLastName: undefined,
                        uiRecipientPostal: undefined
                    }));

                    appContext.updater(draft => {
                        draft.giftCards = giftCards;
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

            <div className="fw-semibold">Gift card options based on recipient's vehicle model year:</div>
            <ul>
                <li>Classic (1999 or older)</li>
                <li>Seasonal (2000 or newer)</li>
            </ul>

            {getGiftCards() != undefined && getGiftCards().length > 0 && getGiftCards().map(giftCard => (
                <div className="card mb-3" key={giftCard.oVoucherId}>
                    <h5 className="card-header d-flex justify-content-between align-items-center">
                        <div>
                            {giftCard.isPurchased && appContext.translation?.i18n?.language === "en" && (
                                <span>Purchased {getGiftCardType(giftCard.productId)?.displayName} Gift Card &mdash; ${formatCurrency(getGiftCardType(giftCard.productId)?.amount)}</span>
                            )}
                            {giftCard.isPurchased && appContext.translation?.i18n?.language === "fr" && (
                                <span>Purchased {getGiftCardType(giftCard.productId)?.frenchDisplayName} Gift Card &mdash; ${formatCurrency(getGiftCardType(giftCard.productId)?.amount)}</span>
                            )}

                            {!giftCard.isPurchased && (
                                <span>Buy New Gift Card</span>
                            )}
                        </div>

                        <div>
                            {giftCard?.isPurchased && !giftCard?.isRedeemed && (
                                <button className="btn btn-primary btn-sm" onClick={() => editGiftCardClick(giftCard?.oVoucherId)} disabled={isGiftCardAddedToCart(giftCard?.oVoucherId) || giftCard?.uiIsInEditMode}>Edit</button>
                            )}

                            {!giftCard?.isPurchased && !giftCard?.isRedeemed && (
                                <button className="btn btn-danger btn-sm ms-1" onClick={() => deleteSnowmobileDialogShow(giftCard?.oVoucherId)} disabled={isGiftCardAddedToCart(giftCard?.oVoucherId)}>Remove</button>
                            )}
                        </div>
                    </h5>

                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <label htmlFor="exampleFormControlInput1" className="form-label">Redemption Code</label>
                                    <p className="font-monospace mb-0">3059734095760349576340957340957304957</p>
                                </div>

                                <div>
                                    <button className="btn btn-primary btn-sm">Resend E-mail</button>
                                </div>
                            </div>
                        </li>

                        {!giftCard?.isPurchased && !giftCard?.isRedeemed && (
                            <li className="list-group-item">
                                <div className="form-floating">
                                    <select className="form-select" id={`gift-cards-permit-options-${giftCard.oVoucherId}`} aria-label="Select gift card to purchase" value={getSelectedGiftCardOption(giftCard?.oVoucherId)} onChange={(e: any) => giftCardOptionChange(e, giftCard?.oVoucherId)} disabled={isGiftCardAddedToCart(giftCard?.oVoucherId)}>
                                        <option value="" disabled>Please select</option>

                                        {giftCardTypesData != undefined && giftCardTypesData.length > 0 && getGiftCardTypesData().map(giftCardType => {
                                            if (appContext.translation?.i18n?.language === "fr") {
                                                return (
                                                    <option value={giftCardType?.productId} key={giftCardType?.productId}>{giftCardType?.frenchDisplayName} - ${formatCurrency(giftCardType?.amount)}</option>
                                                )
                                            } else {
                                                return (
                                                    <option value={giftCardType?.productId} key={giftCardType?.productId}>{giftCardType?.displayName} - ${formatCurrency(giftCardType?.amount)}</option>
                                                )
                                            }
                                        })}
                                    </select>
                                    <label className="required" htmlFor={`gift-cards-permit-options-${giftCard.oVoucherId}`}>Select gift card to purchase</label>
                                </div>
                            </li>
                        )}

                        <li className="list-group-item">
                            <div className="row">
                                <div className="col-12 col-sm-12 col-md-6">
                                    <div className="form-floating mb-2">
                                        <input type="text" className="form-control" id="gift-cards-last-name-${giftCard.id}" placeholder="Recipient's LAST Name ONLY" value={getGiftCardRecipientLastName(giftCard?.oVoucherId)} onChange={(e: any) => giftCardLastNameChange(e, giftCard?.oVoucherId)} disabled={!isGiftCardLastNameEnabled(giftCard?.oVoucherId)} />
                                        <label className="required" htmlFor="gift-cards-last-name-${giftCard.id}">Recipient's LAST Name ONLY</label>
                                    </div>
                                </div>

                                <div className="col-12 col-sm-12 col-md-6">
                                    <div className="form-floating mb-2">
                                        <input type="text" className="form-control" id="gift-cards-postal-code-${giftCard.id}" placeholder="Recipient's Postal Code" value={getGiftCardRecipientPostalCode(giftCard?.oVoucherId)} onChange={(e: any) => giftCardPostalCodeChange(e, giftCard?.oVoucherId)} disabled={!isGiftCardPostalCodeEnabled(giftCard?.oVoucherId)} />
                                        <label className="required" htmlFor="gift-cards-postal-code-${giftCard.id}">Recipient's Postal Code</label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-danger me-1">*</span>= mandatory field and must match the recipient's OFSC account information
                            </div>
                        </li>
                    </ul>

                    {((!giftCard?.isPurchased && !giftCard?.isRedeemed && !isGiftCardAddedToCart(giftCard?.oVoucherId))
                        || (!giftCard?.isPurchased && !giftCard?.isRedeemed && isGiftCardAddedToCart(giftCard?.oVoucherId))
                        || (giftCard?.isPurchased && !giftCard?.isRedeemed && giftCard?.uiIsInEditMode)) && (
                            <div className="card-footer">
                                {!giftCard?.isPurchased && !giftCard?.isRedeemed && !isGiftCardAddedToCart(giftCard?.oVoucherId) && (
                                    <button className="btn btn-success btn-sm me-2" onClick={() => addGiftCardToCartClick(giftCard?.oVoucherId)} disabled={!isAddToCartEnabled(giftCard?.oVoucherId)}>Add Gift Card to Cart</button>
                                )}

                                {!giftCard?.isPurchased && !giftCard?.isRedeemed && isGiftCardAddedToCart(giftCard?.oVoucherId) && (
                                    <button className="btn btn-danger btn-sm" onClick={() => removeGiftCardFromCartClick(giftCard?.oVoucherId)}>Remove Gift Card from Cart</button>
                                )}

                                {giftCard?.isPurchased && !giftCard?.isRedeemed && giftCard?.uiIsInEditMode && (
                                    <button className="btn btn-primary btn-sm me-2" onClick={() => saveGiftCardChangesClick(giftCard?.oVoucherId)}>Save Changes</button>
                                )}

                                {giftCard?.isPurchased && !giftCard?.isRedeemed && giftCard?.uiIsInEditMode && (
                                    <button className="btn btn-primary btn-sm" onClick={() => cancelGiftCardChangesClick(giftCard?.oVoucherId)}>Cancel Changes</button>
                                )}
                            </div>
                        )}
                </div>
            ))}

            <div className="card">
                <div className="card-body text-center">
                    <button className="btn btn-primary btn-sm mt-2" onClick={() => addGiftCardClick()}>Add Gift Card</button>
                </div>
            </div>

            <ConfirmationDialog showDialog={showDeleteGiftCardDialog} title="Remove Gift Card" buttons={2} icon="question" width="50"
                yesClick={() => deleteGiftCardDialogYesClick()} noClick={() => deleteGiftCardDialogNoClick()} closeClick={() => deleteGiftCardDialogNoClick()}>
                <div>Are you sure you want to remove this gift card?</div>
            </ConfirmationDialog>
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
            result = getGiftCards()?.filter(x => x?.oVoucherId === giftCardId)[0];
        }

        return result;
    }

    function getGiftCardTypesData(): IGiftCardType[] {
        let result: IGiftCardType[] = [];

        if (giftCardTypesData != undefined && giftCardTypesData.length > 0) {
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
            productId: undefined,
            recipientLastName: undefined,
            recipientPostal: undefined,
            isPurchased: false,
            isRedeemed: false,

            uiIsInEditMode: false,
            uiRecipientLastName: undefined,
            uiRecipientPostal: undefined
        };

        appContext.updater(draft => {
            draft.giftCards = draft.giftCards == undefined ? [giftCard] : [...draft.giftCards, giftCard];
        });
    }

    function editGiftCardClick(giftCardId?: string): void {
        if (giftCardId != undefined) {
            appContext.updater(draft => {
                let giftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === giftCardId)[0];

                if (giftCard != undefined) {
                    giftCard.uiRecipientLastName = giftCard?.recipientLastName;
                    giftCard.uiRecipientPostal = giftCard?.recipientPostal;
                    giftCard.uiIsInEditMode = true;
                }
            });
        }
    }

    function getGiftCardRecipientLastName(giftCardId?: string): string | undefined {
        let result: string | undefined = undefined;

        if (giftCardId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(giftCardId);

            if (giftCard != undefined) {
                if (giftCard?.uiIsInEditMode) {
                    result = giftCard?.uiRecipientLastName;
                } else {
                    result = giftCard?.recipientLastName;
                }
            }
        }

        return result;
    }

    function giftCardLastNameChange(e: any, giftCardId?: string): void {
        if (e != undefined && giftCardId != undefined) {
            appContext.updater(draft => {
                let giftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x.oVoucherId === giftCardId)[0];

                if (giftCard != undefined) {
                    if (giftCard?.isPurchased) {
                        giftCard.uiRecipientLastName = e?.target?.value;
                    } else {
                        giftCard.recipientLastName = e?.target?.value;
                    }
                }
            });
        }
    }

    function isGiftCardLastNameEnabled(giftCardId?: string): boolean {
        let result: boolean = false;

        if (giftCardId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(giftCardId);

            if (giftCard != undefined) {
                result = (!isGiftCardAddedToCart(giftCardId)
                    && (!giftCard?.isPurchased || (giftCard?.isPurchased && giftCard?.uiIsInEditMode))
                    && !giftCard?.isRedeemed
                ) ?? false;
            }
        }

        return result;
    }

    function getGiftCardRecipientPostalCode(giftCardId?: string): string | undefined {
        let result: string | undefined = undefined;

        if (giftCardId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(giftCardId);

            if (giftCard != undefined) {
                if (giftCard?.uiIsInEditMode) {
                    result = giftCard?.uiRecipientPostal;
                } else {
                    result = giftCard?.recipientPostal;
                }
            }
        }

        return result;
    }

    function giftCardPostalCodeChange(e: any, giftCardId?: string): void {
        if (e != undefined && giftCardId != undefined) {
            appContext.updater(draft => {
                let giftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x.oVoucherId === giftCardId)[0];

                if (giftCard != undefined) {
                    if (giftCard?.isPurchased) {
                        giftCard.uiRecipientPostal = e?.target?.value;
                    } else {
                        giftCard.recipientPostal = e?.target?.value;
                    }
                }
            });
        }
    }

    function isGiftCardPostalCodeEnabled(giftCardId?: string): boolean {
        let result: boolean = false;

        if (giftCardId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(giftCardId);

            if (giftCard != undefined) {
                result = (!isGiftCardAddedToCart(giftCardId)
                    && (!giftCard?.isPurchased || (giftCard?.isPurchased && giftCard?.uiIsInEditMode))
                    && !giftCard?.isRedeemed
                ) ?? false;
            }
        }

        return result;
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
                        itemId: giftCard.oVoucherId,

                        uiRedemptionCode: ""
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
                draft.cartItems = draft.cartItems?.filter(x => x?.itemId !== giftCardId);
            });
        }
    }

    function saveGiftCardChangesClick(giftCardId?: string): void {
        if (giftCardId != undefined) {
            appContext.updater(draft => {
                let giftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === giftCardId)[0];

                if (giftCard != undefined) {
                    giftCard.recipientLastName = giftCard?.uiRecipientLastName;
                    giftCard.recipientPostal = giftCard?.uiRecipientPostal;
                    giftCard.uiIsInEditMode = false;
                }
            });
        }
    }

    function cancelGiftCardChangesClick(giftCardId?: string): void {
        if (giftCardId != undefined) {
            appContext.updater(draft => {
                let giftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === giftCardId)[0];

                if (giftCard != undefined) {
                    giftCard.uiIsInEditMode = false;
                }
            });
        }
    }

    function isAddToCartEnabled(giftCardId?: string): boolean {
        let result: boolean = false;

        if (giftCardId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(giftCardId);

            if (giftCard != undefined) {
                result = giftCard?.productId != undefined && giftCard?.productId !== 0
                    && giftCard?.recipientLastName != undefined && giftCard?.recipientLastName?.trim() !== ""
                    && giftCard?.recipientPostal != undefined && giftCard?.recipientPostal?.trim() !== "";
            }
        }

        return result;
    }

    function isGiftCardAddedToCart(giftCardId?: string): boolean {
        let result: boolean = false;

        if (giftCardId != undefined) {
            result = appContext.data?.cartItems?.some(x => x.isGiftCard && x?.itemId === giftCardId) ?? false;
        }

        return result;
    }

    function deleteSnowmobileDialogShow(giftCardId?: string): void {
        if (giftCardId != undefined) {
            setGiftCardIdToDelete(giftCardId);
            setShowDeleteGiftCardDialog(true);
        }
    }

    function deleteGiftCardDialogYesClick(): void {
        appContext.updater(draft => {
            draft.giftCards = draft?.giftCards?.filter(x => x?.oVoucherId !== giftCardIdToDelete);
            draft.cartItems = draft?.cartItems?.filter(x => x?.itemId !== giftCardIdToDelete);
        });

        setGiftCardIdToDelete("");
        setShowDeleteGiftCardDialog(false);
    }

    function deleteGiftCardDialogNoClick(): void {
        setGiftCardIdToDelete("");
        setShowDeleteGiftCardDialog(false);
    }

    function getSelectedGiftCardOption(giftCardId?: string): string {
        let result: string = "";

        if (giftCardId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(giftCardId);

            if (giftCard != undefined && giftCard?.productId != undefined) {
                result = giftCard?.productId?.toString() ?? "";

                // TODO: Why did api return product ID that was not in the list of gift card options??
                // Check if id exists in list.
                if (result !== "" && getGiftCardType(Number(result)) == undefined) {
                    result = "";

                    //             appContext.updater(draft => {
                    //                 let gc: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === giftCardId)[0];

                    //                 if (gc != undefined) {
                    //                     gc.productId = undefined;
                    //                 }
                    //             });
                }
            }
        }

        return result;
    }

    function giftCardOptionChange(e: any, giftCardId?: string): void {
        if (e != undefined && giftCardId != undefined) {
            appContext.updater(draft => {
                let giftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === giftCardId)[0];

                if (giftCard != undefined) {
                    if (!giftCard?.isPurchased && !giftCard?.isRedeemed) {
                        giftCard.productId = Number(e?.target?.value);
                    }
                }
            });
        }
    }
}