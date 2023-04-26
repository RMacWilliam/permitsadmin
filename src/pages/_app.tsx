import '@/styles/bootstrap.scss';
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import '@fortawesome/fontawesome-free/css/brands.css';
import '@/styles/globals.scss';

import type { AppProps } from 'next/app'

import { Updater, useImmer } from 'use-immer'
import { IAppContextValues, AppContext, appContextValues, IAppContextData } from '../custom/app-context'
import Script from 'next/script'

export default function App({ Component, pageProps }: AppProps) {
  const [appContextDetails, updateAppContextDetails] = useImmer(appContextValues.data);

  const appContextValuesObj: IAppContextValues = {
    data: appContextDetails as IAppContextData,
    updater: updateAppContextDetails as Updater<IAppContextData>,
  };

  return (
    <AppContext.Provider value={appContextValuesObj}>
      <Script src="./bootstrap.bundle.min.js" async></Script>

      <Component {...pageProps} />
    </AppContext.Provider>
  )
}
