import '@/styles/bootstrap.scss';
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import '@fortawesome/fontawesome-free/css/regular.css';
import '@fortawesome/fontawesome-free/css/brands.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/globals.scss';

import type { AppProps } from 'next/app'

import { Updater, useImmer } from 'use-immer'
import { IAppContextValues, AppContext, initialAppContextValues, IAppContextData } from '../custom/app-context'
import '@/localization/i18n';

import Script from 'next/script'
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { GlobalAppContext } from '../../constants';
import RouteGuard from '@/custom/authentication';

export default function App({ Component, pageProps }: AppProps) {
  const [immerAppContextValues, updateImmerAppContextValues] = useImmer(initialAppContextValues.data);
  const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState(false);
  const [t, i18n] = useTranslation();

  // Restore app context from local storage.
  useEffect(() => {
    if (window.localStorage) {
      const localStorageData: string | undefined = window.localStorage.getItem("data")?.toString();

      if (localStorageData != undefined) {
        const localStorageDataObj: IAppContextData | undefined = JSON.parse(localStorageData) as IAppContextData;

        if (localStorageDataObj != undefined) {
          updateImmerAppContextValues(localStorageDataObj);

          // Set WebApi token.
          GlobalAppContext.token = localStorageDataObj.token;

          // Set UI language.
          i18n.changeLanguage(localStorageDataObj?.language ?? "en");
        }
      }
    }

    setIsLocalStorageLoaded(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save app context to local storage whenever app context is updated.
  useEffect(() => {
    // Set WebApi token.
    GlobalAppContext.token = immerAppContextValues.token;
    GlobalAppContext.translation = { t, i18n };

    if (isLocalStorageLoaded && window.localStorage) {
      window.localStorage.setItem("data", JSON.stringify(immerAppContextValues));
    }
  }, [isLocalStorageLoaded, immerAppContextValues]);

  const appContextProviderValues: IAppContextValues = {
    data: immerAppContextValues as IAppContextData,
    updater: updateImmerAppContextValues as Updater<IAppContextData>,
    translation: { t, i18n }
  };

  return (
    <AppContext.Provider value={appContextProviderValues}>
      <Script src="./bootstrap.bundle.min.js" async></Script>

      {isLocalStorageLoaded && (
        <RouteGuard>
          <Component {...pageProps} />
        </RouteGuard>
      )}
    </AppContext.Provider>
  )
}
