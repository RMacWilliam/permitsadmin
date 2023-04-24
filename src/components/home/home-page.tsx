import Head from "next/head";
import { useContext } from 'react';
import { AppContext } from '@/custom/app-context';

export default function HomePage() {
    const appContext = useContext(AppContext);

    return (
        <>
            <Head>
                <title>Home | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h4>Home</h4>
        </>
    )
}
