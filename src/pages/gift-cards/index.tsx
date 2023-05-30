import { useContext, useEffect, useState } from 'react'
import { AppContext, IAppContextValues, ICartItem, IGiftCard, IGiftCardType } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import CartItemsAlert from '@/components/cart-items-alert';
import { formatCurrency, getApiErrorMessage, getGuid, parseDate } from '@/custom/utilities';
import { Observable, forkJoin } from 'rxjs';
import { IApiAddGiftCardForUserRequest, IApiAddGiftCardForUserResult, IApiDeleteGiftCardRequest, IApiDeleteGiftCardResult, IApiGetAvailableGiftCardsResult, IApiGetGiftcardsForCurrentSeasonForUserResult, IApiSaveGiftCardSelectionsForUserRequest, IApiSaveGiftCardSelectionsForUserResult, apiAddGiftCardForUser, apiDeleteGiftCard, apiGetAvailableGiftCards, apiGetGiftcardsForCurrentSeasonForUser, apiSaveGiftCardSelectionsForUser } from '@/custom/api';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { isRoutePermitted, isUserAuthenticated } from '@/custom/authentication';
import { Constants } from '../../../constants';

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
    const [deleteGiftCardDialogErrorMessage, setDeleteGiftCardDialogErrorMessage] = useState("");
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
                        giftCardId: x?.giftcardId === 0 ? undefined : x?.giftcardId, // TODO: Api shouldn't return 0 for giftcard when none are selected
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
                        giftcardId: x?.giftcardId,
                        productId: x?.productId,
                        name: x?.name,
                        displayName: x?.displayName,
                        frenchDisplayName: x?.frenchDisplayName,
                        amount: x?.amount,
                        testAmount: x?.testAmount,
                        classic: x?.classic,
                        isTrackedShipping: x?.isTrackedShipping,
                        trackedShippingAmount: x?.trackedShippingAmount
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
                <li>Do not yet have a VIN and want to take advantage of pre-season fees</li>
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
                                <span>Purchased {getGiftCardName(giftCard?.giftCardId)} &mdash; ${formatCurrency(getGiftCardAmount(giftCard?.giftCardId))}</span>
                            )}
                            {giftCard.isPurchased && appContext.translation?.i18n?.language === "fr" && (
                                <span>Purchased {getGiftCardName(giftCard?.giftCardId, "fr")} Gift Card &mdash; ${formatCurrency(getGiftCardAmount(giftCard?.giftCardId))}</span>
                            )}

                            {!giftCard.isPurchased && (
                                <span>Buy New Gift Card</span>
                            )}
                        </div>

                        <div>
                            {giftCard?.isPurchased && !giftCard?.isRedeemed && (
                                <button className="btn btn-primary btn-sm" onClick={() => editGiftCardClick(giftCard?.oVoucherId)} disabled={isGiftCardAddedToCart(giftCard?.oVoucherId) || giftCard?.uiIsInEditMode}>Edit</button>
                            )}

                            {!giftCard?.isPurchased && !giftCard?.isRedeemed && !isGiftCardAddedToCart(giftCard?.oVoucherId) && (
                                <button className="btn btn-danger btn-sm ms-1" onClick={() => deleteGiftCardDialogShow(giftCard?.oVoucherId)} disabled={isGiftCardAddedToCart(giftCard?.oVoucherId)}>Remove</button>
                            )}
                        </div>
                    </h5>

                    <ul className="list-group list-group-flush">
                        {giftCard?.isPurchased && (
                            <li className="list-group-item">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <label htmlFor="exampleFormControlInput1" className="form-label">Redemption Code</label>
                                        <p className="font-monospace mb-0">{giftCard?.redemptionCode}</p>
                                    </div>

                                    <div>
                                        <button className="btn btn-primary btn-sm">Resend E-mail</button>
                                    </div>
                                </div>
                            </li>
                        )}

                        {!giftCard?.isPurchased && !giftCard?.isRedeemed && (
                            <li className="list-group-item">
                                <div className="form-floating">
                                    <select className="form-select" id={`gift-cards-permit-options-${giftCard?.oVoucherId}`} aria-label="Select gift card to purchase" value={getSelectedGiftCardOption(giftCard?.oVoucherId)} onChange={(e: any) => giftCardOptionChange(e, giftCard?.oVoucherId)} disabled={isGiftCardAddedToCart(giftCard?.oVoucherId)}>
                                        <option value="" disabled>{Constants.PleaseSelect}</option>

                                        {giftCardTypesData != undefined && giftCardTypesData.length > 0 && getGiftCardTypesData().map(giftCardType => {
                                            let displayText: string = "";

                                            if (appContext.translation?.i18n?.language === "fr") {
                                                displayText = getGiftCardName(giftCardType?.giftcardId, "fr");
                                            } else {
                                                displayText = getGiftCardName(giftCardType?.giftcardId);
                                            }

                                            displayText += " — $" + formatCurrency(getGiftCardAmount(giftCardType?.giftcardId));

                                            return (
                                                <option value={giftCardType?.giftcardId} key={giftCardType?.giftcardId}>{displayText}</option>
                                            )
                                        })}
                                    </select>
                                    <label className="required" htmlFor={`gift-cards-permit-options-${giftCard?.oVoucherId}`}>Select gift card to purchase</label>
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

            <ConfirmationDialog showDialog={showDeleteGiftCardDialog} title="Remove Gift Card" errorMessage={deleteGiftCardDialogErrorMessage} buttons={2} icon="question" width="50"
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

    function getGiftCard(oVoucherId?: string): IGiftCard | undefined {
        let result: IGiftCard | undefined = undefined;

        if (oVoucherId != undefined) {
            result = getGiftCards()?.filter(x => x?.oVoucherId === oVoucherId)[0];
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

    function getGiftCardType(giftCardId?: number): IGiftCardType | undefined {
        let result: IGiftCardType | undefined = undefined;

        if (giftCardId != undefined) {
            result = getGiftCardTypesData()?.filter(x => x?.giftcardId === giftCardId)[0];
        }

        return result;
    }

    function getGiftCardName(giftCardId?: number, language: string = "en"): string {
        let result: string = "";

        if (giftCardId != undefined) {
            let giftCardType: IGiftCardType | undefined = getGiftCardType(giftCardId);

            if (giftCardType != undefined) {
                if (language === "fr") {
                    result = giftCardType.frenchDisplayName + " (fr) Gift Card";

                    if (giftCardType?.isTrackedShipping) {
                        result += " (fr) with Tracking";
                    } else {
                        result += " (fr) without Tracking";
                    }
                } else {
                    result = giftCardType.displayName + " Gift Card";

                    if (giftCardType?.isTrackedShipping) {
                        result += " with Tracking";
                    } else {
                        result += " without Tracking";
                    }
                }
            }
        }

        return result;
    }

    function getGiftCardAmount(giftCardId?: number): number {
        let result: number = 0;

        if (giftCardId != undefined) {
            let giftCardType: IGiftCardType | undefined = getGiftCardType(giftCardId);

            if (giftCardType != undefined) {
                result = (giftCardType?.amount ?? 0) + (giftCardType?.isTrackedShipping ? (giftCardType?.trackedShippingAmount ?? 0) : 0);
            }

        }

        return result;
    }

    function addGiftCardClick(): void {
        let addGiftCardRequest: IApiAddGiftCardForUserRequest = {};

        setShowAlert(true);

        apiAddGiftCardForUser(addGiftCardRequest).subscribe({
            next: (result: IApiAddGiftCardForUserResult) => {
                if (result?.isSuccessful && result?.data != undefined) {
                    let newGiftCard: IGiftCard = {
                        oVoucherId: result?.data?.oVoucherId,
                        giftCardId: result?.data?.giftCardId,
                        productId: result?.data?.productId,
                        recipientLastName: result?.data?.recipientLastName,
                        recipientPostal: result?.data?.recipientPostal,
                        // isPurchased: false,
                        // isRedeemed: false
                    };

                    appContext.updater(draft => {
                        draft.giftCards = draft.giftCards == undefined ? [newGiftCard] : [...draft.giftCards, newGiftCard];
                    });
                } else {

                }

                setShowAlert(false);
            },
            error: (error: any) => {
                console.log(error);

                setShowAlert(false);
            }
        });
    }

    function editGiftCardClick(oVoucherId?: string): void {
        if (oVoucherId != undefined) {
            appContext.updater(draft => {
                let draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

                if (draftGiftCard != undefined) {
                    draftGiftCard.uiRecipientLastName = draftGiftCard?.recipientLastName;
                    draftGiftCard.uiRecipientPostal = draftGiftCard?.recipientPostal;
                    draftGiftCard.uiIsInEditMode = true;
                }
            });
        }
    }

    function getGiftCardRecipientLastName(oVoucherId?: string): string | undefined {
        let result: string | undefined = undefined;

        if (oVoucherId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                if (giftCard?.uiIsInEditMode) {
                    result = giftCard?.uiRecipientLastName ?? "";
                } else {
                    result = giftCard?.recipientLastName ?? "";
                }
            }
        }

        return result;
    }

    function giftCardLastNameChange(e: any, oVoucherId?: string): void {
        if (e != undefined && oVoucherId != undefined) {
            appContext.updater(draft => {
                let draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

                if (draftGiftCard != undefined) {
                    let giftCardType: IGiftCardType | undefined = getGiftCardType(draftGiftCard?.giftCardId);

                    if (giftCardType != undefined) {
                        let lastName: string | undefined = e?.target?.value;

                        if (draftGiftCard?.isPurchased) {
                            draftGiftCard.uiRecipientLastName = lastName;
                        } else {
                            draftGiftCard.recipientLastName = lastName;
                            saveGiftCardSelections(oVoucherId, draftGiftCard?.giftCardId, giftCardType?.productId, lastName, draftGiftCard?.recipientPostal);
                        }
                    }
                }
            });
        }
    }

    function isGiftCardLastNameEnabled(oVoucherId?: string): boolean {
        let result: boolean = false;

        if (oVoucherId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                result = (!isGiftCardAddedToCart(oVoucherId)
                    && (!giftCard?.isPurchased || (giftCard?.isPurchased && giftCard?.uiIsInEditMode))
                    && !giftCard?.isRedeemed
                ) ?? false;
            }
        }

        return result;
    }

    function getGiftCardRecipientPostalCode(oVoucherId?: string): string | undefined {
        let result: string | undefined = undefined;

        if (oVoucherId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                if (giftCard?.uiIsInEditMode) {
                    result = giftCard?.uiRecipientPostal ?? "";
                } else {
                    result = giftCard?.recipientPostal ?? "";
                }
            }
        }

        return result;
    }

    function giftCardPostalCodeChange(e: any, oVoucherId?: string): void {
        if (e != undefined && oVoucherId != undefined) {
            appContext.updater(draft => {
                let draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

                if (draftGiftCard != undefined) {
                    let giftCardType: IGiftCardType | undefined = getGiftCardType(draftGiftCard?.giftCardId);

                    if (giftCardType != undefined) {
                        let postalCode: string | undefined = e?.target?.value;

                        if (draftGiftCard?.isPurchased) {
                            draftGiftCard.uiRecipientPostal = postalCode;
                        } else {
                            draftGiftCard.recipientPostal = postalCode;
                            saveGiftCardSelections(oVoucherId, draftGiftCard?.giftCardId, giftCardType?.productId, draftGiftCard?.recipientLastName, postalCode);
                        }
                    }
                }
            });
        }
    }

    function isGiftCardPostalCodeEnabled(oVoucherId?: string): boolean {
        let result: boolean = false;

        if (oVoucherId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                result = (!isGiftCardAddedToCart(oVoucherId)
                    && (!giftCard?.isPurchased || (giftCard?.isPurchased && giftCard?.uiIsInEditMode))
                    && !giftCard?.isRedeemed
                ) ?? false;
            }
        }

        return result;
    }

    function saveGiftCardSelections(oVoucherId?: string, giftCardId?: number, productId?: number, recipientLastName?: string, recipientPostal?: string): void {
        if (oVoucherId != undefined) {
            let apiSaveGiftCardSelectionsForUserRequest: IApiSaveGiftCardSelectionsForUserRequest | undefined = {
                oVoucherId: oVoucherId,
                giftCardId: giftCardId,
                productId: productId,
                recipientLastName: recipientLastName,
                recipientPostal: recipientPostal
            };

            //setShowAlert(true);

            apiSaveGiftCardSelectionsForUser(apiSaveGiftCardSelectionsForUserRequest).subscribe({
                next: (result: IApiSaveGiftCardSelectionsForUserResult) => {
                    if (result?.isSuccessful && result?.data != undefined) {
                        appContext.updater(draft => {
                            let draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

                            if (draftGiftCard != undefined) {
                                draftGiftCard.giftCardId = result?.data?.giftcardId;
                                draftGiftCard.oVoucherId = result?.data?.oVoucherId;
                                draftGiftCard.orderId = result?.data?.orderId;
                                draftGiftCard.transactionDate = result?.data?.transactionDate;
                                draftGiftCard.recipientLastName = result?.data?.recipientLastName;
                                draftGiftCard.recipientPostal = result?.data?.recipientPostal;
                                draftGiftCard.redemptionCode = result?.data?.redemptionCode;
                                draftGiftCard.purchaserEmail = result?.data?.purchaserEmail;
                                draftGiftCard.productId = result?.data?.productId;
                                draftGiftCard.isRedeemed = result?.data?.isRedeemed;
                                draftGiftCard.isPurchased = result?.data?.isPurchased;
                                draftGiftCard.useShippingAddress = result?.data?.useShippingAddress;
                                draftGiftCard.shippingOption = result?.data?.shippingOption;
                                draftGiftCard.clubId = result?.data?.clubId;
                                draftGiftCard.permitId = result?.data?.permitId;
                            }
                        });
                    } else {
                        //
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

    function addGiftCardToCartClick(oVoucherId?: string): void {
        if (oVoucherId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                let giftCardType: IGiftCardType | undefined = getGiftCardType(giftCard?.giftCardId);

                if (giftCardType != undefined) {
                    let cartItem: ICartItem = {
                        id: getGuid(),
                        description: getGiftCardName(giftCardType?.giftcardId) + ` — ${giftCard?.recipientLastName} — ${giftCard?.recipientPostal}`,
                        descriptionFr: getGiftCardName(giftCardType?.giftcardId, "fr") + ` — ${giftCard?.recipientLastName} — ${giftCard?.recipientPostal}`,
                        price: getGiftCardAmount(giftCardType?.giftcardId),
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

    function removeGiftCardFromCartClick(oVoucherId?: string): void {
        if (oVoucherId != undefined) {
            appContext.updater(draft => {
                draft.cartItems = draft.cartItems?.filter(x => x?.itemId !== oVoucherId);
            });
        }
    }

    function saveGiftCardChangesClick(oVoucherId?: string): void {
        if (oVoucherId != undefined) {
            appContext.updater(draft => {
                let draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

                if (draftGiftCard != undefined) {
                    draftGiftCard.recipientLastName = draftGiftCard?.uiRecipientLastName;
                    draftGiftCard.recipientPostal = draftGiftCard?.uiRecipientPostal;
                    draftGiftCard.uiIsInEditMode = false;
                }
            });
        }
    }

    function cancelGiftCardChangesClick(oVoucherId?: string): void {
        if (oVoucherId != undefined) {
            appContext.updater(draft => {
                let draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

                if (draftGiftCard != undefined) {
                    draftGiftCard.uiIsInEditMode = false;
                }
            });
        }
    }

    function isAddToCartEnabled(oVoucherId?: string): boolean {
        let result: boolean = false;

        if (oVoucherId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                result = giftCard?.giftCardId != undefined && giftCard?.giftCardId !== 0
                    && giftCard?.recipientLastName != undefined && giftCard?.recipientLastName?.trim() !== ""
                    && giftCard?.recipientPostal != undefined && giftCard?.recipientPostal?.trim() !== "";
            }
        }

        return result;
    }

    function isGiftCardAddedToCart(oVoucherId?: string): boolean {
        let result: boolean = false;

        if (oVoucherId != undefined) {
            result = appContext.data?.cartItems?.some(x => x.isGiftCard && x?.itemId === oVoucherId) ?? false;
        }

        return result;
    }

    function deleteGiftCardDialogShow(oVoucherId?: string): void {
        if (oVoucherId != undefined) {
            setGiftCardIdToDelete(oVoucherId);
            setDeleteGiftCardDialogErrorMessage("");
            setShowDeleteGiftCardDialog(true);
        }
    }

    function deleteGiftCardDialogYesClick(): void {
        let apiDeleteGiftCardRequest: IApiDeleteGiftCardRequest = {
            oVoucherId: giftCardIdToDelete
        };

        setShowAlert(true);

        apiDeleteGiftCard(apiDeleteGiftCardRequest).subscribe({
            next: (result: IApiDeleteGiftCardResult) => {
                if (result?.isSuccessful) {
                    appContext.updater(draft => {
                        draft.giftCards = draft?.giftCards?.filter(x => x?.oVoucherId !== giftCardIdToDelete);
                        draft.cartItems = draft?.cartItems?.filter(x => x?.itemId !== giftCardIdToDelete);
                    });

                    setGiftCardIdToDelete("");
                    setDeleteGiftCardDialogErrorMessage("");
                    setShowDeleteGiftCardDialog(false);
                } else {
                    setDeleteGiftCardDialogErrorMessage(getApiErrorMessage(result?.errorMessage) ?? result?.errorMessage ?? "");
                }

                setShowAlert(false);
            },
            error: (error: any) => {
                console.log(error);

                setShowAlert(false);
            }
        });
    }

    function deleteGiftCardDialogNoClick(): void {
        setGiftCardIdToDelete("");
        setDeleteGiftCardDialogErrorMessage("");
        setShowDeleteGiftCardDialog(false);
    }

    function getSelectedGiftCardOption(oVoucherId?: string): string {
        let result: string = "";

        if (oVoucherId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined && giftCard?.giftCardId != undefined) {
                result = giftCard?.giftCardId?.toString() ?? "";

                // TODO: Why did api return product ID that was not in the list of gift card options??
                // Check if id exists in list.
                // if (result !== "" && getGiftCardType(Number(result)) == undefined) {
                //     result = "";

                //     //             appContext.updater(draft => {
                //     //                 let gc: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === giftCardId)[0];

                //     //                 if (gc != undefined) {
                //     //                     gc.productId = undefined;
                //     //                 }
                //     //             });
                // }
            }
        }

        return result;
    }

    function giftCardOptionChange(e: any, oVoucherId?: string): void {
        if (e != undefined && oVoucherId != undefined) {
            let giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                let giftCardId: number = Number(e?.target?.value);
                let giftCardType: IGiftCardType | undefined = getGiftCardType(giftCardId);

                if (giftCardType != undefined) {
                    saveGiftCardSelections(oVoucherId, giftCardId, giftCardType?.productId, giftCard?.recipientLastName, giftCard?.recipientPostal);
                }
            }
        }
    }
}