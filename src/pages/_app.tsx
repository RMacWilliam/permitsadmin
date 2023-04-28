import '@/styles/bootstrap.scss';
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import '@fortawesome/fontawesome-free/css/brands.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/globals.scss';

import type { AppProps } from 'next/app'

import { Updater, useImmer } from 'use-immer'
import { IAppContextValues, AppContext, appContextValues, IAppContextData } from '../custom/app-context'
import '@/localization/i18n';

import Script from 'next/script'
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [appContextDetails, updateAppContextDetails] = useImmer(appContextValues.data);
  const [t, i18n] = useTranslation();

  // useEffect(() => {
  //   i18n.changeLanguage("fr");
  // }, [])

  const appContextValuesObj: IAppContextValues = {
    data: appContextDetails as IAppContextData,
    updater: updateAppContextDetails as Updater<IAppContextData>,
    translation: { t, i18n }
  };

  return (
    <AppContext.Provider value={appContextValuesObj}>
      <Script src="./bootstrap.bundle.min.js" async></Script>

      <Component {...pageProps} />
    </AppContext.Provider>
  )
}
