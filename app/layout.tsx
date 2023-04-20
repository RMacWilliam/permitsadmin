"use client"

import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import '@fortawesome/fontawesome-free/css/solid.css'
import './globals.css'

import { Updater, useImmer } from 'use-immer'
import { IAppContextValues, AppContext, appContextValues, IAppContextData } from './AppContext'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [appContextDetails, updateAppContextDetails] = useImmer(appContextValues.data);

    const appContextValuesObj: IAppContextValues = {
        data: appContextDetails as IAppContextData,
        updater: updateAppContextDetails as Updater<IAppContextData>,
    };

    return (
        <AppContext.Provider value={appContextValuesObj}>
            {children}
        </AppContext.Provider >
    )
}
