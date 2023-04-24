import CartPage from "@/components/home/cart-page"
import AuthenticatedPage from "@/components/layouts/authenticated-page"

export default function Cart() {
    return (
        <AuthenticatedPage>
            <CartPage></CartPage>
        </AuthenticatedPage>
    )
}
