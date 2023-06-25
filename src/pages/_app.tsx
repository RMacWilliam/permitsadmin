import '@/styles/bootstrap.scss';
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import '@fortawesome/fontawesome-free/css/regular.css';
import '@fortawesome/fontawesome-free/css/brands.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/globals.scss';

import type { AppProps } from 'next/app'

import { Updater, useImmer } from 'use-immer'
import { IAppContextValues, AppContext, IAppContextData } from '../custom/app-context'
import '@/localization/i18n';

import Script from 'next/script'
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { GlobalAppContext } from '../../global';
import RouteGuard from '@/custom/authentication';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const [immerAppContextValues, updateImmerAppContextValues] = useImmer({ isAuthenticated: false, language: "en" } as IAppContextData); // initialAppContextValues.data);
  const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState(false);
  const [t, i18n] = useTranslation();
  const router = useRouter();

  // Restore app context from local storage.
  useEffect(() => {
    if (window.localStorage) {
      const localStorageData: string | undefined = window.localStorage.getItem("data")?.toString();

      if (localStorageData != undefined) {
        const localStorageDataObj: IAppContextData | undefined = JSON.parse(localStorageData) as IAppContextData;

        if (localStorageDataObj != undefined) {
          updateImmerAppContextValues(localStorageDataObj);

          // Set UI language.
          i18n.changeLanguage(localStorageDataObj?.language ?? "en");

          // Set language for html tag.
          document.getElementsByTagName("html")[0].lang = localStorageDataObj?.language ?? "en";
        }
      }
    }

    setIsLocalStorageLoaded(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save app context to local storage whenever app context is updated.
  useEffect(() => {
    // Set GlobalAppContext.
    GlobalAppContext.data = immerAppContextValues as IAppContextData;
    GlobalAppContext.updater = updateImmerAppContextValues as Updater<IAppContextData>;
    GlobalAppContext.translation = { t, i18n };
    GlobalAppContext.router = router;

    // Set language for html tag.
    document.getElementsByTagName("html")[0].lang = immerAppContextValues?.language ?? "en";

    if (isLocalStorageLoaded && window.localStorage) {
      window.localStorage.setItem("data", JSON.stringify(immerAppContextValues));
    }
  }, [immerAppContextValues, updateImmerAppContextValues, t, i18n, router, isLocalStorageLoaded]);

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
