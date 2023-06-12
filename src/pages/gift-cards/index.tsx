import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'
import { AppContext, IAppContextValues, ICartItem, IGiftCard, IGiftCardType } from '@/custom/app-context';
import AuthenticatedPageLayout, { IShowHoverButton } from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import CartItemsAlert from '@/components/cart-items-alert';
import { formatCurrency, getApiErrorMessage, getGuid, parseDate } from '@/custom/utilities';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { IApiAddGiftCardForUserRequest, IApiAddGiftCardForUserResult, IApiDeleteGiftCardRequest, IApiDeleteGiftCardResult, IApiGetAvailableGiftCardsResult, IApiGetGiftcardsForCurrentSeasonForUserResult, IApiSaveGiftCardSelectionsForUserRequest, IApiSaveGiftCardSelectionsForUserResult, apiAddGiftCardForUser, apiDeleteGiftCard, apiGetAvailableGiftCards, apiGetGiftcardsForCurrentSeasonForUser, apiSaveGiftCardSelectionsForUser } from '@/custom/api';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { Constants } from '../../../constants';

export default function GiftCardsPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    // Display loading indicator.
    const [showAlert, setShowAlert] = useState(true);

    // Display hover button.
    const [showHoverButton, setShowHoverButton] = useState({} as IShowHoverButton);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "gift-cards" });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthenticatedPageLayout showAlert={showAlert} showHoverButton={showHoverButton}>
            <GiftCards appContext={appContext} router={router} setShowAlert={setShowAlert} setShowHoverButton={setShowHoverButton}></GiftCards>
        </AuthenticatedPageLayout>
    )
}

