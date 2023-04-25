import { useContext, useEffect } from 'react'
import { AppContext } from '@/custom/app-context';
import AuthenticatedPageLayout from '@/components/layouts/authenticated-page';
import Head from 'next/head';
import { NextRouter, useRouter } from 'next/router';

export default function HomePage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "home" });
    }, [appContext])

    return (
        <AuthenticatedPageLayout>
            <Home router={router}></Home>
        </AuthenticatedPageLayout>
    )
}

function Home({ router }: { router: NextRouter }) {
    const appContext = useContext(AppContext);

    return (
        <>
            <Head>
                <title>Home | Ontario Federation of Snowmobile Clubs</title>
            </Head>

            <h3>Welcome to Ontario Federation of Snowmobile Clubs</h3>

            {!appContext.data?.isContactInfoVerified && (
                <div className="alert alert-primary" role="alert">
                    <div className="d-flex justify-content-between align-items-center flex-wrap flex-sm-wrap flex-md-wrap flex-md-nowrap w-100">
                        <div>
                            <i className="fa-solid fa-comment fa-xl me-2"></i>
                            Please confirm your contact information and preferences to gain full access to your account.
                        </div>
                        <div>
                            <button type="button" className="btn btn-primary btn-sm mt-2 mt-sm-2 mt-md-0" onClick={(e: any) => router.push('/contact')}>Go to Contact Information</button>
                        </div>
                    </div>
                </div >
            )}
        </>
    )
}
