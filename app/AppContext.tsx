import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import { createContext } from 'react'
import { Updater } from 'use-immer';

export interface IAppContextDetails {
    // Authentication
    isAuthenticated: boolean;
    email?: string;
    token?: string;

    // Shopping Cart
    cartItems: number;

    // Navbar selection
    navbarPage: string;
}

export interface IAppContextData {
    data: IAppContextDetails;
    updater: Updater<IAppContextDetails>;
}

export const appContextData: IAppContextData = {
    data: {
        isAuthenticated: false,
        email: undefined,
        token: undefined,

        cartItems: 0,

        navbarPage: 'home', // home, contact, permits, giftcards; admin-home
    },
    updater: () => { }
};

export const AppContext = createContext(appContextData);