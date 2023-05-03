import { AppContext } from "@/custom/app-context";
import { useRouter } from "next/router";
import { useContext } from "react";

export default function CartItemsAlert() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    if (appContext.data?.cartItems != undefined && appContext.data?.cartItems?.length > 0) {
        return (
            <div className="alert alert-primary" role="alert">
                <div className="d-flex justify-content-between align-items-center flex-wrap flex-sm-wrap flex-md-wrap flex-md-nowrap w-100">
                    <div>
                        <i className="fa-solid fa-cart-shopping fa-xl me-2"></i>
                        {getMessage()}
                    </div>
                    <div>
                        <button type="button" className="btn btn-primary btn-sm mt-2 mt-sm-2 mt-md-0" onClick={() => goToCartClick()}>Go to Cart</button>
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