import { useContext, useEffect } from 'react'
import { AppContext } from '@/custom/app-context';
import { useRouter } from 'next/router';
import AuthenticatedPage from '@/components/layouts/authenticated-page';
import GiftCardsPage from '@/components/home/gift-cards-page';

export default function GiftCards() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "gift-cards" });
    }, [appContext])

    return (
        <AuthenticatedPage>
            <GiftCardsPage></GiftCardsPage>
        </AuthenticatedPage>
    )
}
