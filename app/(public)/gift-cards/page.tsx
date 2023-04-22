"use client"

import { Inter } from 'next/font/google'

import { useContext, useEffect } from 'react'
import { AppContext } from '@/app/AppContext';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] })

export default function GiftCardsPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = "gift-cards" });
    }, [])

    if (!appContext.data.isAuthenticated) {
        return null;
    }

    return (
        <>
            <h4>Gift Cards</h4>
        </>
    )
}
