"use client"

import { Inter } from 'next/font/google'

import { useContext } from 'react'
import { AppContext } from '@/app/AppContext';

const inter = Inter({ subsets: ['latin'] })

export default function AdminHomePage() {
    const appContext = useContext(AppContext);
    appContext.updater(draft => { draft.navbarPage = 'admin-home' });

    return (
        <>
            <h4>Admin Home</h4>
        </>
    )
}
