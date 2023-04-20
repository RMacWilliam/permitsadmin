"use client"

import { AppContext } from "@/app/AppContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const appContext = useContext(AppContext);
    const router = useRouter();
  
    useEffect(() => {
      if (!appContext.data.isAuthenticated) {
        router.push('/');
      }
    }, [appContext.data.isAuthenticated])
  
    if (!appContext.data.isAuthenticated) {
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

            <body>
                <header>
                </header>

                <main>
                    {children}
                </main>

                <footer>
                </footer>
            </body>
        </html>
    )
}
