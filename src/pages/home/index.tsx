import { useContext, useEffect } from 'react'
import { AppContext } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';

export default function HomePage() {
    const appContext = useContext(AppContext);

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "home" });
    }, [appContext])

    return (
        <AuthenticatedPageLayout>
            <Home></Home>
        </AuthenticatedPageLayout>
    )
}

function Home() {
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
