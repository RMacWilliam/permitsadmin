import { useContext, useEffect } from 'react'
import { AppContext } from '@/custom/app-context';
import { useRouter } from 'next/router';
import AuthenticatedPage from '@/components/layouts/authenticated-page';
import PermitsPage from '@/components/home/permits-page';

export default function Permits() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "permits" });
    }, [appContext])

    return (
        <AuthenticatedPage>
            <PermitsPage></PermitsPage>
        </AuthenticatedPage>
    )
}
