"use client"

import { Inter } from 'next/font/google'

import { useContext, useEffect } from 'react'
import { AppContext } from '@/app/AppContext';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] })

export default function PermitsPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = 'permits' });
    }, [])

    if (!appContext.data.isAuthenticated) {
        return null;
    }

    return (
        <>
            <h4>Snowmobiles &amp; Permits</h4>
        </>
    )
}
