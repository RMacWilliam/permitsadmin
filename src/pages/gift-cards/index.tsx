import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'
import { AppContext, IAppContextValues, ICartItem, IGiftCard, IGiftCardType } from '@/custom/app-context';
import AuthenticatedPageLayout, { IShowHoverButton } from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';
import CartItemsAlert from '@/components/cart-items-alert';
import { checkResponseStatus, formatCurrency, getApiErrorMessage, getDate, getGuid, getMoment, parseDate } from '@/custom/utilities';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { IApiAddGiftCardForUserRequest, IApiAddGiftCardForUserResult, IApiDeleteGiftCardRequest, IApiDeleteGiftCardResult, IApiGetAvailableGiftCardsResult, IApiGetGiftcardsForCurrentSeasonForUserResult, IApiSaveGiftCardSelectionsForUserRequest, IApiSaveGiftCardSelectionsForUserResult, IApiSendGiftCardPdfRequest, IApiSendGiftCardPdfResult, apiAddGiftCardForUser, apiDeleteGiftCard, apiGetAvailableGiftCards, apiGetGiftcardsForCurrentSeasonForUser, apiSaveGiftCardSelectionsForUser, apiSendGiftCardPdf } from '@/custom/api';
import ConfirmationDialog, { ConfirmationDialogButtons, ConfirmationDialogIcons } from '@/components/confirmation-dialog';

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
        appContext: IAppContextValues,
        router: NextRouter,
        setShowAlert: Dispatch<SetStateAction<boolean>>,
        setShowHoverButton: Dispatch<SetStateAction<IShowHoverButton>>
    }) {

    const [showDeleteGiftCardDialog, setShowDeleteGiftCardDialog] = useState(false);
    const [deleteGiftCardDialogErrorMessage, setDeleteGiftCardDialogErrorMessage] = useState("");
    const [giftCardIdToDelete, setGiftCardIdToDelete] = useState("");

    const [showResendGiftCardEmailDialog, setShowResendGiftCardEmailDialog] = useState(false);
    const [resendGiftCardEmailMessage, setResendGiftCardEmailMessage] = useState("");

    const [giftCardTypesData, setGiftCardTypesData] = useState([] as IGiftCardType[]);

    const t: Function = appContext.translation.t;

    useEffect(() => {
        const intervalRef: NodeJS.Timer = setInterval(() => {
            appContext.updater(draft => {
                const giftCardsToUpdate: IGiftCard[] | undefined = draft?.giftCards?.filter(x => x?.uiRecipientInfoLastChangeDate != undefined);

                if (giftCardsToUpdate != undefined && giftCardsToUpdate.length > 0) {
                    giftCardsToUpdate.forEach(giftCard => {
                        // Call api to save changes if change was made >= 2 seconds ago.
                        // This will prevent repetative api calls when user is modifying textbox content.
                        if (getMoment().diff(getMoment(giftCard?.uiRecipientInfoLastChangeDate), "seconds") >= 2) {
                            giftCard.uiRecipientInfoLastChangeDate = undefined;
                            saveGiftCardSelections(giftCard?.oVoucherId, giftCard?.isPurchased, giftCard?.giftcardProductId, giftCard?.recipientLastName, giftCard?.recipientPostal);
                        }
                    });
                }
            });
        }, 1000);

        return () => {
            clearInterval(intervalRef);
        }
    }, []);

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

                        uiIsEditMode: false,
                        uiRecipientInfoLastChangeDate: undefined,
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
            },
            error: (error: any) => {
                checkResponseStatus(error);
            },
            complete: () => {
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

            <h4 className="mb-3">{t("GiftCards.Title")}</h4>

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
                    <div className="fw-semibold">Les cartes-cadeaux sont idéales pour ceux qui:</div>
                    <ul>
                        <li>n'ont pas encore la propriété du véhicule et veulent profiter des frais d'inscription hâtive</li>
                        <li>veulent offrir un permis à un membre de leur famille, un ami, un associé, un client, etc.</li>
                    </ul>

                    <div className="fw-semibold">Options de cartes-cadeaux en fonction de l'année-modèle du véhicule du bénéficiaire:</div>
                    <ul>
                        <li>Classique (1999 ou avant)</li>
                        <li>Saisonnier (2000 ou plus récent)</li>
                    </ul>
                </>
            )}

            {getGiftCards() != undefined && getGiftCards().length > 0 && getGiftCards().map(giftCard => (
                <div className="card mb-3" key={giftCard?.oVoucherId}>
                    <div className="card-header bg-success-subtle">
                        <div className="row gap-3">
                            <div className="col d-flex justify-content-center justify-content-md-start align-items-center text-center fw-semibold">
                                {giftCard.isPurchased && appContext.translation.i18n.language === "en" && (
                                    <div>{getGiftCardName(giftCard?.oVoucherId)}</div>
                                )}
                                {giftCard.isPurchased && appContext.translation.i18n.language === "fr" && (
                                    <span>{getGiftCardName(giftCard?.oVoucherId, "fr")}</span>
                                )}

                                {!giftCard.isPurchased && (
                                    <span>{t("GiftCards.BuyNewGiftCard")}</span>
                                )}
                            </div>

                            <div className="col-12 col-md-auto d-flex align-items-center">
                                {giftCard?.isPurchased && !giftCard?.isRedeemed && (
                                    <button className="btn btn-outline-dark btn-sm w-sm-100" onClick={() => editGiftCardClick(giftCard?.oVoucherId)} disabled={isGiftCardAddedToCart(giftCard?.oVoucherId) || giftCard?.uiIsEditMode}>
                                        {t("Common.Edit")}
                                    </button>
                                )}

                                {!giftCard?.isPurchased && !giftCard?.isRedeemed && !isGiftCardAddedToCart(giftCard?.oVoucherId) && (
                                    <button className="btn btn-outline-dark btn-sm ms-1 w-sm-100" onClick={() => deleteGiftCardDialogShow(giftCard?.oVoucherId)} disabled={isGiftCardAddedToCart(giftCard?.oVoucherId)}>
                                        {t("Common.Delete")}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <ul className="list-group list-group-flush">
                        {giftCard?.isPurchased && (
                            <li className="list-group-item">
                                <div className="row gap-3">
                                    <div className="col d-flex justify-content-center justify-content-md-start align-items-center">
                                        {/* <label htmlFor={`redemption-code-${giftCard?.oVoucherId}`} className="form-label fw-semibold mb-0">{t("GiftCards.RedemptionCode")}</label> */}
                                        {/* <input id={`redemption-code-${giftCard?.oVoucherId}`} type="text" readOnly={true} className="form-control-plaintext font-monospace mb-0 pb-0" value={giftCard?.redemptionCode} /> */}

                                        <div className="d-flex justify-content-around align-items-center flex-wrap flex-sm-nowrap position-relative mt-2 mb-1 p-2" style={{ border: "black dashed 2px" }}>
                                            <i className="fa-solid fa-scissors position-absolute" style={{ top: "-9px", right: "11px", backgroundColor: "white" }}></i>
                                            <div className="fw-semibold mx-3 my-1">{t("GiftCards.RedemptionCode")}:</div>
                                            <div className="mx-3 my-1">{giftCard?.redemptionCode}</div>
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-auto d-flex align-items-center">
                                        <button className="btn btn-outline-dark btn-sm w-sm-100" onClick={() => resendEmailClick(giftCard?.oVoucherId)}>
                                            <i className="fa-solid fa-envelope"></i> {t("GiftCards.ResendEmail")}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        )}

                        <li className="list-group-item">
                            {!giftCard?.isPurchased && !giftCard?.isRedeemed && (
                                <div className="form-floating mb-2">
                                    <select className="form-select" id={`gift-cards-permit-options-${giftCard?.oVoucherId}`} aria-label="Select gift card to purchase" value={getSelectedGiftCardOption(giftCard?.oVoucherId)} onChange={(e: any) => giftCardOptionChange(e, giftCard?.oVoucherId)} disabled={giftCard?.uiGiftcardProductIdLoading || isGiftCardAddedToCart(giftCard?.oVoucherId)}>
                                        <option value="" disabled>{t("Common.PleaseSelect")}</option>

                                        {giftCardTypesData != undefined && giftCardTypesData.length > 0 && getGiftCardTypesData().map(giftCardType => {
                                            let displayText: string = "";

                                            if (appContext.translation.i18n.language === "fr") {
                                                displayText = getGiftCardTypeName(giftCardType?.giftcardProductId, "fr");
                                            } else {
                                                displayText = getGiftCardTypeName(giftCardType?.giftcardProductId);
                                            }

                                            displayText += " — " + formatCurrency(getGiftCardTypeAmount(giftCardType?.giftcardProductId));

                                            return (
                                                <option value={giftCardType?.giftcardProductId} key={giftCardType?.giftcardProductId}>{displayText}</option>
                                            )
                                        })}
                                    </select>
                                    <label className="required" htmlFor={`gift-cards-permit-options-${giftCard?.oVoucherId}`}>{t("GiftCards.SelectGiftCard")}</label>

                                    {giftCard?.uiGiftcardProductIdLoading && (
                                        <span className="position-absolute" style={{ left: "50%", top: "30%" }}>
                                            <i className="fa-solid fa-spinner fa-spin fa-xl"></i>
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="row mb-2">
                                <div className="col-12 col-sm-12 col-md-6 mb-2 mb-md-0">
                                    <div className="form-floating">
                                        <input type="text" className="form-control" id={`gift-card-last-name-${giftCard?.oVoucherId}`} placeholder="Recipient's LAST Name ONLY" maxLength={150} value={getGiftCardRecipientLastName(giftCard?.oVoucherId)} onChange={(e: any) => giftCardLastNameChange(e, giftCard?.oVoucherId)} disabled={!isGiftCardLastNameEnabled(giftCard?.oVoucherId)} />
                                        <label className="required" htmlFor={`gift-card-last-name-${giftCard?.oVoucherId}`}>{t("GiftCards.RecipientsLastNameOnly")}</label>
                                    </div>
                                </div>

                                <div className="col-12 col-sm-12 col-md-6">
                                    <div className="form-floating">
                                        <input type="text" className="form-control" id={`gift-card-postal-code-${giftCard?.oVoucherId}`} placeholder="Recipient's Postal Code" maxLength={7} value={getGiftCardRecipientPostalCode(giftCard?.oVoucherId)} onChange={(e: any) => giftCardPostalCodeChange(e, giftCard?.oVoucherId)} disabled={!isGiftCardPostalCodeEnabled(giftCard?.oVoucherId)} />
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
                        || (giftCard?.isPurchased && !giftCard?.isRedeemed && giftCard?.uiIsEditMode)) && (
                            <div className="card-footer">
                                {!giftCard?.isPurchased && !giftCard?.isRedeemed && !isGiftCardAddedToCart(giftCard?.oVoucherId) && (
                                    <button className="btn btn-outline-dark btn-sm me-2" onClick={() => addGiftCardToCartClick(giftCard?.oVoucherId)} disabled={!isAddToCartEnabled(giftCard?.oVoucherId)}>
                                        <i className="fa-solid fa-plus"></i> {t("GiftCards.AddGiftCardToCart")}
                                    </button>
                                )}

                                {!giftCard?.isPurchased && !giftCard?.isRedeemed && isGiftCardAddedToCart(giftCard?.oVoucherId) && (
                                    <button className="btn btn-outline-dark btn-sm" onClick={() => removeGiftCardFromCartClick(giftCard?.oVoucherId)}>
                                        <i className="fa-solid fa-xmark"></i> {t("GiftCards.RemoveGiftCardFromCart")}
                                    </button>
                                )}

                                {giftCard?.isPurchased && !giftCard?.isRedeemed && giftCard?.uiIsEditMode && (
                                    <button className="btn btn-outline-dark btn-sm me-2" onClick={() => saveGiftCardChangesClick(giftCard?.oVoucherId)}>
                                        <i className="fa-solid fa-floppy-disk"></i> {t("GiftCards.SaveChanges")}
                                    </button>
                                )}

                                {giftCard?.isPurchased && !giftCard?.isRedeemed && giftCard?.uiIsEditMode && (
                                    <button className="btn btn-outline-dark btn-sm" onClick={() => cancelGiftCardChangesClick(giftCard?.oVoucherId)}>
                                        <i className="fa-solid fa-xmark"></i> {t("GiftCards.CancelChanges")}
                                    </button>
                                )}
                            </div>
                        )}
                </div>
            ))}

            <div className="card">
                <div className="card-body text-center">
                    <button className="btn btn-primary" onClick={() => addGiftCardClick()}>
                        {t("GiftCards.AddGiftCard")}
                    </button>

                    <button className="btn btn-primary ms-1" onClick={() => router.push("/cart")}>
                        {t("GiftCards.ProceedWithPurchase")}
                    </button>
                </div>
            </div>

            <ConfirmationDialog showDialog={showDeleteGiftCardDialog} title={t("GiftCards.DeleteGiftCardDialog.Title")} errorMessage={deleteGiftCardDialogErrorMessage} buttons={ConfirmationDialogButtons.YesNo} icon={ConfirmationDialogIcons.Question} width="50"
                yesClick={() => deleteGiftCardDialogYesClick()} noClick={() => deleteGiftCardDialogNoClick()} closeClick={() => deleteGiftCardDialogNoClick()}>
                <div>{t("GiftCards.DeleteGiftCardDialog.Message")}</div>
            </ConfirmationDialog>

            <ConfirmationDialog showDialog={showResendGiftCardEmailDialog} title={t("GiftCards.ResendGiftCardEmailDialog.Title")} buttons={ConfirmationDialogButtons.Ok} icon={ConfirmationDialogIcons.Information} width="50"
                okClick={() => setShowResendGiftCardEmailDialog(false)} closeClick={() => setShowResendGiftCardEmailDialog(false)}>
                <div>{resendGiftCardEmailMessage}</div>
            </ConfirmationDialog>
        </>
    )

    function getGiftCards(): IGiftCard[] {
        let result: IGiftCard[] = [];

        if (appContext.data?.giftCards != undefined && appContext.data.giftCards.length > 0) {
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
                if (language === "fr") { // Carte-cadeau classique achetée sans suivi
                    result = t("GiftCards.GiftCard") + " " + giftCard?.frenchDisplayName?.toLowerCase() + " " + t("GiftCards.Purchased");

                    if (giftCard?.isTrackedShipping) {
                        result += " " + t("GiftCards.WithTracking");
                    } else {
                        result += " " + t("GiftCards.WithoutTracking");
                    }
                } else { // Purchased Classic gift card without tracking
                    result = t("GiftCards.Purchased") + " " + giftCard?.displayName + " " + t("GiftCards.GiftCard");

                    if (giftCard?.isTrackedShipping) {
                        result += " " + t("GiftCards.WithTracking");
                    } else {
                        result += " " + t("GiftCards.WithoutTracking");
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
                if (language === "fr") { // Carte-cadeau classique sans suivi
                    result = appContext.translation.i18n.getResource("fr", "translation", "GiftCards.GiftCard") + " " + giftCardType?.frenchDisplayName?.toLowerCase();

                    if (giftCardType?.isTrackedShipping) {
                        result += " " + appContext.translation.i18n.getResource("fr", "translation", "GiftCards.WithTracking");
                    } else {
                        result += " " + appContext.translation.i18n.getResource("fr", "translation", "GiftCards.WithoutTracking");
                    }
                } else { // Classic gift card without tracking
                    result = giftCardType?.displayName + " " + appContext.translation.i18n.getResource("en", "translation", "GiftCards.GiftCard");

                    if (giftCardType?.isTrackedShipping) {
                        result += " " + appContext.translation.i18n.getResource("en", "translation", "GiftCards.WithTracking");
                    } else {
                        result += " " + appContext.translation.i18n.getResource("en", "translation", "GiftCards.WithoutTracking");
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
                    //
                }
            },
            error: (error: any) => {
                checkResponseStatus(error);
            },
            complete: () => {
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
                    draftGiftCard.uiRecipientInfoLastChangeDate = undefined;
                    draftGiftCard.uiIsEditMode = true;
                }
            });
        }
    }

    function getGiftCardRecipientLastName(oVoucherId?: string): string | undefined {
        let result: string | undefined = undefined;

        if (oVoucherId != undefined) {
            const giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                if (giftCard?.uiIsEditMode) {
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
                        // This is a purchased gift card. Gift card can only be modified in edit mode.
                        draftGiftCard.uiRecipientLastName = lastName;
                    } else {
                        // This is an unpurchased gift card. Gift card is open for modification.
                        draftGiftCard.recipientLastName = lastName;
                        draftGiftCard.uiRecipientInfoLastChangeDate = getDate();
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
                    && (!giftCard?.isPurchased || (giftCard?.isPurchased && giftCard?.uiIsEditMode))
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
                if (giftCard?.uiIsEditMode) {
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
                        // This is a purchased gift card. Gift card can only be modified in edit mode.
                        draftGiftCard.uiRecipientPostal = postalCode;
                    } else {
                        // This is an unpurchased gift card. Gift card is open for modification.
                        draftGiftCard.recipientPostal = postalCode;
                        draftGiftCard.uiRecipientInfoLastChangeDate = getDate();
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
                    && (!giftCard?.isPurchased || (giftCard?.isPurchased && giftCard?.uiIsEditMode))
                    && !giftCard?.isRedeemed
                ) ?? false;
            }
        }

        return result;
    }

    function saveGiftCardSelections(oVoucherId?: string, isPurchased?: boolean, giftcardProductId?: number, recipientLastName?: string, recipientPostal?: string): void {
        if (oVoucherId != undefined) {
            const apiSaveGiftCardSelectionsForUserRequest: IApiSaveGiftCardSelectionsForUserRequest | undefined = {
                oVoucherId: oVoucherId,
                isPurchased: isPurchased,
                giftcardProductId: giftcardProductId,
                recipientLastName: recipientLastName?.trim()?.substring(0, 150),
                recipientPostal: recipientPostal?.trim()?.substring(0, 7)
            };

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

                                //draftGiftCard.recipientLastName = result?.data?.recipientLastName;
                                //draftGiftCard.recipientPostal = result?.data?.recipientPostal;
                            }
                        });
                    } else {
                        //
                    }
                },
                error: (error: any) => {
                    checkResponseStatus(error);
                },
                complete: () => {
                    appContext.updater(draft => {
                        const draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

                        if (draftGiftCard != undefined) {
                            draftGiftCard.uiGiftcardProductIdLoading = false;
                        }
                    });
                }
            });
        }
    }

    function addGiftCardToCartClick(oVoucherId?: string): void {
        if (oVoucherId != undefined) {
            const giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                console.log(getGiftCardTypeName(giftCard?.giftcardProductId), getGiftCardTypeName(giftCard?.giftcardProductId, "fr"))
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
                    draftGiftCard.uiRecipientInfoLastChangeDate = undefined;
                    draftGiftCard.uiIsEditMode = false;

                    // Force api save instead of using interval.
                    saveGiftCardSelections(oVoucherId, draftGiftCard?.isPurchased, draftGiftCard?.giftcardProductId, draftGiftCard?.recipientLastName, draftGiftCard?.recipientPostal);
                }
            });
        }
    }

    function cancelGiftCardChangesClick(oVoucherId?: string): void {
        if (oVoucherId != undefined) {
            appContext.updater(draft => {
                const draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

                if (draftGiftCard != undefined) {
                    draftGiftCard.uiRecipientLastName = undefined;
                    draftGiftCard.uiRecipientPostal = undefined;
                    draftGiftCard.uiRecipientInfoLastChangeDate = undefined;
                    draftGiftCard.uiIsEditMode = false;
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
            },
            error: (error: any) => {
                checkResponseStatus(error);
            },
            complete: () => {
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

                appContext.updater(draft => {
                    const draftGiftCard: IGiftCard | undefined = draft?.giftCards?.filter(x => x?.oVoucherId === oVoucherId)[0];

                    if (draftGiftCard != undefined) {
                        draftGiftCard.uiGiftcardProductIdLoading = true;
                    }
                });

                saveGiftCardSelections(oVoucherId, giftCard?.isPurchased, giftcardProductId, giftCard?.recipientLastName, giftCard?.recipientPostal);
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

    function resendEmailClick(oVoucherId?: string): void {
        if (oVoucherId != undefined) {
            const giftCard: IGiftCard | undefined = getGiftCard(oVoucherId);

            if (giftCard != undefined) {
                setShowAlert(true);

                const apiSendGiftCardPdfRequest: IApiSendGiftCardPdfRequest = {
                    orderId: giftCard?.orderId
                }

                apiSendGiftCardPdf(apiSendGiftCardPdfRequest).subscribe({
                    next: (result: IApiSendGiftCardPdfResult) => {
                        if (result?.isSuccessful) {
                            setResendGiftCardEmailMessage(t("GiftCards.ResendGiftCardEmailDialog.Successful"));
                        } else {
                            setResendGiftCardEmailMessage(t("GiftCards.ResendGiftCardEmailDialog.Unsuccessful"));
                        }

                        setShowResendGiftCardEmailDialog(true);
                    },
                    error: (error: any) => {
                        checkResponseStatus(error);
                    },
                    complete: () => {
                        setShowAlert(false);
                    }
                });
            }
        }
    }
}