import { AppContext, IAppContextValues, IGiftCard, ISnowmobile } from "@/custom/app-context";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Subscription } from "rxjs";
import $ from 'jquery';
import { IApiMonerisCompleteRequest, IApiMonerisCompleteResult, IApiSavePrePurchaseDataRequest, IApiSavePrePurchaseDataResult, apiMonerisComplete, apiSavePrePurchaseData } from "@/custom/api";
import { checkResponseStatus } from "@/custom/utilities";
import { ShipTo } from "../cart";
import { WebApi } from "../../../global";

declare var monerisCheckout: any;

export default function PaymentPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "payment" });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Payment appContext={appContext} router={router}></Payment>
    )
}

function Payment({ appContext, router }:
    {
        appContext: IAppContextValues,
        router: NextRouter
    }) {

    let myCheckout: any;

    const t: Function = appContext.translation.t;

    useEffect(() => {
        const permits: any[] = [];

        appContext.data?.cartItems?.filter(x => x.isPermit)?.forEach(x => {
            const snowmobile: ISnowmobile | undefined = appContext.data?.snowmobiles?.filter(snowmobile => snowmobile?.oVehicleId === x.itemId)[0];

            if (snowmobile != undefined) {
                permits.push({
                    oVehicleId: x?.itemId,
                    redemptionCode: x?.redemptionCode,
                    productId: snowmobile?.permitSelections?.permitOptionId,
                    dateStart: snowmobile?.permitSelections?.dateStart,
                    dateEnd: snowmobile?.permitSelections?.dateEnd,
                    clubId: snowmobile?.permitSelections?.clubId
                });
            }
        });

        const giftCards: any[] = [];

        appContext.data?.cartItems?.filter(x => x.isGiftCard)?.forEach(x => {
            const giftCard: IGiftCard | undefined = appContext.data?.giftCards?.filter(giftCard => giftCard?.oVoucherId === x.itemId)[0];

            if (giftCard != undefined) {
                giftCards.push({
                    oVoucherId: x?.itemId,
                    giftcardProductId: giftCard?.giftcardProductId,
                    recipientLastName: giftCard?.recipientLastName,
                    recipientPostal: giftCard?.recipientPostal
                });
            }
        });

        const apiSavePrePurchaseDataRequest: IApiSavePrePurchaseDataRequest = {
            language: appContext.data?.language,
            permits: permits == undefined || permits.length === 0 ? undefined : permits,
            giftCards: giftCards == undefined || giftCards.length === 0 ? undefined : giftCards,
            trackedShipping: appContext.data?.cart?.isTrackedShipping,
            shippingTo: appContext.data?.cart?.shipTo,
            alternateAddress: appContext.data?.cart?.shipTo === ShipTo.Registered
                ? undefined
                : {
                    addressLine1: appContext.data?.cart?.alternateAddress?.addressLine1,
                    addressLine2: appContext.data?.cart?.alternateAddress?.addressLine2,
                    city: appContext.data?.cart?.alternateAddress?.city,
                    postalCode: appContext.data?.cart?.alternateAddress?.postalCode,
                    province: appContext.data?.cart?.alternateAddress?.province?.key,
                    country: appContext.data?.cart?.alternateAddress?.country?.key
                }
        };

        const subscription: Subscription = apiSavePrePurchaseData(apiSavePrePurchaseDataRequest).subscribe({
            next: (result: IApiSavePrePurchaseDataResult) => {
                if (result?.isSuccessful && result?.data != undefined) {
                    // Load moneris script only if it hasn't been loaded yet.
                    if (typeof monerisCheckout === "undefined") {
                        let monerisScript: string = "";

                        if (result.data?.environment === "qa") {
                            monerisScript = "https://gatewayt.moneris.com/chkt/js/chkt_v1.00.js";
                        } else {
                            monerisScript = "https://gateway.moneris.com/chkt/js/chkt_v1.00.js";
                        }

                        $.ajax({
                            dataType: "script",
                            cache: false,
                            url: monerisScript
                        })
                            .done(function (script, textStatus) {
                                initializeMoneris(result.data?.environment, result.data?.ticket);
                            });
                    } else {
                        initializeMoneris(result.data?.environment, result.data?.ticket);
                    }
                } else {
                    //
                }
            },
            error: (error: any) => {
                checkResponseStatus(error);
            },
            complete: () => {
                //
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
                <title>{t("Payment.Title")} | {t("Common.Ofsc")}</title>
            </Head>

            <div id="moneris-checkout"></div>
        </>
    )

    function initializeMoneris(environment?: string, ticket?: string): void {
        myCheckout = new monerisCheckout();
        myCheckout.setMode(environment);
        myCheckout.setCheckoutDiv("moneris-checkout");
        myCheckout.setCallback("page_loaded", pageLoaded);
        myCheckout.setCallback("cancel_transaction", cancelTransaction);
        myCheckout.setCallback("error_event", errorEvent);
        myCheckout.setCallback("payment_receipt", paymentReceipt);
        myCheckout.setCallback("payment_complete", paymentComplete);
        myCheckout.startCheckout(ticket);
    }

    function pageLoaded(jsonMessage: any): void {
        const message = JSON.parse(jsonMessage);
        console.log("pageLoaded(): ", message);

        // $.ajax({
        //     type: 'POST',
        //     url: "../MonerisApproved/MonerisPageLoaded",
        //     data: {
        //         orderId: viewModel.OrderId,
        //         message: message,
        //         ticket: viewModel.Ticket
        //     },
        //     //dataType: "text",
        //     success: function (resultData) {

        //         $('#loadingGif').hide();

        //         if (resultData === false) {  //Page refresh - logout
        //             alert('Error - Logout required.');
        //             window.location.href = "../Home/Index";
        //         }
        //     }
        // });
    }

    function cancelTransaction(jsonMessage: any): void {
        const message = JSON.parse(jsonMessage);
        console.log("cancelTransaction(): ", message);

        myCheckout.closeCheckout();

        router.push("/cart");

        //     const message = JSON.parse(jsonMessage);

        //     $.ajax({
        //         type: 'POST',
        //         url: "../MonerisApproved/MonerisPageCancel",
        //         data: {
        //             orderId: viewModel.OrderId,
        //             message: message,
        //             ticket: viewModel.Ticket
        //         },
        //         //dataType: "text",
        //         success: function (resultData) {

        //         }
        //     });
    }

    function errorEvent(jsonMessage: any): void {
        const message = JSON.parse(jsonMessage);
        console.log("errorEvent(): ", message);

        // $.ajax({
        //     type: 'POST',
        //     url: "../MonerisApproved/MonerisPageError",
        //     data: {
        //         orderId: viewModel.OrderId,
        //         message: message,
        //         ticket: viewModel.Ticket
        //     },
        //     //dataType: "text",
        //     success: function (resultData) {

        //         alert('Error - Logout required.');
        //         window.location.href = "../Home/Index";
        //     }
        // });
    }

    function paymentReceipt(jsonMessage: any): void {
        const message = JSON.parse(jsonMessage);
        console.log("paymentReceipt(): ", message);
    }

    // monerisbaseurl
    function paymentComplete(jsonMessage: any): void {
        const message = JSON.parse(jsonMessage);
        console.log("paymentComplete(): ", message);

        myCheckout.closeCheckout();

        const apiMonerisCompleteRequest: IApiMonerisCompleteRequest = {
            message: jsonMessage
        };

        let url: string = appContext.data?.monerisBaseUrl?.trim() ?? WebApi.MonerisComplete;

        apiMonerisComplete(apiMonerisCompleteRequest, undefined, url).subscribe({
            next: (result: IApiMonerisCompleteResult) => {
                if (result?.isSuccessful) {
                    // Clear shopping cart.
                    appContext.updater(draft => {
                        draft.cart = undefined;
                        draft.cartItems = undefined;
                    });
                    
                    router.push("/payment/approved"); // TODO: api will indicate if the transaction was successful?
                } else {
                    router.push("/payment/declined"); // TODO: api will indicate if the transaction was successful?
                }
            },
            error: (error: any) => {
                checkResponseStatus(error);
            },
            complete: () => {
                //
            }
        });

        // $.ajax({
        //     type: 'POST',
        //     url: "../MonerisApproved/MonerisCheckoutComplete",
        //     data: {
        //         orderId: viewModel.OrderId,
        //         message: message,
        //         ticket: viewModel.Ticket
        //     },
        //     //dataType: "text",
        //     success: function (resultData) {

        //         if (resultData === true) {
        //             window.location.href = "./Approved?OrderId=" + viewModel.OrderId;
        //         }
        //         else {
        //             window.location.href = "./Declined?OrderId=" + viewModel.OrderId;
        //         }
        //     }
        // });
    }




}
