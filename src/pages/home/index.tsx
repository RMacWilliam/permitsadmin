import { useContext, useEffect } from 'react'
import { AppContext } from '@/custom/app-context';
import { useRouter } from 'next/router';
import AuthenticatedPage from '@/components/layouts/authenticated-page';
import HomePage from '@/components/home/home-page';

export default function Home() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "home" });
    }, [appContext])

    return (
        <AuthenticatedPage>
            <HomePage></HomePage>
        </AuthenticatedPage>
    )
}
