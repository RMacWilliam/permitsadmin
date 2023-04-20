"use client"

import { Inter } from 'next/font/google'

import { useContext, useEffect } from 'react'
import { AppContext } from '@/app/AppContext';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] })

export default function ContactPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    useEffect(() => {
        appContext.updater(draft => { draft.navbarPage = 'contact' });
    }, [])

    if (!appContext.data.isAuthenticated) {
        return null;
    }

    return (
        <>
            <h4>Contact Information</h4>
        </>
    )
}
