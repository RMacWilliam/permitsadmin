import { useContext, useEffect } from 'react'
import { AppContext } from '@/custom/app-context';
import { useRouter } from 'next/router';
import AuthenticatedPage from '@/components/layouts/authenticated-page';
import ContactPage from '@/components/home/contact';

export default function Contact() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "contact" });
    }, [appContext])

    return (
        <AuthenticatedPage>
            <ContactPage></ContactPage>
        </AuthenticatedPage>
    )
}