function GiftCards({ appContext, router, setShowAlert, setShowHoverButton }
    : {
        appContext: IAppContextValues, router: NextRouter,
        setShowAlert: Dispatch<SetStateAction<boolean>>,
        setShowHoverButton: Dispatch<SetStateAction<IShowHoverButton>>
    }) {

    const [showDeleteGiftCardDialog, setShowDeleteGiftCardDialog] = useState(false);
    const [deleteGiftCardDialogErrorMessage, setDeleteGiftCardDialogErrorMessage] = useState("");
    const [giftCardIdToDelete, setGiftCardIdToDelete] = useState("");

    const [giftCardTypesData, setGiftCardTypesData] = useState([] as IGiftCardType[]);

    const t: Function = appContext.translation.t;

    useEffect(() => {
        setHoverButtonVisibility(true);

        // Get data from api.
        const batchApi: Observable<any>[] = [
            apiGetGiftcardsForCurrentSeasonForUser(),
            apiGetAvailableGiftCards()
        ];

        const subscription: Subscription = forkJoin(batchApi).subscribe({
            next: (results: any[]) => {
                // apiGetGiftcardsForCurrentSeasonForUser
                const apiGetGiftcardsForCurrentSeasonForUserResult: IApiGetGiftcardsForCurrentSeasonForUserResult[] = results[0] as IApiGetGiftcardsForCurrentSeasonForUserResult[];

                if (apiGetGiftcardsForCurrentSeasonForUserResult != undefined) {
                    const giftCards: IGiftCard[] = apiGetGiftcardsForCurrentSeasonForUserResult.map<IGiftCard>((x: IApiGetGiftcardsForCurrentSeasonForUserResult) => ({
                        giftcardProductId: x?.giftcardProductId,
                        oVoucherId: x?.oVoucherId,
                        orderId: x?.orderId,
                        transactionDate: parseDate(x?.transactionDate),
                        recipientLastName: x?.recipientLastName,
                        recipientPostal: x?.recipientPostal,
                        redemptionCode: x?.redemptionCode,
                        purchaserEmail: x?.purchaserEmail,
                        isRedeemed: x?.isRedeemed,
                        isPurchased: x?.isPurchased,
                        useShippingAddress: x?.useShippingAddress,
                        shippingOption: x?.shippingOption,
                        clubId: x?.clubId,
                        permitId: x?.permitId,
                        isClassic: x?.isClassic,
                        isTrackedShipping: x?.isTrackedShipping,
                        trackedShippingAmount: x?.trackedShippingAmount,
                        amount: x?.amount,
                        displayName: x?.displayName,
                        frenchDisplayName: x?.frenchDisplayName,

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
                    const giftCardTypes: IGiftCardType[] = apiGetAvailableGiftCardsResult.map<IGiftCardType>((x: IApiGetAvailableGiftCardsResult) => ({
                        productId: x?.productId,
                        name: x?.name,
                        displayName: x?.displayName,
                        frenchDisplayName: x?.frenchDisplayName,
                        amount: x?.amount,
                        testAmount: x?.testAmount,
                        classic: x?.classic,
                        giftcardProductId: x?.giftcardProductId,
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

        return () => {
            subscription.unsubscribe();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Head>
                <title>{t("GiftCards.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <h4>{t("GiftCards.Title")}</h4>

            <CartItemsAlert></CartItemsAlert>

            {appContext.translation.i18n.language === "en" && (
                <>
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
                </>
            )}

            {appContext.translation.i18n.language === "fr" && (
                <>
                    <div className="fw-semibold">Gift Cards are ideal for those who:</div>
                    <ul>
                        <li>Do not yet have a VIN and want to take advantage of pre-season fees</li>
                        <li>Want to gift a permit for a family member, friend, business associate, customer, etc.</li>
                    </ul>

                    <div className="fw-semibold">Gift card options based on recipient's vehicle model year:</div>
                    <ul>
                        <li>Classique (1999 ou avant)</li>
                        <li>Saisonnier (2000 ou plus récent)</li>
                    </ul>
                </>
            )}

            {getGiftCards() != undefined && getGiftCards().length > 0 && getGiftCards().map(giftCard => (
                <div className="card mb-3" key={giftCard.oVoucherId}>
                    <h5 className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div className="d-flex flex-fill">
                            {giftCard.isPurchased && appContext.translation.i18n.language === "en" && (
                                <span>Purchased {getGiftCardName(giftCard?.oVoucherId)}</span>
                            )}
                            {giftCard.isPurchased && appContext.translation.i18n.language === "fr" && (
                                <span>Purchased {getGiftCardName(giftCard?.oVoucherId, "fr")}</span>
                            )}

                            {!giftCard.isPurchased && (
                                <span>Buy New Gift Card</span>
                            )}
                        </div>

                        <div className="d-flex flex-fill justify-content-end">
                            {giftCard?.isPurchased && !giftCard?.isRedeemed && (
                                <button className="btn btn-outline-dark btn-sm" onClick={() => editGiftCardClick(giftCard?.oVoucherId)} disabled={isGiftCardAddedToCart(giftCard?.oVoucherId) || giftCard?.uiIsInEditMode}>{t("Common.Edit")}</button>
                            )}

                            {!giftCard?.isPurchased && !giftCard?.isRedeemed && !isGiftCardAddedToCart(giftCard?.oVoucherId) && (
                                <button className="btn btn-outline-dark btn-sm ms-1" onClick={() => deleteGiftCardDialogShow(giftCard?.oVoucherId)} disabled={isGiftCardAddedToCart(giftCard?.oVoucherId)}>{t("Common.Delete")}</button>
                            )}
                        </div>
                    </h5>

                    <ul className="list-group list-group-flush">
                        {giftCard?.isPurchased && (
                            <li className="list-group-item">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                    <div className="d-flex flex-fill flex-column">
                                        <label htmlFor={`redemption-code-${giftCard?.oVoucherId}`} className="form-label fw-semibold mb-0">{t("GiftCards.RedemptionCode")}</label>
                                        <input id={`redemption-code-${giftCard?.oVoucherId}`} type="text" readOnly={true} className="form-control-plaintext font-monospace mb-0" value={giftCard?.redemptionCode} />
                                    </div>

                                    <div className="d-flex flex-fill justify-content-end">
                                        <button className="btn btn-outline-dark btn-sm">{t("GiftCards.ResendEmail")}</button>
                                    </div>
                                </div>
                            </li>
                        )}

                        {!giftCard?.isPurchased && !giftCard?.isRedeemed && (
                            <li className="list-group-item">
                                <div className="form-floating">
                                    <select className="form-select" id={`gift-cards-permit-options-${giftCard?.oVoucherId}`} aria-label="Select gift card to purchase" value={getSelectedGiftCardOption(giftCard?.oVoucherId)} onChange={(e: any) => giftCardOptionChange(e, giftCard?.oVoucherId)} disabled={isGiftCardAddedToCart(giftCard?.oVoucherId)}>
                                        <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                        {giftCardTypesData != undefined && giftCardTypesData.length > 0 && getGiftCardTypesData().map(giftCardType => {
                                            let displayText: string = "";

                                            if (appContext.translation.i18n.language === "fr") {
                                                displayText = getGiftCardTypeName(giftCardType?.giftcardProductId, "fr");
                                            } else {
                                                displayText = getGiftCardTypeName(giftCardType?.giftcardProductId);
                                            }

                                            displayText += " — $" + formatCurrency(getGiftCardTypeAmount(giftCardType?.giftcardProductId));

                                            return (
                                                <option value={giftCardType?.giftcardProductId} key={giftCardType?.giftcardProductId}>{displayText}</option>
                                            )
                                        })}
                                    </select>
                                    <label className="required" htmlFor={`gift-cards-permit-options-${giftCard?.oVoucherId}`}>{t("GiftCards.SelectGiftCard")}</label>
                                </div>
                            </li>
                        )}

                        <li className="list-group-item">
                            <div className="row">
                                <div className="col-12 col-sm-12 col-md-6">
                                    <div className="form-floating mb-2">
                                        <input type="text" className="form-control" id={`gift-card-last-name-${giftCard?.oVoucherId}`} placeholder="Recipient's LAST Name ONLY" value={getGiftCardRecipientLastName(giftCard?.oVoucherId)} onChange={(e: any) => giftCardLastNameChange(e, giftCard?.oVoucherId)} disabled={!isGiftCardLastNameEnabled(giftCard?.oVoucherId)} />
                                        <label className="required" htmlFor={`gift-card-last-name-${giftCard?.oVoucherId}`}>{t("GiftCards.RecipientsLastNameOnly")}</label>
                                    </div>
                                </div>

                                <div className="col-12 col-sm-12 col-md-6">
                                    <div className="form-floating mb-2">
                                        <input type="text" className="form-control" id={`gift-card-postal-code-${giftCard?.oVoucherId}`} placeholder="Recipient's Postal Code" value={getGiftCardRecipientPostalCode(giftCard?.oVoucherId)} onChange={(e: any) => giftCardPostalCodeChange(e, giftCard?.oVoucherId)} disabled={!isGiftCardPostalCodeEnabled(giftCard?.oVoucherId)} />
                                        <label className="required" htmlFor={`gift-card-postal-code-${giftCard?.oVoucherId}`}>{t("GiftCards.RecipientsPostalCode")}</label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-danger me-1">*</span>= {t("GiftCards.MandatoryFieldMustMatch")}
                            </div>
                        </li>
                    </ul>

                    {((!giftCard?.isPurchased && !giftCard?.isRedeemed && !isGiftCardAddedToCart(giftCard?.oVoucherId))
                        || (!giftCard?.isPurchased && !giftCard?.isRedeemed && isGiftCardAddedToCart(giftCard?.oVoucherId))
                        || (giftCard?.isPurchased && !giftCard?.isRedeemed && giftCard?.uiIsInEditMode)) && (
                            <div className="card-footer">
                                {!giftCard?.isPurchased && !giftCard?.isRedeemed && !isGiftCardAddedToCart(giftCard?.oVoucherId) && (
                                    <button className="btn btn-outline-dark btn-sm me-2" onClick={() => addGiftCardToCartClick(giftCard?.oVoucherId)} disabled={!isAddToCartEnabled(giftCard?.oVoucherId)}>{t("GiftCards.AddGiftCardToCart")}</button>
                                )}

                                {!giftCard?.isPurchased && !giftCard?.isRedeemed && isGiftCardAddedToCart(giftCard?.oVoucherId) && (
                                    <button className="btn btn-outline-dark btn-sm" onClick={() => removeGiftCardFromCartClick(giftCard?.oVoucherId)}>{t("GiftCards.RemoveGiftCardFromCart")}</button>
                                )}

                                {giftCard?.isPurchased && !giftCard?.isRedeemed && giftCard?.uiIsInEditMode && (
                                    <button className="btn btn-outline-dark btn-sm me-2" onClick={() => saveGiftCardChangesClick(giftCard?.oVoucherId)}>{t("GiftCards.SaveChanges")}</button>
                                )}

                                {giftCard?.isPurchased && !giftCard?.isRedeemed && giftCard?.uiIsInEditMode && (
                                    <button className="btn btn-outline-dark btn-sm" onClick={() => cancelGiftCardChangesClick(giftCard?.oVoucherId)}>{t("GiftCards.CancelChanges")}</button>
                                )}
                            </div>
                        )}
                </div>
            ))}

            <div className="card">
                <div className="card-body text-center">
                    <button className="btn btn-dark mt-2" onClick={() => addGiftCardClick()}>{t("GiftCards.AddGiftCard")}</button>
                </div>
            </div>

            <ConfirmationDialog showDialog={showDeleteGiftCardDialog} title={t("GiftCards.DeleteGiftCardDialog.Title")} errorMessage={deleteGiftCardDialogErrorMessage} buttons={2} icon="question" width="50"
                yesClick={() => deleteGiftCardDialogYesClick()} noClick={() => deleteGiftCardDialogNoClick()} closeClick={() => deleteGiftCardDialogNoClick()}>
                <div>{t("GiftCards.DeleteGiftCardDialog.Message")}</div>
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

    function getGiftCardType(giftcardProductId?: number): IGiftCardType | undefined {
        let result: IGiftCardType | undefined = undefined;

        if (giftcardProductId != undefined) {
            result = getGiftCardTypesData()?.filter(x => x?.giftcardProductId === giftcardProductId)[0];
        }

        return result;
    }

    function getGiftCardName(oVoucherId?: string, language: string = "en"): string {
        let result: string = "";

        if (oVoucherId != undefined) {
            const giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                if (language === "fr") {
                    result = giftCard?.frenchDisplayName + " (fr) Gift Card";

                    if (giftCard?.isTrackedShipping) {
                        result += " (fr) with Tracking";
                    } else {
                        result += " (fr) without Tracking";
                    }
                } else {
                    result = giftCard?.displayName + " Gift Card";

                    if (giftCard?.isTrackedShipping) {
                        result += " with Tracking";
                    } else {
                        result += " without Tracking";
                    }
                }
            }
        }

        return result;
    }

    function getGiftCardAmount(oVoucherId?: string): number {
        let result: number = 0;

        if (oVoucherId != undefined) {
            const giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                result = (giftCard?.amount ?? 0) + (giftCard?.isTrackedShipping ? (giftCard?.trackedShippingAmount ?? 0) : 0);
            }
        }

        return result;
    }

    function getGiftCardTypeName(giftcardProductId?: number, language: string = "en"): string {
        let result: string = "";

        if (giftcardProductId != undefined) {
            const giftCardType: IGiftCardType | undefined = getGiftCardType(giftcardProductId);

            if (giftCardType != undefined) {
                if (language === "fr") {
                    result = giftCardType?.frenchDisplayName + " (fr) Gift Card";

                    if (giftCardType?.isTrackedShipping) {
                        result += " (fr) with Tracking";
                    } else {
                        result += " (fr) without Tracking";
                    }
                } else {
                    result = giftCardType?.displayName + " Gift Card";

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

    function getGiftCardTypeAmount(giftcardProductId?: number): number {
        let result: number = 0;

        if (giftcardProductId != undefined) {
            const giftCardType: IGiftCardType | undefined = getGiftCardType(giftcardProductId);

            if (giftCardType != undefined) {
                result = (giftCardType?.amount ?? 0) + (giftCardType?.isTrackedShipping ? (giftCardType?.trackedShippingAmount ?? 0) : 0);
            }

        }

        return result;
    }

    function addGiftCardClick(): void {
        const addGiftCardRequest: IApiAddGiftCardForUserRequest = {};

        setShowAlert(true);

        apiAddGiftCardForUser(addGiftCardRequest).subscribe({
            next: (result: IApiAddGiftCardForUserResult) => {
                if (result?.isSuccessful && result?.data != undefined) {
                    const newGiftCard: IGiftCard = {
                        giftcardProductId: result?.data?.giftcardProductId,
                        oVoucherId: result?.data?.oVoucherId,
                        orderId: result?.data?.orderId,
                        transactionDate: parseDate(result?.data?.transactionDate),
                        recipientLastName: result?.data?.recipientLastName,
                        recipientPostal: result?.data?.recipientPostal,
                        redemptionCode: result?.data?.redemptionCode,
                        purchaserEmail: result?.data?.purchaserEmail,
                        isRedeemed: result?.data?.isRedeemed,
                        isPurchased: result?.data?.isPurchased,
                        useShippingAddress: result?.data?.useShippingAddress,
                        shippingOption: result?.data?.shippingOption,
                        clubId: result?.data?.clubId,
                        permitId: result?.data?.permitId,
                        isClassic: result?.data?.isClassic,
                        isTrackedShipping: result?.data?.isTrackedShipping,
                        trackedShippingAmount: result?.data?.trackedShippingAmount,
                        amount: result?.data?.amount,
                        displayName: result?.data?.displayName,
                        frenchDisplayName: result?.data?.frenchDisplayName,
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
                const draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

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
            const giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

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
                const draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

                if (draftGiftCard != undefined) {
                    const lastName: string | undefined = e?.target?.value;

                    if (draftGiftCard?.isPurchased) {
                        draftGiftCard.uiRecipientLastName = lastName;
                    } else {
                        draftGiftCard.recipientLastName = lastName;
                        saveGiftCardSelections(oVoucherId, draftGiftCard?.giftcardProductId, lastName, draftGiftCard?.recipientPostal);
                    }
                }
            });
        }
    }

    function isGiftCardLastNameEnabled(oVoucherId?: string): boolean {
        let result: boolean = false;

        if (oVoucherId != undefined) {
            const giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

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
            const giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

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
                const draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

                if (draftGiftCard != undefined) {
                    const postalCode: string | undefined = e?.target?.value;

                    if (draftGiftCard?.isPurchased) {
                        draftGiftCard.uiRecipientPostal = postalCode;
                    } else {
                        draftGiftCard.recipientPostal = postalCode;
                        saveGiftCardSelections(oVoucherId, draftGiftCard?.giftcardProductId, draftGiftCard?.recipientLastName, postalCode);
                    }
                }
            });
        }
    }

    function isGiftCardPostalCodeEnabled(oVoucherId?: string): boolean {
        let result: boolean = false;

        if (oVoucherId != undefined) {
            const giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                result = (!isGiftCardAddedToCart(oVoucherId)
                    && (!giftCard?.isPurchased || (giftCard?.isPurchased && giftCard?.uiIsInEditMode))
                    && !giftCard?.isRedeemed
                ) ?? false;
            }
        }

        return result;
    }

    function saveGiftCardSelections(oVoucherId?: string, giftcardProductId?: number, recipientLastName?: string, recipientPostal?: string): void {
        if (oVoucherId != undefined) {
            const apiSaveGiftCardSelectionsForUserRequest: IApiSaveGiftCardSelectionsForUserRequest | undefined = {
                oVoucherId: oVoucherId,
                giftcardProductId: giftcardProductId,
                recipientLastName: recipientLastName,
                recipientPostal: recipientPostal
            };

            //setShowAlert(true);

            apiSaveGiftCardSelectionsForUser(apiSaveGiftCardSelectionsForUserRequest).subscribe({
                next: (result: IApiSaveGiftCardSelectionsForUserResult) => {
                    if (result?.isSuccessful && result?.data != undefined) {
                        appContext.updater(draft => {
                            const draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

                            if (draftGiftCard != undefined) {
                                draftGiftCard.giftcardProductId = result?.data?.giftcardProductId;
                                draftGiftCard.oVoucherId = result?.data?.oVoucherId;
                                draftGiftCard.orderId = result?.data?.orderId;
                                draftGiftCard.transactionDate = result?.data?.transactionDate;
                                draftGiftCard.recipientLastName = result?.data?.recipientLastName;
                                draftGiftCard.recipientPostal = result?.data?.recipientPostal;
                                draftGiftCard.redemptionCode = result?.data?.redemptionCode;
                                draftGiftCard.purchaserEmail = result?.data?.purchaserEmail;
                                draftGiftCard.isRedeemed = result?.data?.isRedeemed;
                                draftGiftCard.isPurchased = result?.data?.isPurchased;
                                draftGiftCard.useShippingAddress = result?.data?.useShippingAddress;
                                draftGiftCard.shippingOption = result?.data?.shippingOption;
                                draftGiftCard.clubId = result?.data?.clubId;
                                draftGiftCard.permitId = result?.data?.permitId;
                                draftGiftCard.isClassic = result?.data?.isClassic;
                                draftGiftCard.isTrackedShipping = result?.data?.isTrackedShipping;
                                draftGiftCard.trackedShippingAmount = result?.data?.trackedShippingAmount;
                                draftGiftCard.amount = result?.data?.amount;
                                draftGiftCard.displayName = result?.data?.displayName;
                                draftGiftCard.frenchDisplayName = result?.data?.frenchDisplayName;
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
            const giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                const cartItem: ICartItem = {
                    id: getGuid(),
                    description: getGiftCardTypeName(giftCard?.giftcardProductId) + ` — ${giftCard?.recipientLastName} — ${giftCard?.recipientPostal}`,
                    descriptionFr: getGiftCardTypeName(giftCard?.giftcardProductId, "fr") + ` — ${giftCard?.recipientLastName} — ${giftCard?.recipientPostal}`,
                    price: getGiftCardTypeAmount(giftCard?.giftcardProductId),
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
                const draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

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
                const draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

                if (draftGiftCard != undefined) {
                    draftGiftCard.uiIsInEditMode = false;
                }
            });
        }
    }

    function isAddToCartEnabled(oVoucherId?: string): boolean {
        let result: boolean = false;

        if (oVoucherId != undefined) {
            const giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                result = giftCard?.giftcardProductId != undefined && giftCard?.giftcardProductId !== 0
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

            setHoverButtonVisibility(false);
        }
    }

    function deleteGiftCardDialogYesClick(): void {
        const apiDeleteGiftCardRequest: IApiDeleteGiftCardRequest = {
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

                    setHoverButtonVisibility(true);
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

        setHoverButtonVisibility(true);
    }

    function getSelectedGiftCardOption(oVoucherId?: string): string {
        let result: string = "";

        if (oVoucherId != undefined) {
            const giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined && giftCard?.giftcardProductId != undefined) {
                result = giftCard?.giftcardProductId?.toString() ?? "";
            }
        }

        return result;
    }

    function giftCardOptionChange(e: any, oVoucherId?: string): void {
        if (e != undefined && oVoucherId != undefined) {
            const giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                const giftcardProductId: number = Number(e?.target?.value);

                saveGiftCardSelections(oVoucherId, giftcardProductId, giftCard?.recipientLastName, giftCard?.recipientPostal);
            }
        }
    }

    function setHoverButtonVisibility(isVisible: boolean): void {
        setShowHoverButton({
            showHoverButton: isVisible,
            getButtonText: (): string => { return t("GiftCards.HoverButtons.AddGiftCard"); },
            action: addGiftCardClick
        });
    }
}