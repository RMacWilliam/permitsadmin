import Head from "next/head";
import { useContext } from 'react';
import { AppContext } from '@/custom/app-context';

export default function GiftCardsPage() {
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
