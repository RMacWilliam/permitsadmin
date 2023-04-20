"use client"

import { useContext } from 'react'
import { Inter } from 'next/font/google'
import { AppContext } from '@/app/AppContext'
import LoginPage from './login-page';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] })

export default function IndexPage() {
    const appContext = useContext(AppContext);
    const router = useRouter();

    if (appContext.data.isAuthenticated) {
        return null;
    }

    return (
        <>
            <LoginPage></LoginPage>
        </>
    )
}
