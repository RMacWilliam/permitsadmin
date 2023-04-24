import { useContext, useEffect } from 'react'
import { AppContext } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';

export default function GiftCardsPage() {
    const appContext = useContext(AppContext);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "gift-cards" });
    }, [appContext])

    return (
        <AuthenticatedPageLayout>
            <GiftCards></GiftCards>
        </AuthenticatedPageLayout>
    )
}

function GiftCards() {
    const appContext = useContext(AppContext);

    return (
        <>
            <Head>
                <title>Gift Cards | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>Gift Cards</h4>
        </>
    )
}