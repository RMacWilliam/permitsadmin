"use client"

import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import '@fortawesome/fontawesome-free/css/solid.css'
import './globals.css'

import { Updater, useImmer } from 'use-immer'
import { IAppContextData, AppContext, appContextData, IAppContextDetails } from './AppContext'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [appContextDetails, updateAppContextDetails] = useImmer(appContextData.data);

    const appContextValues: IAppContextData = {
        data: appContextDetails as IAppContextDetails,
        updater: updateAppContextDetails as Updater<IAppContextDetails>,
    };

    return (
        <AppContext.Provider value={appContextValues}>
            {children}
        </AppContext.Provider >
    )
}
