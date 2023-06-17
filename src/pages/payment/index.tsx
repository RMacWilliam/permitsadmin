import AuthenticatedPageLayout from "@/components/layouts/authenticated-page"
import { AppContext, IAppContextValues, IGiftCard, ISnowmobile } from "@/custom/app-context";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Subscription } from "rxjs";
import $ from 'jquery';
import { IApiMonerisCompleteRequest, IApiMonerisCompleteResult, IApiSavePrePurchaseDataRequest, IApiSavePrePurchaseDataResult, IApiSavePrePurchaseDataResultData, apiMonerisComplete, apiSavePrePurchaseData } from "@/custom/api";
import { checkResponseStatus } from "@/custom/utilities";

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

    const [monerisPrePurchase, setMonerisPrePurchase] = useState({} as IApiSavePrePurchaseDataResultData);

    let myCheckout: any;

    const t: Function = appContext.translation.t;

    useEffect(() => {
        const permits: any[] = [];

        appContext.data?.cartItems?.filter(x => x.isPermit)?.forEach(x => {
            const snowmobile: ISnowmobile | undefined = appContext.data?.snowmobiles?.filter(snowmobile => snowmobile?.oVehicleId === x.itemId)[0];

            if (snowmobile != undefined) {
                permits.push({
                    oVehicleId: x?.itemId,
                    redemptionCode: x?.redemptionCode ?? "",
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
                permits.push({
                    oVoucherId: x?.itemId,
                    giftcardProductId: giftCard?.giftcardProductId,
                    recipientLastName: giftCard?.recipientLastName,
                    recipientPostal: giftCard?.recipientPostal
                });
            }
        });

        const apiSavePrePurchaseDataRequest: IApiSavePrePurchaseDataRequest = {
            permits: permits == undefined || permits.length === 0 ? undefined : permits,
            giftCards: giftCards == undefined || giftCards.length === 0 ? undefined : giftCards,
            trackedShipping: appContext.data?.cart?.isTrackedShipping,
            shippingTo: appContext.data?.cart?.shipTo,
            alternateAddress: appContext.data?.cart?.alternateAddress == undefined ? undefined : {
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
                    setMonerisPrePurchase(result.data);

                    let monerisScript: string = "";

                    if (result.data?.environment === "qa") {
                        monerisScript = "https://gatewayt.moneris.com/chkt/js/chkt_v1.00.js";
                    } else {
                        monerisScript = "https://gateway.moneris.com/chkt/js/chkt_v1.00.js";
                    }

                    console.log(result.data);

                    if (monerisScript !== "") {
                        $.getScript(monerisScript, function () {
                            myCheckout = new monerisCheckout();
                            myCheckout.setMode(result.data?.environment);
                            myCheckout.setCheckoutDiv("moneris-checkout");
                            myCheckout.startCheckout(result.data?.ticket);
                            myCheckout.setCallback("page_loaded", pageLoaded);
                            myCheckout.setCallback("payment_complete", paymentComplete);
                            myCheckout.setCallback("cancel_transaction", cancelTransaction);
                            myCheckout.setCallback("error_event", errorEvent);
                        });
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

    function pageLoaded(jsonMessage: any): void {
        const message = JSON.parse(jsonMessage);
        console.log(message);

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

    // monerisbaseurl
    function paymentComplete(jsonMessage: any): void {
        const message = JSON.parse(jsonMessage);
        console.log(message);

        myCheckout.closeCheckout();

        const apiMonerisCompleteRequest: IApiMonerisCompleteRequest = {
            ticket: monerisPrePurchase?.ticket,
            orderId: monerisPrePurchase?.orderId,
            environment: monerisPrePurchase?.environment,
            amount: monerisPrePurchase?.amount,
            message: jsonMessage
        };

        apiMonerisComplete(apiMonerisCompleteRequest).subscribe({
            next: (result: IApiMonerisCompleteResult) => {
                if (result?.isSuccessful) {
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

    function cancelTransaction(jsonMessage: any): void {
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
        console.log(message);

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
}
