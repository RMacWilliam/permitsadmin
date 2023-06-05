import { AppContext } from "@/custom/app-context";
import { useRouter } from "next/router";
import { useContext } from "react";

export default function CartItemsAlert() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    if (appContext.data?.cartItems != undefined && appContext.data?.cartItems?.length > 0) {
        return (
            <div className="alert alert-primary" role="alert">
                <div className="d-flex justify-content-end justify-content-md-between align-items-center flex-wrap gap-2">
                    <div className="flex-fill">
                        <i className="fa-solid fa-cart-shopping fa-xl me-2"></i>
                        {getMessage()}
                    </div>
                    <div>
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => goToCartClick()}>Go to Cart</button>
                    </div>
                </div>
            </div >
        )
    } else {
        return null;
    }

    function getMessage(): string {
        let result: string = "";

        let permitCount: number = appContext.data?.cartItems?.filter(x => x.isPermit)?.length ?? 0;
        let giftCardCount: number = appContext.data?.cartItems?.filter(x => x.isGiftCard)?.length ?? 0;

        if (permitCount > 0 || giftCardCount > 0) {
            result = "You have ";

            if (permitCount > 0) {
                result += permitCount.toString() + (permitCount === 1 ? " permit " : " permits ");
            }

            if (giftCardCount > 0) {
                if (permitCount > 0) {
                    result += "and ";
                }

                result += giftCardCount.toString() + (giftCardCount === 1 ? " gift card " : " gift cards ");
            }

            result += "in your cart.";
        }

        return result;
    }

    function goToCartClick(): void {
        router.push("/cart")
    }
}