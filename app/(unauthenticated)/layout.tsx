"use client"

import { useContext, useEffect } from 'react'
import { AppContext } from '@/app/AppContext';
import { useRouter } from 'next/navigation';

export default function IndexLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const appContext = useContext(AppContext);
    const router = useRouter();

    useEffect(() => {
        if (appContext.data.isAuthenticated) {
            router.push('/home');
        }
    }, [appContext.data.isAuthenticated])

    if (appContext.data.isAuthenticated) {
        return (
            <html lang="en">
                <body>{children}</body>
            </html>
        )
    }

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="" />
            </head>

            <body className="bg-body-tertiary">
                <header>
                    <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark text-white" style={{ maxHeight: 86, overflow: 'hidden' }}>
                        <div className="container-fluid">
                            <div className="d-flex justify-content-start align-items-start align-items-sm-start align-items-md-center w-100">
                                <a className="navbar-brand" href="#">
                                    <img src="./ofsc.png" alt="Logo" width="60" height="60" />
                                </a>

                                <div>
                                    <h4>Ontario Federation of Snowmobile Clubs</h4>
                                </div>
                            </div>
                        </div>
                    </nav>
                </header>

                <main className="container-fluid container-lg py-2">
                    {children}
                </main>

                <footer className="footer bg-secondary py-3">
                    <div className="container-fluid" style={{ padding: 0 }}>
                        <div className="text-white text-center">Need help? Contact OFSC at 705-739-7669 or permits@ofsc.on.ca</div>
                    </div>
                </footer>
            </body>
        </html>
    )
}
