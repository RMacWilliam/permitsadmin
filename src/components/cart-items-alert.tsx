import { AppContext } from "@/custom/app-context";
import { useRouter } from "next/router";
import { useContext } from "react";

export default function CartItemsAlert() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    const t: Function = appContext.translation.t;

    if (appContext.data?.cartItems != undefined && appContext.data?.cartItems?.length > 0) {
        return (
            <div className="alert alert-primary" role="alert">
                <div className="d-flex justify-content-end justify-content-md-between align-items-center flex-wrap gap-2">
                    <div className="flex-fill">
                        <i className="fa-solid fa-cart-shopping fa-xl me-2"></i>
                        {getMessage()}
                    </div>
                    <div>
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => goToCartClick()}>{t("CartItemsAlert.GoToCartButton")}</button>
                    </div>
                </div>
            </div >
        )
    } else {
        return null;
    }

    function getMessage(): string {
        let result: string = "";

        const permitCount: number = appContext.data?.cartItems?.filter(x => x.isPermit)?.length ?? 0;
        const giftCardCount: number = appContext.data?.cartItems?.filter(x => x.isGiftCard)?.length ?? 0;

        const segments: string[] = [];

        if (permitCount > 0 || giftCardCount > 0) {
            segments.push(t("CartItemsAlert.YouHave"));

            if (permitCount > 0) {
                segments.push(permitCount.toString());
                segments.push(permitCount === 1 ? t("CartItemsAlert.Permit") : t("CartItemsAlert.Permits"));
            }

            if (giftCardCount > 0) {
                if (permitCount > 0) {
                    segments.push(t("CartItemsAlert.And"));
                }

                segments.push(giftCardCount.toString());
                segments.push(giftCardCount === 1 ? t("CartItemsAlert.GiftCard") : t("CartItemsAlert.GiftCards"));
            }

            segments.push(t("CartItemsAlert.InYourCart"));

            result = segments.join(" ");
        }

        return result;
    }

    function goToCartClick(): void {
        router.push("/cart")
    }
}